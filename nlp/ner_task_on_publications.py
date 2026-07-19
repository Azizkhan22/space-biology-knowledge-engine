#!/usr/bin/env python3
"""
build_kg_from_mongo.py

Reads articles from a MongoDB collection, extracts entities using spaCy (or SciSpacy),
and writes a knowledge graph into Neo4j.

Environment variables expected (use a .env file or export them):
- MONGO_URI
- MONGO_DB
- MONGO_COLLECTION
- NEO4J_URI
- NEO4J_USER
- NEO4J_PASSWORD
- BATCH_SIZE (optional, default=50)

Article document expectations:
Each MongoDB document should have at least:
- _id (or id)
- title
- abstract (optional)
- conclusion (optional)   # or result, summary, etc.

Adapt field names as needed for your dataset.
"""

import os
import json
import logging
from typing import List, Dict, Tuple, Set
from dotenv import load_dotenv

load_dotenv()

# Neo4j Aura presents SSL.com certificates that Python's default Windows trust
# store may not include, causing "self-signed certificate in certificate chain".
# certifi's CA bundle includes them, so point OpenSSL at it before connecting.
try:
    import certifi
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
except ImportError:
    pass

import pymongo
from neo4j import GraphDatabase

# Load an NLP model.
# SciSpacy's biomedical models (en_core_sci_sm) give better domain entities, but
# they are NOT distributed through `spacy download` and are hard to install on
# modern Python/spaCy. So: use a SciSpacy model only if one is already installed,
# otherwise fall back to spaCy's general-purpose en_core_web_sm.
import spacy


def _patch_scispacy_config(model_name):
    """SciSpacy models are built for spaCy 3.7; under spaCy 3.8+ their config's
    stringified booleans ("True"/"False") fail validation. Rewrite them to real
    booleans so the model loads. Safe no-op if the package isn't installed."""
    try:
        import importlib
        import pathlib

        pkg = importlib.import_module(model_name)
        base = pathlib.Path(pkg.__file__).resolve().parent
        for cfg in base.glob(f"{model_name}-*/config.cfg"):
            text = cfg.read_text(encoding="utf-8")
            fixed = text.replace('= "True"', "= true").replace('= "False"', "= false")
            if fixed != text:
                cfg.write_text(fixed, encoding="utf-8")
    except Exception:
        pass


def load_nlp_model():
    # 1) Prefer a biomedical SciSpacy model — typed NER first, then generic.
    #    Install with (nmslib-free, --no-deps because scispacy won't build on 3.13):
    #      pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.4/en_ner_bionlp13cg_md-0.5.4.tar.gz --no-deps
    for name in ("en_ner_bionlp13cg_md", "en_core_sci_md", "en_core_sci_sm"):
        try:
            _patch_scispacy_config(name)
            model = spacy.load(name)
            logging.info("Loaded biomedical (SciSpacy) model: %s", name)
            return model
        except Exception:
            continue

    # 2) Fall back to the general-purpose English model.
    logging.warning("No biomedical model found; falling back to en_core_web_sm.")
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        # Not installed yet — download it once, then load.
        from spacy.cli import download
        download("en_core_web_sm")
        return spacy.load("en_core_web_sm")


try:
    NLP_MODEL = load_nlp_model()
except Exception as e:
    raise SystemExit(
        "Could not load an NLP model. Install the default one with:\n"
        "    python -m spacy download en_core_web_sm\n"
        f"Original error: {e}"
    )


# -------------------------
# Configuration from ENV
# -------------------------
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "articles")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER") or os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "50"))

if not (MONGO_URI and MONGO_DB and NEO4J_URI and NEO4J_USER and NEO4J_PASSWORD):
    raise SystemExit("Please set MONGO_URI, MONGO_DB, NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD in your environment or .env file.")


# -------------------------
# Utility functions
# -------------------------
def normalize_entity(text: str) -> str:
    """Normalize entity text for node matching."""
    if not text:
        return ""
    text = text.strip()
    # Basic normalization -- you can strengthen this (lowercase, remove duplicates, map synonyms)
    norm = " ".join(text.split())
    return norm


def extract_entities_from_text(nlp_doc, top_k=None) -> List[Tuple[str, str]]:
    """
    Given a spaCy doc, return list of (entity_text, label) tuples.
    Optionally limit to top_k results (by occurrence frequency).
    """
    ent_counter = {}
    for ent in nlp_doc.ents:
        txt = normalize_entity(ent.text)
        if not txt:
            continue
        key = (txt, ent.label_)
        ent_counter[key] = ent_counter.get(key, 0) + 1

    # fallback: if no entities found, attempt to capture some noun chunks as candidates
    if not ent_counter:
        for nc in nlp_doc.noun_chunks:
            txt = normalize_entity(nc.text)
            if not txt:
                continue
            key = (txt, "NOUN_CHUNK")
            ent_counter[key] = ent_counter.get(key, 0) + 1

    items = sorted(ent_counter.items(), key=lambda kv: -kv[1])
    if top_k:
        items = items[:top_k]
    return [(k[0], k[1]) for k, _ in items]


# -------------------------
# Neo4j functions
# -------------------------
class Neo4jKGWriter:
    def __init__(self, uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self._prepare_constraints()

    def close(self):
        self.driver.close()

    def _prepare_constraints(self):
        # Create uniqueness constraints: Article.id, Entity.name
        with self.driver.session() as session:
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (a:Article) REQUIRE a.id IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.name IS UNIQUE")

    def merge_article(self, article_id: str, title: str, metadata: dict = None):
        """
        Create or merge an Article node.
        """
        with self.driver.session() as session:
            session.run(
                """
                MERGE (a:Article {id: $id})
                SET a.title = $title,
                    a.metadata = coalesce(a.metadata, {}) + $metadata
                """,
                id=str(article_id),
                title=title or "",
                metadata=metadata or {},
            )

    def merge_entity(self, entity_name: str, ent_type: str = None):
        """
        Create or merge an Entity node.
        """
        with self.driver.session() as session:
            session.run(
                """
                MERGE (e:Entity {name: $name})
                SET e.type = coalesce(e.type, $ent_type)
                """,
                name=entity_name,
                ent_type=ent_type or "UNKNOWN",
            )

    def link_article_entity(self, article_id: str, entity_name: str, weight: int = 1, section: str = None):
        """
        Create relationship between Article and Entity.
        If relationship exists, increment weight.
        """
        with self.driver.session() as session:
            session.run(
                """
                MATCH (a:Article {id: $id})
                MATCH (e:Entity {name: $name})
                MERGE (a)-[r:MENTIONS]->(e)
                ON CREATE SET r.weight = $weight, r.sections = [$section]
                ON MATCH SET r.weight = coalesce(r.weight, 0) + $weight,
                             r.sections = apoc.coll.toSet(coalesce(r.sections, []) + [$section])
                """,
                id=str(article_id),
                name=entity_name,
                weight=weight,
                section=section or "unknown",
            )

    def merge_article_with_entities(self, article_id: str, title: str, entities: List[Dict]):
        """
        Write an Article node and all of its Entity nodes + MENTIONS relationships
        in a single round-trip (UNWIND). `entities` is a list of dicts with keys
        name, type, section, weight. Pure Cypher (no APOC dependency).
        """
        with self.driver.session() as session:
            session.run(
                """
                MERGE (a:Article {id: $id})
                  SET a.title = $title
                WITH a
                UNWIND $entities AS ent
                MERGE (e:Entity {name: ent.name})
                  ON CREATE SET e.type = ent.type
                MERGE (a)-[r:MENTIONS]->(e)
                  ON CREATE SET r.weight = ent.weight, r.sections = [ent.section]
                  ON MATCH SET r.weight = coalesce(r.weight, 0) + ent.weight,
                               r.sections = CASE
                                   WHEN ent.section IN coalesce(r.sections, []) THEN r.sections
                                   ELSE coalesce(r.sections, []) + ent.section
                               END
                """,
                id=str(article_id),
                title=title or "",
                entities=entities,
            )


# -------------------------
# MongoDB Reader
# -------------------------
class MongoArticleReader:
    def __init__(self, uri: str, db_name: str, collection_name: str):
        self.client = pymongo.MongoClient(uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

    def count(self) -> int:
        return self.collection.count_documents({})

    def stream_articles(self, projection=None, batch_size=100):
        """
        Generator yielding articles from collection. Projection can pick fields, e.g. {"title":1,"abstract":1,"conclusion":1}
        """
        # Fetch full documents by default so field names of any casing are available.
        cursor = self.collection.find({}, projection)
        for doc in cursor:
            yield doc


# -------------------------
# Main pipeline
# -------------------------
def process_articles_and_build_kg(mongo_reader: MongoArticleReader, kg_writer: Neo4jKGWriter, max_articles=None):
    count = 0
    for doc in mongo_reader.stream_articles():
        # adjust field names to match your DB
        article_id = doc.get("_id") or doc.get("id")
        # Field names in this dataset are capitalized (Title/Abstract/Conclusions);
        # keep lowercase fallbacks for other schemas.
        title = doc.get("Title") or doc.get("title") or ""
        abstract = doc.get("Abstract") or doc.get("abstract") or doc.get("summary") or ""
        conclusion = (
            doc.get("Conclusions") or doc.get("conclusion")
            or doc.get("Results and Discussion") or doc.get("results") or ""
        )
        text_to_process = " ".join([title, abstract, conclusion]).strip()
        if not text_to_process:
            continue

        # Extract entities from each section (so we can weight by section)
        sections = [
            ("title", title, 3),
            ("abstract", abstract, 2),
            ("conclusion", conclusion, 2),
        ]

        found_entities: Set[Tuple[str, str]] = set()
        entities: List[Dict] = []

        for section_name, section_text, section_weight in sections:
            if not section_text or len(section_text.strip()) < 10:
                continue
            # run NLP on the section
            doc_nlp = NLP_MODEL(section_text)
            ents = extract_entities_from_text(doc_nlp, top_k=None)  # change top_k if you want to limit
            for ent_text, ent_label in ents:
                norm = normalize_entity(ent_text)
                if not norm:
                    continue
                # avoid duplicates in same article-section
                if (norm, section_name) in found_entities:
                    continue
                found_entities.add((norm, section_name))
                entities.append({
                    "name": norm,
                    "type": ent_label,
                    "section": section_name,
                    "weight": section_weight,
                })

        # Write the article + all its entities/relationships in a single round-trip.
        kg_writer.merge_article_with_entities(article_id, title, entities)

        count += 1
        if max_articles and count >= max_articles:
            break

        if count % 50 == 0:
            logging.info(f"Processed {count} articles...")

    logging.info(f"Finished processing {count} articles.")


# -------------------------
# Entrypoint
# -------------------------
def main():
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting pipeline...")

    mongo_reader = MongoArticleReader(MONGO_URI, MONGO_DB, MONGO_COLLECTION)
    total = mongo_reader.count()
    logging.info(f"Found {total} articles in MongoDB collection '{MONGO_COLLECTION}'.")

    kg_writer = Neo4jKGWriter(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

    try:
        process_articles_and_build_kg(mongo_reader, kg_writer, max_articles=None)
    finally:
        kg_writer.close()
        logging.info("Neo4j connection closed.")


if __name__ == "__main__":
    main()
