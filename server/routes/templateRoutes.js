const express = require('express');
const router = express.Router();
const { getTemplates, createTemplate } = require('../controllers/templateController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // All template routes require authentication

router.get('/', getTemplates);
router.post('/', createTemplate);

module.exports = router;
