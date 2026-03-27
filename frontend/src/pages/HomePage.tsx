import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, CheckCircle, IndianRupee, FileText, Upload, Camera, X, Sparkles, Loader2, MapPin, Mic, MicOff } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { ElectricalBackgroundSystem } from '../components/ElectricalBackgroundSystem';
import { PersonaSection } from '../components/PersonaSection';
import { AISection } from '../components/AISection';
import { productsApi, api } from '../lib/api';
import { Analytics } from '../lib/analytics';
import { useLanguage } from '../contexts/LanguageContext';

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

  return (
    <div className="min-h-screen bg-white relative">
      <ElectricalBackgroundSystem />

      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 grid-bg"></div>

        <div className="max-w-6xl mx-auto px-6 relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left Content */}
            <div className="animate-slide-up">
              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 mb-6 leading-[0.9]">
                {isHi ? tx.hero.headline : (
                  <>We Will Get You The <span className="text-orange-600">Cheapest Price</span> Of Any Electrical Across India.</>
                )}
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl font-medium leading-relaxed">
                {tx.hero.subheadline}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors group"
                >
                  {tx.hero.ctaPrimary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link to="/track" className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-400 transition-colors">
                  {tx.hero.ctaSecondary}
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col gap-3">
                {[IndianRupee, Shield, FileText].map((Icon, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Icon className="w-5 h-5 text-gray-900 flex-shrink-0" />
                    <span>{tx.hero.trust[index]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Product Inquiry Form */}
            <div className="animate-slide-left">
              <div id="inquiry-form" className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-lg">
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

      {/* How It Works */}
      <section className="section bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              {tx.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {tx.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tx.howItWorks.steps.map((item, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-8 hover:shadow-sm transition-all duration-300 group">
                <div className="w-14 h-14 flex items-center justify-center bg-gray-900 text-white text-xl font-semibold rounded-xl mb-6">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.desc}</p>
                <span className="inline-flex items-center text-sm font-bold text-orange-600 uppercase tracking-wider">
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* AI Section — animated, mobile-first */}
      <AISection />

      {/* Categories Grid */}
      <section className="section bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4">
              {tx.categories.title.split('.').map((part, i, arr) => (
                <span key={i}>{part.trim()}{i < arr.length - 1 && <><br /></>}</span>
              ))}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {tx.categories.subtitle}
            </p>
          </div>

          <InteractiveCategoryGrid categories={categories} loading={loading} />

          <div className="text-center mt-12">
            <Link to="/categories" className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
              {tx.categories.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Real Deals */}
      <section className="section bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              {tx.realDeals.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {tx.realDeals.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tx.realDeals.deals.map((deal, di) => {
              const savedAmounts = ['₹37,000', '₹24,000', '₹8,800'];
              return (
                <div key={di} className="bg-white border border-gray-200 rounded-xl p-8 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5">{deal.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-5">{deal.title}</h3>
                  <div className="space-y-2 mb-6">
                    {deal.rows.map((row, ri) => (
                      row.strikethrough ? (
                        <div key={ri} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">{row.label}</span>
                          <span className="text-sm font-bold text-gray-400 line-through">{row.price}</span>
                        </div>
                      ) : (
                        <div key={ri} className="flex justify-between items-center py-2.5 bg-gray-900 px-3">
                          <span className="text-sm font-bold text-white">{row.label}</span>
                          <span className="text-lg font-semibold text-orange-400">{row.price}</span>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{deal.savedLabel}</p>
                    <p className="text-2xl font-semibold text-green-600">{savedAmounts[di]}</p>
                    <p className="text-xs text-gray-400 mt-1">{deal.savedNote}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            {tx.realDeals.footnote}
          </p>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="section bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              {tx.whyWeExist.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {tx.whyWeExist.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {tx.whyWeExist.cards.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-8 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 text-white p-10 text-center rounded-2xl">
            <h3 className="text-3xl font-semibold mb-4">
              {tx.whyWeExist.summary.title}
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {tx.whyWeExist.summary.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Persona Section — second to last */}
      <PersonaSection />

      {/* Final CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            {tx.finalCta.title}
          </h2>
          <p className="text-base text-gray-400 mb-10 max-w-2xl mx-auto">
            {tx.finalCta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              {tx.finalCta.ctaPrimary}
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/track" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 text-white font-medium rounded-xl hover:border-white/60 transition-colors">
              {tx.finalCta.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
