import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotesApi, api } from '../../lib/api';
import {
  Package, MapPin, Clock, ArrowLeft, Send, Truck,
  FileText, Loader2, AlertCircle, Mic, MicOff, Sparkles, CheckCircle,
} from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  notes?: string;
  product: {
    id: string;
    name: string;
    brand: { id: string; name: string };
  };
}

interface RFQ {
  id: string;
  title: string;
  description?: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryPreference: 'delivery' | 'pickup' | 'both';
  urgency: string | null;
  publishedAt: string;
  items: RFQItem[];
}

interface QuoteItem {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function DealerQuoteSubmitPage() {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');

  // Voice AI notes
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [voiceParsed, setVoiceParsed] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setValidUntil(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (!rfqId) return;
    quotesApi.getAvailableRFQs()
      .then(res => {
        const found = res.data.rfqs?.find((r: RFQ) => r.id === rfqId);
        if (found) {
          setRfq(found);
          setQuoteItems(found.items.map((item: RFQItem) => ({
            productId: item.product.id,
            name: item.product.name,
            brand: item.product.brand.name,
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0,
          })));
        }
      })
      .catch(() => setError('Failed to load RFQ details'))
      .finally(() => setIsLoading(false));
  }, [rfqId]);

  const handlePriceChange = (productId: string, unitPrice: number) => {
    setQuoteItems(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, unitPrice, totalPrice: unitPrice * item.quantity }
        : item
    ));
  };

  const totalAmount = quoteItems.reduce((sum, i) => sum + i.totalPrice, 0) + shippingCost;

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError('Voice not supported. Type your terms below.'); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';
    recognition.onresult = (e: any) => setVoiceText(Array.from(e.results).map((r: any) => r[0].transcript).join(''));
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); setVoiceError('Could not hear clearly. Type below.'); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setVoiceError('');
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const parseVoiceTerms = async () => {
    if (!voiceText.trim()) { setVoiceError('Please speak or type your quote terms first.'); return; }
    setIsParsing(true);
    setVoiceError('');
    try {
      const res = await api.post('/chat/parse-quote', { rawText: voiceText.trim() });
      const data = res.data;
      if (data.delivery_days) {
        const d = new Date();
        d.setDate(d.getDate() + data.delivery_days);
        setDeliveryDate(d.toISOString().split('T')[0]);
      }
      const noteParts = [data.warranty_info, data.shipping_info, data.notes].filter(Boolean);
      if (noteParts.length) setNotes(noteParts.join('. '));
      if (data.price_per_unit && quoteItems.length > 0) {
        setQuoteItems(prev => prev.map(item => ({
          ...item,
          unitPrice: data.price_per_unit,
          totalPrice: data.price_per_unit * item.quantity,
        })));
      }
      setVoiceParsed(true);
    } catch {
      setVoiceError('Could not parse terms. Fill manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!quoteItems.every(i => i.unitPrice > 0)) { setError('Enter unit price for all items.'); return; }
    if (!validUntil) { setError('Set a quote validity date.'); return; }
    if (rfq?.deliveryPreference !== 'pickup' && !deliveryDate) { setError('Set an expected delivery date.'); return; }
    if (!rfq) return;

    setIsSubmitting(true);
    try {
      await quotesApi.submitQuote({
        rfqId: rfq.id,
        totalAmount,
        shippingCost,
        deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        pickupDate: pickupDate ? new Date(pickupDate).toISOString() : undefined,
        validUntil: new Date(validUntil).toISOString(),
        notes: notes || undefined,
        items: quoteItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
      });
      navigate('/dealer/quotes', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">RFQ not found or no longer available</p>
          <Link to="/dealer/rfqs" className="inline-flex items-center gap-1 mt-3 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to RFQs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <Link
          to="/dealer/rfqs"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to RFQs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{rfq.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              <MapPin className="inline w-3 h-3 mr-0.5" />
              {rfq.deliveryCity}, {rfq.deliveryPincode}
              {' · '}<Clock className="inline w-3 h-3 mr-0.5" />
              Posted {fmtDate(rfq.publishedAt)}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-semibold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400">total quote</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Item Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900">Item pricing</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {quoteItems.map(item => (
                  <div key={item.productId} className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.brand} · qty {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-400">total</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400 flex-shrink-0">Unit price (₹)</label>
                      <input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={e => handlePriceChange(item.productId, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping + Total */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-500">Shipping cost (₹, 0 = free)</label>
                  <input
                    type="number"
                    value={shippingCost || ''}
                    onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-400 bg-white transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-gray-400" /> Delivery options
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(rfq.deliveryPreference === 'delivery' || rfq.deliveryPreference === 'both') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Expected delivery date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                )}
                {(rfq.deliveryPreference === 'pickup' || rfq.deliveryPreference === 'both') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Available for pickup from</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quote details */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" /> Quote details
                </h2>
                <button
                  type="button"
                  onClick={() => { setIsVoiceMode(v => !v); setVoiceError(''); setVoiceParsed(false); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isVoiceMode
                      ? 'bg-violet-100 text-violet-700 border border-violet-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Spark AI
                </button>
              </div>

              {/* Spark AI Voice Panel */}
              {isVoiceMode && (
                <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 space-y-3">
                  <p className="text-xs text-violet-600 font-medium">
                    Speak your quote terms in Hindi, English, or Hinglish — Spark will fill the form for you.
                  </p>
                  <p className="text-[11px] text-violet-400 italic">
                    e.g. "Price hai 850 rupaye per piece, delivery 5 din mein, 1 saal warranty rahegi"
                  </p>

                  {/* Mic + Text */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={isListening ? stopVoice : startVoice}
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <textarea
                      value={voiceText}
                      onChange={e => { setVoiceText(e.target.value); setVoiceParsed(false); }}
                      rows={2}
                      placeholder={isListening ? 'Listening...' : 'Speak or type your terms here...'}
                      className="flex-1 px-3 py-2 border border-violet-200 rounded-lg text-sm bg-white focus:outline-none focus:border-violet-400 transition-colors resize-none"
                    />
                  </div>

                  {voiceError && (
                    <p className="text-xs text-red-500">{voiceError}</p>
                  )}

                  {/* Parse button */}
                  {!voiceParsed && (
                    <button
                      type="button"
                      onClick={parseVoiceTerms}
                      disabled={isParsing || !voiceText.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                    >
                      {isParsing ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" /> Analyze with Spark</>
                      )}
                    </button>
                  )}

                  {/* Parsed success preview */}
                  {voiceParsed && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Spark filled the form below
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {deliveryDate && (
                          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Delivery: {new Date(deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {notes && notes.includes('warranty') && (
                          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Warranty filled</span>
                        )}
                        {notes && notes.includes('shipping') && (
                          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Shipping notes added</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setVoiceParsed(false); setVoiceText(''); }}
                        className="text-[11px] text-green-600 hover:text-green-800 underline"
                      >
                        Redo voice input
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Valid until <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Payment terms, warranty, additional details..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">RFQ summary</h3>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="text-gray-900 font-medium">{rfq.deliveryCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-gray-900 font-medium capitalize">
                    {rfq.deliveryPreference === 'both' ? 'Flexible' : rfq.deliveryPreference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Items</span>
                  <span className="text-gray-900 font-medium">{rfq.items.length}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
                {rfq.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.product.name}</span>
                    <span className="text-gray-400 flex-shrink-0">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {rfq.description && (
                <p className="text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">{rfq.description}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit quote
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-2">
                Buyer will be notified of your quote
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
