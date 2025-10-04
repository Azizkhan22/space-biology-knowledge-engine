// testNeo4jGraph.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.neo4j') });

const { getTopEntitiesWithRelations } = require('./neo4jTopEntities'); // <-- adjust path if needed

(async () => {
  try {
    console.log('🚀 Testing Neo4j entity graph fetch...\n');
    const { entities, relations, entityArticlesMap } = await getTopEntitiesWithRelations(20);

    console.log(`✅ Retrieved ${entities.length} entities and ${relations.length} relations.\n`);

    console.log('📦 Sample entity:');
    console.log(entities[0]);

    console.log('\n🔗 Sample relation:');
    console.log(relations[0]);

    console.log('\n📰 Articles related to first entity:');
    const firstEntityId = entities[0]?.id;
    if (firstEntityId && entityArticlesMap[firstEntityId]) {
      console.log(entityArticlesMap[firstEntityId]);
    } else {
      console.log('No related articles found for the first entity.');
    }

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing Neo4j graph:', error);
    process.exit(1);
  }
})();
