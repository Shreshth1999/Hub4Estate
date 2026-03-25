import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Clock, Shield, Zap, CheckCircle, Star, TrendingUp, Users, Store, IndianRupee, FileText, Truck, Award, BarChart3, Upload, Camera, X, Sparkles, Loader2, MapPin } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { ElectricalBackgroundSystem } from '../components/ElectricalBackgroundSystem';
import { productsApi, api } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

      // Auto-scan with AI if in AI mode
      if (useAIScan) {
        await processWithAI(file);
      }
    }
  };

  // Drag and drop handlers
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

      // Auto-scan with AI if in AI mode
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

  // AI Scan functions
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

      // Auto-fill form with first item
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

  // Auto-detect location
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
      // Save to sessionStorage so refresh doesn't lose the success state
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

  const urgencyBenefits = [
    { icon: Clock, text: 'Get quotes in under 60 seconds' },
    { icon: Shield, text: 'All dealers verified & background-checked' },
    { icon: Zap, text: 'Guaranteed lowest prices or money back' },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Electrical background system */}
      <ElectricalBackgroundSystem />

      {/* Urgency Ticker */}
      <div className="ticker">
        <div className="ticker-content">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex">
              <span className="ticker-item">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 animate-pulse"></span>
                LIMITED TIME: FREE DELIVERY ON ORDERS ABOVE ₹5,000
              </span>
              <span className="ticker-item">
                <span className="w-2 h-2 bg-success-500 rounded-full mr-3 animate-pulse"></span>
                247 BUYERS GOT QUOTES IN THE LAST HOUR
              </span>
              <span className="ticker-item">
                <span className="w-2 h-2 bg-warning-500 rounded-full mr-3 animate-pulse"></span>
                PRICES UPDATED EVERY 24 HOURS — ACT NOW
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white border-b-2 border-neutral-900 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 grid-bg"></div>

        <div className="container-custom relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Content */}
            <div className="animate-slide-up">
              {/* Urgency Badge */}
              <div className="inline-flex items-center bg-neutral-900 text-white px-4 py-2 mb-8">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-sm font-bold uppercase tracking-wider">Price Drop Alert: Save Up to 40% Today</span>
              </div>

              {/* Brand Badge */}
              <div className="inline-flex items-center border-2 border-accent-500 text-accent-600 px-4 py-2 mb-8 ml-4">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-bold uppercase tracking-wider">India's #1 Electrical Products Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-neutral-900 mb-6 leading-[0.9]">
                We Will Get You The <span className="text-accent-600">Cheapest Price</span> Of Any Electrical Across India.
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-xl font-medium leading-relaxed">
                Wires, switches, MCBs, fans, lights — get <span className="text-neutral-900 font-bold">instant quotes</span> from 500+ verified electrical dealers.
                Compare prices. Pick the best deal.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/rfq/create" className="btn-urgent group">
                  Get Instant Quote
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/categories" className="btn-secondary">
                  Browse Products
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col gap-3">
                {urgencyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <benefit.icon className="w-5 h-5 text-neutral-900" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Product Inquiry Form */}
            <div className="animate-slide-left">
              <div className="bg-white border-2 border-neutral-900 p-6 lg:p-8 shadow-brutal">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-neutral-900 mb-2">Inquiry Submitted!</h3>
                    <p className="text-neutral-600 mb-4">We'll get back to you with the best price shortly.</p>
                    {submittedInquiryId && (
                      <div className="bg-neutral-50 border-2 border-neutral-200 p-4 mb-4 text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Your Inquiry Number</p>
                        <p className="font-mono text-lg font-black text-neutral-900">{submittedInquiryId}</p>
                        <p className="text-xs text-neutral-400 mt-1">Save this number to track your inquiry anytime</p>
                      </div>
                    )}
                    <Link
                      to={`/track?phone=${encodeURIComponent(inquiryForm.phone)}`}
                      className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 font-bold text-sm hover:bg-neutral-800 transition-colors"
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
                      className="mt-4 block mx-auto text-accent-600 font-bold underline text-sm"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-black text-neutral-900 mb-1">Get the Best Price</h3>
                    <p className="text-sm text-neutral-500 mb-6">Choose your preferred method to get started</p>

                    {/* Enhanced Toggle: Manual vs AI Scan */}
                    <div className="relative mb-6 bg-gradient-to-br from-neutral-100 to-neutral-50 border-2 border-neutral-200 rounded-lg p-1.5">
                      <div className="grid grid-cols-2 gap-1.5 relative">
                        <button
                          type="button"
                          onClick={() => { setUseAIScan(false); stopCamera(); setAiParsedItems([]); }}
                          className={`relative px-4 py-3 text-sm font-bold transition-all duration-300 rounded-md ${
                            !useAIScan
                              ? 'bg-neutral-900 text-white shadow-lg'
                              : 'text-neutral-600 hover:text-neutral-900'
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
                          className={`relative px-4 py-3 text-sm font-bold transition-all duration-300 rounded-md overflow-hidden ${
                            useAIScan
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2 relative z-10">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Scan</span>
                          </div>
                          {useAIScan && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 animate-pulse" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* AI Scan Quick Guide */}
                    {useAIScan && !cameraActive && !photoPreview && (
                      <div className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 mb-1">How AI Scan Works</h4>
                            <p className="text-xs text-neutral-600 leading-relaxed">
                              Upload your contractor's slip or materials list. Our AI will instantly extract all products, quantities, and brands.
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white/60 rounded p-2">
                            <div className="text-lg font-black text-purple-600 mb-0.5">1</div>
                            <div className="text-xs font-medium text-neutral-700">Upload Photo</div>
                          </div>
                          <div className="bg-white/60 rounded p-2">
                            <div className="text-lg font-black text-purple-600 mb-0.5">2</div>
                            <div className="text-xs font-medium text-neutral-700">AI Analyzes</div>
                          </div>
                          <div className="bg-white/60 rounded p-2">
                            <div className="text-lg font-black text-purple-600 mb-0.5">3</div>
                            <div className="text-xs font-medium text-neutral-700">Auto-Fill Form</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hidden File Input - Shared by both modes */}
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
                          {/* Camera View or Upload */}
                          {cameraActive ? (
                            <div className="space-y-4">
                              {/* Camera View with Frame Guide */}
                              <div className="relative rounded-lg overflow-hidden border-2 border-purple-400 shadow-lg">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  className="w-full"
                                />
                                {/* Frame guide overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                                    <span className="bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                      Position slip within frame
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Camera Controls */}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  disabled={aiScanning}
                                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                  <Camera className="w-5 h-5" />
                                  <span>Capture & Scan</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="px-5 bg-neutral-200 hover:bg-neutral-300 font-bold text-sm rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : photoPreview ? (
                            <div className="space-y-4">
                              {/* Enhanced Image Preview */}
                              <div className="relative rounded-lg overflow-hidden border-2 border-neutral-300 shadow-lg">
                                <img src={photoPreview} alt="Product" className="w-full bg-neutral-50" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    removePhoto();
                                    setAiParsedItems([]);
                                  }}
                                  className="absolute top-3 right-3 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                {!aiScanning && aiParsedItems.length === 0 && (
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs font-medium text-center">
                                      Photo uploaded • Scanning...
                                    </div>
                                  </div>
                                )}
                              </div>

                              {aiScanning ? (
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-6 text-center">
                                  <div className="relative mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                                      <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 absolute -bottom-1 -right-1 left-0 right-0 mx-auto" />
                                  </div>
                                  <p className="text-sm font-bold text-neutral-900 mb-1">AI is analyzing your slip...</p>
                                  <p className="text-xs text-neutral-600">Extracting products, quantities, and brands</p>
                                  <div className="mt-3 flex items-center justify-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                  </div>
                                </div>
                              ) : aiParsedItems.length > 0 ? (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-green-900">
                                        Success! Found {aiParsedItems.length} product{aiParsedItems.length > 1 ? 's' : ''}
                                      </p>
                                      <p className="text-xs text-green-700">Form auto-filled with first item</p>
                                    </div>
                                  </div>

                                  {/* Product List */}
                                  <div className="space-y-3 bg-white/60 rounded-lg p-3">
                                    {aiParsedItems.slice(0, 3).map((item: any, i: number) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <span className="text-green-600 font-bold mt-0.5">{i + 1}.</span>
                                        <div className="flex-1">
                                          <div className="font-bold text-neutral-900">{item.productName}</div>
                                          <div className="text-neutral-600 flex items-center gap-2 flex-wrap">
                                            <span>{item.quantity} {item.unit}</span>
                                            {item.brand && (
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {item.brand}
                                              </span>
                                            )}
                                            {item.confidence && (
                                              <span className="text-neutral-500">
                                                {Math.round(item.confidence * 100)}% confident
                                              </span>
                                            )}
                                          </div>
                                          {/* Brand suggestions when no brand detected */}
                                          {!item.brand && item.brandSuggestions && item.brandSuggestions.length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-xs text-neutral-500 mb-1">Suggested brands:</p>
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
                                                    className={`px-2 py-0.5 border text-xs font-bold rounded-sm transition-colors ${
                                                      s.segment === 'premium' ? 'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100' :
                                                      s.segment === 'quality' ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' :
                                                      'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                                    }`}
                                                    title={s.reason}
                                                  >
                                                    {s.name}
                                                  </button>
                                                ))}
                                              </div>
                                              <p className="text-xs text-neutral-400 mt-1 italic">Tap to select, or leave blank for all quotes</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {aiParsedItems.length > 3 && (
                                      <p className="text-xs text-neutral-500 italic pt-1 border-t border-neutral-200">
                                        +{aiParsedItems.length - 3} more product{aiParsedItems.length - 3 > 1 ? 's' : ''} detected
                                      </p>
                                    )}
                                  </div>

                                  {detectedLocation && (
                                    <div className="flex items-center gap-2 bg-blue-50 rounded px-3 py-2">
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
                              {/* Enhanced Upload Area */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  className={`group w-full h-44 border-2 border-dashed transition-all duration-300 rounded-xl flex flex-col items-center justify-center gap-3 relative overflow-hidden shadow-sm hover:shadow-lg ${
                                    isDragging
                                      ? 'border-purple-600 bg-purple-100 scale-105'
                                      : 'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 hover:border-purple-600'
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                  {/* Animated Border Pulse */}
                                  <div className="absolute inset-0 rounded-xl border-2 border-purple-400 animate-pulse opacity-50"></div>

                                  <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-lg">
                                      <Upload className="w-8 h-8 text-white animate-bounce" />
                                    </div>
                                    <span className="text-base font-bold text-neutral-900">Click to Upload Slip</span>
                                    <span className="text-xs text-neutral-600">or drag and drop here</span>
                                    <div className="mt-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-md">
                                      <span className="text-xs font-bold">✨ AI-Powered • Instant Results</span>
                                    </div>
                                    <span className="text-xs text-neutral-500 mt-1">JPG, PNG • Max 10MB</span>
                                  </div>
                                </button>
                              </div>

                              {/* Divider */}
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-neutral-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                  <span className="px-3 bg-white text-neutral-500 font-medium">OR</span>
                                </div>
                              </div>

                              {/* Enhanced Camera Button */}
                              <button
                                type="button"
                                onClick={startCamera}
                                className="w-full px-4 py-3.5 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white font-bold flex items-center justify-center gap-2 hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl"
                              >
                                <Camera className="w-5 h-5" />
                                <span>Use Camera to Capture</span>
                              </button>

                              {/* Enhanced Tips Section */}
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <p className="text-sm font-bold text-neutral-900">Pro Tips for Perfect Scans</p>
                                </div>
                                <ul className="text-xs text-neutral-700 space-y-2">
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                                    <span><span className="font-semibold">Clear lighting</span> - Natural light works best</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                                    <span><span className="font-semibold">Full view</span> - Capture entire slip in frame</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                                    <span><span className="font-semibold">Steady shot</span> - Avoid blurry or angled photos</span>
                                  </li>
                                </ul>
                                <div className="mt-3 pt-3 border-t border-green-200">
                                  <p className="text-xs text-neutral-600 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-purple-600" />
                                    <span className="font-medium">AI works best with clear, well-lit images</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Manual Entry Mode */
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                            Product Photo
                          </label>
                          {photoPreview ? (
                          <div className="relative w-full h-32 border-2 border-neutral-200 rounded overflow-hidden">
                            <img src={photoPreview} alt="Product" className="w-full h-full object-contain bg-neutral-50" />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute top-2 right-2 bg-neutral-900 text-white rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-28 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 hover:border-accent-500 hover:bg-accent-50 transition-colors"
                          >
                            <Camera className="w-6 h-6 text-neutral-400" />
                            <span className="text-sm text-neutral-500">Click to upload product photo</span>
                          </button>
                        )}
                        </div>
                      )}

                      {/* Model Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Model Number <span className="text-neutral-400 normal-case">(or product name)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Havells?"
                          value={inquiryForm.modelNumber}
                          onChange={e => setInquiryForm(f => ({ ...f, modelNumber: e.target.value }))}
                          className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                        />
                      </div>

                      {/* Quantity & City in row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={inquiryForm.quantity}
                            onChange={e => setInquiryForm(f => ({ ...f, quantity: e.target.value }))}
                            className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 flex items-center justify-between">
                            <span>Delivery City</span>
                            <button
                              type="button"
                              onClick={detectLocation}
                              className="text-xs text-accent-600 hover:text-accent-700 font-normal normal-case flex items-center gap-1"
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
                            className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Name & Phone */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Your Name</label>
                        <input
                          type="text"
                          placeholder="Full name"
                          value={inquiryForm.name}
                          onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={inquiryForm.phone}
                          onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                        />
                      </div>

                      {formError && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-red-900 mb-0.5">Error</p>
                            <p className="text-xs text-red-700">{formError}</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full justify-center disabled:opacity-50 transition-all duration-300 ${
                          useAIScan && aiParsedItems.length > 0
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl'
                            : 'btn-urgent'
                        }`}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>{useAIScan && aiParsedItems.length > 0 ? 'Submit AI-Scanned Inquiry' : 'Get Cheapest Price'}</span>
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </button>

                      <p className="text-xs text-neutral-400 text-center">
                        We'll call you back with the best price within 30 minutes
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-primary-50 border-b-2 border-neutral-200 py-6">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-neutral-300 border-2 border-white rounded-full" />
                ))}
              </div>
              <span className="text-sm font-bold text-neutral-700">
                <span className="text-neutral-900">2,847</span> happy customers this month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning-400 text-warning-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-neutral-700">
                <span className="text-neutral-900">4.9/5</span> from 12,000+ reviews
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success-600" />
              <span className="text-sm font-bold text-neutral-700">
                <span className="text-neutral-900">₹2.4 Cr</span> saved by customers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Whether You're Buying or Selling */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              Whether You're Buying or Selling
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Hub4Estate works for both sides of the electrical marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Buyers */}
            <div className="border-2 border-neutral-900 p-8 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-600">For Buyers</span>
                  <h3 className="text-2xl font-black text-neutral-900">Home Builders & Contractors</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: IndianRupee, title: 'Save 20-40% on Every Order', desc: 'Dealers compete to give you the best price' },
                  { icon: Shield, title: '100% Verified Products', desc: 'No fake brands, no duplicates, full warranty' },
                  { icon: Clock, title: 'Get Quotes in 60 Seconds', desc: 'No more visiting 10 shops to compare prices' },
                  { icon: FileText, title: 'Proper Documentation', desc: 'GST bills, warranty cards, delivery proof' },
                  { icon: Truck, title: 'Doorstep Delivery', desc: 'Products delivered to your site or home' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-neutral-700" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{benefit.title}</p>
                      <p className="text-sm text-neutral-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/rfq/create" className="btn-urgent w-full justify-center">
                Get Free Quotes Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* For Dealers */}
            <div className="border-2 border-neutral-900 p-8 bg-neutral-900 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-500 flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-400">For Dealers</span>
                  <h3 className="text-2xl font-black text-white">Electrical Shops & Distributors</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, title: 'Quality Leads Daily', desc: 'Get verified buyer inquiries delivered to you' },
                  { icon: IndianRupee, title: 'Zero Upfront Fees', desc: 'No listing fees, no monthly charges' },
                  { icon: Award, title: 'Build Your Reputation', desc: 'Get reviews and ratings from real customers' },
                  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your quotes, wins, and conversion rate' },
                  { icon: TrendingUp, title: 'Grow Your Business', desc: 'Access customers you could never reach before' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-accent-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{benefit.title}</p>
                      <p className="text-sm text-neutral-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/dealer/onboarding" className="btn-accent w-full justify-center">
                Register as Dealer — Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Bold Steps */}
      <section className="section bg-neutral-50 border-y-2 border-neutral-200">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              3 Steps. 60 Seconds. Done.
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              No more running to 10 shops. No more haggling. No more getting ripped off.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Tell Us What You Need',
                description: 'Select products from our catalog. Add quantities. Takes 30 seconds.',
                highlight: 'Takes 30 seconds'
              },
              {
                step: '02',
                title: 'Dealers Fight For You',
                description: 'Verified dealers compete to give you the best price. You sit back.',
                highlight: 'You sit back'
              },
              {
                step: '03',
                title: 'Pick The Winner',
                description: 'Compare quotes side-by-side. Choose the best deal. Pay securely.',
                highlight: 'Compare & Choose'
              },
            ].map((item, index) => (
              <div key={index} className="card-feature group">
                <div className="step-number mb-6">{item.step}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-600 mb-4">{item.description}</p>
                <span className="inline-flex items-center text-sm font-bold text-accent-600 uppercase tracking-wider">
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/rfq/create" className="btn-urgent">
              Start Getting Quotes Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid with Interactive Illustrations */}
      <section className="section bg-neutral-800 text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block text-accent-400 text-sm font-bold uppercase tracking-wider mb-4">
              Shop By Category
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything Electrical.<br />One Platform.
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Havells, Polycab, Schneider, Legrand, Anchor — all major brands with verified specs, compliance info, and warranty details.
            </p>
          </div>

          {/* Interactive Category Grid with SVG illustrations */}
          <InteractiveCategoryGrid categories={categories} loading={loading} />

          <div className="text-center mt-12">
            <Link to="/categories" className="btn-accent">
              Explore Full Catalog
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem Section - The Ugly Truth */}
      <section className="section bg-white border-b-2 border-neutral-200">
        <div className="container-tight">
          <div className="text-center mb-16">
            <span className="inline-block text-error-600 text-sm font-bold uppercase tracking-wider mb-4">
              The Ugly Truth
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              You're Getting Ripped Off.<br />Here's How.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                title: 'The 40% Markup Scam',
                description: 'Local dealers mark up prices 30-50%. The same wire that costs ₹1,200 at wholesale is sold to you for ₹1,800.',
                stat: '40%',
                statLabel: 'Average Markup'
              },
              {
                title: 'The Fake Brand Trap',
                description: 'Duplicate products look identical to originals. Without proper verification, you could be buying counterfeit goods.',
                stat: '23%',
                statLabel: 'Products Are Fake'
              },
              {
                title: 'The Information Gap',
                description: 'Dealers know everything. You know nothing. This power imbalance costs you money on every single purchase.',
                stat: '₹15K',
                statLabel: 'Avg Lost Per Project'
              },
              {
                title: 'Zero Documentation',
                description: 'No proper bills, no warranty cards, no proof. When something fails, you have no recourse.',
                stat: '67%',
                statLabel: 'Have No Paperwork'
              },
            ].map((item, index) => (
              <div key={index} className="border-2 border-neutral-200 p-8 hover:border-neutral-900 hover:shadow-brutal transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-neutral-900">{item.title}</h3>
                  <div className="text-right">
                    <div className="text-3xl font-black text-error-600">{item.stat}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{item.statLabel}</div>
                  </div>
                </div>
                <p className="text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Solution Box */}
          <div className="bg-neutral-900 text-white p-10 text-center">
            <h3 className="text-3xl font-black mb-4">
              Hub4Estate Fixes Everything.
            </h3>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Transparent pricing. Verified dealers. Full documentation. Price comparison.
              <span className="text-accent-400 font-bold"> The playing field is now level.</span>
            </p>
            <Link to="/rfq/create" className="btn-accent inline-flex">
              Start Saving Money Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-primary-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block text-neutral-900 text-sm font-bold uppercase tracking-wider mb-4">
              Real Results
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              Customers Saved ₹2.4 Crores.<br />This Month Alone.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I was quoted ₹85,000 by a local dealer. Hub4Estate got me the same order for ₹52,000. That's ₹33,000 saved!",
                author: 'Rajesh Kumar',
                role: 'Home Builder, Bangalore',
                saved: '₹33,000'
              },
              {
                quote: "The comparison feature is genius. I could see exactly which dealer was trying to overcharge me. Never going back to the old way.",
                author: 'Priya Sharma',
                role: 'Interior Designer, Mumbai',
                saved: '₹28,500'
              },
              {
                quote: "As a contractor, I buy electrical items daily. Hub4Estate reduced my procurement costs by 25%. My margins improved overnight.",
                author: 'Mohammed Irfan',
                role: 'Electrical Contractor, Delhi',
                saved: '₹1.2 Lakhs'
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white border-2 border-neutral-900 p-8">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning-400 text-warning-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-neutral-700 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-between border-t-2 border-neutral-200 pt-6">
                  <div>
                    <p className="font-bold text-neutral-900">{testimonial.author}</p>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Saved</p>
                    <p className="text-xl font-black text-success-600">{testimonial.saved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-accent-500">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready To Save Money?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of smart buyers who refuse to overpay.
            Your first quote is free. Always.
          </p>
          <Link to="/rfq/create" className="btn-primary bg-white text-neutral-900 border-white hover:bg-neutral-900 hover:text-white hover:border-neutral-900">
            Get Your Free Quote Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
