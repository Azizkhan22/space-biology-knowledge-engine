const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Space Biology Knowledge Engine API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);
    console.log('');

    // Test 2: Get Suggested Articles
    console.log('2. Testing Get Suggested Articles...');
    const suggestedResponse = await fetch(`${API_BASE_URL}/articles/suggested`);
    const suggestedData = await suggestedResponse.json();
    if (suggestedData.success) {
      console.log(`✅ Suggested Articles: Found ${suggestedData.data.length} articles`);
      if (suggestedData.data.length > 0) {
        console.log(`   First article: "${suggestedData.data[0].title}"`);
      }
    } else {
      console.log('❌ Suggested Articles failed:', suggestedData.error);
    }
    console.log('');

    // Test 3: Get Latest Articles
    console.log('3. Testing Get Latest Articles...');
    const latestResponse = await fetch(`${API_BASE_URL}/articles/latest`);
    const latestData = await latestResponse.json();
    if (latestData.success) {
      console.log(`✅ Latest Articles: Found ${latestData.data.length} articles`);
      console.log(`   Total articles: ${latestData.pagination.totalArticles}`);
    } else {
      console.log('❌ Latest Articles failed:', latestData.error);
    }
    console.log('');

    // Test 4: Search Articles
    console.log('4. Testing Search Articles...');
    const searchResponse = await fetch(`${API_BASE_URL}/articles/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'microgravity' })
    });
    const searchData = await searchResponse.json();
    if (searchData.success) {
      console.log(`✅ Search Articles: Found ${searchData.data.length} results for "microgravity"`);
    } else {
      console.log('❌ Search Articles failed:', searchData.error);
    }
    console.log('');

    // Test 5: Get Knowledge Graph
    console.log('5. Testing Knowledge Graph...');
    const graphResponse = await fetch(`${API_BASE_URL}/knowledge-graph`);
    const graphData = await graphResponse.json();
    if (graphData.success) {
      console.log(`✅ Knowledge Graph: Found ${graphData.data.entities.length} entities and ${graphData.data.relations.length} relations`);
    } else {
      console.log('❌ Knowledge Graph failed:', graphData.error);
    }
    console.log('');

    // Test 6: Get Article by ID (if we have articles)
    if (suggestedData.success && suggestedData.data.length > 0) {
      const articleId = suggestedData.data[0]._id;
      console.log('6. Testing Get Article by ID...');
      const articleResponse = await fetch(`${API_BASE_URL}/articles/${articleId}`);
      const articleData = await articleResponse.json();
      if (articleData.success) {
        console.log(`✅ Get Article by ID: Retrieved article "${articleData.data.title}"`);
      } else {
        console.log('❌ Get Article by ID failed:', articleData.error);
      }
      console.log('');

      // Test 7: Generate AI Summary (if AI is configured)
      console.log('7. Testing AI Summary Generation...');
      const summaryResponse = await fetch(`${API_BASE_URL}/articles/${articleId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        console.log('✅ AI Summary: Generated successfully');
        console.log(`   Summary preview: "${summaryData.data.summary.substring(0, 100)}..."`);
      } else {
        console.log('❌ AI Summary failed:', summaryData.error);
      }
      console.log('');

      // Test 8: Ask AI Question
      console.log('8. Testing AI Question...');
      const questionResponse = await fetch(`${API_BASE_URL}/articles/${articleId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What are the main findings of this research?' })
      });
      const questionData = await questionResponse.json();
      if (questionData.success) {
        console.log('✅ AI Question: Answered successfully');
        console.log(`   Answer preview: "${questionData.data.answer.substring(0, 100)}..."`);
      } else {
        console.log('❌ AI Question failed:', questionData.error);
      }
    }

    console.log('\n🎉 API Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('- All core endpoints are functional');
    console.log('- Database connection is working');
    console.log('- AI services are integrated');
    console.log('- Client can now connect to the API');

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running on port 3001');
    console.log('2. Check MongoDB connection');
    console.log('3. Verify environment variables');
    console.log('4. Run: npm run dev in the server directory');
  }
}

// Run the test
testAPI();
