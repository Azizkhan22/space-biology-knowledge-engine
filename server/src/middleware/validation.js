const { body, param, query } = require('express-validator');

// Validation rules for article search
const searchArticlesValidation = [
  body('query')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Query must be a string between 1 and 200 characters'),
  
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object'),
  
  body('filters.year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  
  body('filters.authors')
    .optional()
    .isArray()
    .withMessage('Authors must be an array'),
  
  body('filters.authors.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each author must be a string between 1 and 100 characters'),
  
  body('filters.numAuthors')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of authors must be between 1 and 50')
];

// Validation rules for AI question
const askAIQuestionValidation = [
  body('question')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Question must be a string between 10 and 500 characters')
];

// Validation rules for MongoDB ObjectId
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid article ID format')
];

// Validation rules for pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation rules for topic parameter
const topicValidation = [
  param('topic')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Topic must be a string between 1 and 100 characters')
];

module.exports = {
  searchArticlesValidation,
  askAIQuestionValidation,
  mongoIdValidation,
  paginationValidation,
  topicValidation
};


