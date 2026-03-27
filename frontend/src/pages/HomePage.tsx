import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, CheckCircle, TrendingUp, Users, Store, IndianRupee, FileText, Truck, Award, BarChart3, Upload, Camera, X, Sparkles, Loader2, MapPin, Home, Wrench, Palette, Building2, Mic, MicOff } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { ElectricalBackgroundSystem } from '../components/ElectricalBackgroundSystem';
import { productsApi, api } from '../lib/api';
import { Analytics } from '../lib/analytics';

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
                We Will Get You The <span className="text-orange-600">Cheapest Price</span> Of Any Electrical Across India.
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl font-medium leading-relaxed">
                Wires, switches, MCBs, fans, lights — tell us what you need, we contact verified dealers, you compare their real prices and pick the best deal.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors group"
                >
                  Submit an Inquiry
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link to="/track" className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-400 transition-colors">
                  Track Your Inquiry
                </Link>
              </div>

              {/* Honest Trust Indicators */}
              <div className="flex flex-col gap-3">
                {[
                  { icon: IndianRupee, text: 'Multiple quotes from real dealers — compare side by side' },
                  { icon: Shield, text: 'We verify dealers before connecting you' },
                  { icon: FileText, text: 'Full transparency — you see every quote, no hidden fees' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <benefit.icon className="w-5 h-5 text-gray-900" />
                    <span>{benefit.text}</span>
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
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Inquiry Submitted!</h3>
                    <p className="text-gray-600 mb-4">We'll get back to you with the best price shortly.</p>
                    {submittedInquiryId && (
                      <div className="bg-gray-50 border border-gray-200 p-4 mb-4 text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Your Inquiry Number</p>
                        <p className="font-mono text-lg font-semibold text-gray-900">{submittedInquiryId}</p>
                        <p className="text-xs text-gray-400 mt-1">Save this number to track your inquiry anytime</p>
                      </div>
                    )}
                    <Link
                      to={`/track?phone=${encodeURIComponent(inquiryForm.phone)}`}
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Track Your Request
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
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">Get the Best Price</h3>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> AI-powered
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Tell us what you need — speak, type, or scan a slip</p>

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
                            <span>Manual Entry</span>
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
                            <span>AI Scan Slip</span>
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
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Scan Your Material Slip</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Upload a photo of your contractor's slip or materials list. AI will extract products, quantities, and brands automatically.
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {['Upload Photo', 'AI Reads It', 'Auto-Fill Form'].map((step, i) => (
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
                                <span className="text-sm font-bold text-gray-900">Click to Upload Slip</span>
                                <span className="text-xs text-gray-500">or drag and drop here · JPG, PNG · Max 10MB</span>
                              </button>

                              {/* Divider */}
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                  <span className="px-3 bg-white text-gray-500 font-medium">OR</span>
                                </div>
                              </div>

                              {/* Camera Button */}
                              <button
                                type="button"
                                onClick={startCamera}
                                className="w-full px-4 py-3 bg-gray-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                              >
                                <Camera className="w-5 h-5" />
                                <span>Use Camera</span>
                              </button>

                              {/* Tips */}
                              <div className="bg-gray-50 border border-gray-200 p-4">
                                <p className="text-xs font-bold text-gray-700 mb-2">For best results:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• Good lighting — natural light works best</li>
                                  <li>• Capture the full slip in frame</li>
                                  <li>• Avoid blurry or angled shots</li>
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
                          <span>Product / Model Number</span>
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
                            {isVoiceListening ? 'Stop' : 'Speak'}
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
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Quantity</label>
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
                            <span>Delivery City</span>
                            <button
                              type="button"
                              onClick={detectLocation}
                              className="text-xs text-orange-600 hover:text-orange-700 font-normal normal-case flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" />
                              Auto-detect
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Name</label>
                        <input
                          type="text"
                          placeholder="Full name"
                          value={inquiryForm.name}
                          onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 focus:border-gray-400 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Phone Number</label>
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
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>Get the Best Price</span>
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </button>

                      <p className="text-xs text-gray-400 text-center">
                        We'll reach out with dealer quotes. No spam, ever.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="section bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              Anyone Who Buys Electrical Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              If you've ever wondered whether you're being charged a fair price, Hub4Estate is for you.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Home, title: 'Homeowners', desc: 'Fitting, renovating, or upgrading your home' },
              { icon: Wrench, title: 'Contractors', desc: 'Sourcing materials for construction projects' },
              { icon: Palette, title: 'Interior Designers', desc: 'Specifying fixtures and fittings for clients' },
              { icon: Building2, title: 'Builders', desc: 'Large-scale procurement for project sites' },
              { icon: Users, title: 'Architects', desc: 'Sourcing to spec for client projects' },
              { icon: Store, title: 'Small Businesses', desc: 'Office, retail, or facility fitouts' },
            ].map((segment, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200 group">
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-orange-500 flex items-center justify-center mb-4 transition-colors">
                  <segment.icon className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{segment.title}</h3>
                <p className="text-sm text-gray-600">{segment.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Buyers & For Dealers */}
      <section className="section bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              Two Sides. One Platform.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hub4Estate works for both buyers and electrical dealers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Buyers */}
            <div className="border border-gray-200 rounded-2xl p-8 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600">For Buyers</span>
                  <h3 className="text-2xl font-semibold text-gray-900">Anyone Buying Electrical Products</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: IndianRupee, title: 'Compare Real Dealer Prices', desc: 'See what multiple verified dealers are actually charging — side by side' },
                  { icon: Shield, title: 'Verified Dealers Only', desc: 'We check dealers before connecting you. No unknown vendors' },
                  { icon: FileText, title: 'Full Documentation', desc: 'GST bills, warranty cards, delivery proof — proper paperwork every time' },
                  { icon: Truck, title: 'Doorstep Delivery', desc: 'Products delivered to your site, home, or office where available' },
                  { icon: TrendingUp, title: 'Zero Middlemen', desc: 'You deal directly with the dealer. We just facilitate the connection' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{benefit.title}</p>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Submit Your First Inquiry
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* For Dealers */}
            <div className="border border-gray-700 rounded-2xl p-8 bg-gray-900 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">For Dealers</span>
                  <h3 className="text-2xl font-semibold text-white">Electrical Shops & Distributors</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, title: 'Qualified Buyer Inquiries', desc: 'Receive real inquiries from buyers who know what they want' },
                  { icon: IndianRupee, title: 'Free to Join', desc: 'No listing fees, no upfront charges to get started' },
                  { icon: Award, title: 'Build Your Reputation', desc: 'Get rated by real customers. Better ratings, more inquiries' },
                  { icon: BarChart3, title: 'Track Your Performance', desc: 'See your quotes, conversions, and earnings in one dashboard' },
                  { icon: TrendingUp, title: 'Expand Your Reach', desc: 'Reach buyers across your city who would never have found you otherwise' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{benefit.title}</p>
                      <p className="text-sm text-gray-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/dealer/onboarding" className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                Register as a Dealer — Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Submit your inquiry. We do the sourcing. You compare and choose.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Submit Your Inquiry',
                description: 'Tell us what you need — product name, model, quantity, and your city. Upload a photo or a contractor\'s material slip if you have one.',
                highlight: 'Takes 2 minutes'
              },
              {
                step: '02',
                title: 'We Source Quotes',
                description: 'We reach out to our network of verified dealers who stock what you need. They compete to give you the best price.',
                highlight: 'We do the work'
              },
              {
                step: '03',
                title: 'Compare & Choose',
                description: 'We share the dealer quotes with you. Review prices, terms, and ratings. Pick the deal that makes sense for you.',
                highlight: 'You decide'
              },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-8 hover:shadow-sm transition-all duration-300 group">
                <div className="w-14 h-14 flex items-center justify-center bg-gray-900 text-white text-xl font-semibold rounded-xl mb-6">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <span className="inline-flex items-center text-sm font-bold text-orange-600 uppercase tracking-wider">
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Submit Your Inquiry
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Spark AI Features Strip */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Powered by Volt AI</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: 'Voice Inquiry',
                desc: 'Say what you need in Hindi or English. Volt extracts the product, quantity, and city — zero typing required.',
                tag: 'Hinglish supported',
                color: 'text-violet-600',
                bg: 'bg-violet-50',
              },
              {
                icon: Camera,
                title: 'Slip Scanner',
                desc: 'Photo your contractor\'s material list. Volt AI reads it, identifies every product, and auto-fills your inquiry form.',
                tag: 'Claude Vision AI',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: TrendingUp,
                title: 'Smart Quote Compare',
                desc: 'When quotes arrive, Volt analyzes price, delivery speed, and dealer reliability — and tells you which one to pick.',
                tag: 'Auto-comparison',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
            ].map(({ icon: Icon, title, desc, tag, color, bg }) => (
              <div key={title} className={`${bg} rounded-xl p-6 border border-gray-100`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-sm font-semibold text-gray-900">{title}</span>
                  <span className={`ml-auto text-[10px] font-medium ${color} bg-white px-2 py-0.5 rounded-full border border-current/20`}>{tag}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4">
              Everything Electrical.<br />One Platform.
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Havells, Polycab, Schneider, Legrand, Anchor — all major brands with verified specs and warranty details.
            </p>
          </div>

          <InteractiveCategoryGrid categories={categories} loading={loading} />

          <div className="text-center mt-12">
            <Link to="/categories" className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
              Explore Full Catalog
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Real Deals */}
      <section className="section bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              What Real Price Access Looks Like
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Actual deals closed through Hub4Estate. Real numbers, no fabrications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Deal 1: Sony Speaker */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5">Audio Equipment</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">Sony Tower Speaker + 2 Mics</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">MRP</span>
                  <span className="text-sm font-bold text-gray-400 line-through">₹1,15,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Croma (retail)</span>
                  <span className="text-sm font-bold text-gray-500 line-through">₹1,05,000</span>
                </div>
                <div className="flex justify-between items-center py-2.5 bg-gray-900 px-3">
                  <span className="text-sm font-bold text-white">Hub4Estate</span>
                  <span className="text-lg font-semibold text-orange-400">₹68,000</span>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Saved vs Croma</p>
                <p className="text-2xl font-semibold text-green-600">₹37,000</p>
                <p className="text-xs text-gray-400 mt-1">We tracked 8 dealers to find this price</p>
              </div>
            </div>

            {/* Deal 2: Philips LED */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5">LED Lighting</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">Philips 15W LED Panels × 200 units</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Local dealer (per piece)</span>
                  <span className="text-sm font-bold text-gray-500 line-through">₹585/pc</span>
                </div>
                <div className="flex justify-between items-center py-2.5 bg-gray-900 px-3">
                  <span className="text-sm font-bold text-white">Hub4Estate (incl. shipping)</span>
                  <span className="text-lg font-semibold text-orange-400">₹465/pc</span>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Saved on Order</p>
                <p className="text-2xl font-semibold text-green-600">₹24,000</p>
                <p className="text-xs text-gray-400 mt-1">₹120 saved per unit × 200 units</p>
              </div>
            </div>

            {/* Deal 3: FRLS Wire */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5">Wiring & Cable</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">FRLS 2.5mm² Wire × 200 metres</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Highest dealer quote</span>
                  <span className="text-sm font-bold text-gray-500 line-through">₹127/m</span>
                </div>
                <div className="flex justify-between items-center py-2.5 bg-gray-900 px-3">
                  <span className="text-sm font-bold text-white">Best dealer (via Hub4Estate)</span>
                  <span className="text-lg font-semibold text-orange-400">₹83/m</span>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Saved on 200m Order</p>
                <p className="text-2xl font-semibold text-green-600">₹8,800</p>
                <p className="text-xs text-gray-400 mt-1">6 dealers quoted — ₹44/m spread between them</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            These are real, verified deals. We don't fabricate numbers or testimonials.
          </p>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="section bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              The Same Product.<br />Very Different Prices.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The price you're quoted depends entirely on who you ask. Most buyers never find out.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                title: 'The Information Gap',
                description: 'Dealers know exactly what they paid for the product. You don\'t. The same Sony speaker set was priced at ₹1,05,000 at one retailer and ₹68,000 through our network. That gap is real — and it\'s common.',
              },
              {
                title: 'The Local Monopoly Problem',
                description: 'If there are only one or two dealers near you, they set the price. No competition means no transparency. Calling 5–6 dealers manually takes hours. Most people don\'t bother — and pay the first price they\'re given.',
              },
              {
                title: 'The Documentation Problem',
                description: 'Cash purchases, no proper GST bills, no warranty cards in your name. When something fails, you\'re left with no recourse and no proof of purchase.',
              },
              {
                title: 'What We\'re Fixing',
                description: 'We connect buyers to multiple verified dealers at once. You see all the quotes side by side. The dealer who wins your business earns it fairly. That\'s the whole model.',
              },
            ].map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-8 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 text-white p-10 text-center">
            <h3 className="text-3xl font-semibold mb-4">
              Transparent Pricing. Verified Dealers. Your Choice.
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              We're not here to guarantee the lowest price in the universe.
              We're here to give you enough information to make the right call.
            </p>
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Submit Your First Inquiry
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Ready to Find the Best Price?
          </h2>
          <p className="text-base text-gray-400 mb-10 max-w-2xl mx-auto">
            Submit an inquiry and let our dealer network do the work.
            No commitment. No spam. Just real quotes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Submit an Inquiry
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/track" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 text-white font-medium rounded-xl hover:border-white/60 transition-colors">
              Track an Existing Inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
