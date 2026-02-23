/**
 * Conversation Context Tracker
 * Maintains conversation history and context for intelligent responses
 */

const MAX_CONTEXT_LENGTH = 10;
const CONTEXT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// In-memory store for conversation contexts (use Redis in production)
const conversationStore = new Map();

/**
 * Get or create conversation context for a user/session
 */
const getContext = (sessionId) => {
  if (!conversationStore.has(sessionId)) {
    conversationStore.set(sessionId, {
      sessionId,
      messages: [],
      problemHistory: [],
      lastActive: Date.now(),
      userIntent: null,
      entities: {},
      sentimentTrend: [],
    });
  }
  
  const context = conversationStore.get(sessionId);
  
  // Check if context has expired
  if (Date.now() - context.lastActive > CONTEXT_EXPIRY_MS) {
    // Reset expired context
    conversationStore.set(sessionId, {
      sessionId,
      messages: [],
      problemHistory: [],
      lastActive: Date.now(),
      userIntent: null,
      entities: {},
      sentimentTrend: [],
    });
  }
  
  return conversationStore.get(sessionId);
};

/**
 * Update conversation context with new message
 */
const updateContext = (sessionId, message, validationSummary) => {
  const context = getContext(sessionId);
  
  // Add message to history
  context.messages.push({
    text: message,
    timestamp: Date.now(),
    validation: validationSummary,
  });
  
  // Keep only recent messages
  if (context.messages.length > MAX_CONTEXT_LENGTH) {
    context.messages.shift();
  }
  
  // Track problem history
  if (validationSummary.problemCategory) {
    context.problemHistory.push({
      category: validationSummary.problemCategory,
      timestamp: Date.now(),
      urgency: validationSummary.urgency.level,
      sentiment: validationSummary.sentiment.level,
    });
    
    // Keep only recent problems
    if (context.problemHistory.length > 5) {
      context.problemHistory.shift();
    }
  }
  
  // Update user intent
  context.userIntent = validationSummary.problemCategory;
  
  // Merge entities
  context.entities = { ...context.entities, ...validationSummary.entities };
  
  // Track sentiment trend
  context.sentimentTrend.push({
    level: validationSummary.sentiment.level,
    score: validationSummary.sentiment.score,
    timestamp: Date.now(),
  });
  
  if (context.sentimentTrend.length > 5) {
    context.sentimentTrend.shift();
  }
  
  // Update last active time
  context.lastActive = Date.now();
  
  conversationStore.set(sessionId, context);
  
  return context;
};

/**
 * Analyze conversation patterns
 */
const analyzeConversationPatterns = (context) => {
  const patterns = {
    isEscalating: false,
    isRepetitive: false,
    requiresHumanIntervention: false,
    topicChanges: 0,
    averageSentiment: 0,
    sentimentTrend: 'stable',
  };
  
  if (context.messages.length < 2) {
    return patterns;
  }
  
  // Check for escalation (increasing urgency or negative sentiment)
  const recentMessages = context.messages.slice(-3);
  const urgencies = recentMessages.map(m => m.validation?.urgency?.score || 0);
  const sentiments = recentMessages.map(m => m.validation?.sentiment?.score || 0);
  
  // Check if urgency is increasing
  if (urgencies.length >= 2 && urgencies[urgencies.length - 1] > urgencies[0] + 2) {
    patterns.isEscalating = true;
  }
  
  // Check if sentiment is getting worse
  if (sentiments.length >= 2 && sentiments[sentiments.length - 1] < sentiments[0] - 3) {
    patterns.sentimentTrend = 'declining';
  } else if (sentiments.length >= 2 && sentiments[sentiments.length - 1] > sentiments[0] + 2) {
    patterns.sentimentTrend = 'improving';
  }
  
  // Check for repetitive messages
  const lastMessage = context.messages[context.messages.length - 1]?.text?.toLowerCase();
  const previousMessages = context.messages.slice(0, -1).map(m => m.text?.toLowerCase());
  
  for (const prev of previousMessages) {
    if (prev && lastMessage && similarityScore(prev, lastMessage) > 0.8) {
      patterns.isRepetitive = true;
      break;
    }
  }
  
  // Check for topic changes
  const categories = context.messages.map(m => m.validation?.problemCategory).filter(Boolean);
  for (let i = 1; i < categories.length; i++) {
    if (categories[i] !== categories[i - 1]) {
      patterns.topicChanges++;
    }
  }
  
  // Calculate average sentiment
  const allSentiments = context.sentimentTrend.map(s => s.score);
  patterns.averageSentiment = allSentiments.length > 0
    ? allSentiments.reduce((a, b) => a + b, 0) / allSentiments.length
    : 0;
  
  // Determine if human intervention is needed
  patterns.requiresHumanIntervention = 
    patterns.isEscalating ||
    patterns.isRepetitive ||
    patterns.topicChanges >= 3 ||
    patterns.averageSentiment <= -5 ||
    context.problemHistory.filter(p => 
      p.urgency === 'CRITICAL' || p.urgency === 'HIGH'
    ).length >= 2;
  
  return patterns;
};

/**
 * Calculate similarity between two strings (simple implementation)
 */
const similarityScore = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  
  return track[str2.length][str1.length];
};

/**
 * Get context-aware suggestions
 */
const getContextSuggestions = (context, currentProblem) => {
  const suggestions = [];
  
  // If there's an order number in context, suggest tracking
  if (context.entities.orderNumber) {
    suggestions.push(`Track order ${context.entities.orderNumber}`);
  }
  
  // If previous problems were about similar topics, suggest related actions
  const recentProblems = context.problemHistory.slice(-2);
  if (recentProblems.length > 0) {
    const lastProblem = recentProblems[recentProblems.length - 1];
    
    if (lastProblem.category === 'ORDER_ISSUES') {
      suggestions.push('Contact shipping carrier');
      suggestions.push('Request refund');
    } else if (lastProblem.category === 'PRODUCT_QUALITY') {
      suggestions.push('Upload photos');
      suggestions.push('Request replacement');
    } else if (lastProblem.category === 'SIZE_FIT') {
      suggestions.push('View size chart');
      suggestions.push('Request exchange');
    }
  }
  
  // If sentiment is declining, add de-escalation options
  const patterns = analyzeConversationPatterns(context);
  if (patterns.sentimentTrend === 'declining') {
    suggestions.push('Speak to a human agent');
    suggestions.push('Request callback');
  }
  
  // If conversation is going in circles, suggest escalation
  if (patterns.isRepetitive || patterns.topicChanges >= 3) {
    suggestions.push('Connect with specialist');
    suggestions.push('Escalate to supervisor');
  }
  
  return suggestions.slice(0, 5);
};

/**
 * Clear conversation context
 */
const clearContext = (sessionId) => {
  conversationStore.delete(sessionId);
};

/**
 * Get conversation statistics
 */
const getConversationStats = (sessionId) => {
  const context = getContext(sessionId);
  const patterns = analyzeConversationPatterns(context);
  
  return {
    messageCount: context.messages.length,
    duration: Date.now() - context.messages[0]?.timestamp || 0,
    problemsDiscussed: [...new Set(context.problemHistory.map(p => p.category))],
    averageSentiment: patterns.averageSentiment,
    sentimentTrend: patterns.sentimentTrend,
    requiresHumanIntervention: patterns.requiresHumanIntervention,
    isEscalating: patterns.isEscalating,
    isRepetitive: patterns.isRepetitive,
  };
};

module.exports = {
  getContext,
  updateContext,
  clearContext,
  analyzeConversationPatterns,
  getContextSuggestions,
  getConversationStats,
};
