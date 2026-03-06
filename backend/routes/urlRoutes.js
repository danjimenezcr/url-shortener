const express = require('express');
const router = express.Router();

const urlController = require('../controllers/urlController');

// /api/urls
router.post('/urls', urlController.createUrl);
router.get('/urls', urlController.getAllUrls);

// /api/urls/:id
router.get('/urls/:id', urlController.getUrlById);

const statsController = require('../controllers/statsController');
router.get('/urls/:id/stats', statsController.getUrlStats);

module.exports = router;