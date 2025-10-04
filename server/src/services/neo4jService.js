const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.neo4j') });

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const database = process.env.NEO4J_DATABASE;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

/**
 * Fetch top N entities (non-articles) with the most relationships,
 * including their relations with other entities and related Articles.
 *
 * Returns:
 * {
 *   entities: [{ id, label, ...properties }],
 *   relations: [{ source, target, weight, type }]
 * }
 */
async function getTopEntitiesWithRelations(limit = 40) {
    const session = driver.session({ database });
    try {
      console.log(`🔍 [Neo4j] Fetching knowledge graph data (limit: ${limit})...`);
  
      const cypher = `
        // Step 1: Get top non-article entities by relationship count
        MATCH (e)
        WHERE NOT e:Article
        WITH e, COUNT { (e)--() } AS relCount
        ORDER BY relCount DESC
        LIMIT $limit
        WITH collect(e) AS topEntities
  
        // Step 2: Get entity-to-entity relations and related articles
        UNWIND topEntities AS e
        OPTIONAL MATCH (e)-[r]-(n)
        WHERE (n:Article OR (NOT n:Article AND n IN topEntities))
        RETURN e, n AS relatedNode, r
      `;
  
      const result = await session.run(cypher, { limit: neo4j.int(limit) });
  
      const entitiesMap = new Map();
      const relations = [];
      const entityArticlesMap = {}; // entityId → [articles]
  
      for (const record of result.records) {
        const e = record.get('e');
        const relatedNode = record.get('relatedNode');
        const r = record.get('r');
  
        if (!r || !relatedNode) continue;
  
        const eId = e.identity.toString();
        const relatedId = relatedNode.identity.toString();
  
        // Skip adding articles to the main graph
        const isArticle = relatedNode.labels.includes('Article');
  
        // ✅ Add entity node (non-article)
        if (!entitiesMap.has(eId)) {
          entitiesMap.set(eId, {
            id: eId,
            label:
              e.properties.title ||
              e.properties.name ||
              e.properties.label ||
              e.labels[0] ||
              'Entity',
            type: e.labels[0],
            ...e.properties,
            articleIds: [] // attach here directly too
          });
        }
  
        // ✅ If related node is an article, map it to the entity only
        if (isArticle) {
          if (!entityArticlesMap[eId]) entityArticlesMap[eId] = [];
          entityArticlesMap[eId].push({
            id: relatedId,
            title: relatedNode.properties.title || 'Untitled Article',
            ...relatedNode.properties
          });
          entitiesMap.get(eId).articleIds.push(relatedId);
          continue; // don't add article nodes or edges
        }
  
        // ✅ Add the related entity node (if also not an article)
        if (!entitiesMap.has(relatedId)) {
          entitiesMap.set(relatedId, {
            id: relatedId,
            label:
              relatedNode.properties.title ||
              relatedNode.properties.name ||
              relatedNode.properties.label ||
              relatedNode.labels[0] ||
              'Entity',
            type: relatedNode.labels[0],
            ...relatedNode.properties,
            articleIds: []
          });
        }
  
        // ✅ Add relation between two entities
        relations.push({
          source: eId,
          target: relatedId,
          weight: r.properties?.weight || 1,
          type: r.type
        });
      }
  
      return {
        entities: Array.from(entitiesMap.values()),
        relations,
        entityArticlesMap
      };
    } catch (error) {
      console.error('❌ [Neo4j Error] Failed to fetch knowledge graph:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
  
  
  
  
  
  

module.exports = { getTopEntitiesWithRelations };
