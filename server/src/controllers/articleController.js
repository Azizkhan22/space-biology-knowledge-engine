const Article = require('../models/Article');
const AIService = require('../services/aiService');
const SearchService = require('../services/searchService');
const { validationResult } = require('express-validator');

const searchService = new SearchService({
  mongoUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME
});

(async () => {
  try {
    await searchService.init();
    console.log('✅ SearchService initialized');
  } catch (error) {
    console.error('❌ Failed to initialize SearchService:', error);
  }
})();

class ArticleController {
  async getLatestArticles(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      console.log(`🔍 [DB Query] Fetching latest articles - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
      
      const articles = await Article.find({})
        .sort({ PublishedDate: -1 })
        .limit(limit)
        .skip(skip)
        .select('-__v')
        .lean();

      const total = await Article.countDocuments({});
      
      console.log(`✅ [DB Result] Found ${articles.length} articles out of ${total} total articles`);
      if (articles.length > 0) {
        console.log(`📄 [DB Data] First article: ${articles[0].Title} by ${articles[0].Authors?.join(', ')}`);
      } else {
        console.log(`⚠️ [DB Warning] No articles found in database`);
      }

      res.json({
        success: true,
        data: articles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalArticles: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch latest articles'
      });
    }
  }

  // Get article by ID with full details
  async getArticlesByIds(req, res) {
  try {
    const articlesArray = req.body;
    console.log('🔍 [DB Query] Received articles array:', articlesArray);

    if (!Array.isArray(articlesArray) || articlesArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be a non-empty array of articles'
      });
    }

    // Extract IDs and validate. Accept either raw id strings or { id } objects.
    const validIds = articlesArray
      .map(a => (typeof a === 'string' ? a : a && a.id))
      .filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid article IDs provided'
      });
    }

    // Fetch articles from DB
    const articles = await Article.find({ _id: { $in: validIds } })
      .select('-__v')
      .lean();

    console.log(`✅ [DB Result] Found ${articles.length} articles`);

    res.json({
      success: true,
      data: articles
    });

  } catch (error) {
    console.error('❌ Error fetching articles by IDs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles'
    });
  }
}

  // Search articles
  async searchArticles(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { query } = req.body;
      const limit = 24;

      console.log(`🔍 [Search] Query: "${query}", Limit: ${limit}`);

      // Use the SearchService for semantic search
      const semanticResults = await searchService.searchArticles(query, limit);

      console.log(`✅ [Search] Found ${semanticResults.length} relevant articles`);

      res.json({
        success: true,
        data: semanticResults,
        query: query,
        pagination: {
          currentPage: 1,
          totalResults: semanticResults.length,
          limit
        }
      });
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search articles'
      });
    }
  }

  // Get suggested articles (for home page)
  async getSuggestedArticles(req, res) {
    try {
      const cache = require('../utils/cache');
      const { value, cached } = await cache.remember('suggested:20', 5 * 60 * 1000, async () => {
        return Article.find({})
          .sort({ PublishedDate: -1 })
          .limit(20)
          .select('-__v')
          .lean();
      });

      res.json({ success: true, cached, data: value });
    } catch (error) {
      console.error('Error fetching suggested articles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch suggested articles'
      });
    }
  }

  // Generate AI summary for an article
  async generateAISummary(req, res) {
    try {
      const { articleId } = req.params;

      if (!articleId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid article ID format'
        });
      }

      const article = await Article.findById(articleId).lean();
      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }

      const summary = await AIService.generateSummary(article);

      // Update the article with the generated summary
      await Article.findByIdAndUpdate(articleId, { 
        aiSummary: summary
      });

      res.json({
        success: true,
        data: {
          articleId: articleId,
          summary: summary,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error generating AI summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate AI summary'
      });
    }
  }

  // Ask AI questions about an article
  async askAIQuestion(req, res) {
    try {
      const { articleId } = req.params;
      const { question } = req.body;
  
      console.log("📩 Incoming AI question:", { articleId, question });
  
      // Basic checks (optional but safe)
      if (!articleId) {
        return res.status(400).json({
          success: false,
          error: "Article ID is required"
        });
      }
  
      if (!question || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Question cannot be empty"
        });
      }
  
      // Find the article by ID (no regex or validator check)
      const article = await Article.findById(articleId).lean();
  
      if (!article) {
        return res.status(404).json({
          success: false,
          error: "Article not found"
        });
      }
  
      // Call your AI logic
      const answer = await AIService.askQuestion(article, question);
  
      // Send success response
      return res.json({
        success: true,
        data: {
          question,
          answer,
          confidence: 0.8,
          sources: [
            `Article ID: ${articleId}`,
            "NASA Space Biology Database",
            "International Space Station Research"
          ],
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("❌ Error asking AI question:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process AI question"
      });
    }
  }
  

  // Get articles by topic/entity
  async getArticlesByTopic(req, res) {
    try {
      const { topic } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      console.log(`🔍 [DB Query] Fetching articles by topic: "${topic}" - Page: ${page}, Limit: ${limit}`);

      const searchQuery = {
        $or: [
          { Title: new RegExp(topic, 'i') },
          { Abstract: new RegExp(topic, 'i') },
          { 'Results and Discussion': new RegExp(topic, 'i') },
          { Conclusions: new RegExp(topic, 'i') }
        ]
      };

      console.log(`🔍 [DB Query] Topic search query:`, JSON.stringify(searchQuery, null, 2));

      const articles = await Article.find(searchQuery)
        .sort({ PublishedDate: -1 })
        .limit(limit)
        .skip(skip)
        .select('-__v')
        .lean();

      const total = await Article.countDocuments(searchQuery);
      
      console.log(`✅ [DB Result] Topic search completed - Found ${articles.length} articles out of ${total} total matches for topic: "${topic}"`);
      if (articles.length > 0) {
        console.log(`📄 [DB Data] First result: ${articles[0].Title} by ${articles[0].Authors?.join(', ')}`);
      } else {
        console.log(`⚠️ [DB Warning] No articles found for topic: "${topic}"`);
      }

      res.json({
        success: true,
        data: articles,
        topic: topic,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching articles by topic:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch articles by topic'
      });
    }
  }

  // Get knowledge graph data
  async getKnowledgeGraph(req, res) {
    try {
      const cache = require('../utils/cache');
      const limit = 40;

      // The graph is expensive (two Neo4j queries) and changes only when the
      // NLP pipeline re-runs, so cache it for 10 minutes.
      const { value, cached } = await cache.remember('knowledge-graph:40', 10 * 60 * 1000, async () => {
        console.log(`🔍 [Neo4j] Fetching knowledge graph data (limit: ${limit})...`);
        const { getTopEntitiesWithRelations } = require('../services/neo4jService');
        const { entities, relations, entityArticlesMap } = await getTopEntitiesWithRelations(limit);

        const normalizedEntities = entities.map(e => ({
          ...e,
          id: String(e.id),
          articleIds: entityArticlesMap[String(e.id)] || []
        }));

        const validIds = new Set(normalizedEntities.map(e => e.id));

        const filteredRelations = relations
          .map((r, i) => ({
            id: `${r.source}__${r.target}__${i}`,
            source: String(r.source),
            target: String(r.target),
            weight: r.weight || 1,
            type: r.type || 'CO_OCCURS'
          }))
          .filter(r => validIds.has(r.source) && validIds.has(r.target));

        return { entities: normalizedEntities, relations: filteredRelations };
      });

      console.log(`📡 Knowledge graph ${cached ? '(cached)' : '(fresh)'}: ${value.entities.length} entities, ${value.relations.length} relations.`);
      return res.status(200).json({ success: true, cached, data: value });
    } catch (error) {
      console.error('❌ [Neo4j Error] Failed to fetch knowledge graph:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch knowledge graph data from Neo4j',
        details: error.message
      });
    }
  }

  // Get the knowledge graph scoped to a single article
  async getArticleGraph(req, res) {
    try {
      const { articleId } = req.params;
      if (!articleId || !articleId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, error: 'Invalid article ID format' });
      }

      const { getArticleGraph } = require('../services/neo4jService');
      const { entities, relations } = await getArticleGraph(articleId);

      const validIds = new Set(entities.map(e => String(e.id)));
      const filteredRelations = relations
        .map((r, i) => ({
          id: `${r.source}__${r.target}__${i}`,
          source: String(r.source),
          target: String(r.target),
          weight: r.weight || 1,
          type: r.type || 'CO_OCCURS'
        }))
        .filter(r => validIds.has(r.source) && validIds.has(r.target));

      console.log(`✅ [Neo4j] Article graph: ${entities.length} entities, ${filteredRelations.length} relations.`);
      return res.status(200).json({
        success: true,
        data: { entities, relations: filteredRelations }
      });
    } catch (error) {
      console.error('❌ [Neo4j Error] Failed to fetch article graph:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch article graph',
        details: error.message
      });
    }
  }



  // Helper method to categorize authors
  categorizeTopic(author) {
    const categories = {
      'smith': 'biology',
      'johnson': 'physics',
      'brown': 'medicine',
      'davis': 'engineering',
      'wilson': 'psychology',
      'moore': 'chemistry',
      'taylor': 'mathematics',
      'anderson': 'astronomy',
      'thomas': 'geology',
      'jackson': 'computer science'
    };

    for (const [key, category] of Object.entries(categories)) {
      if (author.toLowerCase().includes(key)) {
        return category;
      }
    }
    return 'general';
  }
}

module.exports = new ArticleController();


