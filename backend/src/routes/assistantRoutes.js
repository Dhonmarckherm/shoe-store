const express = require('express');
const router = express.Router();
const { chatWithAssistant, getSuggestions } = require('../controllers/assistantController');
const { protect } = require('../middleware/auth');

router.post('/chat', chatWithAssistant);
router.get('/suggestions', getSuggestions);

module.exports = router;
