import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Ticket,
} from 'lucide-react';
import { chatService } from '../../services/chatService';

const SUGGESTED_PROMPTS = [
  'What music events are coming up in Hyderabad?',
  'Which events are happening this month?',
  'What is the starting ticket price for Sunburn Festival?',
  'How do I select seats and book tickets?',
];

let messageCounter = 0;
function createMessageId(prefix) {
  messageCounter += 1;
  return `${prefix}_${messageCounter}`;
}

function getFormattedTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [conversationId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputMessage).trim();
    if (!text || isLoading) return;

    if (text.length > 500) {
      setError('Message exceeds the 500-character limit. Please shorten your question.');
      return;
    }

    const userMessage = {
      id: createMessageId('usr'),
      sender: 'user',
      text,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setError(null);
    setLastFailedMessage(null);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(text, conversationId);
      const botMessage = {
        id: createMessageId('bot'),
        sender: 'assistant',
        text: response.reply,
        referencedEventIds: response.referencedEventIds || [],
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage =
        err.message || 'Unable to connect to the AI assistant. Please try again.';
      setError(errorMessage);
      setLastFailedMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setLastFailedMessage(null);
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  return (
    <>
      {/* Floating Launcher Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close Eventra AI Assistant' : 'Open Eventra AI Assistant'}
        title="Eventra AI Concierge"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--ink-primary)',
          color: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} />
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                border: '2px solid var(--ink-primary)',
              }}
            />
          </div>
        )}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Eventra AI Assistant"
          style={{
            position: 'fixed',
            bottom: '92px',
            right: '24px',
            zIndex: 999,
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-glass)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans)',
            animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--bg-paper)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--ink-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} color="var(--accent)" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--ink-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  Eventra Concierge
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--ink-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Live Database Discovery
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-muted)',
                    padding: '6px',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <RefreshCw size={15} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-muted)',
                  padding: '6px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            {/* Welcome State if no messages */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    color: 'var(--ink-primary)',
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>
                    👋 Welcome to Eventra Concierge
                  </p>
                  <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                    I can answer questions about upcoming concerts, tech summits, live seat
                    availability, and ticket pricing verified from our database.
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Suggested Questions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-paper)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--ink-primary)',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease',
                          lineHeight: '1.3',
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor:
                      msg.sender === 'user' ? 'var(--ink-primary)' : 'var(--bg-subtle)',
                    color: msg.sender === 'user' ? '#FFFFFF' : 'var(--ink-primary)',
                    border:
                      msg.sender === 'user'
                        ? '1px solid var(--ink-primary)'
                        : '1px solid var(--border-subtle)',
                  }}
                >
                  {msg.text}
                </div>

                {/* Referenced Event Links */}
                {msg.referencedEventIds && msg.referencedEventIds.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '6px',
                    }}
                  >
                    {msg.referencedEventIds.map((eventId) => (
                      <button
                        key={eventId}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/events/${eventId}`);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--accent-subtle)',
                          border: '1px solid var(--accent-border)',
                          color: 'var(--accent)',
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        <Ticket size={12} />
                        View Event #{eventId}
                        <ExternalLink size={10} />
                      </button>
                    ))}
                  </div>
                )}

                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--ink-faint)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px',
                    padding: '0 4px',
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--ink-secondary)',
                  fontSize: '0.82rem',
                }}
              >
                <Sparkles size={14} color="var(--accent)" />
                <span>Checking live database...</span>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-cancel-bg)',
                  border: '1px solid var(--status-cancel-border)',
                  color: 'var(--status-cancel-text)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
                {lastFailedMessage && (
                  <button
                    onClick={handleRetry}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--status-cancel-text)',
                      color: 'var(--status-cancel-text)',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Retry Question
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-paper)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about events, prices, or venues..."
                maxLength={500}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--ink-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                title="Send message"
                aria-label="Send message"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor:
                    !inputMessage.trim() || isLoading
                      ? 'var(--bg-muted)'
                      : 'var(--ink-primary)',
                  color:
                    !inputMessage.trim() || isLoading
                      ? 'var(--ink-faint)'
                      : '#FFFFFF',
                  border: 'none',
                  cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Send size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--ink-muted)',
                fontFamily: 'var(--font-mono)',
                padding: '0 2px',
              }}
            >
              <span>Press Enter to send</span>
              <span
                style={{
                  color: inputMessage.length > 450 ? 'var(--accent)' : 'var(--ink-muted)',
                }}
              >
                {inputMessage.length}/500
              </span>
            </div>
          </form>
        </aside>
      )}
    </>
  );
}
