import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, CheckCircle, IndianRupee, FileText, Upload, Camera, X, Sparkles, Loader2, MapPin, Mic, MicOff, Home, Wrench, Palette, Building2, Users, Store, Truck, TrendingUp, Award, BarChart3, Search, Clock, UserCheck, Inbox, SlidersHorizontal, Star } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { AISection } from '../components/AISection';
import { productsApi, api } from '../lib/api';
import { Analytics } from '../lib/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView, revealStyle } from '../hooks/useInView';


const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

// ─── How It Works flow data ────────────────────────────────────────────────────
const BUYER_STEPS = [
  { step: '01', Icon: Upload,           title: 'Browse or Upload Slip', desc: 'Select products or scan a purchase order' },
  { step: '02', Icon: Sparkles,         title: 'AI Extracts Specs',     desc: 'Brand, qty, specs auto-detected in seconds' },
  { step: '03', Icon: CheckCircle,      title: 'Review & Submit',       desc: 'Confirm details and send to the network' },
  { step: '04', Icon: SlidersHorizontal,title: 'Compare All Quotes',    desc: 'Price · shipping · delivery time side by side' },
  { step: '05', Icon: Star,             title: 'Select Best Deal',      desc: 'Tap the winner, contact is revealed instantly' },
  { step: '06', Icon: TrendingUp,       title: 'Deal Closed!',          desc: 'Best price secured, zero spam calls' },
];

const DEALER_STEPS = [
  { step: '01', Icon: Inbox,       title: 'Requirement Arrives',  desc: 'Blind — no buyer name or contact shared' },
  { step: '02', Icon: Search,      title: 'View Specs & Qty',     desc: 'See exactly what is needed before quoting' },
  { step: '03', Icon: IndianRupee, title: 'Submit Quote',         desc: 'Price + shipping + delivery + terms' },
  { step: '04', Icon: Clock,       title: 'Await Decision',       desc: 'Buyer compares all quotes objectively' },
  { step: '05', Icon: UserCheck,   title: 'Win = Contact',        desc: 'Contact revealed the moment buyer selects you' },
  { step: '06', Icon: BarChart3,   title: 'Lose = Market Data',   desc: 'Winning price benchmark shared — learn and adapt' },
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
  const [tabAnimating, setTabAnimating] = useState(false);
  const switchTab = (view: 'buyer' | 'dealer') => {
    if (view === flowView) return;
    setTabAnimating(true);
    setTimeout(() => { setFlowView(view); setTabAnimating(false); }, 200);
  };
  const heroIn = useInView(0.05);
  const howIn = useInView(0.06);
  const whoIn = useInView(0.05);
  const twoIn = useInView(0.05);
  const catIn = useInView(0.06);
  const dealsIn = useInView(0.06);
  const whyIn = useInView(0.06);
  const ctaIn = useInView(0.1);

  return (
    <div className="min-h-screen relative">

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden border-b border-gray-100">
        {/* Subtle warm glow orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.07) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 65%)' }} />

        <div ref={heroIn.ref as any} className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <div>
              {/* Live badge — animated pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full mb-8"
                style={revealStyle(heroIn.inView, 0)}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  {isHi ? 'Verified Dealer Network' : 'Verified Dealer Network Across India'}
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 mb-6 leading-[0.93] tracking-tight"
                style={revealStyle(heroIn.inView, 0.06)}
              >
                {isHi ? (
                  <span className="gradient-text-orange">{tx.hero.headline}</span>
                ) : (
                  <>
                    We Will Get You The{' '}
                    <span className="text-amber-600">Cheapest Price</span>
                    {' '}Of Any Electrical Across India.
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
                className="flex flex-col gap-2.5"
                style={revealStyle(heroIn.inView, 0.24)}
              >
                {[
                  { Icon: IndianRupee, text: 'Multiple quotes from real dealers — compare side by side' },
                  { Icon: Shield, text: 'We verify dealers before connecting you' },
                  { Icon: FileText, text: 'Full transparency — you see every quote, no hidden fees' },
                ].map(({ Icon, text }, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                    <Icon className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Verified deal proof — floating pill cards */}
              <div className="mt-10 flex flex-wrap gap-3" style={revealStyle(heroIn.inView, 0.30)}>
                {[
                  { label: 'Sony Speaker', saved: '₹37,000 saved', sub: 'vs Croma ₹1,05,000' },
                  { label: 'Philips LED ×200', saved: '₹24,000 saved', sub: 'vs local dealer' },
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

      {/* ─── Key Facts Bar ─────────────────────────────────────────────────────── */}
      <div className="border-t border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { stat: '₹37,000', label: 'Average saved per order' },
              { stat: '100%', label: 'Free for buyers, always' },
              { stat: 'Verified', label: 'Every dealer, vetted manually' },
              { stat: 'Zero', label: 'Spam calls to your number' },
            ].map((f, i) => (
              <div key={i} className="px-6 py-6 text-center">
                <p className="text-2xl font-black text-[#0B1628] mb-1">{f.stat}</p>
                <p className="text-xs text-gray-400 leading-snug">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ─── How It Works ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 overflow-hidden">
        <div ref={howIn.ref as any} className="max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-20 sm:pb-28">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12" style={revealStyle(howIn.inView, 0)}>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] mb-3">{tx.howItWorks.label}</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                {tx.howItWorks.title}
              </h2>
            </div>
            {/* Tab toggle */}
            <div className="inline-flex bg-gray-50 border border-gray-100 rounded-xl p-1 gap-1 flex-shrink-0" style={revealStyle(howIn.inView, 0.06)}>
              {([
                { id: 'buyer' as const, label: 'For Buyers' },
                { id: 'dealer' as const, label: 'For Dealers' },
              ]).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => switchTab(id)}
                  className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    flowView === id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {label}
                  {flowView === id && (
                    <span className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-amber-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Steps — animated individual cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6"
            style={{
              opacity: tabAnimating ? 0 : 1,
              transform: tabAnimating ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            {(flowView === 'buyer' ? BUYER_STEPS : DEALER_STEPS).map((step, i) => (
              <div
                key={step.step}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 overflow-hidden hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/40 hover:-translate-y-1 transition-all duration-300 cursor-default"
                style={revealStyle(howIn.inView, 0.08 + i * 0.06)}
              >
                {/* Icon — soft amber, fills on hover */}
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
                  <step.Icon className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>

                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.15em] mb-1.5">Step {step.step}</p>
                <p className="text-sm font-bold text-gray-900 mb-1.5 relative">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed relative">{step.desc}</p>

                {/* Bottom accent line — slides in on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            ))}
          </div>

          {/* Blind Matching Engine */}
          <div className="bg-[#0B1628] rounded-xl px-6 py-4 flex flex-wrap items-center gap-4" style={revealStyle(howIn.inView, 0.18)}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <p className="text-sm font-semibold text-white">Blind Matching Engine</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['No names shared', 'Quotes sent blind', 'Instant routing', 'Market data on every bid'].map((tag, i) => (
                <span key={i} className="text-xs text-gray-400 bg-white/[0.07] px-3 py-1 rounded-full border border-white/10">{tag}</span>
              ))}
            </div>
            <button
              onClick={() => setFlowView(flowView === 'buyer' ? 'dealer' : 'buyer')}
              className="ml-auto text-xs text-amber-500 hover:text-amber-400 transition-colors flex-shrink-0"
            >
              {flowView === 'buyer' ? 'View dealer flow →' : 'View buyer flow →'}
            </button>
          </div>

        </div>
      </section>

      {/* ─── Anyone Who Buys ──────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
        <div ref={whoIn.ref as any} className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="max-w-3xl mb-14" style={revealStyle(whoIn.inView, 0)}>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] mb-3">Who We Serve</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Anyone Who Buys Electrical Products
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
              If you've ever paid more than you should have — without knowing it — Hub4Estate was built for you.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Home,      title: 'Homeowners',         useCase: 'Renovating or fitting a new home', benefit: 'Compare prices on lights, fans & wiring — before spending a rupee' },
              { icon: Wrench,    title: 'Contractors',        useCase: 'Running construction projects',      benefit: 'Bulk pricing from 4+ dealers, delivered directly to site' },
              { icon: Palette,   title: 'Interior Designers', useCase: 'Specifying fixtures for clients',   benefit: 'Source exact-spec products without calling 10 vendors' },
              { icon: Building2, title: 'Builders',           useCase: 'Large-scale project procurement',   benefit: 'One inquiry → multiple verified dealer quotes, instantly' },
              { icon: Users,     title: 'Architects',         useCase: 'Sourcing to your exact specs',      benefit: 'Find products that match specifications, not just nearby stock' },
              { icon: Store,     title: 'Small Businesses',   useCase: 'Office or facility fitouts',        benefit: 'Get dealer pricing on fitout materials — not retail markup' },
            ].map((segment, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-7 border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                style={revealStyle(whoIn.inView, 0.05 + i * 0.07)}
              >
                {/* Card number */}
                <span className="absolute top-5 right-6 text-5xl font-black leading-none select-none pointer-events-none text-gray-50 group-hover:text-amber-50 transition-colors duration-300">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
                  <segment.icon className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-gray-900 mb-1">{segment.title}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">{segment.useCase}</p>

                {/* Benefit */}
                <div className="mt-auto flex items-start gap-2.5 pt-4 border-t border-gray-100">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 leading-snug">{segment.benefit}</p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Two Sides. One Platform. ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
        <div ref={twoIn.ref as any} className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16" style={revealStyle(twoIn.inView, 0)}>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              Two Sides. One Platform.
            </h2>
            <p className="text-xl text-gray-500 max-w-xl mx-auto">
              Hub4Estate works for both buyers and electrical dealers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6" style={revealStyle(twoIn.inView, 0.08)}>
            {/* For Buyers */}
            <div className="border border-gray-200 rounded-2xl p-8 bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/30 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">For Buyers</span>
                  <h3 className="text-xl font-semibold text-gray-900">Anyone Buying Electrical Products</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: IndianRupee, title: 'Compare Real Dealer Prices', desc: 'See what multiple verified dealers are actually charging — side by side' },
                  { icon: Shield, title: 'Verified Dealers Only', desc: 'We check dealers before connecting you. No unknown vendors' },
                  { icon: FileText, title: 'Full Documentation', desc: 'GST bills, warranty cards, delivery proof — proper paperwork every time' },
                  { icon: Truck, title: 'Doorstep Delivery', desc: 'Products delivered to your site, home, or office where available' },
                  { icon: TrendingUp, title: 'Zero Middlemen', desc: 'You deal directly with the dealer. We just facilitate the connection' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500 leading-snug">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0B1628] text-white font-semibold rounded-xl hover:bg-[#0F2040] transition-colors"
              >
                Submit Your First Inquiry <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* For Dealers */}
            <div className="border border-gray-700 rounded-2xl p-8 bg-[#0B1628] text-white hover:border-gray-600 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">For Dealers</span>
                  <h3 className="text-xl font-semibold text-white">Electrical Shops &amp; Distributors</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, title: 'Qualified Buyer Inquiries', desc: 'Receive real inquiries from buyers who know what they want' },
                  { icon: IndianRupee, title: 'Free to Join', desc: 'No listing fees, no upfront charges to get started' },
                  { icon: Award, title: 'Build Your Reputation', desc: 'Get rated by real customers. Better ratings, more inquiries' },
                  { icon: BarChart3, title: 'Track Your Performance', desc: 'See your quotes, conversions, and earnings in one dashboard' },
                  { icon: TrendingUp, title: 'Expand Your Reach', desc: 'Reach buyers across your city who would never have found you otherwise' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{title}</p>
                      <p className="text-sm text-white/50 leading-snug">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/dealer/onboarding" className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors">
                Register as a Dealer — Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}

      <AISection />


      {/* Categories Grid */}
      <section className="py-20 sm:py-28 bg-gray-50 border-t border-gray-100">
        <div ref={catIn.ref as any} className="max-w-6xl mx-auto px-6">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4" style={revealStyle(catIn.inView, 0)}>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] mb-3">Browse by category</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 tracking-tight">
                {tx.categories.title}
              </h2>
              <p className="text-base text-gray-500 max-w-lg">
                {tx.categories.subtitle}
              </p>
            </div>
          </div>

          <div style={revealStyle(catIn.inView, 0.1)}>
            <InteractiveCategoryGrid categories={categories} loading={loading} />
          </div>

          <div className="text-center mt-12" style={revealStyle(catIn.inView, 0.2)}>
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


      {/* ─── Real Deals ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#0B1628] border-t border-white/5">
        <div ref={dealsIn.ref as any} className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6" style={revealStyle(dealsIn.inView, 0)}>
            <div>
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] mb-3">{tx.realDeals.label}</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight leading-tight">
                {tx.realDeals.title}
              </h2>
              <p className="text-base text-white/50 max-w-lg">
                {tx.realDeals.subtitle}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-white/60">Real verified deals</span>
            </div>
          </div>

          {/* Deal Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {tx.realDeals.deals.map((deal, di) => {
              const savedAmounts = ['₹37,000', '₹24,000', '₹8,800'];
              // Bar widths as % of max price for visual comparison
              const barData = [
                [{ w: 100, label: null }, { w: 91, label: null }, { w: 59, label: null }],
                [{ w: 100, label: null }, { w: 80, label: null }],
                [{ w: 100, label: null }, { w: 65, label: null }],
              ][di] || [];
              return (
                <div
                  key={di}
                  className="group relative bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300"
                  style={revealStyle(dealsIn.inView, 0.1 + di * 0.09)}
                >
                  {/* Amber top line */}
                  <div className="h-[2px] bg-gradient-to-r from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 transition-all duration-300" />

                  <div className="p-6">
                    {/* Tag */}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      {deal.tag}
                    </span>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white mt-4 mb-6 leading-snug">{deal.title}</h3>

                    {/* Price comparison with visual bars */}
                    <div className="space-y-4 mb-6">
                      {deal.rows.map((row, ri) => {
                        const bar = barData[ri];
                        const isWinner = !row.strikethrough;
                        return (
                          <div key={ri}>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className={`text-xs font-medium ${isWinner ? 'text-amber-400 font-bold' : 'text-white/40'}`}>
                                {row.label}
                              </span>
                              <span className={`text-sm font-bold ${isWinner ? 'text-amber-400 text-lg' : 'text-white/30 line-through'}`}>
                                {row.price}
                              </span>
                            </div>
                            {/* Visual bar */}
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isWinner ? 'bg-amber-500' : 'bg-white/15'}`}
                                style={{ width: dealsIn.inView ? `${bar?.w ?? 80}%` : '0%', transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Savings — Hero number */}
                    <div className="border-t border-white/8 pt-5">
                      <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold mb-1">{deal.savedLabel}</p>
                      <p
                        className="text-4xl font-black text-amber-400 mb-1 transition-all duration-700"
                        style={{
                          opacity: dealsIn.inView ? 1 : 0,
                          transform: dealsIn.inView ? 'translateY(0)' : 'translateY(12px)',
                          transitionDelay: `${0.3 + di * 0.1}s`,
                        }}
                      >{savedAmounts[di]}</p>
                      <p className="text-xs text-white/30">{deal.savedNote}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-white/25 mt-10" style={revealStyle(dealsIn.inView, 0.4)}>
            {tx.realDeals.footnote}
          </p>
        </div>
      </section>


      {/* ─── Why We Exist ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
        <div ref={whyIn.ref as any} className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="mb-16 max-w-2xl" style={revealStyle(whyIn.inView, 0)}>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] mb-4">{tx.whyWeExist.label}</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
              {tx.whyWeExist.title}
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
              {tx.whyWeExist.subtitle}
            </p>
          </div>

          {/* 3 problem cards — proper cards with icons + real example stats */}
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            {[
              { icon: BarChart3, stat: '₹37K difference on a single order', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: MapPin,   stat: '5–6 manual calls wasted per purchase', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: FileText, stat: 'No GST bill = no warranty claim possible', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            ].map(({ icon: Icon, stat, color, bg, border }, i) => {
              const item = tx.whyWeExist.cards[i];
              return (
                <div
                  key={i}
                  className="group relative bg-white border border-gray-100 rounded-2xl p-7 overflow-hidden hover:border-amber-200/80 hover:shadow-xl hover:shadow-amber-100/30 hover:-translate-y-1.5 transition-all duration-300"
                  style={revealStyle(whyIn.inView, 0.08 + i * 0.08)}
                >
                  {/* Faded step number background */}
                  <span className="absolute right-5 top-4 text-7xl font-black text-gray-50 group-hover:text-amber-50/80 transition-colors duration-300 select-none leading-none pointer-events-none">
                    0{i + 1}
                  </span>

                  {/* Icon */}
                  <div className={`w-11 h-11 ${bg} border ${border} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-3 relative">{item?.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 relative">{item?.desc}</p>

                  {/* Real example callout */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Real example</p>
                    <p className="text-sm font-bold text-gray-800">{stat}</p>
                  </div>

                  {/* Hover accent bottom line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              );
            })}
          </div>

          {/* Solution block */}
          <div
            className="bg-[#0B1628] rounded-2xl p-8 sm:p-12 grid sm:grid-cols-2 gap-10 items-center"
            style={revealStyle(whyIn.inView, 0.36)}
          >
            <div>
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-5">
                {tx.whyWeExist.cards[3]?.title}
              </p>
              <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {tx.whyWeExist.summary.title}
              </h3>
            </div>
            <div className="space-y-5">
              <p className="text-base text-white/60 leading-relaxed">{tx.whyWeExist.cards[3]?.desc}</p>
              <p className="text-sm text-white/40 leading-relaxed">{tx.whyWeExist.summary.desc}</p>
              <button
                onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
              >
                See Your Price <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0B1628] py-24 sm:py-32">
        <div ref={ctaIn.ref as any} className="max-w-4xl mx-auto px-6 text-center">
          <p
            className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] mb-6"
            style={revealStyle(ctaIn.inView, 0)}
          >
            Free · No Account Required
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight"
            style={revealStyle(ctaIn.inView, 0.07)}
          >
            {tx.finalCta.title}
          </h2>
          <p
            className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed"
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
              className="inline-flex items-center gap-2 px-10 py-4 bg-amber-600 text-white font-bold text-base rounded-xl btn-glow group"
            >
              {tx.finalCta.ctaPrimary}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/track"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 text-white/75 font-medium text-base rounded-xl hover:border-white/40 hover:text-white transition-all duration-200"
            >
              {tx.finalCta.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
