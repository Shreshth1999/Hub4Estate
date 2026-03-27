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

const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

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
  const savedData = savedInquiry ? JSON.parse(savedInquiry) : null;

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

  const heroIn = useInView(0.05);
  const howIn = useInView(0.06);
  const dealsIn = useInView(0.06);
  const whyIn = useInView(0.06);
  const ctaIn = useInView(0.1);

  return (
    <div className="min-h-screen relative">

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#09090B] overflow-hidden blueprint-bg-dark">
        {/* Ambient glow orbs */}
        <div className="absolute top-[-15%] right-[-5%] w-[900px] h-[900px] rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)' }} />

        <div ref={heroIn.ref as any} className="max-w-7xl mx-auto px-6 relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <div>
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full mb-8"
                style={revealStyle(heroIn.inView, 0)}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                  {isHi ? 'Live — 500+ verified dealers' : 'Live — 500+ Verified Dealers Across India'}
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-white mb-6 leading-[1.02] tracking-tight"
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
                className="text-lg text-white/55 mb-8 max-w-lg leading-relaxed"
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
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold text-base rounded-xl btn-glow group"
                >
                  {tx.hero.ctaPrimary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/track"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white/70 font-medium text-base rounded-xl hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {tx.hero.ctaSecondary}
                </Link>
              </div>

              {/* Trust Indicators */}
              <div
                className="flex flex-col gap-3"
                style={revealStyle(heroIn.inView, 0.24)}
              >
                {[IndianRupee, Shield, FileText].map((Icon, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-white/50">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <span>{tx.hero.trust[index]}</span>
                  </div>
                ))}
              </div>

              {/* Real Deal Proof Pills */}
              <div className="mt-10 flex flex-wrap gap-3" style={revealStyle(heroIn.inView, 0.30)}>
                {[
                  { label: 'Sony Speaker', saved: '₹37,000 saved', sub: 'vs Croma ₹1,05,000', delay: '' },
                  { label: 'Philips LED ×200', saved: '₹24,000 saved', sub: 'vs local dealer', delay: '0.4s' },
                ].map((d, i) => (
                  <div key={i} className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm ${i === 0 ? 'animate-float' : 'animate-float-delay'}`}>
                    <p className="text-[11px] text-white/40 mb-0.5 font-medium">{d.label}</p>
                    <p className="text-sm font-bold text-green-400">{d.saved}</p>
                    <p className="text-[11px] text-white/35">{d.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Product Inquiry Form */}
            <div style={revealStyle(heroIn.inView, 0.08)}>
              <div id="inquiry-form" className="bg-white rounded-2xl p-6 lg:p-8 shadow-2xl shadow-black/50 ring-1 ring-white/10">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
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
                      className="mt-4 block mx-auto text-orange-600 font-bold underline text-sm"
                    >
                      {tx.hero.submitted.submitAnother}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">{tx.hero.formTitle}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
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
                              ? 'bg-orange-500 text-white'
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
                              <div className="text-lg font-semibold text-orange-600 mb-0.5">{i + 1}</div>
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
                                <div className="bg-green-50 border border-green-300 p-5 space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <p className="text-sm font-bold text-green-900">
                                      Found {aiParsedItems.length} product{aiParsedItems.length > 1 ? 's' : ''} — form auto-filled
                                    </p>
                                  </div>

                                  <div className="space-y-3 bg-white border border-green-200 p-3">
                                    {aiParsedItems.slice(0, 3).map((item: any, i: number) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <span className="text-green-600 font-bold mt-0.5">{i + 1}.</span>
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
                                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2">
                                      <MapPin className="w-4 h-4 text-blue-600" />
                                      <span className="text-xs font-medium text-blue-900">
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
                                : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
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
                            isVoiceListening ? 'border-violet-300 bg-violet-50' : 'border-gray-200'
                          }`}
                        />
                        {isVoiceListening && (
                          <p className="text-[11px] text-violet-500 mt-1">Say the product, quantity, and city — Volt AI will fill the form</p>
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
                              className="text-xs text-orange-600 hover:text-orange-700 font-normal normal-case flex items-center gap-1"
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
      <div className="bg-[#09090B] border-t border-white/5 overflow-hidden py-5">
        <div className="ticker-content gap-0">
          {[...Array(2)].map((_, pass) => (
            <span key={pass} className="inline-flex items-center">
              {['Havells', 'Polycab', 'Schneider', 'Legrand', 'Anchor', 'Philips', 'Finolex', 'Siemens', 'ABB', 'Crompton', 'Orient', 'Wipro Lighting'].map(b => (
                <span key={b} className="inline-flex items-center gap-3 mr-12 text-white/25 text-sm font-semibold tracking-widest uppercase">
                  <span className="w-1 h-1 rounded-full bg-orange-500/50" />
                  {b}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Trust Pillars ─────────────────────────────────────────────────────── */}
      <div className="bg-[#09090B] border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/8">
            {[
              { icon: '🔍', title: 'Verified Dealers Only', desc: 'Every dealer is vetted before they can quote. No random shops, no middlemen.' },
              { icon: '⚡', title: 'Real Competition', desc: 'Multiple dealers quote simultaneously — prices drop when they compete for your order.' },
              { icon: '🧾', title: 'GST on Every Order', desc: 'Full GST invoice, warranty in your name, proper documentation always.' },
            ].map((p, i) => (
              <div key={i} className="bg-[#09090B] px-8 py-8 hover:bg-white/[0.03] transition-colors duration-300">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── How It Works ─────────────────────────────────────────────────────── */}
      <section className="bg-white overflow-hidden">
        <div ref={howIn.ref as any} className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="pt-20 sm:pt-28 text-center mb-20" style={revealStyle(howIn.inView, 0)}>
            <span className="inline-block text-[11px] font-bold text-orange-600 uppercase tracking-[0.2em] mb-5 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full">
              {tx.howItWorks.label}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {tx.howItWorks.title}
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">{tx.howItWorks.subtitle}</p>
          </div>

          {/* Step 1 — Submit */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center pb-24 border-b border-gray-100"
            style={revealStyle(howIn.inView, 0.1)}>
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-6">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">1</span>
                <span className="text-sm font-bold text-orange-700 uppercase tracking-wider">{tx.howItWorks.steps[0].highlight}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 leading-tight">{tx.howItWorks.steps[0].title}</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">{tx.howItWorks.steps[0].desc}</p>
              <div className="flex flex-col gap-3">
                {['Tell us the product name, model, or brand', 'Add quantity and delivery city', 'Upload a photo or speak your requirement — optional'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-orange-500" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            {/* Illustrated form preview */}
            <div className="bg-[#09090B] rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/20 animate-float-slow">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-[11px] text-white/30 ml-2 font-mono">hub4estate.com</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Product / Model</div>
                  <div className="text-white text-sm font-medium flex items-center gap-2">
                    Polycab FRLS 2.5mm² Wire
                    <span className="text-orange-400 text-[10px]">|</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Quantity</div>
                    <div className="text-white text-sm font-medium">200 metres</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">City</div>
                    <div className="text-white text-sm font-medium">Jaipur</div>
                  </div>
                </div>
                <div className="bg-orange-500 rounded-xl px-4 py-3 text-white text-sm font-bold text-center flex items-center justify-center gap-2">
                  Get Best Price <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-white/25 text-center mt-3">No account needed · Takes 2 minutes</p>
            </div>
          </div>

          {/* Step 2 — We Source */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-24 border-b border-gray-100"
            style={revealStyle(howIn.inView, 0.15)}>
            {/* Illustrated dealer network — left side */}
            <div className="bg-[#09090B] rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/20 order-2 lg:order-1 animate-float-slow">
              <div className="text-[11px] text-violet-400 font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                Contacting dealers in Jaipur...
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'Delhi Electricals', status: 'Quote received', price: '₹83/m', done: true },
                  { name: 'Jaipur Traders', status: 'Quote received', price: '₹97/m', done: true },
                  { name: 'Raj Wire Stores', status: 'Preparing quote...', price: '', done: false },
                  { name: 'Prime Suppliers', status: 'Notified', price: '', done: false },
                ].map((d, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${d.done ? 'bg-violet-500/10 border-violet-500/20' : 'bg-white/[0.03] border-white/8'}`}>
                    <div>
                      <div className="text-sm font-medium text-white">{d.name}</div>
                      <div className={`text-[11px] ${d.done ? 'text-violet-400' : 'text-white/30'}`}>{d.status}</div>
                    </div>
                    {d.price && <div className="text-base font-black text-violet-300">{d.price}</div>}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-[11px] text-white/25">4–6 dealers contacted automatically</div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-6">
                <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center">2</span>
                <span className="text-sm font-bold text-violet-700 uppercase tracking-wider">{tx.howItWorks.steps[1].highlight}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 leading-tight">{tx.howItWorks.steps[1].title}</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">{tx.howItWorks.steps[1].desc}</p>
              <div className="flex flex-col gap-3">
                {['We reach out to 4–6 verified dealers in your area', 'Dealers compete — price pressure happens automatically', 'You never have to make a single call'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-violet-500" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 — Compare & Choose */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-24 pb-28"
            style={revealStyle(howIn.inView, 0.2)}>
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-6">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-black flex items-center justify-center">3</span>
                <span className="text-sm font-bold text-green-700 uppercase tracking-wider">{tx.howItWorks.steps[2].highlight}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 leading-tight">{tx.howItWorks.steps[2].title}</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">{tx.howItWorks.steps[2].desc}</p>
              <div className="flex flex-col gap-3">
                {['All quotes in one place — price, delivery time, dealer rating', 'Pick the deal that works for you', 'GST invoice + delivery arranged after you confirm'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            {/* Illustrated quote comparison */}
            <div className="bg-[#09090B] rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/20 animate-float-slow">
              <div className="text-[11px] text-green-400 font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                4 quotes received — Polycab FRLS 2.5mm², 200m
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'Delhi Electricals', price: '₹83/m', total: '₹16,600', delivery: '2 days', best: true },
                  { name: 'Jaipur Traders', price: '₹97/m', total: '₹19,400', delivery: '1 day', best: false },
                  { name: 'Raj Wire Stores', price: '₹109/m', total: '₹21,800', delivery: '3 days', best: false },
                  { name: 'Prime Suppliers', price: '₹127/m', total: '₹25,400', delivery: 'Same day', best: false },
                ].map((q, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${q.best ? 'bg-green-500/12 border-green-500/30' : 'bg-white/[0.03] border-white/8'}`}>
                    <div>
                      {q.best && <div className="text-[10px] text-green-400 font-black mb-0.5">★ BEST PRICE</div>}
                      <div className="text-sm font-medium text-white">{q.name}</div>
                      <div className="text-[11px] text-white/30">{q.delivery} delivery</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black ${q.best ? 'text-green-400' : 'text-white/50'}`}>{q.price}</div>
                      <div className={`text-[11px] ${q.best ? 'text-green-400/70' : 'text-white/25'}`}>{q.total} total</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 text-center">
                <span className="text-sm font-bold text-green-400">₹8,800 saved vs highest quote</span>
                <span className="text-[11px] text-white/30 ml-2">· Real deal, verified</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* AI Section — animated, mobile-first */}
      <AISection />

      {/* Categories Grid */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-orange-600 uppercase tracking-[0.2em] mb-4 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">Browse by category</span>
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold rounded-xl btn-glow"
            >
              {tx.categories.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Real Deals ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#09090B] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)' }} />

        <div ref={dealsIn.ref as any} className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-14" style={revealStyle(dealsIn.inView, 0)}>
            <span className="inline-block text-[11px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-4 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">{tx.realDeals.label}</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              {tx.realDeals.title}
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              {tx.realDeals.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tx.realDeals.deals.map((deal, di) => {
              const savedAmounts = ['₹37,000', '₹24,000', '₹8,800'];
              return (
                <div
                  key={di}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 card-3d hover:border-orange-500/20 hover:bg-white/[0.07]"
                  style={revealStyle(dealsIn.inView, 0.1 + di * 0.08)}
                >
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">{deal.tag}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-5 leading-snug">{deal.title}</h3>
                  <div className="space-y-2 mb-5">
                    {deal.rows.map((row, ri) => (
                      row.strikethrough ? (
                        <div key={ri} className="flex justify-between items-center py-2 border-b border-white/8">
                          <span className="text-sm text-white/35">{row.label}</span>
                          <span className="text-sm font-medium text-white/25 line-through">{row.price}</span>
                        </div>
                      ) : (
                        <div key={ri} className="flex justify-between items-center py-3 bg-orange-500/10 border border-orange-500/20 px-3.5 rounded-xl">
                          <span className="text-sm font-bold text-white/80">{row.label}</span>
                          <span className="text-xl font-black text-orange-400">{row.price}</span>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="border-t border-white/8 pt-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1.5">{deal.savedLabel}</p>
                    <p className="text-3xl font-black text-green-400">{savedAmounts[di]}</p>
                    <p className="text-xs text-white/30 mt-1">{deal.savedNote}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-white/25 mt-10" style={revealStyle(dealsIn.inView, 0.35)}>
            {tx.realDeals.footnote}
          </p>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-20 sm:py-28 bg-[#09090B] relative overflow-hidden blueprint-bg-dark">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.1) 0%, transparent 60%)' }} />

        <div ref={whyIn.ref as any} className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-14" style={revealStyle(whyIn.inView, 0)}>
            <span className="inline-block text-[11px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-4 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">{tx.whyWeExist.label}</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              {tx.whyWeExist.title}
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              {tx.whyWeExist.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {tx.whyWeExist.cards.map((item, index) => (
              <div
                key={index}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 card-3d hover:border-orange-500/20 group"
                style={revealStyle(whyIn.inView, 0.1 + index * 0.08)}
              >
                <div className="w-1 h-8 bg-orange-500 rounded-full mb-5 group-hover:h-10 transition-all duration-300" />
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div
            className="border border-orange-500/20 bg-orange-500/5 rounded-2xl p-10 text-center"
            style={revealStyle(whyIn.inView, 0.35)}
          >
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              {tx.whyWeExist.summary.title}
            </h3>
            <p className="text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
              {tx.whyWeExist.summary.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Persona Section — second to last */}
      <PersonaSection />

      {/* Final CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 40%, #FB923C 70%, #EA580C 100%)' }}>
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
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#09090B] text-white font-black text-base rounded-xl hover:bg-gray-900 transition-all duration-200 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 group"
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
