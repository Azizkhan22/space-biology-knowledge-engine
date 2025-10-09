// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class ApiService {
  static async getSuggestedArticles() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/suggested`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch suggested articles');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching suggested articles:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async searchArticles(query, filters = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search articles');
      }
      
      return data;
    } catch (error) {
      console.error('Error searching articles:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getKnowledgeGraph() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/knowledge-graph`);
      const data = await response.json();
      console.log(data.data.entities);
      if (!response.ok) {
        throw new Error(data.error ||   'Failed to fetch knowledge graph');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getArticlesByIds(articleIds) {
  try {
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return { success: true, data: [] }; 
    }

    const response = await fetch(`${API_BASE_URL}/articles/byIds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleIds) 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch articles by IDs');
    }

    return data;
  } catch (error) {
    console.error('Error fetching articles by IDs:', error);
    return { success: false, error: error.message };
  }
}
  
  static async generateAISummary(articleId, articleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${articleId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI summary');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return { success: false, error: error.message };
    }
  }

  static async askAIQuestion(articleId, question, articleData = null) {
    try {
      console.log(articleId);
      const response = await fetch(`${API_BASE_URL}/articles/${articleId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process AI question');
      }
      
      return data;
    } catch (error) {
      console.error('Error asking AI question:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ApiService;
