import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ImagePreview } from '../../components/common/ImagePreview';
import {
  Package, Phone, MapPin, Loader2, Image as ImageIcon,
  Hash, User, Calendar, Send, IndianRupee, Truck, X,
  CheckCircle, Mic, MicOff, Sparkles, AlertCircle, Edit3,
  Zap,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

interface Category { id: string; name: string }
interface Brand { id: string; name: string }

interface Inquiry {
  id: string;
  inquiryNumber: string;
  name: string;
  phone: string;
  email: string | null;
  productPhoto: string | null;
  modelNumber: string | null;
  quantity: number;
  deliveryCity: string;
  notes: string | null;
  status: string;
  createdAt: string;
  category: Category | null;
  identifiedBrand: Brand | null;
  dealerResponse: { status: string; quotedPrice: number } | null;
}

interface ParsedQuote {
  price_per_unit?: number;
  unit_type?: string;
  delivery_days?: number;
  warranty_info?: string;
  shipping_info?: string;
  notes?: string;
  formatted_quote?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VOICE_TIPS = [
  '"600 rupees per piece, delivery 7 days, warranty included"',
  '"Ek saal ki warranty, shipping extra, 5 working days mein"',
  '"Price 450 per unit, free delivery above 50 pieces"',
];

export function DealerAvailableInquiriesPage() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [quoteForm, setQuoteForm] = useState({ quotedPrice: '', shippingCost: '', estimatedDelivery: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const [sparkMode, setSparkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedQuote, setParsedQuote] = useState<ParsedQuote | null>(null);
  const [parseError, setParseError] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(i => (i + 1) % VOICE_TIPS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dealer-inquiry/available', { params: { page, limit: 20 } });
      setInquiries(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/dealer/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openQuoteModal = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setQuoteForm({ quotedPrice: inq.dealerResponse?.quotedPrice.toString() || '', shippingCost: '', estimatedDelivery: '', notes: '' });
    setSparkMode(false);
    setVoiceText('');
    setParsedQuote(null);
    setParseError('');
  };

  const closeModal = () => {
    setSelectedInquiry(null);
    recognitionRef.current?.stop();
    setIsListening(false);
    setSparkMode(false);
    setVoiceText('');
    setParsedQuote(null);
    setParseError('');
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setParseError('Voice input not supported in this browser. Type your quote below.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setVoiceText(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setParseError('Could not hear clearly. Please type your quote below.');
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setParseError('');
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const parseWithSpark = async () => {
    if (!voiceText.trim()) { setParseError('Please speak or type your quote first.'); return; }
    setIsParsing(true);
    setParseError('');
    setParsedQuote(null);
    try {
      const res = await api.post('/chat/parse-quote', { rawText: voiceText.trim() });
      const data: ParsedQuote = res.data;
      setParsedQuote(data);
      setQuoteForm(prev => ({
        ...prev,
        quotedPrice: data.price_per_unit ? String(data.price_per_unit) : prev.quotedPrice,
        estimatedDelivery: data.delivery_days ? `${data.delivery_days} working days` : prev.estimatedDelivery,
        shippingCost: data.shipping_info?.toLowerCase().includes('free') ? '0' : prev.shippingCost,
        notes: [data.warranty_info, data.shipping_info, data.notes].filter(Boolean).join('. ') || prev.notes,
      }));
    } catch {
      setParseError('Spark could not parse this. Please fill the form manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmitQuote = async () => {
    if (!selectedInquiry) return;
    setSubmitting(true);
    try {
      await api.post(`/dealer-inquiry/${selectedInquiry.id}/quote`, {
        quotedPrice: parseFloat(quoteForm.quotedPrice),
        shippingCost: parseFloat(quoteForm.shippingCost) || 0,
        estimatedDelivery: quoteForm.estimatedDelivery,
        notes: quoteForm.notes,
      });
      closeModal();
      fetchInquiries();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = selectedInquiry
    ? (parseFloat(quoteForm.quotedPrice) || 0) * selectedInquiry.quantity + (parseFloat(quoteForm.shippingCost) || 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Product Inquiries</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total > 0 ? `${total} inquiries available` : 'View and respond to product inquiries'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Spark AI voice quotes
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-700">No inquiries available</p>
            <p className="text-xs text-gray-400 mt-1">No product inquiries match your profile yet. Check back later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map(inq => (
              <div key={inq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-medium text-gray-900">{inq.inquiryNumber}</span>
                    {inq.category && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">{inq.category.name}</span>}
                    {inq.identifiedBrand && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-50 text-violet-700">{inq.identifiedBrand.name}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-900">{inq.name}</span></div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><a href={`tel:${inq.phone}`} className="text-sm text-blue-600 hover:underline">{inq.phone}</a></div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{inq.deliveryCity}</span></div>
                    </div>
                    <div className="space-y-2">
                      {inq.modelNumber && <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-900">{inq.modelNumber}</span></div>}
                      <div className="flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">Qty: {inq.quantity}</span></div>
                      {inq.notes && <p className="text-sm text-gray-500 italic">"{inq.notes}"</p>}
                    </div>
                    <div>
                      {inq.productPhoto ? (
                        <ImagePreview src={`${API_BASE_URL}${inq.productPhoto}`} alt="Product Photo" className="w-full h-32" />
                      ) : (
                        <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end justify-center">
                      {inq.dealerResponse ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                          <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Quote Submitted</p>
                          <p className="text-lg font-semibold text-green-800">Rs{inq.dealerResponse.quotedPrice.toLocaleString('en-IN')}<span className="text-xs font-normal text-green-600">/unit</span></p>
                        </div>
                      ) : (
                        <button onClick={() => openQuoteModal(inq)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                          <Send className="w-4 h-4" />Submit Quote
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">Showing {(page - 1) * 20 + 1}:{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 transition-colors">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Quote - {selectedInquiry.inquiryNumber}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedInquiry.name} - {selectedInquiry.deliveryCity}</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Product:</span> <span className="font-medium text-gray-900">{selectedInquiry.modelNumber || 'See photo'}</span></div>
                <div><span className="text-gray-500">Quantity:</span> <span className="font-medium text-gray-900">{selectedInquiry.quantity} units</span></div>
                <div><span className="text-gray-500">City:</span> <span className="font-medium text-gray-900">{selectedInquiry.deliveryCity}</span></div>
                {selectedInquiry.category && <div><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-900">{selectedInquiry.category.name}</span></div>}
              </div>
            </div>

            <div className="px-6 pt-5 pb-2">
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setSparkMode(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${!sparkMode ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Edit3 className="w-4 h-4" />Manual Form
                </button>
                <button
                  onClick={() => { setSparkMode(true); setParseError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${sparkMode ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Sparkles className="w-4 h-4" />Spark AI Voice
                </button>
              </div>
            </div>

            {sparkMode && (
              <div className="px-6 py-4 space-y-4">
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-violet-700 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />Spark AI Voice Quote
                  </p>
                  <p className="text-xs text-violet-600">Speak or type your offer in Hindi, English, or Hinglish. Spark structures it for you.</p>
                  <p className="text-xs text-violet-500 mt-2 italic">{VOICE_TIPS[tipIndex]}</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isListening ? 'Stop recording' : 'Start voice input'}
                    </button>
                    {isListening && <span className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Listening...</span>}
                  </div>
                  <textarea
                    value={voiceText}
                    onChange={e => setVoiceText(e.target.value)}
                    placeholder="Your quote will appear here, or type directly..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-violet-400 focus:outline-none transition-colors resize-none"
                  />
                </div>
                {parseError && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{parseError}
                  </div>
                )}
                <button
                  onClick={parseWithSpark}
                  disabled={isParsing || !voiceText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {isParsing ? <><Loader2 className="w-4 h-4 animate-spin" />Spark is structuring...</> : <><Sparkles className="w-4 h-4" />Analyze with Spark</>}
                </button>
                {parsedQuote && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-green-700 mb-3 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />Spark extracted - form auto-filled</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {parsedQuote.price_per_unit && <div className="bg-white rounded-lg p-2"><span className="text-gray-400">Price</span><p className="font-semibold text-gray-900">Rs{parsedQuote.price_per_unit}/{parsedQuote.unit_type || 'piece'}</p></div>}
                      {parsedQuote.delivery_days && <div className="bg-white rounded-lg p-2"><span className="text-gray-400">Delivery</span><p className="font-semibold text-gray-900">{parsedQuote.delivery_days} working days</p></div>}
                      {parsedQuote.warranty_info && <div className="bg-white rounded-lg p-2"><span className="text-gray-400">Warranty</span><p className="font-semibold text-gray-900">{parsedQuote.warranty_info}</p></div>}
                      {parsedQuote.shipping_info && <div className="bg-white rounded-lg p-2"><span className="text-gray-400">Shipping</span><p className="font-semibold text-gray-900">{parsedQuote.shipping_info}</p></div>}
                    </div>
                    <p className="text-xs text-green-600 mt-2">Review the form below and edit if needed before submitting.</p>
                  </div>
                )}
              </div>
            )}

            <div className="px-6 py-5 space-y-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900">{sparkMode && parsedQuote ? 'Review and confirm your quote' : 'Pricing and delivery'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Price per unit (Rs) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="0" required placeholder="e.g. 125.50"
                    value={quoteForm.quotedPrice} onChange={e => setQuoteForm(f => ({ ...f, quotedPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Shipping cost (Rs)</label>
                  <input type="number" step="0.01" min="0" placeholder="0 = free"
                    value={quoteForm.shippingCost} onChange={e => setQuoteForm(f => ({ ...f, shippingCost: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
                </div>
              </div>
              {quoteForm.quotedPrice && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700">Order total</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Rs{parseFloat(quoteForm.quotedPrice).toLocaleString('en-IN')} x {selectedInquiry.quantity}
                      {quoteForm.shippingCost ? ` + Rs${parseFloat(quoteForm.shippingCost).toLocaleString('en-IN')} shipping` : ''}
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-green-800">Rs{totalAmount.toLocaleString('en-IN')}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5"><Truck className="w-3.5 h-3.5 inline mr-1" />Estimated delivery</label>
                <input type="text" placeholder="e.g. 3-5 business days"
                  value={quoteForm.estimatedDelivery} onChange={e => setQuoteForm(f => ({ ...f, estimatedDelivery: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
                <textarea placeholder="Warranty, brand, GST included, payment terms..."
                  value={quoteForm.notes} onChange={e => setQuoteForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none resize-none" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-2xl">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
              <button
                onClick={handleSubmitQuote}
                disabled={submitting || !quoteForm.quotedPrice}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
