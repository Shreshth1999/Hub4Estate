import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Zap, MessageCircle, Sparkles, ChevronDown } from 'lucide-react';
import { chatApi } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const QUICK_SUGGESTIONS = [
  { label: 'Product help', message: 'What products do you offer?' },
  { label: 'Create RFQ', message: 'How do I create an RFQ?' },
  { label: 'Pricing', message: 'How much can I save using Hub4Estate?' },
  { label: 'Contact', message: 'How can I contact Hub4Estate?' },
];

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session when widget opens
  useEffect(() => {
    if (isOpen && !sessionId && !isInitializing) {
      initSession();
    }
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const initSession = async () => {
    setIsInitializing(true);
    try {
      const response = await chatApi.createSession();
      setSessionId(response.data.sessionId);

      // Add welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm the Hub4Estate AI Assistant. I can help you with:

• Electrical product recommendations
• Creating RFQs (Request for Quotes)
• Wire sizes and technical specs
• Finding the right dealer

How can I help you today?`,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      console.error('Failed to initialize chat session:', err);
      setMessages([
        {
          id: 'error',
          role: 'assistant',
          content: 'Sorry, I had trouble connecting. Please try again or contact us at hello@hub4estate.com',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !sessionId || isLoading) return;

    setHasInteracted(true);

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(sessionId, text);
      const assistantMessage: Message = {
        id: response.data.message.id,
        role: 'assistant',
        content: response.data.message.content,
        createdAt: new Date(response.data.message.createdAt),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't respond. Please try again or contact us at hello@hub4estate.com",
          createdAt: new Date(),
        },
      ]);
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

  const toggleWidget = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Button with Electric Spark Animation */}
      <button
        onClick={toggleWidget}
        className={`
          fixed bottom-6 right-6 z-50
          w-16 h-16 rounded-full
          bg-neutral-900 text-white
          border-2 border-accent-500
          shadow-[0_0_20px_rgba(249,115,22,0.4)]
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]
          ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
          group
        `}
        aria-label="Open AI Assistant"
      >
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 rounded-full bg-accent-500 animate-ping opacity-20" />

        {/* Electric spark rings */}
        <div className="absolute inset-[-4px] rounded-full border-2 border-accent-500/50 animate-[spin_3s_linear_infinite]">
          <Zap className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 text-accent-500" />
        </div>
        <div className="absolute inset-[-8px] rounded-full border border-accent-500/30 animate-[spin_4s_linear_infinite_reverse]">
          <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 text-accent-400" />
        </div>

        {/* Inner glow pulse */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-accent-500/20 to-transparent animate-pulse" />

        {/* Icon */}
        <Bot className="w-7 h-7 relative z-10" />

        {/* Notification dot for new users */}
        {!hasInteracted && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="w-2 h-2 bg-white rounded-full" />
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`
          fixed bottom-6 right-6 z-50
          w-[380px] max-w-[calc(100vw-48px)]
          transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}
      >
        <div className={`
          bg-white border-2 border-neutral-900 shadow-brutal
          flex flex-col
          transition-all duration-300
          ${isMinimized ? 'h-[60px]' : 'h-[500px] max-h-[80vh]'}
        `}>
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 bg-neutral-900 text-white cursor-pointer"
            onClick={toggleMinimize}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-accent-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Assistant</h3>
                <p className="text-xs text-neutral-400">
                  {isLoading ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimize();
                }}
                className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidget();
                }}
                className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Content - Hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                {isInitializing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-accent-500 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-neutral-500">Connecting...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 bg-accent-500 flex-shrink-0 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-neutral-900 text-white'
                              : 'bg-white border-2 border-neutral-200 text-neutral-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-accent-500 flex-shrink-0 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border-2 border-neutral-200 p-3">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              {messages.length <= 1 && !isLoading && sessionId && (
                <div className="px-4 py-3 border-t-2 border-neutral-200 bg-white">
                  <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Quick questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(suggestion.message)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-medium border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all bg-white"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t-2 border-neutral-200 bg-white">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2.5 text-sm border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors"
                    disabled={isLoading || !sessionId}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading || !sessionId}
                    className="px-4 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-2 text-center">
                  Powered by <span className="font-medium text-accent-500">Hub4Estate</span> AI
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes electric-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.4),
                        0 0 40px rgba(249, 115, 22, 0.2),
                        0 0 60px rgba(249, 115, 22, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(249, 115, 22, 0.6),
                        0 0 60px rgba(249, 115, 22, 0.4),
                        0 0 90px rgba(249, 115, 22, 0.2);
          }
        }

        .shadow-brutal {
          box-shadow: 4px 4px 0 0 #171717;
        }
      `}</style>
    </>
  );
}
