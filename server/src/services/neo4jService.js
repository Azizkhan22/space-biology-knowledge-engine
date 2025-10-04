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
        // Step 1: Get top entities (non-articles) by relationship count
        MATCH (e)
        WHERE NOT e:Article
        WITH e, COUNT { (e)--() } AS relCount
        ORDER BY relCount DESC
        LIMIT $limit
        WITH collect(e) AS topEntities
  
        // Step 2: Get relations among top entities and their connected articles
        UNWIND topEntities AS e
        OPTIONAL MATCH (e)-[r]-(n)
        WHERE (n:Article OR n IN topEntities)
        RETURN e, n AS relatedNode, r
      `;
  
      // ✅ FIXED: wrap limit as Neo4j integer
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
  
        // Add nodes
        [e, relatedNode].forEach(node => {
          const id = node.identity.toString();
          if (!entitiesMap.has(id)) {
            entitiesMap.set(id, {
              id,
              label:
                node.properties.title ||
                node.properties.name ||
                node.properties.label ||
                node.labels[0] ||
                'Entity',
              type: node.labels[0],
              ...node.properties
            });
          }
        });
  
        // Add relation
        relations.push({
          source: eId,
          target: relatedId,
          weight: r.properties?.weight || 1,
          type: r.type
        });
  
        // If related node is an article, map it
        if (relatedNode.labels.includes('Article')) {
          if (!entityArticlesMap[eId]) entityArticlesMap[eId] = [];
          entityArticlesMap[eId].push({
            id: relatedId,
            title: relatedNode.properties.title || 'Untitled Article',
            ...relatedNode.properties
          });
        }
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
