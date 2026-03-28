import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, CheckCircle, IndianRupee, FileText, Upload, Camera, X, Sparkles, Loader2, MapPin, Mic, MicOff } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { PersonaSection } from '../components/PersonaSection';
import { AISection } from '../components/AISection';
import { productsApi, api } from '../lib/api';
import { Analytics } from '../lib/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView, revealStyle } from '../hooks/useInView';
import { ElectricWireDivider } from '../components/ElectricWireDivider';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

// ─── How It Works flow data ────────────────────────────────────────────────────
const BUYER_STEPS = [
  { step: '01', emoji: '📋', title: 'Browse or Upload Slip', desc: 'Select products or scan a purchase order' },
  { step: '02', emoji: '🤖', title: 'AI Extracts Specs', desc: 'Brand, qty, specs auto-detected' },
  { step: '03', emoji: '✅', title: 'Review & Submit', desc: 'Confirm details and send' },
  { step: '04', emoji: '📊', title: 'Compare All Quotes', desc: 'Price · shipping · delivery time' },
  { step: '05', emoji: '🎯', title: 'Select Best Deal', desc: 'Tap winner, get contact info' },
  { step: '06', emoji: '🏆', title: 'Deal Closed!', desc: 'Best price, zero spam calls' },
];

const DEALER_STEPS = [
  { step: '01', emoji: '📨', title: 'Requirement Arrives', desc: 'Blind — no buyer name or contact' },
  { step: '02', emoji: '🔍', title: 'View Specs & Qty', desc: 'See exactly what is needed' },
  { step: '03', emoji: '💰', title: 'Submit Quote', desc: 'Price + shipping + delivery + terms' },
  { step: '04', emoji: '⏳', title: 'Await Decision', desc: 'Buyer compares all quotes' },
  { step: '05', emoji: '🏆', title: 'Win = Contact', desc: 'Contact revealed on selection' },
  { step: '06', emoji: '📈', title: 'Lose = Market Data', desc: 'Winning price benchmark shared' },
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

  // Inquiry form state - restore from sessionStorage on refresh
  const savedInquiry = sessionStorage.getItem('hub4estate_inquiry');
  let savedData: any = null;
  try { savedData = savedInquiry ? JSON.parse(savedInquiry) : null; } catch { sessionStorage.removeItem('hub4estate_inquiry'); }

  const [inquiryForm, setInquiryForm] = useState<InquiryForm>(
    savedData?.form || defaultForm
  );
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!savedData?.submitted);
  const [submittedInquiryId, setSubmittedInquiryId] = useState(savedData?.inquiryNumber || '');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice input for manual form
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
      // Simple extraction: fill model number, try to find quantity and city
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

  // AI Scan mode
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
      .then(res => {
        setCategories(res.data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductPhoto(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);

      if (useAIScan) {
        await processWithAI(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProductPhoto(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);

      if (useAIScan) {
        await processWithAI(file);
      }
    }
  };

  const removePhoto = () => {
    setProductPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      setFormError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
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
    setAiScanning(true);
    setFormError('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/slip-scanner/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;
      setAiParsedItems(data.items || []);

      if (data.items && data.items.length > 0) {
        const firstItem = data.items[0];
        setInquiryForm(f => ({
          ...f,
          modelNumber: `${firstItem.productName} ${firstItem.brand || ''}`.trim(),
          quantity: firstItem.quantity.toString(),
          deliveryCity: data.detectedLocation || f.deliveryCity,
        }));
        setDetectedLocation(data.detectedLocation || '');
      }

      if (data.warnings && data.warnings.length > 0) {
        setFormError(`AI detected: ${data.warnings[0]}`);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'AI scan failed. Please try manual entry.');
    } finally {
      setAiScanning(false);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            if (city) {
              setInquiryForm(f => ({ ...f, deliveryCity: city }));
            }
          } catch (err) {
            console.error('Location detection failed:', err);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!inquiryForm.name || !inquiryForm.phone || !inquiryForm.deliveryCity) {
      setFormError('Please fill in name, phone, and city.');
      return;
    }
    if (!productPhoto && !inquiryForm.modelNumber) {
      setFormError('Please upload a product photo or enter a model number.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', inquiryForm.name);
      formData.append('phone', inquiryForm.phone);
      formData.append('modelNumber', inquiryForm.modelNumber);
      formData.append('quantity', inquiryForm.quantity);
      formData.append('deliveryCity', inquiryForm.deliveryCity);
      if (productPhoto) {
        formData.append('productPhoto', productPhoto);
      }

      const response = await api.post('/inquiry/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const inquiryNumber = response.data.inquiryNumber || response.data.inquiryId || '';
      setSubmittedInquiryId(inquiryNumber);
      setSubmitted(true);
      Analytics.inquirySubmitted({
        city: inquiryForm.deliveryCity,
        hasPhoto: !!productPhoto,
        hasModel: !!inquiryForm.modelNumber,
      });
      sessionStorage.setItem('hub4estate_inquiry', JSON.stringify({
        submitted: true,
        inquiryNumber,
        form: inquiryForm,
      }));
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const [flowView, setFlowView] = useState<'buyer' | 'dealer'>('buyer');
  const heroIn = useInView(0.05);
  const howIn = useInView(0.06);
  const dealsIn = useInView(0.06);
  const whyIn = useInView(0.06);
  const ctaIn = useInView(0.1);

  return (
    <div className="min-h-screen relative">

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden">
        {/* Subtle warm glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 65%)' }} />

        <div ref={heroIn.ref as any} className="max-w-7xl mx-auto px-6 relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <div>
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full mb-8"
                style={revealStyle(heroIn.inView, 0)}
              >
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  {isHi ? 'Live — Verified Dealer Network' : 'Live — Verified Dealer Network Across India'}
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-gray-900 mb-6 leading-[1.02] tracking-tight"
                style={revealStyle(heroIn.inView, 0.06)}
              >
                {isHi ? (
                  <span className="gradient-text-orange">{tx.hero.headline}</span>
                ) : (
                  <>
                    Get The{' '}
                    <span className="gradient-text-orange">Cheapest Price</span>
                    {' '}On Any Electrical In India.
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p
                className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed"
                style={revealStyle(heroIn.inView, 0.12)}
              >
                {tx.hero.subheadline}
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-3 mb-10"
                style={revealStyle(heroIn.inView, 0.18)}
              >
                <button
                  onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold text-base rounded-xl btn-glow group"
                >
                  {tx.hero.ctaPrimary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/track"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-600 font-medium text-base rounded-xl hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                >
                  {tx.hero.ctaSecondary}
                </Link>
              </div>

              {/* Trust Indicators */}
              <div
                className="flex flex-col gap-3"
                style={revealStyle(heroIn.inView, 0.24)}
              >
                {[
                { Icon: IndianRupee, text: 'Always free for buyers — zero commission, zero fee' },
                { Icon: Shield, text: 'Every dealer verified before they can respond to your inquiry' },
                { Icon: CheckCircle, text: 'Your inquiry stays private — you choose who you deal with' },
              ].map(({ Icon, text }, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Real Deal Proof Pills */}
              <div className="mt-10 flex flex-wrap gap-3" style={revealStyle(heroIn.inView, 0.30)}>
                {[
                  { label: 'Sony Speaker', saved: '₹37,000 saved', sub: 'vs Croma ₹1,05,000', delay: '' },
                  { label: 'Philips LED ×200', saved: '₹24,000 saved', sub: 'vs local dealer', delay: '0.4s' },
                ].map((d, i) => (
                  <div key={i} className={`bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 ${i === 0 ? 'animate-float' : 'animate-float-delay'}`}>
                    <p className="text-[11px] text-gray-400 mb-0.5 font-medium">{d.label}</p>
                    <p className="text-sm font-bold text-amber-700">{d.saved}</p>
                    <p className="text-[11px] text-gray-400">{d.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Product Inquiry Form */}
            <div style={revealStyle(heroIn.inView, 0.08)}>
              <div id="inquiry-form" className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl shadow-gray-200/80 ring-1 ring-gray-100">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-amber-700 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{tx.hero.submitted.title}</h3>
                    <p className="text-gray-600 mb-4">{tx.hero.submitted.subtitle}</p>
                    {submittedInquiryId && (
                      <div className="bg-gray-50 border border-gray-200 p-4 mb-4 text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{tx.hero.submitted.inquiryLabel}</p>
                        <p className="font-mono text-lg font-semibold text-gray-900">{submittedInquiryId}</p>
                        <p className="text-xs text-gray-400 mt-1">{tx.hero.submitted.inquiryHint}</p>
                      </div>
                    )}
                    <Link
                      to={`/track?phone=${encodeURIComponent(inquiryForm.phone)}`}
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      {tx.hero.submitted.trackBtn}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setSubmittedInquiryId('');
                        setInquiryForm(defaultForm);
                        removePhoto();
                        sessionStorage.removeItem('hub4estate_inquiry');
                      }}
                      className="mt-4 block mx-auto text-amber-700 font-bold underline text-sm"
                    >
                      {tx.hero.submitted.submitAnother}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">{tx.hero.formTitle}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> AI-powered
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">{tx.hero.formSubtitle}</p>

                    {/* Toggle: Manual vs AI Scan */}
                    <div className="relative mb-6 bg-gray-100 border border-gray-200 p-1">
                      <div className="grid grid-cols-2 gap-1 relative">
                        <button
                          type="button"
                          onClick={() => { setUseAIScan(false); stopCamera(); setAiParsedItems([]); }}
                          className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 ${
                            !useAIScan
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{tx.hero.formModeTabs.manual}</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseAIScan(true)}
                          className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 ${
                            useAIScan
                              ? 'bg-amber-600 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>{tx.hero.formModeTabs.aiScan}</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* AI Scan Guide */}
                    {useAIScan && !cameraActive && !photoPreview && (
                      <div className="mb-6 bg-gray-50 border border-gray-200 p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{tx.hero.aiScan.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{tx.hero.aiScan.desc}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {tx.hero.aiScan.steps.map((step, i) => (
                            <div key={i} className="bg-white border border-gray-200 p-2">
                              <div className="text-lg font-semibold text-amber-700 mb-0.5">{i + 1}</div>
                              <div className="text-xs font-medium text-gray-700">{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />

                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      {/* AI Scan Mode */}
                      {useAIScan ? (
                        <div className="space-y-4">
                          {cameraActive ? (
                            <div className="space-y-4">
                              <div className="relative overflow-hidden border border-gray-200 rounded-xl">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  className="w-full"
                                />
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute inset-4 border border-dashed border-white/60 flex items-center justify-center">
                                    <span className="bg-black/60 text-white text-xs font-medium px-3 py-1.5">
                                      Position slip within frame
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  disabled={aiScanning}
                                  className="flex-1 px-4 py-3 bg-gray-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                  <Camera className="w-5 h-5" />
                                  <span>Capture & Scan</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="px-5 bg-gray-200 hover:bg-gray-300 font-bold text-sm transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : photoPreview ? (
                            <div className="space-y-4">
                              <div className="relative overflow-hidden border border-gray-300">
                                <img src={photoPreview} alt="Product" className="w-full bg-gray-50" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    removePhoto();
                                    setAiParsedItems([]);
                                  }}
                                  className="absolute top-3 right-3 bg-gray-900/80 hover:bg-gray-900 text-white p-2 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {aiScanning ? (
                                <div className="bg-gray-100 border border-gray-200 p-6 text-center">
                                  <Loader2 className="w-8 h-8 animate-spin text-gray-700 mx-auto mb-3" />
                                  <p className="text-sm font-bold text-gray-900 mb-1">Scanning your slip...</p>
                                  <p className="text-xs text-gray-600">Extracting products, quantities, and brands</p>
                                </div>
                              ) : aiParsedItems.length > 0 ? (
                                <div className="bg-amber-50 border border-amber-300 p-5 space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-5 h-5 text-amber-700" />
                                    <p className="text-sm font-bold text-amber-900">
                                      Found {aiParsedItems.length} product{aiParsedItems.length > 1 ? 's' : ''} — form auto-filled
                                    </p>
                                  </div>

                                  <div className="space-y-3 bg-white border border-amber-200 p-3">
                                    {aiParsedItems.slice(0, 3).map((item: any, i: number) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <span className="text-amber-700 font-bold mt-0.5">{i + 1}.</span>
                                        <div className="flex-1">
                                          <div className="font-bold text-gray-900">{item.productName}</div>
                                          <div className="text-gray-600 flex items-center gap-2 flex-wrap">
                                            <span>{item.quantity} {item.unit}</span>
                                            {item.brand && (
                                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium">
                                                {item.brand}
                                              </span>
                                            )}
                                          </div>
                                          {!item.brand && item.brandSuggestions && item.brandSuggestions.length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-xs text-gray-500 mb-1">Suggested brands:</p>
                                              <div className="flex flex-wrap gap-1">
                                                {item.brandSuggestions.map((s: any) => (
                                                  <button
                                                    key={s.name}
                                                    type="button"
                                                    onClick={() => {
                                                      const updated = [...aiParsedItems];
                                                      updated[i] = { ...updated[i], brand: s.name };
                                                      setAiParsedItems(updated);
                                                      if (i === 0) setInquiryForm(f => ({ ...f, modelNumber: `${item.productName} ${s.name}`.trim() }));
                                                    }}
                                                    className="px-2 py-0.5 border border-gray-300 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    title={s.reason}
                                                  >
                                                    {s.name}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {aiParsedItems.length > 3 && (
                                      <p className="text-xs text-gray-500 italic pt-1 border-t border-gray-200">
                                        +{aiParsedItems.length - 3} more product{aiParsedItems.length - 3 > 1 ? 's' : ''} detected
                                      </p>
                                    )}
                                  </div>

                                  {detectedLocation && (
                                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2">
                                      <MapPin className="w-4 h-4 text-amber-700" />
                                      <span className="text-xs font-medium text-amber-900">
                                        Location detected: <span className="font-bold">{detectedLocation}</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Upload Area */}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full h-40 border border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                                  isDragging
                                    ? 'border-gray-500 bg-gray-100'
                                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                                }`}
                              >
                                <div className="w-12 h-12 bg-gray-900 flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold text-gray-900">{tx.hero.aiScan.upload}</span>
                                <span className="text-xs text-gray-500">{tx.hero.aiScan.uploadHint}</span>
                              </button>

                              {/* Divider */}
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                  <span className="px-3 bg-white text-gray-500 font-medium">{tx.hero.aiScan.or}</span>
                                </div>
                              </div>

                              {/* Camera Button */}
                              <button
                                type="button"
                                onClick={startCamera}
                                className="w-full px-4 py-3 bg-gray-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                              >
                                <Camera className="w-5 h-5" />
                                <span>{tx.hero.aiScan.camera}</span>
                              </button>

                              {/* Tips */}
                              <div className="bg-gray-50 border border-gray-200 p-4">
                                <p className="text-xs font-bold text-gray-700 mb-2">{tx.hero.aiScan.tips.title}</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {tx.hero.aiScan.tips.items.map((tip, i) => (
                                    <li key={i}>• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Manual Entry Mode */
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Product Photo <span className="text-gray-400 normal-case font-normal">(optional)</span>
                          </label>
                          {photoPreview ? (
                            <div className="relative w-full h-32 border border-gray-200 overflow-hidden">
                              <img src={photoPreview} alt="Product" className="w-full h-full object-contain bg-gray-50" />
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute top-2 right-2 bg-gray-900 text-white p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-24 border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                            >
                              <Camera className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-500">Upload product photo</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Model Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                          <span>{tx.hero.formLabels.productModel}</span>
                          <button
                            type="button"
                            onClick={isVoiceListening ? stopVoiceInput : startVoiceInput}
                            className={`flex items-center gap-1 text-xs font-normal normal-case px-2 py-0.5 rounded-full transition-colors ${
                              isVoiceListening
                                ? 'bg-red-100 text-red-600 animate-pulse'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {isVoiceListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                            {isVoiceListening ? tx.hero.formLabels.stop : tx.hero.formLabels.speak}
                          </button>
                        </label>
                        <input
                          type="text"
                          placeholder={isVoiceListening ? 'Listening... speak your product name' : 'e.g. Havells Crabtree 16A switch, Polycab 2.5mm wire...'}
                          value={inquiryForm.modelNumber}
                          onChange={e => setInquiryForm(f => ({ ...f, modelNumber: e.target.value }))}
                          className={`w-full px-4 py-2.5 border focus:border-gray-400 outline-none text-sm transition-colors ${
                            isVoiceListening ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                          }`}
                        />
                        {isVoiceListening && (
                          <p className="text-[11px] text-amber-700 mt-1">Say the product, quantity, and city — Volt AI will fill the form</p>
                        )}
                      </div>

                      {/* Quantity & City */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">{tx.hero.formLabels.quantity}</label>
                          <input
                            type="number"
                            min="1"
                            value={inquiryForm.quantity}
                            onChange={e => setInquiryForm(f => ({ ...f, quantity: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 focus:border-gray-400 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                            <span>{tx.hero.formLabels.city}</span>
                            <button
                              type="button"
                              onClick={detectLocation}
                              className="text-xs text-amber-700 hover:text-amber-800 font-normal normal-case flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" />
                              {tx.hero.formLabels.autoDetect}
                            </button>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mumbai"
                            value={inquiryForm.deliveryCity}
                            onChange={e => setInquiryForm(f => ({ ...f, deliveryCity: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 focus:border-gray-400 outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Name & Phone */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">{tx.hero.formLabels.yourName}</label>
                        <input
                          type="text"
                          placeholder="Full name"
                          value={inquiryForm.name}
                          onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 focus:border-gray-400 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">{tx.hero.formLabels.phone}</label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={inquiryForm.phone}
                          onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 focus:border-gray-400 outline-none text-sm"
                        />
                      </div>

                      {formError && (
                        <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-sm text-red-700">{formError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            <span>{tx.hero.formLabels.submitting}</span>
                          </>
                        ) : (
                          <>
                            <span>{tx.hero.formLabels.getPrice}</span>
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </button>

                      <p className="text-xs text-gray-400 text-center">
                        {tx.hero.formLabels.noSpam}
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Brand Marquee ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-y border-gray-100 overflow-hidden py-5">
        <div className="ticker-content gap-0">
          {[...Array(2)].map((_, pass) => (
            <span key={pass} className="inline-flex items-center">
              {['Havells', 'Polycab', 'Schneider', 'Legrand', 'Anchor', 'Philips', 'Finolex', 'Siemens', 'ABB', 'Crompton', 'Orient', 'Wipro Lighting'].map(b => (
                <span key={b} className="inline-flex items-center gap-3 mr-12 text-gray-400 text-sm font-semibold tracking-widest uppercase">
                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                  {b}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Trust Pillars ─────────────────────────────────────────────────────── */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
            {[
              { icon: '🔍', title: 'Verified Dealers Only', desc: 'Every dealer is vetted before they can respond to an inquiry. No random shops, no unknown sources.' },
              { icon: '⚡', title: 'Dealers Compete For You', desc: 'Multiple dealers quote your inquiry simultaneously — prices drop when they compete for your business.' },
              { icon: '🤝', title: 'You Stay In Control', desc: 'All quotes in one place. Compare prices, delivery, and ratings. You decide — no pressure, no commitment.' },
            ].map((p, i) => (
              <div key={i} className="bg-white px-8 py-8 hover:bg-amber-50/40 transition-colors duration-300">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ElectricWireDivider />
      {/* ─── How It Works ─────────────────────────────────────────────────────── */}
      <section className="bg-white overflow-hidden">
        <div ref={howIn.ref as any} className="max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-20 sm:pb-28">

          {/* Header */}
          <div className="text-center mb-10" style={revealStyle(howIn.inView, 0)}>
            <span className="inline-block text-[11px] font-bold text-amber-700 uppercase tracking-[0.2em] mb-5 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full">
              {tx.howItWorks.label}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {tx.howItWorks.title}
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">One requirement. Zero spam. Competitive quotes. Both sides win.</p>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center justify-center mb-10" style={revealStyle(howIn.inView, 0.06)}>
            <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 gap-1">
              <button
                onClick={() => setFlowView('buyer')}
                className={`px-7 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${flowView === 'buyer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                For Buyers
              </button>
              <button
                onClick={() => setFlowView('dealer')}
                className={`px-7 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${flowView === 'dealer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                For Dealers
              </button>
            </div>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8" style={revealStyle(howIn.inView, 0.1)}>
            {(flowView === 'buyer' ? BUYER_STEPS : DEALER_STEPS).map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl p-4 hover:border-amber-200 hover:shadow-md transition-all duration-200 group">
                <div className="text-[10px] font-bold text-gray-300 mb-2 tracking-widest">{step.step}</div>
                <div className="text-3xl mb-3">{step.emoji}</div>
                <p className="text-xs font-bold text-gray-900 mb-1 leading-tight">{step.title}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{step.desc}</p>
                {i < 5 && (
                  <div className="hidden lg:block absolute top-1/2 -right-1.5 w-3 h-px bg-gray-200 group-hover:bg-amber-400 transition-colors" />
                )}
              </div>
            ))}
          </div>

          {/* Hub4Estate Blind Matching Engine */}
          <div className="bg-gray-900 rounded-2xl px-6 py-5 text-center mb-6" style={revealStyle(howIn.inView, 0.18)}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <p className="text-sm font-bold text-white">Hub4Estate Blind Matching Engine</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['No names shared', 'Instant routing', 'Every bid = market data', 'Sent blind to dealers', 'Quotes back to buyer'].map((tag, i) => (
                <span key={i} className="text-xs text-gray-400 bg-white/8 px-3 py-1 rounded-full border border-white/[0.14]">{tag}</span>
              ))}
            </div>
          </div>

          {/* Switch flow CTA */}
          <div className="text-center" style={revealStyle(howIn.inView, 0.22)}>
            <button
              onClick={() => setFlowView(flowView === 'buyer' ? 'dealer' : 'buyer')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4"
            >
              {flowView === 'buyer' ? 'See how it works for dealers →' : 'See how it works for buyers →'}
            </button>
          </div>

        </div>
      </section>

      {/* Who Is Hub4Estate For */}
      <ElectricWireDivider />
      <PersonaSection />

      {/* AI Section */}
      <ElectricWireDivider dark />
      <AISection />
      <ElectricWireDivider />

      {/* Categories Grid */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-amber-700 uppercase tracking-[0.2em] mb-4 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">Browse by category</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {tx.categories.title}
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              {tx.categories.subtitle}
            </p>
          </div>

          <InteractiveCategoryGrid categories={categories} loading={loading} />

          <div className="text-center mt-12">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl btn-glow"
            >
              {tx.categories.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <ElectricWireDivider />
      {/* ─── Real Deals ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div ref={dealsIn.ref as any} className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14" style={revealStyle(dealsIn.inView, 0)}>
            <span className="inline-block text-[11px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-4 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">{tx.realDeals.label}</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {tx.realDeals.title}
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              {tx.realDeals.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tx.realDeals.deals.map((deal, di) => {
              const savedAmounts = ['₹37,000', '₹24,000', '₹8,800'];
              return (
                <div
                  key={di}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-amber-200 hover:shadow-md transition-all duration-300"
                  style={revealStyle(dealsIn.inView, 0.1 + di * 0.08)}
                >
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">{deal.tag}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-5 leading-snug">{deal.title}</h3>
                  <div className="space-y-2 mb-5">
                    {deal.rows.map((row, ri) => (
                      row.strikethrough ? (
                        <div key={ri} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-400">{row.label}</span>
                          <span className="text-sm font-medium text-gray-300 line-through">{row.price}</span>
                        </div>
                      ) : (
                        <div key={ri} className="flex justify-between items-center py-3 bg-[#0B1628] px-3.5 rounded-xl">
                          <span className="text-sm font-bold text-white">{row.label}</span>
                          <span className="text-xl font-black text-amber-400">{row.price}</span>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5">{deal.savedLabel}</p>
                    <p className="text-3xl font-black text-[#0B1628]">{savedAmounts[di]}</p>
                    <p className="text-xs text-gray-400 mt-1">{deal.savedNote}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-10" style={revealStyle(dealsIn.inView, 0.35)}>
            {tx.realDeals.footnote}
          </p>
        </div>
      </section>

      <ElectricWireDivider />
      {/* Why We Exist */}
      <section className="py-20 sm:py-28 bg-white">
        <div ref={whyIn.ref as any} className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14" style={revealStyle(whyIn.inView, 0)}>
            <span className="inline-block text-[11px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-4 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">{tx.whyWeExist.label}</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {tx.whyWeExist.title}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {tx.whyWeExist.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {tx.whyWeExist.cards.map((item, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-2xl p-7 hover:border-amber-200 hover:shadow-md transition-all duration-300 group"
                style={revealStyle(whyIn.inView, 0.1 + index * 0.08)}
              >
                <div className="w-1 h-8 bg-amber-600 rounded-full mb-5 group-hover:h-10 transition-all duration-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div
            className="bg-[#0B1628] rounded-2xl p-10 text-center"
            style={revealStyle(whyIn.inView, 0.35)}
          >
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              {tx.whyWeExist.summary.title}
            </h3>
            <p className="text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
              {tx.whyWeExist.summary.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #B45309 0%, #D97706 40%, #F59E0B 70%, #B45309 100%)' }}>
        {/* Noise + pattern overlay */}
        <div className="absolute inset-0 blueprint-bg-dark opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 65%)' }} />

        <div ref={ctaIn.ref as any} className="max-w-4xl mx-auto px-6 text-center relative">
          <div style={revealStyle(ctaIn.inView, 0)}>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 text-white text-[11px] font-bold rounded-full mb-8 uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Free · No Account Required
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight"
            style={revealStyle(ctaIn.inView, 0.07)}
          >
            {tx.finalCta.title}
          </h2>
          <p
            className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed"
            style={revealStyle(ctaIn.inView, 0.13)}
          >
            {tx.finalCta.subtitle}
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={revealStyle(ctaIn.inView, 0.19)}
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#0B1628] text-white font-black text-base rounded-xl hover:bg-gray-900 transition-all duration-200 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 group"
            >
              {tx.finalCta.ctaPrimary}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/track"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-white/40 text-white font-bold text-base rounded-xl hover:border-white hover:bg-white/10 transition-all duration-200"
            >
              {tx.finalCta.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
