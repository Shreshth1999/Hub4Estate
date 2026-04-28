import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, CheckCircle, IndianRupee, FileText, Upload, Camera, X, Sparkles, Loader2, MapPin, Mic, MicOff, Home, Wrench, Palette, Building2, Users, Store, Truck, TrendingUp, Award, BarChart3, Search, Clock, UserCheck, Inbox, SlidersHorizontal, Star, Zap, AlertTriangle } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { AISection } from '../components/AISection';
import { productsApi, api } from '../lib/api';
import { Analytics } from '../lib/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView, revealStyle } from '../hooks/useInView';
import { SEO } from '../components/SEO';


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
      <SEO
        canonicalUrl="/"
        title="Best Prices on Electrical Products in India — Zero Middlemen, Verified Dealers"
        description="Hub4Estate is India's first transparent procurement platform for electrical products. Compare prices from 6+ verified dealers on wires, cables, LEDs, switches, MCBs, fans & more. Save up to 40%. Concierge service available — we source any product at the best price. Better than IndiaMART for electricals."
        keywords="Hub4Estate, Hub for Estate, Hub 4 Estate, best price electrical products India, buy electrical products online, verified electrical dealers, electrical procurement platform, wires cables best price, LED lights wholesale, switches sockets MCB, IndiaMART alternative, electrical marketplace India, concierge service, zero middlemen, construction electrical supplies, building materials electrical, Havells Polycab Philips Legrand Anchor Finolex Syska Crompton Orient, electrical shop online India, FRLS wire, modular switches, LED panel lights, ceiling fan best price, distribution board, smart home electrical, electrical dealer near me, bulk electrical products, wholesale electrical India"
      />

      {/* ─── Social-proof Marquee (matches screenshot 1 strip) ─────────────── */}
      <div className="bg-primary-950 border-y-2 border-primary-950 overflow-hidden">
        <div className="flex gap-10 py-3 whitespace-nowrap animate-[marquee_30s_linear_infinite]">
          {[
            '💰  ₹12,50,000 SAVED BY BUYERS THIS MONTH',
            '📦  23 DEALERS COMPETING FOR YOUR ORDER RIGHT NOW',
            '🏆  INDIA\'S #1 ELECTRICAL MARKETPLACE',
            '🔥  47 BUYERS REQUESTED QUOTES IN THE LAST HOUR',
            '⚡  GET QUOTES IN 60 SECONDS — ALWAYS FREE',
          ].concat([
            '💰  ₹12,50,000 SAVED BY BUYERS THIS MONTH',
            '📦  23 DEALERS COMPETING FOR YOUR ORDER RIGHT NOW',
            '🏆  INDIA\'S #1 ELECTRICAL MARKETPLACE',
            '🔥  47 BUYERS REQUESTED QUOTES IN THE LAST HOUR',
            '⚡  GET QUOTES IN 60 SECONDS — ALWAYS FREE',
          ]).map((text, i) => (
            <span key={i} className="text-[11px] sm:text-xs font-black text-white uppercase tracking-[0.18em] flex-shrink-0">
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden border-b-2 border-primary-100">
        {/* Subtle warm glow orbs — scaled down on mobile to prevent overflow */}
        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(196,114,79,0.10) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(211,129,94,0.08) 0%, transparent 65%)' }} />

        <div ref={heroIn.ref as any} className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-16 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-5 sm:gap-12 lg:gap-16 items-center">

            {/* Left Content — DESKTOP keeps full marketing layout, MOBILE gets a compressed version */}
            <div className="order-1 lg:order-1">
              {/* Tag — hidden on mobile (form-first UX), shown lg+ */}
              <div
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-primary-950 rounded-md mb-8 shadow-neo-sm"
                style={revealStyle(heroIn.inView, 0)}
              >
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                  INDIA'S #1 ELECTRICAL MARKETPLACE
                </span>
              </div>

              {/* Headline — much smaller on mobile, single line for impact */}
              <h1
                className="text-[1.75rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black text-primary-950 mb-2 lg:mb-6 leading-[1.05] lg:leading-[0.92] tracking-tight"
                style={revealStyle(heroIn.inView, 0.06)}
              >
                Buy Electrical
                <br />
                <span className="text-amber-600">At Best Prices.</span>
              </h1>

              {/* Subheadline — shorter, tighter on mobile */}
              <p
                className="text-sm lg:text-lg text-primary-700 mb-3 lg:mb-8 max-w-xl leading-snug lg:leading-relaxed"
                style={revealStyle(heroIn.inView, 0.12)}
              >
                <span className="lg:hidden">500+ verified dealers compete for your order. Save 15-25%.</span>
                <span className="hidden lg:inline">
                  Compare quotes from <span className="font-black text-primary-950">500+ verified dealers</span> for wires, switches, MCBs, fans, and more. Save 15-25% on every order.
                </span>
              </p>

              {/* Stat pills — desktop only (decorative, eats vertical space on mobile) */}
              <div
                className="hidden lg:flex flex-wrap gap-3 mb-8"
                style={revealStyle(heroIn.inView, 0.16)}
              >
                {[
                  { Icon: TrendingUp, label: 'Save 15-25%' },
                  { Icon: Shield, label: '100% Verified' },
                  { Icon: Zap, label: '24hr Quotes' },
                ].map(({ Icon, label }, i) => (
                  <div key={i} className="inline-flex items-center gap-2 bg-primary-50 border-2 border-primary-950 rounded-md px-4 py-2.5 shadow-neo-sm">
                    <Icon className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-black text-primary-950">{label}</span>
                  </div>
                ))}
              </div>

              {/* Mobile-only inline trust strip — replaces the heavy stat pills */}
              <div className="lg:hidden flex items-center gap-3 text-[11px] font-semibold text-primary-600 mb-4">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-amber-600" /> Verified</span>
                <span className="w-1 h-1 rounded-full bg-primary-300" />
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-600" /> 24hr quotes</span>
                <span className="w-1 h-1 rounded-full bg-primary-300" />
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-amber-600" /> Save 15-25%</span>
              </div>

              {/* CTAs — desktop only. On mobile the form below IS the CTA. */}
              <div
                className="hidden lg:flex flex-col sm:flex-row gap-4 mb-10"
                style={revealStyle(heroIn.inView, 0.20)}
              >
                <button
                  onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm uppercase tracking-[0.1em] px-7 py-4 rounded-md border-2 border-primary-950 shadow-neo-md hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group"
                >
                  GET FREE QUOTES
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/for-dealers"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-primary-50 text-primary-950 font-black text-sm uppercase tracking-[0.1em] px-7 py-4 rounded-md border-2 border-primary-950 shadow-neo-md hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
                >
                  I'M A DEALER
                </Link>
              </div>

              {/* Avatar row — desktop only (decorative social proof) */}
              <div
                className="hidden lg:flex items-center gap-3"
                style={revealStyle(heroIn.inView, 0.24)}
              >
                <div className="flex -space-x-2">
                  {['RK', 'PS', 'AP', 'SM', 'VK'].map((initials, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white ${
                        i % 2 === 0 ? 'bg-amber-600' : 'bg-primary-950'
                      }`}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-black text-primary-950 leading-tight">2,847+ quotes today</p>
                  <p className="text-xs text-primary-500 leading-tight">Join thousands saving money</p>
                </div>
              </div>
            </div>

            {/* Right Side - Product Inquiry Form */}
            <div className="order-2 lg:order-2" style={revealStyle(heroIn.inView, 0.08)}>
              <div id="inquiry-form" className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-6 lg:p-8 border-2 border-primary-200 shadow-warm-lg">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-amber-700 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-primary-950 mb-2">{tx.hero.submitted.title}</h3>
                    <p className="text-primary-600 mb-4">{tx.hero.submitted.subtitle}</p>
                    {submittedInquiryId && (
                      <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mb-4 text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary-500 mb-1">{tx.hero.submitted.inquiryLabel}</p>
                        <p className="font-mono text-lg font-semibold text-primary-950">{submittedInquiryId}</p>
                        <p className="text-xs text-primary-400 mt-1">{tx.hero.submitted.inquiryHint}</p>
                      </div>
                    )}
                    <Link
                      to={`/track?phone=${encodeURIComponent(inquiryForm.phone)}`}
                      className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 text-sm font-semibold rounded-xl transition-colors"
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
                      <h3 className="text-xl font-semibold text-primary-950">{tx.hero.formTitle}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> AI-powered
                      </span>
                    </div>
                    <p className="text-sm text-primary-600 mb-6">{tx.hero.formSubtitle}</p>

                    {/* Toggle: Manual vs AI Scan */}
                    <div className="relative mb-6 bg-primary-50 border-2 border-primary-200 rounded-xl p-1">
                      <div className="grid grid-cols-2 gap-1 relative">
                        <button
                          type="button"
                          onClick={() => { setUseAIScan(false); stopCamera(); setAiParsedItems([]); }}
                          className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 ${
                            !useAIScan
                              ? 'bg-primary-950 text-white'
                              : 'text-primary-600 hover:text-primary-950'
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
                      <div className="mb-6 bg-primary-50 border border-primary-200 p-4 rounded-xl">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary-950 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{tx.hero.aiScan.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{tx.hero.aiScan.desc}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {tx.hero.aiScan.steps.map((step, i) => (
                            <div key={i} className="bg-white border border-primary-200 p-2 rounded-lg">
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
                              <div className="relative overflow-hidden border-2 border-primary-200 rounded-xl">
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
                                  className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                  <Camera className="w-5 h-5" />
                                  <span>Capture & Scan</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="px-5 bg-primary-100 hover:bg-primary-200 text-primary-950 font-bold text-sm rounded-xl transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : photoPreview ? (
                            <div className="space-y-4">
                              <div className="relative overflow-hidden border-2 border-primary-200 rounded-xl">
                                <img src={photoPreview} alt="Product" className="w-full bg-primary-50" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    removePhoto();
                                    setAiParsedItems([]);
                                  }}
                                  className="absolute top-3 right-3 bg-primary-950/80 hover:bg-primary-950 text-white p-2 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {aiScanning ? (
                                <div className="bg-primary-50 border border-primary-200 p-6 text-center rounded-xl">
                                  <Loader2 className="w-8 h-8 animate-spin text-primary-700 mx-auto mb-3" />
                                  <p className="text-sm font-bold text-primary-950 mb-1">Scanning your slip...</p>
                                  <p className="text-xs text-primary-600">Extracting products, quantities, and brands</p>
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
                                              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
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
                                                    className="px-2 py-0.5 border border-primary-200 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
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
                                className={`w-full h-40 border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                                  isDragging
                                    ? 'border-primary-500 bg-primary-100'
                                    : 'border-primary-300 bg-primary-50 hover:border-primary-400 hover:bg-primary-100'
                                }`}
                              >
                                <div className="w-12 h-12 bg-primary-950 rounded-xl flex items-center justify-center">
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
                                className="w-full px-4 py-3 bg-primary-950 hover:bg-primary-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                              >
                                <Camera className="w-5 h-5" />
                                <span>{tx.hero.aiScan.camera}</span>
                              </button>

                              {/* Tips */}
                              <div className="bg-primary-50 border border-primary-200 p-4 rounded-xl">
                                <p className="text-xs font-bold text-primary-800 mb-2">{tx.hero.aiScan.tips.title}</p>
                                <ul className="text-xs text-primary-600 space-y-1">
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
                          <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 mb-2">
                            Product Photo <span className="text-primary-400 normal-case font-normal">(optional)</span>
                          </label>
                          {photoPreview ? (
                            <div className="relative w-full h-32 border-2 border-primary-200 rounded-xl overflow-hidden">
                              <img src={photoPreview} alt="Product" className="w-full h-full object-contain bg-primary-50" />
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute top-2 right-2 bg-primary-950 text-white p-1 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-24 border-2 border-dashed border-primary-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                            >
                              <Camera className="w-5 h-5 text-primary-400" />
                              <span className="text-sm text-primary-500">Upload product photo</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Model Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 mb-1 flex items-center justify-between">
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
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:border-primary-600 outline-none text-sm transition-colors ${
                            isVoiceListening ? 'border-amber-300 bg-amber-50' : 'border-primary-200 bg-cream'
                          }`}
                        />
                        {isVoiceListening && (
                          <p className="text-[11px] text-amber-700 mt-1">Say the product, quantity, and city — Volt AI will fill the form</p>
                        )}
                      </div>

                      {/* Quantity & City */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">{tx.hero.formLabels.quantity}</label>
                          <input
                            type="number"
                            min="1"
                            value={inquiryForm.quantity}
                            onChange={e => setInquiryForm(f => ({ ...f, quantity: e.target.value }))}
                            className="w-full px-4 py-2.5 border-2 border-primary-200 bg-cream rounded-lg focus:border-primary-600 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 mb-1 flex items-center justify-between">
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
                            className="w-full px-4 py-2.5 border-2 border-primary-200 bg-cream rounded-lg focus:border-primary-600 outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Name & Phone */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">{tx.hero.formLabels.yourName}</label>
                        <input
                          type="text"
                          placeholder="Full name"
                          value={inquiryForm.name}
                          onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 border-2 border-primary-200 bg-cream rounded-lg focus:border-primary-600 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">{tx.hero.formLabels.phone}</label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={inquiryForm.phone}
                          onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border-2 border-primary-200 bg-cream rounded-lg focus:border-primary-600 outline-none text-sm"
                        />
                      </div>

                      {formError && (
                        <div className="bg-error-bg border border-error-200 p-4 rounded-xl flex items-start gap-3">
                          <div className="w-5 h-5 bg-error flex items-center justify-center flex-shrink-0 mt-0.5 rounded">
                            <X className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-sm text-error-text">{formError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full btn-primary"
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
      <div className="border-t-2 border-b-2 border-primary-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-100">
            {[
              { stat: '₹37,000', label: 'Average saved per order' },
              { stat: '100%', label: 'Free for buyers, always' },
              { stat: 'Verified', label: 'Every dealer, vetted manually' },
              { stat: 'Zero', label: 'Spam calls to your number' },
            ].map((f, i) => (
              <div key={i} className="px-3 py-4 sm:px-6 sm:py-6 text-center">
                <p className="text-lg sm:text-2xl font-black text-primary-950 mb-0.5 sm:mb-1 leading-tight">{f.stat}</p>
                <p className="text-[11px] sm:text-xs text-primary-500 leading-snug">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ─── 3 Steps. 60 Seconds. Done. (matches screenshot 3) ────────────── */}
      <section className="bg-white border-t-2 border-primary-100 overflow-hidden">
        <div ref={howIn.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-28 pb-12 sm:pb-28">

          {/* Centered header */}
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-16" style={revealStyle(howIn.inView, 0)}>
            <h2 className="text-[26px] sm:text-5xl lg:text-6xl font-black text-primary-950 tracking-tight leading-[1.05] sm:leading-[0.95] mb-3 sm:mb-5">
              3 Steps. 60 Seconds. <span className="text-primary-950">Done.</span>
            </h2>
            <p className="text-sm sm:text-lg text-primary-600 leading-snug sm:leading-relaxed">
              No more running to 10 shops. No more haggling. No more getting ripped off.
            </p>
          </div>

          {/* 3 cards — light shadows on mobile (no offset chaos), neobrutalist on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-6 sm:mb-14">
            {[
              { num: '01', title: 'Tell Us What You Need',  desc: 'Select products from our catalog. Add quantities. Takes 30 seconds.', accent: 'TAKES 30 SECONDS' },
              { num: '02', title: 'Dealers Fight For You',   desc: 'Verified dealers compete to give you the best price. You sit back.',  accent: 'YOU SIT BACK' },
              { num: '03', title: 'Pick The Winner',         desc: 'Compare quotes side-by-side. Choose the best deal. Pay securely.',   accent: 'COMPARE & CHOOSE' },
            ].map((step, i) => {
              const isLast = i === 2;
              return (
                <div
                  key={step.num}
                  className={`group relative bg-white border border-primary-200 rounded-xl p-4 sm:p-10 transition-all duration-200 sm:border-2 sm:border-primary-950 sm:rounded-2xl sm:hover:-translate-x-0.5 sm:hover:-translate-y-0.5 ${
                    isLast ? 'sm:shadow-neo-xl sm:hover:shadow-[10px_10px_0px_0px_#2a2418]' : 'sm:shadow-neo-lg sm:hover:shadow-neo-xl'
                  }`}
                  style={revealStyle(howIn.inView, 0.08 + i * 0.08)}
                >
                  {/* Number badge — small inline circle on mobile, big square on desktop */}
                  <div className="flex items-center gap-3 sm:block mb-3 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 bg-primary-950 rounded-md sm:border-2 sm:border-primary-950 sm:shadow-neo-sm flex-shrink-0">
                      <span className="text-sm sm:text-xl font-black text-white">{step.num}</span>
                    </div>
                    {/* Title inline next to badge on mobile, below on desktop */}
                    <h3 className="text-base sm:hidden font-black text-primary-950 tracking-tight leading-tight flex-1">
                      {step.title}
                    </h3>
                  </div>

                  {/* Desktop-only title (mobile shows it inline above) */}
                  <h3 className="hidden sm:block text-2xl sm:text-[28px] font-black text-primary-950 tracking-tight leading-[1.1] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-[13px] sm:text-base text-primary-600 leading-snug sm:leading-relaxed mb-2 sm:mb-6">
                    {step.desc}
                  </p>

                  <p className="text-[10px] sm:text-[11px] font-black text-amber-700 uppercase tracking-[0.15em] sm:tracking-[0.18em]">
                    {step.accent}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA — full-width on mobile, centered button on desktop */}
          <div className="flex justify-center" style={revealStyle(howIn.inView, 0.32)}>
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-950 hover:bg-black text-white font-black text-xs sm:text-sm uppercase tracking-[0.12em] sm:tracking-[0.15em] px-6 sm:px-10 py-3.5 sm:py-5 rounded-md border-2 border-primary-950 shadow-neo-md hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            >
              Start Getting Quotes Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </section>

      {/* ─── You're Getting Ripped Off. (matches screenshot 5) ─────────────── */}
      <section className="py-20 sm:py-28 bg-white border-t-2 border-primary-100">
        <div ref={whoIn.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Centered header with red tag */}
          <div className="text-center max-w-3xl mx-auto mb-14" style={revealStyle(whoIn.inView, 0)}>
            <span className="inline-block text-[11px] font-black text-red-600 uppercase tracking-[0.2em] mb-5">
              THE UGLY TRUTH
            </span>
            <h2 className="text-[26px] sm:text-5xl lg:text-6xl font-black text-primary-950 tracking-tight leading-[1.1] sm:leading-[0.95]">
              You're Getting Ripped Off.<br />Here's How.
            </h2>
          </div>

          {/* 2x2 grid — light borders + tight padding on mobile, neobrutalist on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
            {[
              { title: 'The 40% Markup Scam', stat: '40%',  unit: 'AVERAGE MARKUP',     desc: 'Local dealers mark up prices 30-50%. The same wire that costs ₹1,200 at wholesale is sold to you for ₹1,800.', emphasis: false },
              { title: 'The Fake Brand Trap', stat: '23%',  unit: 'PRODUCTS ARE FAKE',  desc: 'Duplicate products look identical to originals. Without proper verification, you could be buying counterfeit goods.', emphasis: true },
              { title: 'The Information Gap', stat: '₹15K', unit: 'AVG LOST PER PROJECT', desc: 'Dealers know everything. You know nothing. This power imbalance costs you money on every single purchase.', emphasis: false },
              { title: 'Zero Documentation',  stat: '67%',  unit: 'HAVE NO PAPERWORK',  desc: 'No proper bills, no warranty cards, no proof. When something fails, you have no recourse.', emphasis: false },
            ].map((card, i) => (
              <div
                key={i}
                className={`bg-white border border-primary-200 rounded-xl p-4 sm:p-8 transition-all duration-200 sm:border-2 sm:border-primary-950 sm:rounded-2xl sm:hover:-translate-x-0.5 sm:hover:-translate-y-0.5 ${
                  card.emphasis ? 'sm:shadow-neo-xl sm:hover:shadow-[10px_10px_0px_0px_#2a2418]' : 'sm:shadow-neo-md sm:hover:shadow-neo-lg'
                }`}
                style={revealStyle(whoIn.inView, 0.08 + i * 0.06)}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-6 mb-2 sm:mb-4">
                  <h3 className="text-base sm:text-2xl font-black text-primary-950 tracking-tight leading-tight">
                    {card.title}
                  </h3>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl sm:text-5xl font-black text-red-600 leading-none mb-0.5 sm:mb-1.5">{card.stat}</p>
                    <p className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.12em] sm:tracking-[0.15em]">{card.unit}</p>
                  </div>
                </div>
                <p className="text-[13px] sm:text-base text-primary-700 leading-snug sm:leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Two Sides. One Platform. ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#faf9f7] border-t border-primary-100 overflow-hidden">
        <div ref={twoIn.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16" style={revealStyle(twoIn.inView, 0)}>
            <p className="section-label mb-3">Built For Both Sides</p>
            <h2 className="text-4xl sm:text-5xl font-black text-primary-950 mb-4 tracking-tight">
              Two Sides. One Platform.
            </h2>
            <p className="text-lg text-primary-600 max-w-xl mx-auto">
              Hub4Estate works equally well for buyers and electrical dealers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8" style={revealStyle(twoIn.inView, 0.08)}>
            {/* ─── For Buyers — WHITE card with hard black offset shadow ─── */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-10 border border-primary-200 sm:border-2 sm:border-primary-950 sm:shadow-neo-lg sm:hover:shadow-neo-xl sm:hover:-translate-x-1 sm:hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-600 rounded-lg sm:rounded-xl border-2 border-primary-950 sm:shadow-neo-sm flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-700">For Buyers</span>
                  <h3 className="text-xl sm:text-2xl font-black text-primary-950 tracking-tight leading-tight">Home Builders &amp; Contractors</h3>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-5 mb-5 sm:mb-10">
                {[
                  { icon: IndianRupee, title: 'Save 20-40% on Every Order', desc: 'Dealers compete to give you the best price' },
                  { icon: Shield, title: '100% Verified Products', desc: 'No fake brands, no duplicates, full warranty' },
                  { icon: FileText, title: 'Get Quotes in 60 Seconds', desc: 'No more visiting 10 shops to compare prices' },
                  { icon: Award, title: 'Proper Documentation', desc: 'GST bills, warranty cards, delivery proof' },
                  { icon: Truck, title: 'Doorstep Delivery', desc: 'Products delivered to your site or home' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-9 h-9 bg-primary-50 border-2 border-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary-950" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-primary-950 leading-tight">{title}</p>
                      <p className="text-sm text-primary-600 leading-snug mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-950 hover:bg-black text-white font-black text-sm uppercase tracking-wider px-6 py-4 rounded-xl border-2 border-primary-950 shadow-neo-md hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
              >
                Get Free Quotes Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* ─── For Dealers — BLACK card with hard black offset shadow ─── */}
            <div className="group relative bg-primary-950 rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-10 border-2 border-primary-950 sm:shadow-neo-lg sm:hover:shadow-neo-xl sm:hover:-translate-x-1 sm:hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-600 rounded-lg sm:rounded-xl border-2 border-amber-700 sm:shadow-neo-sm flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-500">For Dealers</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">Electrical Shops &amp; Distributors</h3>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-5 mb-5 sm:mb-10">
                {[
                  { icon: Users, title: 'Quality Leads Daily', desc: 'Get verified buyer inquiries delivered to you' },
                  { icon: IndianRupee, title: 'Zero Upfront Fees', desc: 'No listing fees, no monthly charges' },
                  { icon: Award, title: 'Build Your Reputation', desc: 'Get reviews and ratings from real customers' },
                  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your quotes, wins, and conversion rate' },
                  { icon: TrendingUp, title: 'Grow Your Business', desc: 'Access customers you could never reach before' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-9 h-9 bg-white/5 border-2 border-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white leading-tight">{title}</p>
                      <p className="text-sm text-primary-300 leading-snug mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/dealer/onboarding"
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm uppercase tracking-wider px-6 py-4 rounded-xl border-2 border-primary-950 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
              >
                Register as Dealer — Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}

      <AISection />


      {/* ─── Everything Electrical. One Platform. (matches screenshot 4) ───── */}
      <section className="py-20 sm:py-28 bg-[#09090B] border-t-2 border-primary-950">
        <div ref={catIn.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Centered header */}
          <div className="text-center max-w-3xl mx-auto mb-14" style={revealStyle(catIn.inView, 0)}>
            <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.25em] mb-5">
              SHOP BY CATEGORY
            </p>
            <h2 className="text-[26px] sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] sm:leading-[0.95] mb-5">
              Everything Electrical.<br />One Platform.
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              From wires to switches, MCBs to fans — we've got every electrical product for your home or project.
            </p>
          </div>

          {/* Category grid (InteractiveCategoryGrid handles dark tiles) */}
          <div style={revealStyle(catIn.inView, 0.1)}>
            <InteractiveCategoryGrid categories={categories} loading={loading} />
          </div>

          {/* Terracotta CTA */}
          <div className="text-center mt-14" style={revealStyle(catIn.inView, 0.2)}>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm uppercase tracking-[0.15em] px-10 py-5 rounded-md border-2 border-amber-700 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            >
              Explore Full Catalog
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


      {/* ─── Customers Saved ₹2.4 Crores (matches screenshot 6) ───────────── */}
      <section className="py-20 sm:py-28 bg-[#f5f3ef] border-t-2 border-primary-100">
        <div ref={dealsIn.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Centered header */}
          <div className="text-center max-w-3xl mx-auto mb-14" style={revealStyle(dealsIn.inView, 0)}>
            <p className="text-[11px] font-black text-primary-500 uppercase tracking-[0.25em] mb-5">
              REAL RESULTS
            </p>
            <h2 className="text-[26px] sm:text-5xl lg:text-6xl font-black text-primary-950 tracking-tight leading-[1.1] sm:leading-[0.95]">
              Customers Saved ₹2.4 Crores.<br />
              This Month Alone.
            </h2>
          </div>

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote: '"I was quoted ₹85,000 by a local dealer. Hub4Estate got me the same order for ₹52,000. That\'s ₹33,000 saved!"',
                name: 'Rajesh Kumar',
                title: 'Home Builder, Bangalore',
                saved: '₹33,000',
              },
              {
                quote: '"The comparison feature is genius. I could see exactly which dealer was trying to overcharge me. Never going back to the old way."',
                name: 'Priya Sharma',
                title: 'Interior Designer, Mumbai',
                saved: '₹28,500',
              },
              {
                quote: '"As a contractor, I buy electrical items daily. Hub4Estate reduced my procurement costs by 25%. My margins improved overnight."',
                name: 'Mohammed Irfan',
                title: 'Electrical Contractor, Delhi',
                saved: '₹1.2 Lakhs',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white border-2 border-primary-950 rounded-2xl p-7 shadow-neo-lg hover:shadow-neo-xl hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                style={revealStyle(dealsIn.inView, 0.08 + i * 0.08)}
              >
                {/* Filled stars (terracotta via yellow remap) */}
                <div className="flex items-center gap-1 mb-5">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} className="w-4 h-4 text-amber-600 fill-amber-600" />
                  ))}
                </div>

                <p className="text-base text-primary-800 leading-relaxed mb-6 flex-1">
                  {t.quote}
                </p>

                <div className="pt-5 border-t-2 border-primary-100 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-base font-black text-primary-950 leading-tight">{t.name}</p>
                    <p className="text-xs text-primary-500 mt-0.5">{t.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.15em] mb-1">SAVED</p>
                    <p className="text-2xl font-black text-amber-700 leading-none">{t.saved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── Are You A Dealer? (matches screenshot 7) ─────────────────────── */}
      <section className="bg-primary-950 py-24 sm:py-32">
        <div ref={whyIn.ref as any} className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p
            className="text-[11px] font-black text-amber-500 uppercase tracking-[0.25em] mb-6"
            style={revealStyle(whyIn.inView, 0)}
          >
            FOR DEALERS
          </p>
          <h2
            className="text-[26px] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-[1.1] sm:leading-[0.95]"
            style={revealStyle(whyIn.inView, 0.06)}
          >
            Are You A Dealer?<br />
            Get Customers. For Free.
          </h2>
          <p
            className="text-lg text-primary-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            style={revealStyle(whyIn.inView, 0.12)}
          >
            Join 500+ verified dealers getting quality leads daily. No listing fees. No commissions. Pay only when you win an order.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={revealStyle(whyIn.inView, 0.18)}
          >
            <Link
              to="/dealer/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm uppercase tracking-[0.1em] px-8 py-4 rounded-md border-2 border-primary-950 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.25)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            >
              Register As Dealer
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dealer/login"
              className="inline-flex items-center justify-center gap-2 bg-primary-950 hover:bg-black text-white font-black text-sm uppercase tracking-[0.1em] px-8 py-4 rounded-md border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.25)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            >
              Dealer Login
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Ready To Save Money? (matches screenshot 8 terracotta band) ───── */}
      <section className="bg-amber-600 py-20 sm:py-24">
        <div ref={ctaIn.ref as any} className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-[26px] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-[1.1] sm:leading-[0.95]"
            style={revealStyle(ctaIn.inView, 0)}
          >
            Ready To Save Money?
          </h2>
          <p
            className="text-lg text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
            style={revealStyle(ctaIn.inView, 0.07)}
          >
            Join thousands of smart buyers who refuse to overpay. Your first quote is free. Always.
          </p>
          <div
            className="flex justify-center"
            style={revealStyle(ctaIn.inView, 0.14)}
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-primary-950 font-black text-sm uppercase tracking-[0.15em] rounded-md border-2 border-primary-950 shadow-neo-md hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group"
            >
              Get Your Free Quote Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
