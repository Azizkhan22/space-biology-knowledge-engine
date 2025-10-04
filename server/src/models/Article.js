const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  Link: {
    type: String,
    trim: true
  },
  Abstract: {
    type: String,
    required: true,
    trim: true
  },
  'Results and Discussion': {
    type: String,
    trim: true
  },
  Conclusions: {
    type: String,
    trim: true
  },
  Authors: [{
    type: String,
    required: true,
    trim: true
  }],
  NumAuthors: {
    type: Number,
    required: true,
    min: 1
  },
  PublishedDate: {
    type: Date,
    required: true
  }
}, {
  collection: 'Articles',
  timestamps: false
});

// Indexes for better query performance
articleSchema.index({ Title: 'text', Abstract: 'text' });
articleSchema.index({ PublishedDate: -1 });
articleSchema.index({ Authors: 1 });
articleSchema.index({ NumAuthors: 1 });

module.exports = mongoose.model('Article', articleSchema);


