const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.neo4j') });

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const database = process.env.NEO4J_DATABASE;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Map biomedical entity types (from the scispaCy NER model) to the client's
// display categories, so graph nodes can be colored meaningfully.
const CATEGORY_BY_TYPE = {
  GENE_OR_GENE_PRODUCT: 'genetics',
  AMINO_ACID: 'genetics',
  SIMPLE_CHEMICAL: 'biochemistry',
  CELL: 'biology',
  CELLULAR_COMPONENT: 'biology',
  ORGANISM: 'biology',
  ORGANISM_SUBDIVISION: 'biology',
  ORGANISM_SUBSTANCE: 'biology',
  TISSUE: 'medicine',
  ORGAN: 'medicine',
  MULTI_TISSUE_STRUCTURE: 'medicine',
  ANATOMICAL_SYSTEM: 'medicine',
  DEVELOPING_ANATOMICAL_STRUCTURE: 'medicine',
  IMMATERIAL_ANATOMICAL_ENTITY: 'medicine',
  CANCER: 'health',
  PATHOLOGICAL_FORMATION: 'health',
};
const categoryForType = (t) => CATEGORY_BY_TYPE[t] || 'biology';
const num = (v) => (v && typeof v.toNumber === 'function' ? v.toNumber() : v || 0);

// Co-occurrence edges among a given set of entity names: two entities are
// related when the same article mentions both; weight = number of shared articles.
async function coOccurrenceEdges(session, names, minWeight = 1, limit = 250) {
  if (!names || names.length < 2) return [];
  const res = await session.run(
    `
    MATCH (e1:Entity)<-[:MENTIONS]-(a:Article)-[:MENTIONS]->(e2:Entity)
    WHERE e1.name IN $names AND e2.name IN $names AND e1.name < e2.name
    WITH e1.name AS source, e2.name AS target, count(DISTINCT a) AS weight
    WHERE weight >= $minWeight
    RETURN source, target, weight
    ORDER BY weight DESC
    LIMIT $limit
    `,
    { names, minWeight: neo4j.int(minWeight), limit: neo4j.int(limit) }
  );
  return res.records.map((r) => ({
    source: r.get('source'),
    target: r.get('target'),
    weight: num(r.get('weight')),
    type: 'CO_OCCURS',
  }));
}

/**
 * Corpus-wide graph: the top entities by article coverage, plus the
 * co-occurrence relationships between them.
 */
async function getTopEntitiesWithRelations(limit = 40) {
  const session = driver.session({ database });
  try {
    console.log(`🔍 [Neo4j] Fetching knowledge graph (limit: ${limit})...`);

    const entRes = await session.run(
      `
      MATCH (e:Entity)<-[:MENTIONS]-(a:Article)
      WITH e, count(DISTINCT a) AS degree, collect(DISTINCT a.id) AS articleIds
      ORDER BY degree DESC
      LIMIT $limit
      RETURN e.name AS name, e.type AS type, degree, articleIds
      `,
      { limit: neo4j.int(limit) }
    );

    const entities = [];
    const names = [];
    const entityArticlesMap = {};
    for (const rec of entRes.records) {
      const name = rec.get('name');
      const type = rec.get('type');
      const degree = num(rec.get('degree'));
      const articleIds = (rec.get('articleIds') || []).filter(Boolean);
      names.push(name);
      entityArticlesMap[name] = articleIds;
      entities.push({
        id: name,
        label: name,
        type,
        category: categoryForType(type),
        size: 24 + Math.min(degree * 1.5, 36),
        articleCount: degree,
        articleIds,
      });
    }

    // Only connect entities that share at least 2 articles, to keep the
    // corpus graph readable.
    const relations = await coOccurrenceEdges(session, names, 2, 250);

    return { entities, relations, entityArticlesMap };
  } catch (error) {
    console.error('❌ [Neo4j Error] Failed to fetch knowledge graph:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Graph scoped to a single article: the entities that article mentions, and
 * the co-occurrence relationships among those entities across the corpus.
 */
async function getArticleGraph(articleId) {
  const session = driver.session({ database });
  try {
    const entRes = await session.run(
      `
      MATCH (a:Article {id: $id})-[m:MENTIONS]->(e:Entity)
      WITH e, m.weight AS weight
      MATCH (e)<-[:MENTIONS]-(other:Article)
      WITH e, weight, collect(DISTINCT other.id) AS articleIds
      RETURN e.name AS name, e.type AS type, weight, articleIds
      ORDER BY weight DESC
      `,
      { id: String(articleId) }
    );

    const entities = [];
    const names = [];
    for (const rec of entRes.records) {
      const name = rec.get('name');
      const type = rec.get('type');
      const articleIds = (rec.get('articleIds') || []).filter(Boolean);
      names.push(name);
      entities.push({
        id: name,
        label: name,
        type,
        category: categoryForType(type),
        size: 26 + Math.min(num(rec.get('weight')) * 3, 24),
        articleCount: articleIds.length,
        articleIds,
      });
    }

    // Within one article every entity co-occurs, so keep all pairs (weight >= 1).
    const relations = await coOccurrenceEdges(session, names, 1, 200);

    return { entities, relations };
  } catch (error) {
    console.error('❌ [Neo4j Error] Failed to fetch article graph:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

module.exports = { getTopEntitiesWithRelations, getArticleGraph };
