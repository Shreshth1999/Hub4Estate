import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Mic, MicOff, Send, Copy, Check,
  Zap, RotateCcw, ChevronRight, X,
  Package, TrendingUp, Layers, FileText, Star,
} from 'lucide-react';
import { chatApi, streamChatMessage, StreamEvent } from '../lib/api';
import { useAuthStore } from '../lib/store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolResult {
  tool: string;
  result: any;
  label: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  isStreaming?: boolean;
  toolResults?: ToolResult[];
}

// ─── Simple markdown renderer ─────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MarkdownContent({ text, isUser }: { text: string; isUser: boolean }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold mt-3 mb-1 first:mt-0">
          {renderInline(line.slice(2))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h4 key={i} className="text-sm font-bold mt-2 mb-1 first:mt-0">
          {renderInline(line.slice(3))}
        </h4>
      );
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const bullet = line.slice(2);
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-white/60' : 'bg-amber-600'}`} />
          <span className="flex-1 text-sm">{renderInline(bullet)}</span>
        </div>
      );
    } else if (line === '') {
      if (elements.length > 0) {
        elements.push(<div key={i} className="h-2" />);
      }
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// ─── Tool result cards ────────────────────────────────────────────────────────

function ToolCard({ tool, result }: { tool: string; result: any }) {
  const [copied, setCopied] = useState(false);

  const copyQuote = () => {
    if (result.formatted_quote) {
      // Strip markdown from quote for clipboard
      const plain = result.formatted_quote.replace(/\*\*/g, '').replace(/`/g, '');
      navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (tool === 'submit_inquiry' && result.success) {
    return (
      <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 bg-green-500 flex items-center justify-center rounded-full">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold text-green-800">Inquiry Submitted</span>
        </div>
        <p className="text-xs text-green-700 font-mono font-bold">{result.inquiryNumber}</p>
        <p className="text-xs text-green-600 mt-1">Expect a callback within 24 hours.</p>
      </div>
    );
  }

  if (tool === 'generate_dealer_quote' && result.success && result.is_dealer_quote) {
    return (
      <div className="mt-3 border border-amber-200 rounded-xl bg-white overflow-hidden">
        <div className="bg-amber-600 px-4 py-2 flex items-center justify-between">
          <span className="text-white text-xs font-bold uppercase tracking-wider">Quote Preview</span>
          <button
            onClick={copyQuote}
            className="flex items-center gap-1 text-white/80 hover:text-white text-xs"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="p-4">
          <MarkdownContent text={result.formatted_quote} isUser={false} />
        </div>
      </div>
    );
  }

  if (tool === 'search_products' && result.found > 0) {
    return (
      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {result.found} product{result.found !== 1 ? 's' : ''} found
        </p>
        <div className="space-y-1">
          {result.products?.slice(0, 3).map((p: any, idx: number) => (
            <div key={idx} className="text-xs text-gray-700">
              <span className="font-bold">{p.brand}</span> — {p.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Quick actions ────────────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  message: string;
  icon: React.ElementType;
  forDealer?: boolean;
  forUser?: boolean;
}

const ALL_QUICK_ACTIONS: QuickAction[] = [
  { label: 'Get a price quote', message: 'I want to get the best price on an electrical product.', icon: TrendingUp, forUser: true },
  { label: 'Compare products', message: 'I want to compare two electrical products or brands.', icon: Layers, forUser: true },
  { label: 'Wire size guide', message: 'What wire size should I use for my home?', icon: Zap, forUser: true },
  { label: 'Submit an inquiry', message: 'Help me submit a product inquiry on Hub4Estate.', icon: Package, forUser: true },
  { label: 'Compose a quote', message: 'I want to compose a professional price quote for a buyer. I will tell you my offer.', icon: FileText, forDealer: true },
  { label: 'How to get more leads', message: 'How can I win more bids and get better leads on Hub4Estate?', icon: Star, forDealer: true },
  { label: 'My performance', message: 'Analyse my performance as a dealer and give me actionable tips to improve.', icon: TrendingUp, forDealer: true },
  { label: 'What is Hub4Estate?', message: 'What is Hub4Estate and how does it work?', icon: Zap },
];

// ─── Voice hook ───────────────────────────────────────────────────────────────

function useVoice(onTranscript: (text: string, final: boolean) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  const startListening = useCallback((lang: 'hi-IN' | 'en-IN' = 'en-IN') => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        onTranscript(final.trim(), true);
      } else if (interim) {
        onTranscript(interim.trim(), false);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}

// ─── Detect language from text ────────────────────────────────────────────────

function detectLanguage(text: string): 'hi-IN' | 'en-IN' {
  // Devanagari Unicode range: \u0900–\u097F
  return /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIAssistantPage() {
  const { user } = useAuthStore();
  const isDealer = user?.type === 'dealer';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingToolLabel, setPendingToolLabel] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<'hi-IN' | 'en-IN'>('en-IN');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Session init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const res = await chatApi.createSession();
        setSessionId(res.data.sessionId);
      } catch {
        setInitError(true);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // ── Auto scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingToolLabel]);

  // ── Voice input ─────────────────────────────────────────────────────────────
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    setInput(text);
    if (isFinal) {
      setDetectedLang(detectLanguage(text));
    }
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useVoice(handleTranscript);

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(detectedLang);
    }
  };

  // ── Auto resize textarea ────────────────────────────────────────────────────
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || !sessionId || isStreaming) return;

    setInput('');
    setIsStreaming(true);
    setPendingToolLabel(null);

    const userLang = detectLanguage(text);
    setDetectedLang(userLang);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', createdAt: new Date(), isStreaming: true, toolResults: [] },
    ]);

    try {
      for await (const event of streamChatMessage(sessionId, text)) {
        handleStreamEvent(event, assistantId);
        if (event.type === 'done' || event.type === 'error') break;
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Connection lost. Please try again.', isStreaming: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setPendingToolLabel(null);
    }
  }, [input, sessionId, isStreaming]);

  const handleStreamEvent = (event: StreamEvent, assistantId: string) => {
    switch (event.type) {
      case 'text':
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + event.text } : m
          )
        );
        break;

      case 'tool_start':
        setPendingToolLabel(event.label);
        break;

      case 'tool_done':
        setPendingToolLabel(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  toolResults: [
                    ...(m.toolResults || []),
                    { tool: event.tool, result: event.result, label: event.tool },
                  ],
                }
              : m
          )
        );
        break;

      case 'done':
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
        );
        break;

      case 'error':
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content || event.error || 'Something went wrong. Please try again.',
                  isStreaming: false,
                }
              : m
          )
        );
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // ── Quick actions for this user type ────────────────────────────────────────
  const quickActions = ALL_QUICK_ACTIONS.filter((a) => {
    if (isDealer) return a.forDealer || (!a.forUser && !a.forDealer);
    return !a.forDealer;
  }).slice(0, isDealer ? 4 : 4);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Starting Volt...</p>
        </div>
      </div>
    );
  }

  if (initError || !sessionId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-white font-bold mb-2">Couldn't connect</h2>
          <p className="text-gray-400 text-sm mb-6">
            Check your internet and try again, or reach Shreshth directly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-600 text-white px-6 py-3 font-bold text-sm hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col bg-gray-950" style={{ height: '100dvh' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={user ? '/dashboard' : '/'}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm tracking-tight">Volt</span>
              {isDealer && (
                <span className="ml-2 text-xs text-amber-500 font-bold uppercase tracking-wider">
                  Dealer
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {detectedLang === 'hi-IN' && (
            <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-800 rounded">
              हिंदी
            </span>
          )}
          {hasMessages && (
            <button
              onClick={clearChat}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
              title="Clear chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
            <div className="w-20 h-20 bg-amber-600 flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              {isDealer ? `Hi ${user?.name?.split(' ')[0] || 'there'}.` : 'Hi there.'}
            </h1>
            <p className="text-gray-400 text-base mb-1">
              {isDealer
                ? 'Compose quotes, analyse your performance, win more bids.'
                : 'Ask anything. Get the best price. In any language.'}
            </p>
            <p className="text-gray-600 text-sm mb-10">
              Type, speak, or tap a suggestion below.
            </p>

            {/* Quick actions */}
            <div className="w-full max-w-md grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(action.message)}
                    disabled={isStreaming}
                    className="flex items-start gap-3 p-4 bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 text-left transition-all group disabled:opacity-40"
                  >
                    <div className="w-8 h-8 bg-gray-800 group-hover:bg-amber-600/20 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white font-medium leading-snug transition-colors">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message list */
          <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-700' : 'bg-amber-600'}`}>
                  {msg.role === 'user' ? (
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  ) : (
                    <Zap className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-900 border border-gray-800 text-gray-100'
                    }`}
                  >
                    {msg.content ? (
                      <MarkdownContent text={msg.content} isUser={msg.role === 'user'} />
                    ) : null}

                    {/* Streaming cursor */}
                    {msg.isStreaming && (
                      <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Tool result cards */}
                  {msg.toolResults?.map((tr, idx) => (
                    <div key={idx} className="w-full">
                      <ToolCard tool={tr.tool} result={tr.result} />
                    </div>
                  ))}

                  {/* Pending tool label */}
                  {msg.isStreaming && pendingToolLabel && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      </div>
                      <span className="text-xs text-gray-400">{pendingToolLabel}</span>
                    </div>
                  )}

                  {/* Copy button for assistant */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <><Check className="w-3 h-3" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking state (before first text arrives) */}
            {isStreaming && messages.at(-1)?.role === 'assistant' && !messages.at(-1)?.content && !pendingToolLabel && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-amber-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 bg-gray-900 border border-gray-800">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Quick actions strip (when chatting) ──────────────────────────────── */}
      {hasMessages && !isStreaming && (
        <div className="flex-shrink-0 border-t border-gray-800 px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action.message)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-gray-200 text-xs font-medium transition-all whitespace-nowrap"
              >
                <ChevronRight className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input area ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          {/* Voice button */}
          {isSupported && (
            <button
              onClick={toggleVoice}
              disabled={isStreaming}
              className={`w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all disabled:opacity-40 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value) setDetectedLang(detectLanguage(e.target.value));
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening...'
                  : isDealer
                  ? 'Describe your offer or ask anything...'
                  : 'Ask anything in English or हिंदी...'
              }
              disabled={isStreaming || isListening}
              rows={1}
              className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-white placeholder-gray-600 px-4 py-2.5 text-sm focus:outline-none resize-none transition-colors disabled:opacity-50"
              style={{ minHeight: '42px', maxHeight: '160px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming || !sessionId}
            className="w-10 h-10 flex-shrink-0 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-800 disabled:text-gray-600 flex items-center justify-center text-white transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-gray-700 text-xs mt-2 max-w-3xl mx-auto">
          Volt · Powered by Claude · Hub4Estate
        </p>
      </div>
    </div>
  );
}
