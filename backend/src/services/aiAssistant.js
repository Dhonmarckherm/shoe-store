const Product = require('../models/Product');
const User = require('../models/User');
const axios = require('axios');
const { generateValidationSummary, PROBLEM_CATEGORIES, SENTIMENT_LEVELS, URGENCY_LEVELS } = require('./customerProblemValidator');
const { getContext, updateContext, analyzeConversationPatterns, getContextSuggestions } = require('./conversationContext');

/**
 * AI Assistant Service
 * Uses Qwen AI for intelligent responses with fallback to rule-based system
 * Enhanced with problem validation and conversation context tracking
 */

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-plus';
const USE_QWEN = process.env.USE_QWEN === 'true' && QWEN_API_KEY && QWEN_API_KEY !== 'your-qwen-api-key-here';

const INTENTS = {
  PRODUCT_SEARCH: 'PRODUCT_SEARCH',
  PRODUCT_RECOMMENDATION: 'PRODUCT_RECOMMENDATION',
  ORDER_STATUS: 'ORDER_STATUS',
  CART_HELP: 'CART_HELP',
  SHIPPING_INFO: 'SHIPPING_INFO',
  RETURN_POLICY: 'RETURN_POLICY',
  SIZE_GUIDE: 'SIZE_GUIDE',
  PRICE_FILTER: 'PRICE_FILTER',
  CATEGORY_BROWSE: 'CATEGORY_BROWSE',
  GENERAL_HELP: 'GENERAL_HELP',
  UNKNOWN: 'UNKNOWN',
};

const analyzeQuery = (query) => {
  const lowerQuery = query.toLowerCase();

  // Brand search - check early for brand mentions
  const brands = ['nike', 'adidas', 'puma', 'reebok', 'new balance', 'converse', 'vans', 'jordan'];
  for (const brand of brands) {
    if (lowerQuery.includes(brand)) {
      const entities = extractProductEntities(lowerQuery);
      if (!entities.brand) entities.brand = brand;
      return { intent: INTENTS.PRODUCT_SEARCH, entities };
    }
  }

  if (lowerQuery.match(/search|find|look for|show me|want|need|looking for|have|got|available/)) {
    const entities = extractProductEntities(lowerQuery);
    return { intent: INTENTS.PRODUCT_SEARCH, entities };
  }

  if (lowerQuery.match(/recommend|suggest|best|popular|trending|top rated|favorite/)) {
    const entities = extractProductEntities(lowerQuery);
    return { intent: INTENTS.PRODUCT_RECOMMENDATION, entities };
  }

  if (lowerQuery.match(/order|delivery|shipping status|track|where is my|my order|order status/)) {
    return { intent: INTENTS.ORDER_STATUS, entities: {} };
  }

  if (lowerQuery.match(/cart|basket|add to cart|remove from cart|checkout|shopping bag/)) {
    return { intent: INTENTS.CART_HELP, entities: {} };
  }

  if (lowerQuery.match(/shipping|delivery time|how long|when will|arrive|ship to|shipping cost/)) {
    return { intent: INTENTS.SHIPPING_INFO, entities: {} };
  }

  if (lowerQuery.match(/return|refund|exchange|send back|give back/)) {
    return { intent: INTENTS.RETURN_POLICY, entities: {} };
  }

  if (lowerQuery.match(/size|fit|sizing|what size|size chart|too big|too small/)) {
    const entities = extractProductEntities(lowerQuery);
    return { intent: INTENTS.SIZE_GUIDE, entities };
  }

  if (lowerQuery.match(/price|cheap|expensive|budget|under|cost|affordable|discount|sale/)) {
    const priceRange = extractPriceRange(lowerQuery);
    const entities = extractProductEntities(lowerQuery);
    return { intent: INTENTS.PRICE_FILTER, entities: { priceRange, ...entities } };
  }

  if (lowerQuery.match(/category|type|kind|running|casual|formal|sports|sneakers|boots|sandals|training/)) {
    const category = extractCategory(lowerQuery);
    return { intent: INTENTS.CATEGORY_BROWSE, entities: { category } };
  }

  if (lowerQuery.match(/help|support|assist|question|problem|issue|contact/)) {
    return { intent: INTENTS.GENERAL_HELP, entities: {} };
  }

  return { intent: INTENTS.UNKNOWN, entities: {} };
};

const extractProductEntities = (query) => {
  const entities = {};

  const categories = ['running', 'casual', 'formal', 'sports', 'sneakers', 'boots', 'sandals', 'training'];
  for (const category of categories) {
    if (query.includes(category)) {
      entities.category = category;
      break;
    }
  }

  const brands = ['nike', 'adidas', 'puma', 'reebok', 'new balance', 'converse', 'vans', 'jordan'];
  for (const brand of brands) {
    if (query.includes(brand)) {
      entities.brand = brand;
      break;
    }
  }

  const colors = ['black', 'white', 'red', 'blue', 'green', 'gray', 'brown', 'pink', 'yellow', 'purple'];
  const foundColors = colors.filter(color => query.includes(color));
  if (foundColors.length > 0) {
    entities.color = foundColors[0];
  }

  const sizeMatch = query.match(/size\s*(\d+\.?\d*)/);
  if (sizeMatch) {
    entities.size = sizeMatch[1];
  }

  return entities;
};

const extractPriceRange = (query) => {
  const priceMatch = query.match(/(\d+)\s*(?:to|-)\s*(\d+)/);
  if (priceMatch) {
    return { min: parseFloat(priceMatch[1]), max: parseFloat(priceMatch[2]) };
  }

  const underMatch = query.match(/under\s*(\d+)/);
  if (underMatch) {
    return { max: parseFloat(underMatch[1]) };
  }

  const overMatch = query.match(/over\s*(\d+)/);
  if (overMatch) {
    return { min: parseFloat(overMatch[1]) };
  }

  return {};
};

const extractCategory = (query) => {
  const categories = ['running', 'casual', 'formal', 'sports', 'sneakers', 'boots', 'sandals', 'training'];
  for (const category of categories) {
    if (query.includes(category)) {
      return category;
    }
  }
  return null;
};

const generateResponse = async (intent, entities, userId = null) => {
  switch (intent) {
    case INTENTS.PRODUCT_SEARCH:
      return await handleProductSearch(entities);
    case INTENTS.PRODUCT_RECOMMENDATION:
      return await handleRecommendation(entities, userId);
    case INTENTS.ORDER_STATUS:
      return handleOrderStatus();
    case INTENTS.CART_HELP:
      return handleCartHelp();
    case INTENTS.SHIPPING_INFO:
      return handleShippingInfo();
    case INTENTS.RETURN_POLICY:
      return handleReturnPolicy();
    case INTENTS.SIZE_GUIDE:
      return handleSizeGuide(entities);
    case INTENTS.PRICE_FILTER:
      return await handlePriceFilter(entities.priceRange);
    case INTENTS.CATEGORY_BROWSE:
      return await handleCategoryBrowse(entities.category);
    case INTENTS.GENERAL_HELP:
      return handleGeneralHelp();
    default:
      return handleUnknown();
  }
};

const handleProductSearch = async (entities) => {
  const filter = { isActive: true };

  if (entities.category) filter.category = entities.category;
  if (entities.brand) filter.brand = { $regex: entities.brand, $options: 'i' };

  const products = await Product.find(filter).limit(5);

  if (products.length === 0) {
    return {
      message: "I couldn't find any products matching your search. Try browsing our categories!",
      suggestions: ['Show all products', 'Browse by category', 'Show featured products'],
    };
  }

  const productList = products.map(p => `- ${p.name} (${p.brand}) - $${p.price}`).join('\n');

  return {
    message: `I found ${products.length} product(s) for you:\n\n${productList}`,
    products: products,
    suggestions: ['Show more', 'Filter by price', 'View details'],
  };
};

const handleRecommendation = async (entities, userId) => {
  if (userId) {
    const user = await User.findById(userId);
    if (user && user.browsingHistory.length > 0) {
      const categories = [...new Set(user.browsingHistory.map(h => h.category))];
      const recommendations = await Product.find({
        category: { $in: categories },
        isActive: true,
      }).sort({ rating: -1 }).limit(5);

      if (recommendations.length > 0) {
        const recList = recommendations.map(p => `- ${p.name} - $${p.price} ⭐ ${p.rating}`).join('\n');
        return {
          message: `Based on your browsing history, here are my top picks:\n\n${recList}`,
          products: recommendations,
          suggestions: ['Add to cart', 'View similar', 'More recommendations'],
        };
      }
    }
  }

  const popular = await Product.find({ isActive: true }).sort({ rating: -1, numReviews: -1 }).limit(5);
  const popularList = popular.map(p => `- ${p.name} - $${p.price} ⭐ ${p.rating} (${p.numReviews} reviews)`).join('\n');

  return {
    message: `Here are our most popular products:\n\n${popularList}`,
    products: popular,
    suggestions: ['View details', 'Filter by category', 'Show trending'],
  };
};

const handleOrderStatus = () => ({
  message: "To check your order status, go to 'My Orders' in your account. You'll see real-time updates on processing and delivery. Need more help? Contact our support team.",
  suggestions: ['Go to My Orders', 'Contact support', 'Track order'],
});

const handleCartHelp = () => ({
  message: "Your shopping cart stores items before checkout. You can:\n• Add items by clicking 'Add to Cart'\n• Update quantities in the cart\n• Remove items anytime\n• Apply discount codes at checkout\n\nClick the cart icon in the navbar to checkout!",
  suggestions: ['Go to cart', 'Continue shopping', 'Apply discount'],
});

const handleShippingInfo = () => ({
  message: "📦 Shipping Information:\n• Standard: 5-7 business days (Free on orders over $50)\n• Express: 2-3 business days ($9.99)\n• Next Day: Order by 2PM ($19.99)\n\nWe ship nationwide! You'll receive a tracking number once shipped.",
  suggestions: ['View shipping rates', 'Track order', 'Continue shopping'],
});

const handleReturnPolicy = () => ({
  message: "🔄 Return Policy:\n• 30-day return window from delivery\n• Items must be unworn with original packaging\n• Free returns for exchange or store credit\n• Refunds processed within 5-7 business days\n\nTo initiate a return, go to 'My Orders' and select 'Return Item'.",
  suggestions: ['Start a return', 'View return policy', 'Contact support'],
});

const handleSizeGuide = (entities) => {
  let sizeInfo = "📏 Size Guide:\n\n";

  if (entities.category === 'running' || entities.category === 'sports') {
    sizeInfo += "For athletic shoes, we recommend going half a size up for optimal comfort.\n\n";
  }

  sizeInfo += "US Men's | US Women's | EU | UK\n";
  sizeInfo += "---------|------------|-----|----\n";
  sizeInfo += "   7     |     8.5    |  40 |  6\n";
  sizeInfo += "   8     |     9.5    |  41 |  7\n";
  sizeInfo += "   9     |    10.5    |  42 |  8\n";
  sizeInfo += "   10    |    11.5    |  43 |  9\n";
  sizeInfo += "   11    |    12.5    |  44 | 10\n";
  sizeInfo += "   12    |    13.5    |  45 | 11\n\n";
  sizeInfo += "💡 Tip: Measure your foot length and compare with our size chart!";

  return {
    message: sizeInfo,
    suggestions: ['View full size chart', 'How to measure', 'Back to shopping'],
  };
};

const handlePriceFilter = async (priceRange) => {
  const filter = { isActive: true };

  if (priceRange) {
    filter.price = {};
    if (priceRange.min) filter.price.$gte = priceRange.min;
    if (priceRange.max) filter.price.$lte = priceRange.max;
  }

  const products = await Product.find(filter).sort({ price: 1 }).limit(5);

  if (products.length === 0) {
    return {
      message: "No products found in that price range. Try adjusting your budget!",
      suggestions: ['Show all products', 'View sale items', 'Adjust price range'],
    };
  }

  const productList = products.map(p => `- ${p.name} - $${p.price}`).join('\n');

  return {
    message: `Here are some great options within your budget:\n\n${productList}`,
    products: products,
    suggestions: ['Show more', 'Filter by category', 'Sort by rating'],
  };
};

const handleCategoryBrowse = async (category) => {
  if (!category) {
    const categories = await Product.distinct('category', { isActive: true });
    return {
      message: `Here are our available categories:\n\n${categories.map(c => `• ${c.charAt(0).toUpperCase() + c.slice(1)}`).join('\n')}\n\nWhich category interests you?`,
      suggestions: categories.map(c => `Show ${c} shoes`),
    };
  }

  const products = await Product.find({ category, isActive: true }).sort({ rating: -1 }).limit(5);

  if (products.length === 0) {
    return {
      message: `Sorry, we don't have any ${category} shoes available. Check back soon!`,
      suggestions: ['Show all categories', 'Show similar products', 'Back to home'],
    };
  }

  const productList = products.map(p => `- ${p.name} - $${p.price} ⭐ ${p.rating}`).join('\n');

  return {
    message: `Great choice! Here are our top-rated ${category} shoes:\n\n${productList}`,
    products: products,
    suggestions: ['View all in category', 'Filter by price', 'Sort by newest'],
  };
};

const handleGeneralHelp = () => ({
  message: "👋 I'm here to help! I can assist you with:\n\n• Finding the perfect shoes\n• Product recommendations\n• Order tracking\n• Cart & checkout help\n• Shipping & returns\n• Size guidance\n\nJust ask me anything!",
  suggestions: ['Find running shoes', 'Track my order', 'Return policy', 'Size guide'],
});

const handleUnknown = () => ({
  message: "I'm not sure I understand. Could you rephrase that? I can help you find shoes, check orders, or answer questions about shipping and returns.",
  suggestions: ['Find shoes', 'Track order', 'Shipping info', 'Return policy', 'Talk to support'],
});

/**
 * Get system prompt with store context
 */
const getSystemPrompt = async () => {
  const categories = await Product.distinct('category', { isActive: true });
  
  return `You are a helpful AI shopping assistant for a shoe store. Help customers find products, answer questions about orders, shipping, returns, and sizing.

Store Policies:
- Shipping: Standard (5-7 days, free over $50), Express (2-3 days, $9.99), Next Day ($19.99)
- Returns: 30-day return window, unworn with original packaging, free returns
- Size Guide: Available for all products, recommend half size up for athletic shoes

Available Categories: ${categories.join(', ')}

Be friendly, concise, and helpful. Always suggest products when relevant.`;
};

/**
 * Call Qwen AI API for intelligent response
 */
const callQwenAI = async (query, userId, context) => {
  if (!USE_QWEN) {
    console.log('Qwen AI not configured, using rule-based system');
    return null; // Fallback to rule-based
  }

  try {
    console.log('Calling Qwen AI API...');
    const systemPrompt = await getSystemPrompt();
    
    // Try the OpenAI-compatible endpoint
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User query: ${query}\n\nContext: ${JSON.stringify(context)}` }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('Qwen AI response received');
    const aiMessage = response.data?.choices?.[0]?.message?.content;
    
    if (aiMessage) {
      return {
        message: aiMessage,
        suggestions: ['View products', 'Learn more', 'Ask another question'],
      };
    }
  } catch (error) {
    console.error('Qwen AI error:', error.response?.data || error.message);
    // Fallback to rule-based system
  }
  
  return null;
};

/**
 * Process user query with enhanced problem validation
 */
const processQuery = async (query, userId = null, sessionId = null) => {
  try {
    // Generate session ID if not provided
    const session = sessionId || userId || `anon_${Date.now()}`;
    
    // Step 1: Validate and analyze the customer's problem
    const validationSummary = generateValidationSummary(query);
    
    // Step 2: Update conversation context
    const conversationContext = updateContext(session, query, validationSummary);
    
    // Step 3: Analyze conversation patterns
    const patterns = analyzeConversationPatterns(conversationContext);
    
    // Step 4: Get context-aware suggestions
    const contextSuggestions = getContextSuggestions(conversationContext, validationSummary.problemCategory);
    
    console.log('=== PROBLEM VALIDATION ===');
    console.log('Category:', validationSummary.problemCategory);
    console.log('Sentiment:', validationSummary.sentiment.level);
    console.log('Urgency:', validationSummary.urgency.level);
    console.log('Requires Human:', patterns.requiresHumanIntervention);
    
    // Step 5: Check if human intervention is needed
    if (patterns.requiresHumanIntervention) {
      return {
        success: true,
        query,
        intent: 'ESCALATION_REQUIRED',
        message: validationSummary.suggestedResponse,
        suggestions: [...contextSuggestions, 'Connect with human agent'],
        validation: validationSummary,
        conversationStats: getConversationStats(session),
        requiresEscalation: true,
        escalationReason: getEscalationReason(patterns),
      };
    }
    
    // Step 6: Try Qwen AI for product-related queries
    if (USE_QWEN) {
      const aiContext = {
        userId,
        timestamp: new Date().toISOString(),
        validation: validationSummary,
        conversationHistory: conversationContext.messages.slice(-3),
      };

      const aiResponse = await callQwenAIWithValidation(query, aiContext, validationSummary);

      if (aiResponse) {
        // Get products if query is product-related
        const { intent, entities } = analyzeQuery(query);
        let products = [];

        if (intent === INTENTS.PRODUCT_SEARCH || intent === INTENTS.PRODUCT_RECOMMENDATION) {
          const filter = { isActive: true };
          if (entities.category) filter.category = entities.category;
          if (entities.brand) filter.brand = { $regex: entities.brand, $options: 'i' };
          products = await Product.find(filter).limit(4);
        }

        return {
          success: true,
          query,
          intent: 'QWEN_AI',
          ...aiResponse,
          suggestions: [...(aiResponse.suggestions || []), ...contextSuggestions].slice(0, 5),
          products: products.length > 0 ? products : undefined,
          validation: validationSummary,
          conversationStats: getConversationStats(session),
        };
      }
    }

    // Step 7: Use rule-based system with validation-aware responses
    const response = await generateValidationAwareResponse(validationSummary, conversationContext, userId);
    
    // Get products if relevant
    let products = [];
    const { intent, entities } = analyzeQuery(query);
    
    if (intent === INTENTS.PRODUCT_SEARCH || intent === INTENTS.PRODUCT_RECOMMENDATION) {
      const filter = { isActive: true };
      if (entities.category) filter.category = entities.category;
      if (entities.brand) filter.brand = { $regex: entities.brand, $options: 'i' };
      products = await Product.find(filter).limit(4);
    }

    return {
      success: true,
      query,
      intent: validationSummary.problemCategory,
      ...response,
      suggestions: [...(response.suggestions || []), ...contextSuggestions].slice(0, 5),
      products: products.length > 0 ? products : undefined,
      validation: validationSummary,
      conversationStats: getConversationStats(session),
    };
  } catch (error) {
    console.error('AI Assistant error:', error);
    return {
      success: false,
      message: "I'm having trouble processing your request. Please try again or contact support.",
      intent: INTENTS.UNKNOWN,
    };
  }
};

/**
 * Get escalation reason based on conversation patterns
 */
const getEscalationReason = (patterns) => {
  if (patterns.isEscalating) return 'Conversation is escalating - customer becoming more frustrated';
  if (patterns.isRepetitive) return 'Conversation is going in circles - customer not getting resolution';
  if (patterns.topicChanges >= 3) return 'Multiple unrelated issues - requires human assessment';
  if (patterns.averageSentiment <= -5) return 'Very negative sentiment - requires special handling';
  return 'Complex issue requires human assistance';
};

/**
 * Generate response based on problem validation
 */
const generateValidationAwareResponse = async (validation, context, userId) => {
  const { problemCategory, sentiment, urgency, suggestedResponse } = validation;
  
  // Customize response based on sentiment
  let message = suggestedResponse;
  
  // Add urgency indicator for high priority issues
  if (urgency.level === URGENCY_LEVELS.CRITICAL || urgency.level === URGENCY_LEVELS.HIGH) {
    message = `⚡ **Priority Support**: ${message}`;
  }
  
  // Add empathy for negative sentiment
  if (sentiment.level === SENTIMENT_LEVELS.VERY_NEGATIVE) {
    message = `${message}\n\n💙 I truly understand your frustration, and I want to assure you that we're committed to making this right for you.`;
  }
  
  // Get problem-specific response
  const problemResponse = await getProblemSpecificResponse(problemCategory, context, userId);
  
  if (problemResponse) {
    message = `${message}\n\n${problemResponse.message}`;
  }
  
  return {
    message,
    suggestions: getProblemSuggestions(problemCategory),
    validationSummary: validation.summary,
  };
};

/**
 * Get problem-specific response with database lookups
 */
const getProblemSpecificResponse = async (problemCategory, context, userId) => {
  switch (problemCategory) {
    case PROBLEM_CATEGORIES.ORDER_ISSUES:
      if (context.entities.orderNumber) {
        // Here you would look up the actual order
        return {
          message: `Let me check the status of order #${context.entities.orderNumber} for you...`,
        };
      }
      return {
        message: 'Could you please provide your order number so I can look up the details?',
      };
    
    case PROBLEM_CATEGORIES.PRODUCT_QUALITY:
      return {
        message: 'I apologize for the quality issue. Could you please describe the problem in detail? If possible, please have photos ready to share.',
      };
    
    case PROBLEM_CATEGORIES.SIZE_FIT:
      return {
        message: "I'd be happy to help with sizing! Here's our general guide:\n\n• Running/Athletic shoes: Go half size up\n• Casual shoes: True to size\n• Boots: Consider thick socks\n\nWhat specific product are you interested in?",
      };
    
    case PROBLEM_CATEGORIES.RETURN_EXCHANGE:
      return {
        message: 'Our return process is simple:\n1. Go to "My Orders" in your account\n2. Select the item to return\n3. Choose reason and print label\n4. Drop off at any shipping location\n\nReturns are free and refunds process in 5-7 days.',
      };
    
    default:
      return null;
  }
};

/**
 * Get suggestions based on problem category
 */
const getProblemSuggestions = (problemCategory) => {
  const suggestionMap = {
    [PROBLEM_CATEGORIES.ORDER_ISSUES]: ['Track my order', 'Contact support', 'Request refund'],
    [PROBLEM_CATEGORIES.PRODUCT_QUALITY]: ['Upload photos', 'Request replacement', 'Read warranty'],
    [PROBLEM_CATEGORIES.SHIPPING_DELIVERY]: ['Check tracking', 'Update address', 'Reschedule delivery'],
    [PROBLEM_CATEGORIES.PAYMENT_BILLING]: ['View transactions', 'Request refund', 'Update payment method'],
    [PROBLEM_CATEGORIES.ACCOUNT_ACCESS]: ['Reset password', 'Unlock account', 'Contact support'],
    [PROBLEM_CATEGORIES.RETURN_EXCHANGE]: ['Start return', 'Print label', 'Check return status'],
    [PROBLEM_CATEGORIES.SIZE_FIT]: ['View size chart', 'Measure foot', 'Exchange size'],
    [PROBLEM_CATEGORIES.WEBSITE_TECHNICAL]: ['Report bug', 'Try mobile app', 'Contact support'],
    [PROBLEM_CATEGORIES.PRODUCT_AVAILABILITY]: ['Notify when available', 'View similar', 'Check stores'],
    [PROBLEM_CATEGORIES.CUSTOMER_SERVICE]: ['Request callback', 'Email support', 'Live chat'],
    [PROBLEM_CATEGORIES.GENERAL_INQUIRY]: ['Browse products', 'View FAQs', 'Contact support'],
  };
  
  return suggestionMap[problemCategory] || ['How can I help?', 'View products', 'Contact support'];
};

/**
 * Call Qwen AI with validation context
 */
const callQwenAIWithValidation = async (query, context, validation) => {
  if (!USE_QWEN) {
    return null;
  }

  try {
    const systemPrompt = await getSystemPrompt();

    // Enhanced prompt with validation data
    const enhancedPrompt = `User Query: ${query}

Problem Analysis:
- Category: ${validation.problemCategory}
- Sentiment: ${validation.sentiment.level} (score: ${validation.sentiment.score})
- Urgency: ${validation.urgency.level}
- Entities: ${JSON.stringify(validation.entities)}

Conversation Context: ${JSON.stringify(context.conversationHistory || [])}

Please provide a helpful, empathetic response that addresses the customer's specific concern.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt }
        ],
        max_tokens: 600,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Shoe Store Assistant'
        },
        timeout: 15000
      }
    );

    const aiMessage = response.data?.choices?.[0]?.message?.content;

    if (aiMessage) {
      return {
        message: aiMessage,
        suggestions: ['View products', 'Learn more', 'Ask another question'],
      };
    }
  } catch (error) {
    console.error('Qwen AI error:', error.response?.data || error.message);
  }

  return null;
};

// Add getConversationStats import
const { getConversationStats } = require('./conversationContext');

module.exports = {
  processQuery,
  INTENTS,
  analyzeQuery,
};
