import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, X, Send, Loader2, Zap, MessageCircle, Sparkles,
  ChevronDown, Mic, MicOff, CheckCircle, Search, Package, Phone,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { chatApi, streamChatMessage, StreamEvent } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { Analytics } from '../lib/analytics';

// ─── DOMPurify config (XSS protection for AI-generated content) ──────────────

/** Sanitize HTML string through DOMPurify before rendering */
function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
  }) as string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolResult {
  tool: string;
  result: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  toolResults?: ToolResult[];
}

// ─── Markdown renderer (no external deps) ────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={key++} className="space-y-1 my-2 ml-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(inlineFormat(item)) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s/, ''));
    } else if (line.startsWith('## ')) {
      flushList();
      nodes.push(<p key={key++} className="font-bold text-sm mt-3 mb-1 text-gray-800">{line.slice(3)}</p>);
    } else if (line.startsWith('# ')) {
      flushList();
      nodes.push(<p key={key++} className="font-bold text-base mt-2 mb-1">{line.slice(2)}</p>);
    } else if (line.trim() === '') {
      flushList();
      nodes.push(<div key={key++} className="h-1.5" />);
    } else {
      flushList();
      nodes.push(
        <p key={key++} className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(inlineFormat(line)) }} />
      );
    }
  }
  flushList();
  return <>{nodes}</>;
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>');
}

// ─── Tool result cards ────────────────────────────────────────────────────────

function ToolResultCard({ toolResults }: { toolResults: ToolResult[] }) {
  return (
    <div className="space-y-2 mt-2">
      {toolResults.map((tr, i) => {
        if (tr.tool === 'submit_inquiry' && tr.result?.success) {
          return (
            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">Inquiry Submitted!</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Number: <span className="font-mono font-bold">{tr.result.inquiryNumber}</span>
                </p>
                <p className="text-xs text-green-600 mt-0.5">You'll get a callback within 24 hours.</p>
              </div>
            </div>
          );
        }
        if (tr.tool === 'search_products' && tr.result?.found > 0) {
          return (
            <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-bold text-blue-800">Found {tr.result.found} product{tr.result.found > 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-1">
                {tr.result.products?.slice(0, 3).map((p: any, j: number) => (
                  <div key={j} className="text-xs text-blue-700 bg-white rounded px-2 py-1 border border-blue-100">
                    <span className="font-semibold">{p.brand}</span> — {p.name}
                    {p.model && <span className="text-blue-500 ml-1">({p.model})</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (tr.tool === 'compare_products') {
          return (
            <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <Package className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Comparing: {tr.result.items?.join(' vs ')}</p>
            </div>
          );
        }
        if (tr.tool === 'track_inquiry' && tr.result?.found) {
          return (
            <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-800 mb-1">Inquiry Status</p>
              <p className="text-xs font-mono text-blue-700">{tr.result.inquiryNumber}</p>
              <p className="text-xs text-blue-600 mt-1">{tr.result.statusLabel}</p>
              <p className="text-xs text-blue-500 mt-0.5">{tr.result.product} · {tr.result.deliveryCity}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Quick suggestions ────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  { label: '🔍 Find a product', message: 'I want to find a specific electrical product and get the best price' },
  { label: '⚡ Wire size help', message: 'What wire size do I need for my AC and geysers?' },
  { label: '💰 How much savings?', message: 'How much can I save using Hub4Estate? Show me real examples.' },
  { label: '🏢 About Hub4Estate', message: 'Tell me about Hub4Estate and the founder' },
  { label: '📊 Compare brands', message: 'Compare Havells vs Polycab wires — which is better?' },
  { label: '🤝 Become a dealer', message: 'How can I register as a dealer on Hub4Estate?' },
];

// ─── Main component ────────────────────────────────────────────────────────────

export function AIAssistantWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check voice support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    if (isOpen && !sessionId && !isInitializing) initSession();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const initSession = async () => {
    setIsInitializing(true);
    setSessionError(false);
    try {
      const response = await chatApi.createSession();
      setSessionId(response.data.sessionId);

      const greeting = user?.name
        ? `Namaste ${user.name}! 👋 I'm **Volt**, Hub4Estate's AI assistant.`
        : `Namaste! 👋 I'm **Volt**, Hub4Estate's AI assistant.`;

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `${greeting}

I can help you with:

• Find any electrical product & get the best price
• Submit an inquiry — just tell me what you need
• Compare products and brands
• Wire sizing, safety advice, technical help
• Everything about Hub4Estate

**Speak or type in any language** — Hindi, English, or mix both!`,
        createdAt: new Date(),
      }]);
    } catch {
      setSessionError(true);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSend = useCallback(async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || !sessionId || isLoading || isStreaming) return;

    setHasInteracted(true);
    Analytics.sparkMessageSent(false);
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    }]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    const assistantId = `a-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    }]);

    try {
      const toolResults: ToolResult[] = [];

      for await (const event of streamChatMessage(sessionId, text)) {
        const e = event as StreamEvent;

        if (e.type === 'text') {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + e.text } : m
          ));
        } else if (e.type === 'tool_done') {
          toolResults.push({ tool: e.tool, result: e.result });
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, toolResults: [...toolResults] } : m
          ));
        } else if (e.type === 'done' || e.type === 'error') {
          if (e.type === 'error') {
            setMessages(prev => prev.map(m =>
              m.id === assistantId
                ? { ...m, content: m.content || 'Something went wrong. Please try again.' }
                : m
            ));
          }
          break;
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Connection lost. Please try again or call +91 76900 01999.' }
          : m
      ));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [input, sessionId, isLoading, isStreaming]);

  // ── Voice input ──────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // Support Hindi + English + common Indian languages
    recognition.lang = 'hi-IN';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); Analytics.sparkOpened(); }}
        className={`
          fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
          bg-gray-900 text-white
          shadow-lg
          flex items-center justify-center transition-all duration-300
          hover:scale-110 hover:shadow-xl
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
          group
        `}
        aria-label="Open AI Assistant"
      >
        <div className="absolute inset-0 rounded-full bg-amber-600 animate-ping opacity-20" />
        <div className="absolute inset-[-4px] rounded-full border border-amber-600/40 animate-[spin_3s_linear_infinite]">
          <Zap className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 text-amber-600" />
        </div>
        <div className="absolute inset-[-8px] rounded-full border border-amber-600/30 animate-[spin_4s_linear_infinite_reverse]">
          <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 text-amber-500" />
        </div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-600/20 to-transparent animate-pulse" />
        <Bot className="w-7 h-7 relative z-10" />
        {!hasInteracted && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center animate-bounce">
            <span className="w-2 h-2 bg-white rounded-full" />
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div className={`
        fixed bottom-6 right-6 z-50
        w-[400px] max-w-[calc(100vw-24px)]
        transition-all duration-300 ease-out
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
      `}>
        <div className={`
          bg-white border border-gray-200 rounded-2xl
          flex flex-col overflow-hidden
          shadow-lg
          transition-all duration-300
          ${isMinimized ? 'h-[60px]' : 'h-[560px] max-h-[85vh]'}
        `}>

          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white cursor-pointer flex-shrink-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-amber-600 flex items-center justify-center rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gray-700 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Volt AI</h3>
                  <span className="text-[10px] bg-amber-600/20 text-amber-500 px-1.5 py-0.5 rounded font-medium">
                    by Hub4Estate
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {isLoading ? '⚡ Thinking...' : 'Hindi • English • All languages'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {isInitializing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Connecting Volt...</p>
                    </div>
                  </div>
                ) : sessionError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Bot className="w-6 h-6 text-amber-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Volt is unavailable right now</p>
                      <p className="text-xs text-gray-500 mb-4">Our AI assistant couldn't connect. You can retry or reach us directly.</p>
                      <button
                        onClick={initSession}
                        className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors mb-3"
                      >
                        Retry connection
                      </button>
                      <a
                        href="tel:+917690001999"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-amber-600" />
                        Call +91 76900 01999
                      </a>
                      <p className="text-[11px] text-gray-400 mt-3">Mon–Sat, 10am–7pm IST</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 bg-amber-600 rounded-lg flex-shrink-0 flex items-center justify-center self-end mb-0.5">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-3 py-2.5 text-sm ${
                            msg.role === 'user'
                              ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm shadow-sm'
                          }`}>
                            {msg.role === 'assistant'
                              ? renderMarkdown(msg.content)
                              : <p className="leading-relaxed">{msg.content}</p>
                            }
                          </div>
                          {msg.toolResults && msg.toolResults.length > 0 && (
                            <div className="w-full">
                              <ToolResultCard toolResults={msg.toolResults} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-amber-600 rounded-lg flex-shrink-0 flex items-center justify-center self-end">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Quick suggestions (only before first interaction) */}
              {messages.length <= 1 && !isLoading && sessionId && (
                <div className="px-3 py-2.5 border-t border-gray-200 bg-white flex-shrink-0">
                  <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> Try asking...
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s.message)}
                        disabled={isLoading}
                        className="px-2.5 py-1 text-xs font-medium border border-gray-200 hover:border-amber-600 hover:text-amber-700 rounded-full transition-colors bg-white"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
                {isListening && (
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-600 font-medium">Listening... speak now</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? 'Listening...' : 'Message Volt... (Hindi / English)'}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    disabled={isLoading || !sessionId}
                  />

                  {voiceSupported && (
                    <button
                      onClick={toggleVoice}
                      disabled={isLoading || !sessionId}
                      className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center ${
                        isListening
                          ? 'bg-red-500 border-red-500 text-white animate-pulse'
                          : 'border-gray-200 text-gray-500 hover:border-amber-600 hover:text-amber-600'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                      title={isListening ? 'Click to stop' : 'Voice input (Hindi/English)'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading || !sessionId}
                    className="px-3 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Send"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Powered by <span className="font-semibold text-amber-600">Volt AI</span> · Hub4Estate
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
