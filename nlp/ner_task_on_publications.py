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

import pymongo
from neo4j import GraphDatabase

# Try to import SciSpacy model first, fall back to en_core_web_sm
try:
    import spacy

    # Prefer SciSpacy if installed and model present
    NLP_MODEL = None
    try:
        # Try SciSpacy model (if installed)
        spacy_model_name = "en_core_sci_sm"  # SciSpacy small model
        spacy.cli.download(spacy_model_name)  # attempt to ensure model available (no-op if installed)
        NLP_MODEL = spacy.load(spacy_model_name)
        logging.info(f"Loaded SciSpacy model: {spacy_model_name}")
    except Exception:
        # fallback
        spacy_model_name = "en_core_web_sm"
        try:
            spacy.cli.download(spacy_model_name)
        except Exception:
            pass
        NLP_MODEL = spacy.load(spacy_model_name)
        logging.info(f"Loaded fallback spaCy model: {spacy_model_name}")

except Exception as e:
    raise SystemExit("spaCy is required. Install with `pip install spacy` and a model. Error: " + str(e))


# -------------------------
# Configuration from ENV
# -------------------------
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "articles")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
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
        cursor = self.collection.find({}, projection or {"title": 1, "abstract": 1, "conclusion": 1})
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
        title = doc.get("title", "") or ""
        # try common fields
        abstract = doc.get("abstract") or doc.get("summary") or ""
        conclusion = doc.get("conclusion") or doc.get("results") or ""
        text_to_process = " ".join([title, abstract, conclusion]).strip()
        if not text_to_process:
            continue

        # Merge article node
        kg_writer.merge_article(article_id, title, metadata={"source": "mongo"})

        # Extract entities from sections individually (so we can weight by section)
        sections = [
            ("title", title, 3),
            ("abstract", abstract, 2),
            ("conclusion", conclusion, 2),
        ]

        found_entities: Set[str] = set()

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
                # Create/fetch entity and link
                kg_writer.merge_entity(norm, ent_type=ent_label)
                kg_writer.link_article_entity(str(article_id), norm, weight=section_weight, section=section_name)

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
