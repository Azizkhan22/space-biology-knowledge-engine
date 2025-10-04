const express = require('express');
const articleRoutes = require('./articleRoutes');

function setRoutes(app) {
    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({
            success: true,
            message: 'Space Biology Knowledge Engine API is running',
            timestamp: new Date().toISOString()
        });
    });

    // API routes
    app.use('/api/articles', articleRoutes);    
}

module.exports = { setRoutes };