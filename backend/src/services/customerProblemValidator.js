/**
 * Customer Problem Validator Service
 * Analyzes customer concerns to validate and identify root problems
 * Provides intelligent solutions based on problem classification
 */

const PROBLEM_CATEGORIES = {
  ORDER_ISSUES: 'ORDER_ISSUES',
  PRODUCT_QUALITY: 'PRODUCT_QUALITY',
  SHIPPING_DELIVERY: 'SHIPPING_DELIVERY',
  PAYMENT_BILLING: 'PAYMENT_BILLING',
  ACCOUNT_ACCESS: 'ACCOUNT_ACCESS',
  RETURN_EXCHANGE: 'RETURN_EXCHANGE',
  SIZE_FIT: 'SIZE_FIT',
  WEBSITE_TECHNICAL: 'WEBSITE_TECHNICAL',
  PRODUCT_AVAILABILITY: 'PRODUCT_AVAILABILITY',
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
  GENERAL_INQUIRY: 'GENERAL_INQUIRY',
};

const SENTIMENT_LEVELS = {
  VERY_NEGATIVE: 'VERY_NEGATIVE',
  NEGATIVE: 'NEGATIVE',
  NEUTRAL: 'NEUTRAL',
  POSITIVE: 'POSITIVE',
  VERY_POSITIVE: 'VERY_POSITIVE',
};

const URGENCY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * Analyze sentiment of customer message
 */
const analyzeSentiment = (text) => {
  const lowerText = text.toLowerCase();
  
  const negativeKeywords = [
    'angry', 'frustrated', 'disappointed', 'terrible', 'awful', 'horrible',
    'worst', 'hate', 'useless', 'waste', 'scam', 'fraud', 'cheated',
    'unacceptable', 'ridiculous', 'pathetic', 'disgusting', 'ruined',
    'broken', 'defective', 'damaged', 'wrong', 'never', 'cancelled',
    'refund', 'complaint', 'sue', 'report', 'lawyer', 'legal'
  ];
  
  const veryNegativeKeywords = [
    'furious', 'enraged', 'livid', 'disgusted', 'appalled', 'outraged',
    'never again', 'worst experience', 'absolutely terrible', 'completely unacceptable',
    'want my money back', 'reporting you', 'contacting lawyer', 'consumer protection'
  ];
  
  const positiveKeywords = [
    'happy', 'satisfied', 'great', 'excellent', 'amazing', 'wonderful',
    'love', 'perfect', 'fantastic', 'awesome', 'helpful', 'quick',
    'easy', 'recommend', 'best', 'thank', 'appreciate', 'good'
  ];

  let score = 0;
  let negativeCount = 0;
  let positiveCount = 0;

  // Check for very negative phrases first
  for (const phrase of veryNegativeKeywords) {
    if (lowerText.includes(phrase)) {
      return {
        level: SENTIMENT_LEVELS.VERY_NEGATIVE,
        score: -10,
        requiresImmediateAttention: true,
      };
    }
  }

  // Count negative keywords
  for (const keyword of negativeKeywords) {
    if (lowerText.includes(keyword)) {
      negativeCount++;
      score -= 2;
    }
  }

  // Count positive keywords
  for (const keyword of positiveKeywords) {
    if (lowerText.includes(keyword)) {
      positiveCount++;
      score += 1;
    }
  }

  // Check for urgency indicators
  const urgencyKeywords = ['urgent', 'asap', 'emergency', 'immediately', 'right now', 'today'];
  const hasUrgency = urgencyKeywords.some(keyword => lowerText.includes(keyword));

  // Determine sentiment level
  let level;
  if (score <= -8 || negativeCount >= 5) {
    level = SENTIMENT_LEVELS.VERY_NEGATIVE;
  } else if (score <= -4 || negativeCount >= 3) {
    level = SENTIMENT_LEVELS.NEGATIVE;
  } else if (score >= 4 || positiveCount >= 3) {
    level = SENTIMENT_LEVELS.VERY_POSITIVE;
  } else if (score >= 1 || positiveCount >= 1) {
    level = SENTIMENT_LEVELS.POSITIVE;
  } else {
    level = SENTIMENT_LEVELS.NEUTRAL;
  }

  return {
    level,
    score,
    negativeCount,
    positiveCount,
    requiresImmediateAttention: level === SENTIMENT_LEVELS.VERY_NEGATIVE || hasUrgency,
  };
};

/**
 * Classify the problem category based on customer message
 */
const classifyProblem = (text) => {
  const lowerText = text.toLowerCase();
  
  const problemPatterns = {
    [PROBLEM_CATEGORIES.ORDER_ISSUES]: {
      keywords: ['order', 'order status', 'order not', 'order cancelled', 'order wrong', 
                 'order not received', 'order lost', 'order tracking', 'order number',
                 'order id', 'confirmation', 'order confirmation'],
      patterns: [/order\s*(not|missing|wrong|lost|delayed|cancelled)/g, 
                 /where'?s?\s*my\s*order/g, 
                 /didn'?t\s*receive\s*order/g,
                 /order\s*\d+/g],
    },
    [PROBLEM_CATEGORIES.PRODUCT_QUALITY]: {
      keywords: ['quality', 'defective', 'broken', 'damaged', 'poor quality', 
                 'fell apart', 'stitching', 'material', 'cheap', 'not as described',
                 'different from picture', 'fake', 'counterfeit'],
      patterns: [/quality\s*(issue|problem|bad|poor)/g,
                 /(broken|defective|damaged)\s*(product|shoe|item)/g,
                 /not\s*as\s*described/g],
    },
    [PROBLEM_CATEGORIES.SHIPPING_DELIVERY]: {
      keywords: ['shipping', 'delivery', 'deliver', 'ship', 'tracking', 'package',
                 'parcel', 'courier', 'fedex', 'ups', 'dhl', 'post', 'mail',
                 'late delivery', 'delayed', 'not delivered', 'wrong address'],
      patterns: [/shipping\s*(delayed|late|problem|issue)/g,
                 /delivery\s*(late|delayed|not|missing|wrong)/g,
                 /tracking\s*(not|doesn'?t|issue)/g,
                 /when\s*will\s*(it|my\s*order)\s*arrive/g],
    },
    [PROBLEM_CATEGORIES.PAYMENT_BILLING]: {
      keywords: ['payment', 'charged', 'charge', 'billing', 'invoice', 'receipt',
                 'refund', 'money back', 'double charged', 'overcharged', 'card',
                 'credit card', 'debit card', 'paypal', 'transaction', 'declined'],
      patterns: [/charged\s*(twice|double|wrong|incorrect)/g,
                 /payment\s*(failed|issue|problem|declined)/g,
                 /refund\s*(not|didn'?t|where|when|status)/g,
                 /overcharged|double.?charged/g],
    },
    [PROBLEM_CATEGORIES.ACCOUNT_ACCESS]: {
      keywords: ['login', 'password', 'account', 'sign in', 'locked out', 
                 'can\'t access', 'forgot password', 'reset password', 'username',
                 'account hacked', 'suspended', 'disabled'],
      patterns: [/can'?t\s*(login|log\s*in|sign\s*in|access)/g,
                 /forgot\s*(password|username)/g,
                 /account\s*(locked|suspended|disabled| hacked)/g],
    },
    [PROBLEM_CATEGORIES.RETURN_EXCHANGE]: {
      keywords: ['return', 'exchange', 'send back', 'give back', 'return policy',
                 'return status', 'return label', 'return shipping', 'refund for return'],
      patterns: [/want\s*to\s*return/g,
                 /how\s*to\s*(return|exchange)/g,
                 /return\s*(label|status|process|policy)/g,
                 /exchange\s*(for|to|size|color)/g],
    },
    [PROBLEM_CATEGORIES.SIZE_FIT]: {
      keywords: ['size', 'fit', 'sizing', 'too big', 'too small', 'tight', 'loose',
                 'size chart', 'size guide', 'what size', 'which size', 'true to size'],
      patterns: [/too\s*(big|small|tight|loose)/g,
                 /what\s*size\s*(should|i\s*am|for)/g,
                 /size\s*(chart|guide|recommend)/g,
                 /true\s*to\s*size/g],
    },
    [PROBLEM_CATEGORIES.WEBSITE_TECHNICAL]: {
      keywords: ['website', 'app', 'bug', 'error', 'crash', 'not working', 
                 'broken', 'glitch', 'freeze', 'loading', 'checkout issue',
                 'cart not working', 'payment page', 'technical'],
      patterns: [/website\s*(not|doesn'?t)\s*work/g,
                 /error\s*(message|code|page)/g,
                 /can'?t\s*(checkout|add\s*to\s*cart|complete\s*order)/g,
                 /(app|site)\s*(crashed|frozen|broken)/g],
    },
    [PROBLEM_CATEGORIES.PRODUCT_AVAILABILITY]: {
      keywords: ['out of stock', 'unavailable', 'not available', 'when available',
                 'restock', 'back in stock', 'size not available', 'color not available'],
      patterns: [/out\s*of\s*stock/g,
                 /when\s*(will|available|back)/g,
                 /not\s*available/g,
                 /restock|back\s*in\s*stock/g],
    },
    [PROBLEM_CATEGORIES.CUSTOMER_SERVICE]: {
      keywords: ['customer service', 'support', 'help', 'contact', 'call', 
                 'email', 'phone', 'representative', 'agent', 'speak to someone'],
      patterns: [/speak\s*to\s*(someone|agent|representative)/g,
                 /customer\s*service|support/g,
                 /how\s*to\s*contact/g,
                 /no\s*one\s*(responded|helped)/g],
    },
  };

  let bestMatch = { category: PROBLEM_CATEGORIES.GENERAL_INQUIRY, confidence: 0 };

  for (const [category, config] of Object.entries(problemPatterns)) {
    let matchCount = 0;
    
    // Count keyword matches
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        matchCount++;
      }
    }
    
    // Count pattern matches
    for (const pattern of config.patterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        matchCount += matches.length;
      }
    }

    const confidence = matchCount / (config.keywords.length + config.patterns.length);
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { category, confidence, matchCount };
    }
  }

  // If no strong match, default to general inquiry
  if (bestMatch.confidence < 0.1) {
    bestMatch = { category: PROBLEM_CATEGORIES.GENERAL_INQUIRY, confidence: 0, matchCount: 0 };
  }

  return bestMatch;
};

/**
 * Determine urgency level of the problem
 */
const determineUrgency = (text, sentiment, problemCategory) => {
  const lowerText = text.toLowerCase();
  let urgency = URGENCY_LEVELS.LOW;
  let urgencyScore = 0;

  // Critical keywords
  const criticalKeywords = ['emergency', 'urgent', 'asap', 'immediately', 'right now', 'today'];
  for (const keyword of criticalKeywords) {
    if (lowerText.includes(keyword)) {
      urgencyScore += 3;
    }
  }

  // High urgency problems
  const highUrgencyProblems = [
    PROBLEM_CATEGORIES.PAYMENT_BILLING,
    PROBLEM_CATEGORIES.ACCOUNT_ACCESS,
  ];
  if (highUrgencyProblems.includes(problemCategory)) {
    urgencyScore += 2;
  }

  // Negative sentiment increases urgency
  if (sentiment.level === SENTIMENT_LEVELS.VERY_NEGATIVE) {
    urgencyScore += 3;
  } else if (sentiment.level === SENTIMENT_LEVELS.NEGATIVE) {
    urgencyScore += 1;
  }

  // Time-sensitive phrases
  const timeSensitivePatterns = [
    /need\s*(it|this|order)\s*(by|before|for)\s*(tomorrow|today|this\s*week)/g,
    /event\s*(tomorrow|tonight|this\s*week)/g,
    /gift\s*(for|tomorrow|tonight)/g,
  ];
  for (const pattern of timeSensitivePatterns) {
    if (pattern.test(lowerText)) {
      urgencyScore += 2;
    }
  }

  // Determine urgency level
  if (urgencyScore >= 5) {
    urgency = URGENCY_LEVELS.CRITICAL;
  } else if (urgencyScore >= 3) {
    urgency = URGENCY_LEVELS.HIGH;
  } else if (urgencyScore >= 1) {
    urgency = URGENCY_LEVELS.MEDIUM;
  }

  return {
    level: urgency,
    score: urgencyScore,
    estimatedResponseTime: getEstimatedResponseTime(urgency),
  };
};

/**
 * Get estimated response time based on urgency
 */
const getEstimatedResponseTime = (urgency) => {
  switch (urgency) {
    case URGENCY_LEVELS.CRITICAL:
      return 'Immediate (within 15 minutes)';
    case URGENCY_LEVELS.HIGH:
      return 'Priority (within 1 hour)';
    case URGENCY_LEVELS.MEDIUM:
      return 'Standard (within 4 hours)';
    case URGENCY_LEVELS.LOW:
      return 'Normal (within 24 hours)';
    default:
      return 'Normal (within 24 hours)';
  }
};

/**
 * Extract relevant entities from the message
 */
const extractEntities = (text) => {
  const entities = {};
  const lowerText = text.toLowerCase();

  // Extract order number patterns
  const orderPatterns = [
    /order\s*(?:#|number|id)?[:\s]*([A-Z0-9]+)/gi,
    /#([A-Z0-9]{6,})/gi,
    /order\s*[:\s]*([A-Z0-9]{6,})/gi,
  ];
  for (const pattern of orderPatterns) {
    const match = pattern.exec(text);
    if (match) {
      entities.orderNumber = match[1].toUpperCase();
      break;
    }
  }

  // Extract email
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emailMatch = emailPattern.exec(text);
  if (emailMatch) {
    entities.email = emailMatch[1];
  }

  // Extract phone number
  const phonePattern = /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
  const phoneMatch = phonePattern.exec(text);
  if (phoneMatch) {
    entities.phoneNumber = phoneMatch[1];
  }

  // Extract product mentions
  const productKeywords = ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'sandals'];
  for (const keyword of productKeywords) {
    if (lowerText.includes(keyword)) {
      entities.productType = keyword;
      break;
    }
  }

  // Extract size mentions
  const sizePattern = /size\s*(\d+\.?\d*)/gi;
  const sizeMatch = sizePattern.exec(text);
  if (sizeMatch) {
    entities.size = sizeMatch[1];
  }

  // Extract color mentions
  const colors = ['black', 'white', 'red', 'blue', 'green', 'gray', 'brown', 'pink', 'yellow', 'purple', 'navy', 'beige'];
  for (const color of colors) {
    if (lowerText.includes(color)) {
      entities.color = color;
      break;
    }
  }

  // Extract date mentions
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{1,2}/gi,
  ];
  for (const pattern of datePatterns) {
    const dateMatch = pattern.exec(text);
    if (dateMatch) {
      entities.mentionedDate = dateMatch[0];
      break;
    }
  }

  return entities;
};

/**
 * Get recommended actions based on problem category
 */
const getRecommendedActions = (problemCategory, sentiment, urgency) => {
  const actions = {
    [PROBLEM_CATEGORIES.ORDER_ISSUES]: [
      'Verify order number and status in system',
      'Check tracking information',
      'Contact shipping carrier if needed',
      'Offer expedited replacement if lost',
    ],
    [PROBLEM_CATEGORIES.PRODUCT_QUALITY]: [
      'Request photos of the defect/damage',
      'Verify purchase date and warranty',
      'Offer replacement or refund',
      'Escalate to quality team if recurring issue',
    ],
    [PROBLEM_CATEGORIES.SHIPPING_DELIVERY]: [
      'Check tracking status',
      'Contact shipping carrier',
      'Verify delivery address',
      'Offer reshipment or refund if lost',
    ],
    [PROBLEM_CATEGORIES.PAYMENT_BILLING]: [
      'Verify transaction in payment system',
      'Check for duplicate charges',
      'Contact payment processor if needed',
      'Process refund if error confirmed',
    ],
    [PROBLEM_CATEGORIES.ACCOUNT_ACCESS]: [
      'Verify user identity',
      'Reset password or unlock account',
      'Check for suspicious activity',
      'Enable 2FA if available',
    ],
    [PROBLEM_CATEGORIES.RETURN_EXCHANGE]: [
      'Verify return eligibility',
      'Generate return label',
      'Explain return process',
      'Track return shipment',
    ],
    [PROBLEM_CATEGORIES.SIZE_FIT]: [
      'Provide size chart',
      'Ask for foot measurements',
      'Recommend size based on product',
      'Offer exchange if needed',
    ],
    [PROBLEM_CATEGORIES.WEBSITE_TECHNICAL]: [
      'Gather error details and screenshots',
      'Check for known issues',
      'Escalate to technical team',
      'Offer alternative ordering method',
    ],
    [PROBLEM_CATEGORIES.PRODUCT_AVAILABILITY]: [
      'Check inventory system',
      'Offer to notify when restocked',
      'Suggest similar products',
      'Check other warehouses',
    ],
    [PROBLEM_CATEGORIES.CUSTOMER_SERVICE]: [
      'Route to appropriate department',
      'Schedule callback if needed',
      'Provide direct contact information',
      'Escalate to supervisor if requested',
    ],
    [PROBLEM_CATEGORIES.GENERAL_INQUIRY]: [
      'Gather more information',
      'Provide relevant resources',
      'Offer further assistance',
    ],
  };

  // Add urgency-based actions
  const urgencyActions = {
    [URGENCY_LEVELS.CRITICAL]: [
      '⚠️ ESCALATE IMMEDIATELY to senior support',
      '📞 Consider phone callback',
      '⏱️ Set follow-up reminder in 15 minutes',
    ],
    [URGENCY_LEVELS.HIGH]: [
      '⚡ Prioritize this ticket',
      '📧 Send acknowledgment within 1 hour',
      '⏱️ Set follow-up reminder in 1 hour',
    ],
    [URGENCY_LEVELS.MEDIUM]: [
      '📋 Add to priority queue',
      '📧 Send acknowledgment',
    ],
    [URGENCY_LEVELS.LOW]: [
      '📝 Log for standard follow-up',
    ],
  };

  // Add sentiment-based actions
  const sentimentActions = {
    [SENTIMENT_LEVELS.VERY_NEGATIVE]: [
      '💙 Use empathetic and apologetic tone',
      '🎁 Consider offering compensation (discount/free shipping)',
      '👤 Escalate to customer relations specialist',
    ],
    [SENTIMENT_LEVELS.NEGATIVE]: [
      '💙 Use empathetic tone',
      '🙏 Acknowledge frustration',
      '✅ Provide clear resolution timeline',
    ],
    [SENTIMENT_LEVELS.POSITIVE]: [
      '😊 Maintain friendly tone',
      '⭐ Thank for positive feedback',
    ],
    [SENTIMENT_LEVELS.VERY_POSITIVE]: [
      '🎉 Celebrate with customer',
      '📝 Consider for testimonial/review request',
    ],
  };

  const baseActions = actions[problemCategory] || actions[PROBLEM_CATEGORIES.GENERAL_INQUIRY];
  const urgencyAdds = urgencyActions[urgency.level] || [];
  const sentimentAdds = sentimentActions[sentiment.level] || [];

  return {
    primary: baseActions,
    urgency: urgencyAdds,
    sentiment: sentimentAdds,
    all: [...baseActions, ...urgencyAdds, ...sentimentAdds],
  };
};

/**
 * Generate validation summary
 */
const generateValidationSummary = (text) => {
  const sentiment = analyzeSentiment(text);
  const problem = classifyProblem(text);
  const urgency = determineUrgency(text, sentiment, problem.category);
  const entities = extractEntities(text);
  const actions = getRecommendedActions(problem.category, sentiment, urgency.level);

  return {
    isValid: problem.category !== PROBLEM_CATEGORIES.GENERAL_INQUIRY || text.length > 10,
    problemCategory: problem.category,
    problemConfidence: problem.confidence,
    sentiment,
    urgency,
    entities,
    recommendedActions: actions,
    summary: generateSummaryText(problem, sentiment, urgency, entities),
    suggestedResponse: generateSuggestedResponse(problem, sentiment, entities),
  };
};

/**
 * Generate human-readable summary
 */
const generateSummaryText = (problem, sentiment, urgency, entities) => {
  const parts = [];

  // Problem summary
  const problemName = problem.category.replace(/_/g, ' ').toLowerCase();
  parts.push(`Issue: ${problemName}`);

  // Sentiment summary
  const sentimentName = sentiment.level.replace(/_/g, ' ').toLowerCase();
  if (sentiment.level === SENTIMENT_LEVELS.VERY_NEGATIVE || sentiment.level === SENTIMENT_LEVELS.NEGATIVE) {
    parts.push(`Customer is ${sentimentName}`);
  }

  // Urgency summary
  parts.push(`Priority: ${urgency.level.toLowerCase()}`);

  // Entity summary
  if (entities.orderNumber) {
    parts.push(`Order: ${entities.orderNumber}`);
  }

  return parts.join(' • ');
};

/**
 * Generate suggested response template
 */
const generateSuggestedResponse = (problem, sentiment, entities) => {
  const templates = {
    [PROBLEM_CATEGORIES.ORDER_ISSUES]: `I understand you're having an issue with your order. ${entities.orderNumber ? `Let me look into order #${entities.orderNumber} for you.` : 'Could you please provide your order number so I can assist you better?'} I'm here to help resolve this for you.`,
    
    [PROBLEM_CATEGORIES.PRODUCT_QUALITY]: `I'm sorry to hear about the quality issue with your product. This is not the experience we want for our customers. Could you please share more details about the problem? If possible, photos would be helpful. We'll make this right for you.`,
    
    [PROBLEM_CATEGORIES.SHIPPING_DELIVERY]: `I understand you're concerned about the delivery of your order. Let me help you track down your package. ${entities.orderNumber ? `For order #${entities.orderNumber},` : ''} I'll check the shipping status right away.`,
    
    [PROBLEM_CATEGORIES.PAYMENT_BILLING]: `I understand you have a concern about a charge on your account. Payment issues are our top priority. Could you please provide more details about the transaction? I'll investigate this immediately.`,
    
    [PROBLEM_CATEGORIES.ACCOUNT_ACCESS]: `I'm sorry you're having trouble accessing your account. Let me help you regain access. For security purposes, I'll need to verify your identity first.`,
    
    [PROBLEM_CATEGORIES.RETURN_EXCHANGE]: `I'd be happy to help you with your return/exchange. Our return process is straightforward, and I'll guide you through each step. Could you tell me which item you'd like to return?`,
    
    [PROBLEM_CATEGORIES.SIZE_FIT]: `I'd be glad to help you find the right size! Sizing can vary between products, so let me provide you with accurate guidance. What product are you interested in, and what are your usual measurements?`,
    
    [PROBLEM_CATEGORIES.WEBSITE_TECHNICAL]: `I'm sorry you're experiencing technical difficulties. That's frustrating! Could you please describe what's happening? Any error messages or screenshots would be very helpful.`,
    
    [PROBLEM_CATEGORIES.PRODUCT_AVAILABILITY]: `I understand you're looking for a product that's currently unavailable. Let me check our inventory and see what options we have. I can also notify you when it's back in stock.`,
    
    [PROBLEM_CATEGORIES.CUSTOMER_SERVICE]: `Thank you for reaching out. I'm here to help! Could you please let me know what you need assistance with? If you need to speak with a specific department, I'll connect you right away.`,
    
    [PROBLEM_CATEGORIES.GENERAL_INQUIRY]: `Hello! I'm here to help. Could you please provide more details about your question or concern? The more information you can share, the better I can assist you.`,
  };

  let response = templates[problem.category] || templates[PROBLEM_CATEGORIES.GENERAL_INQUIRY];

  // Adjust tone based on sentiment
  if (sentiment.level === SENTIMENT_LEVELS.VERY_NEGATIVE) {
    response = `I sincerely apologize for the frustration you've experienced. This is absolutely not acceptable, and I want to make this right for you immediately. ${response}`;
  } else if (sentiment.level === SENTIMENT_LEVELS.NEGATIVE) {
    response = `I understand your frustration, and I apologize for the inconvenience. ${response}`;
  }

  return response;
};

module.exports = {
  generateValidationSummary,
  analyzeSentiment,
  classifyProblem,
  determineUrgency,
  extractEntities,
  getRecommendedActions,
  PROBLEM_CATEGORIES,
  SENTIMENT_LEVELS,
  URGENCY_LEVELS,
};
