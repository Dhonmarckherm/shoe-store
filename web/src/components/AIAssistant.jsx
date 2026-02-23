import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions for validation display
const getSentimentColor = (level) => {
  const colors = {
    VERY_NEGATIVE: '#dc2626',
    NEGATIVE: '#f97316',
    NEUTRAL: '#6b7280',
    POSITIVE: '#22c55e',
    VERY_POSITIVE: '#16a34a',
  };
  return colors[level] || '#6b7280';
};

const getSentimentLabel = (level) => {
  const labels = {
    VERY_NEGATIVE: '😠 Very Frustrated',
    NEGATIVE: '😕 Frustrated',
    NEUTRAL: '😐 Neutral',
    POSITIVE: '😊 Happy',
    VERY_POSITIVE: '😍 Very Happy',
  };
  return labels[level] || level;
};

const getUrgencyColor = (level) => {
  const colors = {
    CRITICAL: '#dc2626',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };
  return colors[level] || '#6b7280';
};

const formatEntities = (entities) => {
  const parts = [];
  if (entities.orderNumber) parts.push(`Order: ${entities.orderNumber}`);
  if (entities.email) parts.push(`Email: ${entities.email}`);
  if (entities.size) parts.push(`Size: ${entities.size}`);
  if (entities.color) parts.push(`Color: ${entities.color}`);
  if (entities.productType) parts.push(`Product: ${entities.productType}`);
  return parts.join(' • ');
};

const AIAssistant = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hi! I'm your AI shopping assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevAuthState = useRef(isAuthenticated);

  // Clear chat history when user logs out
  useEffect(() => {
    if (prevAuthState.current && !isAuthenticated) {
      // User just logged out - clear chat history
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: "👋 Hi! I'm your AI shopping assistant. How can I help you today?",
        },
      ]);
      setSuggestions([]);
      setInputValue('');
    }
    prevAuthState.current = isAuthenticated;
  }, [isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/assistant/suggestions`);
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_URL}/assistant/chat`,
        { query: text.trim(), sessionId },
        config
      );

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.message,
        suggestions: response.data.suggestions || [],
        products: response.data.products || [],
        validation: response.data.validation || null,
        requiresEscalation: response.data.requiresEscalation || false,
        escalationReason: response.data.escalationReason || null,
        conversationStats: response.data.conversationStats || null,
      };

      setMessages((prev) => [...prev, botMessage]);
      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '380px',
            height: '550px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 5px 40px rgba(0, 0, 0, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '16px 20px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  AI Assistant
                </h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                  Online • Ready to help
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f7f7f8',
            }}
          >
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      message.type === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      background:
                        message.type === 'user'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'white',
                      color: message.type === 'user' ? 'white' : '#333',
                      boxShadow:
                        message.type === 'user'
                          ? '0 2px 8px rgba(102, 126, 234, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      borderBottomRightRadius:
                        message.type === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius:
                        message.type === 'bot' ? '4px' : '16px',
                      borderTopRightRadius:
                        message.type === 'user' ? '4px' : '16px',
                      borderTopLeftRadius:
                        message.type === 'bot' ? '4px' : '16px',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5',
                      }}
                    >
                      {message.text}
                    </p>
                  </div>
                </div>

                {/* Validation Info & Escalation Notice */}
                {message.type === 'bot' && message.validation && (
                  <>
                    {/* Escalation Notice */}
                    {message.requiresEscalation && (
                      <div
                        style={{
                          maxWidth: '80%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: '#fef3c7',
                          border: '2px solid #f59e0b',
                          marginBottom: '12px',
                          marginLeft: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px' }}>⚠️</span>
                          <strong style={{ color: '#92400e', fontSize: '14px' }}>Human Agent Required</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>
                          {message.escalationReason || 'This issue requires assistance from a human agent.'}
                        </p>
                        <button
                          onClick={() => sendMessage('Connect me with a human agent')}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            backgroundColor: '#f59e0b',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Request Human Agent
                        </button>
                      </div>
                    )}

                    {/* Problem Analysis Summary */}
                    {!message.requiresEscalation && message.validation.problemCategory && (
                      <div
                        style={{
                          maxWidth: '80%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          marginBottom: '12px',
                          marginLeft: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            backgroundColor: '#0ea5e9', 
                            color: 'white', 
                            borderRadius: '12px',
                            fontWeight: '500',
                          }}>
                            {message.validation.problemCategory.replace(/_/g, ' ')}
                          </span>
                          <span style={{ 
                            padding: '2px 8px', 
                            backgroundColor: getSentimentColor(message.validation.sentiment.level), 
                            color: 'white', 
                            borderRadius: '12px',
                            fontWeight: '500',
                          }}>
                            {getSentimentLabel(message.validation.sentiment.level)}
                          </span>
                          <span style={{ 
                            padding: '2px 8px', 
                            backgroundColor: getUrgencyColor(message.validation.urgency.level), 
                            color: 'white', 
                            borderRadius: '12px',
                            fontWeight: '500',
                          }}>
                            {message.validation.urgency.level}
                          </span>
                        </div>
                        {message.validation.entities && Object.keys(message.validation.entities).length > 0 && (
                          <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                            <strong>Detected:</strong> {formatEntities(message.validation.entities)}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    {message.products.slice(0, 4).map((product) => (
                      <div
                        key={product._id}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          padding: '8px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = 'translateY(-2px)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = 'translateY(0)')
                        }
                      >
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginBottom: '6px',
                          }}
                        />
                        <p
                          style={{
                            margin: '0 0 4px 0',
                            fontSize: '12px',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {product.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#667eea',
                          }}
                        >
                          ${product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '12px',
                    }}
                  >
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'white',
                          border: '1px solid #667eea',
                          borderRadius: '16px',
                          color: '#667eea',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#667eea';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#667eea';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#667eea',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out',
                      }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#667eea',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out 0.2s',
                      }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#667eea',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out 0.4s',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {suggestions.length > 0 && !isLoading && (
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                borderTop: '1px solid #eee',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '11px',
                  color: '#999',
                  textTransform: 'uppercase',
                }}
              >
                Quick questions
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '16px',
                      color: '#666',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#667eea';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                      e.currentTarget.style.color = '#666';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'white',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '24px',
                outline: 'none',
                fontSize: '14px',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor:
                  isLoading || !inputValue.trim() ? '#ccc' : '#667eea',
                border: 'none',
                cursor:
                  isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isLoading && inputValue.trim()) {
                  e.currentTarget.style.backgroundColor = '#764ba2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && inputValue.trim()) {
                  e.currentTarget.style.backgroundColor = '#667eea';
                }
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                style={{ transform: 'rotate(90deg)' }}
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
