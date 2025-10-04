const express = require('express');
const IndexController = require('../controllers/index').IndexController;

const router = express.Router();
const indexController = new IndexController();

function setRoutes(app) {
    router.get('/data', indexController.getData.bind(indexController));
    router.post('/data', indexController.postData.bind(indexController));
    
    app.use('/api', router);
}

module.exports = setRoutes;