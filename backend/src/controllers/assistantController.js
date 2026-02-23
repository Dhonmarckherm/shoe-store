const { processQuery } = require('../services/aiAssistant');

/**
 * @desc    Chat with AI assistant
 * @route   POST /api/assistant/chat
 * @access  Public (optional auth for personalized responses)
 */
const chatWithAssistant = async (req, res) => {
  try {
    const { query, sessionId } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    // Use user ID if authenticated, otherwise use session ID or create anonymous
    const userId = req.user ? req.user._id : null;
    const session = sessionId || userId || `anon_${Date.now()}`;
    
    const response = await processQuery(query, userId, session);

    res.json(response);
  } catch (error) {
    console.error('Assistant chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing your request',
      error: error.message,
    });
  }
};

/**
 * @desc    Get quick suggestion prompts
 * @route   GET /api/assistant/suggestions
 * @access  Public
 */
const getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      'Find running shoes',
      'Recommend me some shoes',
      'Show me shoes under $100',
      'What is your return policy?',
      'How long does shipping take?',
      'Help me find my size',
      'Track my order',
      'Show me casual shoes',
    ];

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAssistant,
  getSuggestions,
};
