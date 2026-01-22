import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Send, Bot, User, Lightbulb, Shield, TrendingUp,
  HelpCircle, Package, Building2, Phone, Mail, ChevronRight, Loader2
} from 'lucide-react';
import { chatApi } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface QuickQuestion {
  icon: React.ElementType;
  question: string;
  category: string;
}

export function AIAssistantPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions: QuickQuestion[] = [
    { icon: HelpCircle, question: 'What is Hub4Estate?', category: 'About' },
    { icon: User, question: 'Who is the founder of Hub4Estate?', category: 'About' },
    { icon: Package, question: 'What product categories do you offer?', category: 'Products' },
    { icon: TrendingUp, question: 'How much can I save using Hub4Estate?', category: 'Pricing' },
    { icon: Lightbulb, question: 'How do I create an RFQ?', category: 'Process' },
    { icon: Building2, question: 'How can I join as a dealer?', category: 'Dealers' },
    { icon: Shield, question: 'What wire size should I use for AC?', category: 'Technical' },
    { icon: Phone, question: 'How can I contact Hub4Estate?', category: 'Contact' },
  ];

  // Initialize chat session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await chatApi.createSession();
        setSessionId(response.data.sessionId);

        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm the Hub4Estate AI Assistant, powered by advanced AI. I can help you with:

• Electrical product recommendations
• Wire sizes and technical specifications
• Creating RFQs (Request for Quotes)
• Finding the right products for your project
• Dealer partnerships and registration
• Pricing and savings information

What would you like to know?`,
            createdAt: new Date(),
          },
        ]);
      } catch (err) {
        console.error('Failed to initialize chat session:', err);
        setError('Failed to connect to AI assistant. Please refresh the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const text = question || input.trim();
    if (!text || !sessionId || isLoading) return;

    setError(null);

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
          content:
            "I apologize, but I'm having trouble responding right now. Please try again or contact us directly at hello@hub4estate.com or +91 76900 01999.",
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

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Initializing AI Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-neutral-900 text-white py-6 border-b-4 border-accent-500">
        <div className="container-custom">
          <Link to="/" className="inline-flex items-center text-neutral-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">AI Assistant</h1>
              <p className="text-neutral-400">Powered by Claude AI - Your guide to electrical procurement</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container-custom py-6 flex flex-col lg:flex-row gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white border-2 border-neutral-200 shadow-brutal">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-b-2 border-red-200 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user' ? 'bg-neutral-900' : 'bg-accent-500'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-4 ${
                    message.role === 'user'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-accent-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-neutral-100 p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <span
                      className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t-2 border-neutral-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about electrical products..."
                className="flex-1 px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors"
                disabled={isLoading || !sessionId}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || !sessionId}
                className="btn-urgent px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Quick Questions */}
          <div className="bg-white border-2 border-neutral-200 shadow-brutal p-6">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent-500" />
              Quick Questions
            </h3>
            <div className="space-y-2">
              {quickQuestions.map((q, index) => {
                const Icon = q.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSend(q.question)}
                    disabled={isLoading || !sessionId}
                    className="w-full text-left p-3 border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900" />
                    <span className="flex-1 text-sm font-medium">{q.question}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-neutral-900 text-white p-6">
            <h3 className="font-bold mb-4">Need Human Help?</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Our founder is always available to assist you personally.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:shresth.agarwal@hub4estate.com"
                className="flex items-center gap-3 text-sm hover:text-accent-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-accent-400" />
                shresth.agarwal@hub4estate.com
              </a>
              <a
                href="tel:+917690001999"
                className="flex items-center gap-3 text-sm hover:text-accent-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-accent-400" />
                +91 76900 01999
              </a>
            </div>
          </div>

          {/* About Card */}
          <div className="bg-accent-500 text-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              <span className="font-bold">Hub4Estate</span>
            </div>
            <p className="text-sm text-white/80 mb-4">
              India's trusted marketplace for electrical products. Save 15-25% with verified dealers.
            </p>
            <Link to="/about" className="inline-flex items-center text-sm font-bold hover:underline">
              Learn More
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
