const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const {
  searchArticlesValidation,
  askAIQuestionValidation,
  mongoIdValidation,
  paginationValidation,
  topicValidation
} = require('../middleware/validation');

// Get latest articles (for home page)
router.get('/latest', paginationValidation, articleController.getLatestArticles);

// Get suggested articles (for home page)
router.get('/suggested', paginationValidation, articleController.getSuggestedArticles);

router.get('/knowledge-graph', articleController.getKnowledgeGraph);

// Get article by ID
router.get('/:id', mongoIdValidation, articleController.getArticleById);

// Search articles
router.post('/search', searchArticlesValidation, paginationValidation, articleController.searchArticles);

// Get articles by topic/entity
router.get('/topic/:topic', topicValidation, paginationValidation, articleController.getArticlesByTopic);

// Generate AI summary for an article
router.post('/:articleId/summary', articleController.generateAISummary);

// Ask AI questions about an article
router.post('/:articleId/ask', articleController.askAIQuestion);

module.exports = router;
