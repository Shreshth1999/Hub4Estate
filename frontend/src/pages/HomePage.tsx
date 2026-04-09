import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, CheckCircle, IndianRupee, FileText, Upload, Camera, X, Sparkles, Loader2, MapPin, Mic, MicOff, Search, Clock, UserCheck, Inbox, SlidersHorizontal, Star, TrendingUp, BarChart3 } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { productsApi, api } from '../lib/api';
import { Analytics } from '../lib/analytics';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

const BUYER_STEPS = [
  { Icon: Upload, title: 'Tell us what you need', desc: 'Upload a slip, type a product name, or speak it in Hindi' },
  { Icon: SlidersHorizontal, title: 'Dealers compete', desc: 'Verified dealers send you blind quotes — you compare side by side' },
  { Icon: CheckCircle, title: 'Pick the best deal', desc: 'Choose the winner. Contact is revealed. Deal done.' },
];

const DEALER_STEPS = [
  { Icon: Inbox, title: 'Inquiry arrives blind', desc: 'You see specs and quantity — no buyer name or contact' },
  { Icon: IndianRupee, title: 'Submit your quote', desc: 'Price, shipping, delivery time — all transparent' },
  { Icon: UserCheck, title: 'Win or learn', desc: 'Win = contact revealed. Lose = get the winning price as benchmark' },
];

interface InquiryForm {
  name: string;
  phone: string;
  modelNumber: string;
  quantity: string;
  deliveryCity: string;
}

const defaultForm: InquiryForm = { name: '', phone: '', modelNumber: '', quantity: '1', deliveryCity: '' };

export function HomePage() {
  const { lang, tx } = useLanguage();
  const isHi = lang === 'hi';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedInquiry = sessionStorage.getItem('hub4estate_inquiry');
  let savedData: any = null;
  try { savedData = savedInquiry ? JSON.parse(savedInquiry) : null; } catch { sessionStorage.removeItem('hub4estate_inquiry'); }

  const [inquiryForm, setInquiryForm] = useState<InquiryForm>(savedData?.form || defaultForm);
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!savedData?.submitted);
  const [submittedInquiryId, setSubmittedInquiryId] = useState(savedData?.inquiryNumber || '');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const voiceRecognitionRef = useRef<any>(null);

  const startVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setFormError('Voice input not supported in this browser.'); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN';
    recognition.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      let qty = '1';
      const qtyMatch = text.match(/(\d+)\s*(pieces?|pcs?|units?|numbers?|nos?|नग)/i);
      if (qtyMatch) qty = qtyMatch[1];
      const cityMatch = text.match(/\b(Mumbai|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|Surat|Kanpur|Nagpur|Indore|Thane|Bhopal|Visakhapatnam|Pimpri)\b/i);
      setInquiryForm(f => ({
        ...f,
        modelNumber: text,
        quantity: qty,
        ...(cityMatch ? { deliveryCity: cityMatch[1] } : {}),
      }));
    };
    recognition.onend = () => setIsVoiceListening(false);
    recognition.onerror = () => { setIsVoiceListening(false); };
    voiceRecognitionRef.current = recognition;
    recognition.start();
    setIsVoiceListening(true);
    setFormError('');
  };

  const stopVoiceInput = () => {
    voiceRecognitionRef.current?.stop();
    setIsVoiceListening(false);
  };

  const [useAIScan, setUseAIScan] = useState(false);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiParsedItems, setAiParsedItems] = useState<any[]>([]);
  const [detectedLocation, setDetectedLocation] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    productsApi.getCategories()
      .then(res => { setCategories(res.data.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      if (useAIScan) await processWithAI(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProductPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      if (useAIScan) await processWithAI(file);
    }
  };

  const removePhoto = () => { setProductPhoto(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCameraActive(true);
    } catch { setFormError('Unable to access camera.'); }
  };

  const stopCamera = () => { if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); } setCameraActive(false); };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          handlePhotoChange({ target: { files: [file] } } as any);
          stopCamera();
          processWithAI(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const processWithAI = async (file: File) => {
    setAiScanning(true); setFormError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/slip-scanner/parse', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = response.data;
      setAiParsedItems(data.items || []);
      if (data.items?.length > 0) {
        const first = data.items[0];
        setInquiryForm(f => ({ ...f, modelNumber: `${first.productName} ${first.brand || ''}`.trim(), quantity: first.quantity.toString(), deliveryCity: data.detectedLocation || f.deliveryCity }));
        setDetectedLocation(data.detectedLocation || '');
      }
      if (data.warnings?.length > 0) setFormError(`AI detected: ${data.warnings[0]}`);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'AI scan failed. Please try manual entry.');
    } finally { setAiScanning(false); }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          if (city) setInquiryForm(f => ({ ...f, deliveryCity: city }));
        } catch {}
      }, () => {});
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!inquiryForm.name || !inquiryForm.phone || !inquiryForm.deliveryCity) { setFormError('Please fill in name, phone, and city.'); return; }
    if (!productPhoto && !inquiryForm.modelNumber) { setFormError('Please upload a product photo or enter a model number.'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', inquiryForm.name);
      formData.append('phone', inquiryForm.phone);
      formData.append('modelNumber', inquiryForm.modelNumber);
      formData.append('quantity', inquiryForm.quantity);
      formData.append('deliveryCity', inquiryForm.deliveryCity);
      if (productPhoto) formData.append('productPhoto', productPhoto);
      const response = await api.post('/inquiry/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const inquiryNumber = response.data.inquiryNumber || response.data.inquiryId || '';
      setSubmittedInquiryId(inquiryNumber);
      setSubmitted(true);
      Analytics.inquirySubmitted({ city: inquiryForm.deliveryCity, hasPhoto: !!productPhoto, hasModel: !!inquiryForm.modelNumber });
      sessionStorage.setItem('hub4estate_inquiry', JSON.stringify({ submitted: true, inquiryNumber, form: inquiryForm }));
    } catch (err: any) { setFormError(err.response?.data?.error || 'Something went wrong.'); }
    finally { setSubmitting(false); }
  };

  const [flowView, setFlowView] = useState<'buyer' | 'dealer'>('buyer');

  return (
    <div className="min-h-screen">

      {/* ─── Hero ─── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left */}
            <div className="pt-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.05] tracking-tight">
                {isHi ? tx.hero.headline : (
                  <>We get you the <span className="text-amber-600">cheapest price</span> on any electrical product in India.</>
                )}
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed">
                {tx.hero.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button
                  onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {tx.hero.ctaPrimary} <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  to="/track"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-600 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {tx.hero.ctaSecondary}
                </Link>
              </div>

              <div className="space-y-2.5">
                {[
                  { Icon: CheckCircle, text: 'Multiple quotes from verified dealers — compare side by side' },
                  { Icon: Shield, text: 'Every dealer vetted before they can quote' },
                  { Icon: IndianRupee, text: 'Always free for buyers. No hidden fees.' },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Social proof — static, not floating */}
              <div className="mt-10 flex gap-8 text-sm">
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹37K</p>
                  <p className="text-gray-400">avg. saved per order</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">10+</p>
                  <p className="text-gray-400">active clients</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Zero</p>
                  <p className="text-gray-400">spam calls</p>
                </div>
              </div>
            </div>

            {/* Right — Inquiry Form */}
            <div>
              <div id="inquiry-form" className="bg-stone-50 rounded-lg p-6 lg:p-8 border border-gray-200">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{tx.hero.submitted.title}</h3>
                    <p className="text-gray-500 mb-4">{tx.hero.submitted.subtitle}</p>
                    {submittedInquiryId && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 text-left">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{tx.hero.submitted.inquiryLabel}</p>
                        <p className="font-mono text-lg font-semibold text-gray-900">{submittedInquiryId}</p>
                      </div>
                    )}
                    <Link to={`/track?phone=${encodeURIComponent(inquiryForm.phone)}`} className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                      {tx.hero.submitted.trackBtn} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button onClick={() => { setSubmitted(false); setSubmittedInquiryId(''); setInquiryForm(defaultForm); removePhoto(); sessionStorage.removeItem('hub4estate_inquiry'); }} className="mt-4 block mx-auto text-amber-600 font-semibold text-sm hover:underline">
                      {tx.hero.submitted.submitAnother}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{tx.hero.formTitle}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-5">{tx.hero.formSubtitle}</p>

                    {/* Toggle */}
                    <div className="flex gap-1 mb-5 bg-gray-200 rounded-lg p-1">
                      <button type="button" onClick={() => { setUseAIScan(false); stopCamera(); setAiParsedItems([]); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${!useAIScan ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                        <FileText className="w-4 h-4" /> {tx.hero.formModeTabs.manual}
                      </button>
                      <button type="button" onClick={() => setUseAIScan(true)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${useAIScan ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                        <Sparkles className="w-4 h-4" /> {tx.hero.formModeTabs.aiScan}
                      </button>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

                    <form onSubmit={handleInquirySubmit} className="space-y-3">
                      {useAIScan ? (
                        <div className="space-y-3">
                          {cameraActive ? (
                            <div className="space-y-3">
                              <div className="relative overflow-hidden border border-gray-200 rounded-lg">
                                <video ref={videoRef} autoPlay playsInline className="w-full" />
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={capturePhoto} disabled={aiScanning} className="flex-1 px-4 py-2.5 bg-gray-900 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50">
                                  <Camera className="w-4 h-4" /> Capture
                                </button>
                                <button type="button" onClick={stopCamera} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 font-medium text-sm rounded-lg transition-colors">Cancel</button>
                              </div>
                            </div>
                          ) : photoPreview ? (
                            <div className="space-y-3">
                              <div className="relative overflow-hidden border border-gray-200 rounded-lg">
                                <img src={photoPreview} alt="Product" className="w-full bg-white" />
                                <button type="button" onClick={() => { removePhoto(); setAiParsedItems([]); }} className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-900 text-white p-1.5 rounded-md transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              {aiScanning && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
                                  <Loader2 className="w-6 h-6 animate-spin text-gray-500 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-gray-900">Scanning your slip...</p>
                                </div>
                              )}
                              {aiParsedItems.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <p className="text-sm font-medium text-green-800">Found {aiParsedItems.length} product{aiParsedItems.length > 1 ? 's' : ''} — form auto-filled</p>
                                  </div>
                                  {aiParsedItems.slice(0, 3).map((item: any, i: number) => (
                                    <div key={i} className="text-xs text-green-700 ml-6">{item.productName} × {item.quantity} {item.unit}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <button type="button" onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                className={`w-full h-32 border border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${isDragging ? 'border-gray-500 bg-gray-100' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">{tx.hero.aiScan.upload}</span>
                                <span className="text-xs text-gray-400">{tx.hero.aiScan.uploadHint}</span>
                              </button>
                              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-xs"><span className="px-3 bg-stone-50 text-gray-400">or</span></div></div>
                              <button type="button" onClick={startCamera} className="w-full px-4 py-2.5 bg-gray-900 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                                <Camera className="w-4 h-4" /> {tx.hero.aiScan.camera}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Product Photo <span className="text-gray-300">(optional)</span></label>
                          {photoPreview ? (
                            <div className="relative w-full h-28 border border-gray-200 rounded-lg overflow-hidden">
                              <img src={photoPreview} alt="Product" className="w-full h-full object-contain bg-white" />
                              <button type="button" onClick={removePhoto} className="absolute top-2 right-2 bg-gray-900 text-white p-1 rounded-md"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-20 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:border-gray-400 transition-colors">
                              <Camera className="w-4 h-4 text-gray-400" /> <span className="text-sm text-gray-400">Upload photo</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
                          <span>{tx.hero.formLabels.productModel}</span>
                          <button type="button" onClick={isVoiceListening ? stopVoiceInput : startVoiceInput}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${isVoiceListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-amber-600 hover:bg-amber-50'}`}>
                            {isVoiceListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                            {isVoiceListening ? tx.hero.formLabels.stop : tx.hero.formLabels.speak}
                          </button>
                        </label>
                        <input type="text" placeholder="e.g. Havells 16A switch, Polycab 2.5mm wire..." value={inquiryForm.modelNumber}
                          onChange={e => setInquiryForm(f => ({ ...f, modelNumber: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{tx.hero.formLabels.quantity}</label>
                          <input type="number" min="1" value={inquiryForm.quantity} onChange={e => setInquiryForm(f => ({ ...f, quantity: e.target.value }))}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
                            <span>{tx.hero.formLabels.city}</span>
                            <button type="button" onClick={detectLocation} className="text-xs text-amber-600 hover:underline flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {tx.hero.formLabels.autoDetect}
                            </button>
                          </label>
                          <input type="text" placeholder="e.g. Mumbai" value={inquiryForm.deliveryCity} onChange={e => setInquiryForm(f => ({ ...f, deliveryCity: e.target.value }))}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{tx.hero.formLabels.yourName}</label>
                        <input type="text" placeholder="Full name" value={inquiryForm.name} onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{tx.hero.formLabels.phone}</label>
                        <input type="tel" placeholder="10-digit mobile" value={inquiryForm.phone} onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm" />
                      </div>

                      {formError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{formError}</p>
                        </div>
                      )}

                      <button type="submit" disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {tx.hero.formLabels.submitting}</> : <>{tx.hero.formLabels.getPrice} <ArrowRight className="w-4 h-4" /></>}
                      </button>
                      <p className="text-xs text-gray-400 text-center">{tx.hero.formLabels.noSpam}</p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── How It Works ─── */}
      <section className="bg-stone-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">How it works</h2>
              <p className="text-gray-500 mt-2">Three steps. Real savings. No spam.</p>
            </div>
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
              {(['buyer', 'dealer'] as const).map(id => (
                <button key={id} onClick={() => setFlowView(id)}
                  className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${flowView === id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  {id === 'buyer' ? 'For Buyers' : 'For Dealers'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(flowView === 'buyer' ? BUYER_STEPS : DEALER_STEPS).map((step, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700">{i + 1}</span>
                  </div>
                  <step.Icon className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── Categories ─── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">{tx.categories.title}</h2>
            <p className="text-gray-500 max-w-lg">{tx.categories.subtitle}</p>
          </div>
          <InteractiveCategoryGrid categories={categories} loading={loading} />
          <div className="text-center mt-10">
            <Link to="/categories" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
              {tx.categories.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ─── Real Deals ─── */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">{tx.realDeals.title}</h2>
            <p className="text-gray-400 max-w-lg">{tx.realDeals.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tx.realDeals.deals.map((deal, di) => {
              const savedAmounts = ['₹37,000', '₹24,000', '₹8,800'];
              const barWidths = [[100, 91, 59], [100, 80], [100, 65]][di] || [];
              return (
                <div key={di} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <span className="text-xs font-semibold text-amber-500">{deal.tag}</span>
                    <h3 className="text-base font-semibold text-white mt-2 mb-5">{deal.title}</h3>
                    <div className="space-y-3 mb-5">
                      {deal.rows.map((row, ri) => {
                        const isWinner = !row.strikethrough;
                        return (
                          <div key={ri}>
                            <div className="flex justify-between items-baseline mb-1">
                              <span className={`text-xs ${isWinner ? 'text-amber-400 font-medium' : 'text-gray-500'}`}>{row.label}</span>
                              <span className={`text-sm font-semibold ${isWinner ? 'text-amber-400' : 'text-gray-500 line-through'}`}>{row.price}</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isWinner ? 'bg-amber-500' : 'bg-white/10'}`} style={{ width: `${barWidths[ri] ?? 80}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-gray-500 mb-1">{deal.savedLabel}</p>
                      <p className="text-3xl font-bold text-amber-400">{savedAmounts[di]}</p>
                      <p className="text-xs text-gray-500 mt-1">{deal.savedNote}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-gray-600 mt-8">{tx.realDeals.footnote}</p>
        </div>
      </section>


      {/* ─── Final CTA ─── */}
      <section className="bg-gray-900 border-t border-white/5 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">{tx.finalCta.title}</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">{tx.finalCta.subtitle}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            {tx.finalCta.ctaPrimary} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
