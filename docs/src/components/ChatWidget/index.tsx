import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const CHAT_API_URL = '/api/chat-docs';

export default function ChatWidget(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your VIVIM AI assistant. Ask me anything about the documentation!',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: getDocumentationContext(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Sorry, I\'m having trouble connecting. Please check your API key or try again later.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className="chat-widget-button"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title={isOpen ? 'Close chat' : 'Chat with VIVIM AI'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a65bf0 0%, #00d4ff 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          boxShadow: '0 4px 24px rgba(166, 91, 240, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen
            ? 'rotate(90deg) scale(1.1)'
            : 'scale(1.1)';
          e.currentTarget.style.boxShadow =
            '0 8px 32px rgba(166, 91, 240, 0.6), 0 0 60px rgba(0, 212, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
          e.currentTarget.style.boxShadow =
            '0 4px 24px rgba(166, 91, 240, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)';
        }}
      >
        {isLoading ? (
          <span
            style={{
              fontSize: '24px',
              color: '#fff',
              animation: 'spin 1s linear infinite',
            }}
          >
            ⏳
          </span>
        ) : isOpen ? (
          <span
            style={{
              fontSize: '28px',
              color: '#fff',
              fontWeight: 'bold',
              lineHeight: 1,
            }}
          >
            ×
          </span>
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="white"
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="chat-widget-window"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: 'min(420px, calc(100vw - 48px))',
            height: 'min(600px, calc(100vh - 120px))',
            background: 'rgba(10, 10, 15, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px',
            border: '1px solid rgba(166, 91, 240, 0.25)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, rgba(166, 91, 240, 0.08) 0%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a65bf0 0%, #00d4ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(166, 91, 240, 0.4)',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    fill="white"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#f8f8f2',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  VIVIM AI
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#00ff88',
                      boxShadow: '0 0 8px #00ff88',
                    }}
                  />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              scrollBehavior: 'smooth',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #a65bf0 0%, #8b5cf6 100%)'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderRadius: msg.role === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    padding: '14px 18px',
                    color: '#e8e8e8',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    wordBreak: 'break-word',
                    border: msg.role === 'assistant'
                      ? '1px solid rgba(255, 255, 255, 0.06)'
                      : 'none',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 20px rgba(166, 91, 240, 0.3)'
                      : 'none',
                  }}
                >
                  {msg.content}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    padding: '0 8px',
                  }}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '14px 18px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#a65bf0',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '-0.32s',
                    }}
                  />
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#a65bf0',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '-0.16s',
                    }}
                  />
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#a65bf0',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                    }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about VIVIM..."
                  rows={1}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    paddingRight: '48px',
                    color: '#e8e8e8',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    outline: 'none',
                    resize: 'none',
                    minHeight: '48px',
                    maxHeight: '120px',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(166, 91, 240, 0.5)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: inputValue.trim() && !isLoading
                    ? 'linear-gradient(135deg, #a65bf0 0%, #00d4ff 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (inputValue.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(166, 91, 240, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                    fill={inputValue.trim() && !isLoading ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                  />
                </svg>
              </button>
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '12px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .chat-widget-window::-webkit-scrollbar {
          width: 6px;
        }
        .chat-widget-window::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-widget-window::-webkit-scrollbar-thumb {
          background: rgba(166, 91, 240, 0.3);
          border-radius: 3px;
        }
        .chat-widget-window::-webkit-scrollbar-thumb:hover {
          background: rgba(166, 91, 240, 0.5);
        }
      `}</style>
    </>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDocumentationContext(): string {
  return `You are a helpful AI assistant for VIVIM documentation. 
VIVIM is a decentralized AI memory platform that allows users to own their AI conversations.
Key topics include:
- SDK installation and usage
- Context pipeline and memory management
- PWA (Progressive Web App) features
- Network architecture and security
- API reference
- User guides and tutorials

Provide concise, accurate answers based on the documentation.`;
}
