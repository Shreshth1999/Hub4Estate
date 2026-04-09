import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import {
  Building2, MapPin, CheckCircle, ArrowRight,
  ChevronLeft, Eye, EyeOff, Shield, Clock, TrendingUp, Users,
  Upload, X, Camera, Zap, Loader2, Store, Truck, Wrench,
  Factory, Package, FileCheck, AlertCircle, Image as ImageIcon,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEALER_TYPES = [
  { value: 'RETAILER',         label: 'Retailer',         icon: Store,   description: 'Sell directly to end customers' },
  { value: 'DISTRIBUTOR',      label: 'Distributor',       icon: Truck,   description: 'Supply to retailers and dealers' },
  { value: 'SYSTEM_INTEGRATOR',label: 'System Integrator', icon: Wrench,  description: 'Complete installation solutions' },
  { value: 'CONTRACTOR',       label: 'Contractor',        icon: Building2, description: 'Electrical contracting services' },
  { value: 'OEM_PARTNER',      label: 'OEM Partner',       icon: Factory, description: 'Manufacturing partnership' },
  { value: 'WHOLESALER',       label: 'Wholesaler',        icon: Package, description: 'Bulk supply operations' },
];

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi',
];

const YEARS_OPTIONS = [
  { value: 1, label: 'Less than 1 year' },
  { value: 2, label: '1–2 years' },
  { value: 5, label: '3–5 years' },
  { value: 10, label: '5–10 years' },
  { value: 15, label: '10+ years' },
];

// Matches a valid Indian GST number: 2-digit state + 5-letter PAN + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
const GST_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]/i;

// Steps definition
const STEPS = [
  { label: 'Type',       icon: Store },
  { label: 'Documents',  icon: FileCheck },
  { label: 'Details',    icon: Building2 },
  { label: 'Location',   icon: MapPin },
  { label: 'Shop',       icon: ImageIcon },
  { label: 'Account',    icon: Shield },
  { label: 'Review',     icon: CheckCircle },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = 'text', placeholder, error, required, children,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string; required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children || (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 border text-sm rounded-lg focus:outline-none transition-colors ${
            error
              ? 'border-red-300 bg-red-50 focus:border-red-400'
              : 'border-gray-200 focus:border-gray-400'
          }`}
        />
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DealerOnboarding() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  // Form data
  const [form, setForm] = useState({
    dealerType: '',
    yearsInOperation: 0,
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    gstNumber: '',
    panNumber: '',
    shopAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  // GST document state
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [gstPreview, setGstPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<{ gst?: string; businessName?: string; address?: string } | null>(null);
  const [extractFailed, setExtractFailed] = useState(false);
  const [skipDocUpload, setSkipDocUpload] = useState(false);
  const gstInputRef = useRef<HTMLInputElement>(null);

  // Shop images state
  const [shopImages, setShopImages] = useState<File[]>([]);
  const [shopPreviews, setShopPreviews] = useState<string[]>([]);
  const shopImgRef = useRef<HTMLInputElement>(null);

  // PAN document
  const [panFile, setPanFile] = useState<File | null>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    setSubmitError('');
  };

  // ── GST Document Extraction ────────────────────────────────────────────────

  const handleGstUpload = async (file: File) => {
    setGstFile(file);
    setGstPreview(URL.createObjectURL(file));
    setExtracted(null);
    setExtractFailed(false);
    setExtracting(true);

    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/slip-scanner/parse', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const raw = JSON.stringify(res.data);
      const gstMatch = raw.match(GST_REGEX);
      const gst = gstMatch ? gstMatch[0].toUpperCase() : undefined;

      // Try to extract business name from returned items
      let businessName: string | undefined;
      const items: any[] = res.data.items || [];
      if (items.length > 0 && items[0].productName) {
        // Not a business name — ignore product-level extraction for name
      }
      // Look for "tradeName" or "legalName" in raw text
      const tradeMatch = raw.match(/"(?:tradeName|legalName|businessName)"\s*:\s*"([^"]+)"/i);
      if (tradeMatch) businessName = tradeMatch[1];

      if (gst || businessName) {
        setExtracted({ gst, businessName });
        if (gst) set('gstNumber', gst);
        if (businessName) set('businessName', businessName);
      } else {
        setExtractFailed(true);
      }
    } catch {
      setExtractFailed(true);
    } finally {
      setExtracting(false);
    }
  };

  // ── Shop Images ────────────────────────────────────────────────────────────

  const handleShopImages = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - shopImages.length);
    setShopImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => {
      const url = URL.createObjectURL(f);
      setShopPreviews(prev => [...prev, url]);
    });
  };

  const removeShopImage = (idx: number) => {
    setShopImages(prev => prev.filter((_, i) => i !== idx));
    setShopPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};

    if (s === 0 && !form.dealerType) e.dealerType = 'Please select your dealer type';

    if (s === 1 && !skipDocUpload) {
      if (!gstFile && !form.gstNumber) {
        // Allow passing if they manually filled GST
        if (!form.gstNumber) e.gstNumber = 'Enter your GST number or upload a certificate';
      }
    }

    if (s === 2) {
      if (!form.businessName.trim()) e.businessName = 'Business name is required';
      if (!form.ownerName.trim()) e.ownerName = 'Owner name is required';
      if (!form.phone.trim()) e.phone = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit mobile number';
      if (!form.gstNumber.trim()) e.gstNumber = 'GST number is required';
      else if (form.gstNumber.length !== 15) e.gstNumber = 'GST number must be exactly 15 characters';
      if (form.panNumber && form.panNumber.length !== 10) e.panNumber = 'PAN number must be exactly 10 characters';
    }

    if (s === 3) {
      if (!form.shopAddress.trim()) e.shopAddress = 'Shop address is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.state) e.state = 'State is required';
      if (!form.pincode.trim()) e.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    }

    if (s === 5) {
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const back = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await authApi.dealerRegister({
        email: form.email,
        password: form.password,
        businessName: form.businessName,
        ownerName: form.ownerName,
        phone: form.phone,
        dealerType: form.dealerType || undefined,
        yearsInOperation: form.yearsInOperation || undefined,
        gstNumber: form.gstNumber || undefined,
        panNumber: form.panNumber || undefined,
        shopAddress: form.shopAddress,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });

      if (res.data.token) {
        setAuth({
          id: res.data.dealer.id,
          email: res.data.dealer.email,
          name: res.data.dealer.businessName,
          type: 'dealer',
          status: res.data.dealer.status,
          onboardingStep: res.data.dealer.onboardingStep,
        }, res.data.token);
        window.location.href = '/dealer';
      } else {
        navigate('/dealer/registration-success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setSubmitError(msg);
      if (err.response?.data?.details) {
        const fe: Record<string, string> = {};
        err.response.data.details.forEach((d: any) => { if (d.path) fe[d.path] = d.message; });
        setErrors(fe);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Hub4Estate</span>
          </Link>
          <span className="text-sm text-gray-400">Dealer Registration</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* ── Left: Why Join ──────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Reach more buyers.<br />Grow your business.
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Register once, get verified, and start receiving real buyer inquiries for electrical products.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, title: 'Qualified Leads', desc: 'Real buyers with specific requirements' },
                  { icon: TrendingUp, title: 'Zero Upfront Cost', desc: 'Free to register and get started' },
                  { icon: Shield, title: 'Verified Badge', desc: 'Build buyer trust through our verification' },
                  { icon: Clock, title: 'Fast Onboarding', desc: 'Takes less than 5 minutes' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step progress */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {STEPS.map(({ label }, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      i < step ? 'bg-green-500 text-white' :
                      i === step ? 'bg-gray-900 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${i === step ? 'font-semibold text-gray-900' : i < step ? 'text-gray-400 line-through' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Form ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">

            {/* Progress bar (mobile) */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Step {step + 1} of {STEPS.length}</span>
                <span className="text-xs font-medium text-gray-900">{STEPS[step].label}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-500"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">

              {submitError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* ── Step 0: Business Type ──────────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">What type of dealer are you?</h2>
                    <p className="text-sm text-gray-500">This helps us match you with the right buyers</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {DEALER_TYPES.map(({ value, label, icon: Icon, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set('dealerType', value)}
                        className={`p-4 border rounded-xl text-left transition-all ${
                          form.dealerType === value
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2.5 ${form.dealerType === value ? 'text-gray-900' : 'text-gray-400'}`} />
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                      </button>
                    ))}
                  </div>
                  {errors.dealerType && <p className="text-sm text-red-600">{errors.dealerType}</p>}

                  <Field
                    label="Years in operation"
                    value={String(form.yearsInOperation || '')}
                    onChange={() => {}}
                  >
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                      value={form.yearsInOperation}
                      onChange={e => set('yearsInOperation', parseInt(e.target.value) || 0)}
                    >
                      <option value={0}>Select (optional)</option>
                      {YEARS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {/* ── Step 1: GST Document ───────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Verify your business</h2>
                    <p className="text-sm text-gray-500">
                      Upload your GST certificate — we'll extract your details automatically
                    </p>
                  </div>

                  {!skipDocUpload && (
                    <>
                      {!gstFile ? (
                        <div>
                          <input
                            ref={gstInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={e => e.target.files?.[0] && handleGstUpload(e.target.files[0])}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => gstInputRef.current?.click()}
                            className="w-full h-44 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700">Upload GST Certificate</p>
                              <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF · Max 10MB</p>
                            </div>
                            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                              Auto-extracts GST number & business name
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Preview */}
                          <div className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 h-36 flex items-center justify-center">
                            {gstFile.type.startsWith('image/') ? (
                              <img src={gstPreview!} alt="GST doc" className="h-full w-full object-contain" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-gray-500">
                                <FileCheck className="w-10 h-10 text-gray-300" />
                                <span className="text-sm font-medium">{gstFile.name}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => { setGstFile(null); setGstPreview(null); setExtracted(null); setExtractFailed(false); }}
                              className="absolute top-2 right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Extraction state */}
                          {extracting && (
                            <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                              <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                              <p className="text-sm text-blue-700 font-medium">Scanning document...</p>
                            </div>
                          )}

                          {extracted && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <p className="text-sm font-semibold text-green-800">Details extracted successfully</p>
                              </div>
                              <div className="space-y-2">
                                {extracted.gst && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-600 font-medium w-24">GST Number</span>
                                    <span className="text-sm font-mono font-semibold text-green-900">{extracted.gst}</span>
                                  </div>
                                )}
                                {extracted.businessName && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-600 font-medium w-24">Business</span>
                                    <span className="text-sm font-semibold text-green-900">{extracted.businessName}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-green-600 mt-2">Form has been auto-filled. Review & edit in the next step.</p>
                            </div>
                          )}

                          {extractFailed && (
                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-amber-800">Could not auto-extract details</p>
                                <p className="text-xs text-amber-700 mt-0.5">No problem — you can fill them manually in the next step</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="h-px flex-1 bg-gray-100" />
                        <span>or</span>
                        <div className="h-px flex-1 bg-gray-100" />
                      </div>
                    </>
                  )}

                  {/* Manual GST entry */}
                  <div>
                    <Field
                      label="GST Number"
                      value={form.gstNumber}
                      onChange={v => set('gstNumber', v.toUpperCase())}
                      placeholder="e.g. 08ABCDE1234F1Z5"
                      error={errors.gstNumber}
                    />
                    <p className="text-xs text-gray-400 mt-1">15-character GST identification number</p>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipDocUpload}
                      onChange={e => setSkipDocUpload(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900"
                    />
                    <span className="text-sm text-gray-600">I don't have my GST certificate handy — I'll fill details manually</span>
                  </label>
                </div>
              )}

              {/* ── Step 2: Business Details ───────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Business information</h2>
                    <p className="text-sm text-gray-500">Tell us about your electrical business</p>
                  </div>
                  {extracted?.gst && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-700">Pre-filled from your GST certificate — review and edit if needed</p>
                    </div>
                  )}
                  <Field label="Business / Shop Name" value={form.businessName} onChange={v => set('businessName', v)}
                    placeholder="e.g. Sharma Electricals" error={errors.businessName} required />
                  <Field label="Owner / Proprietor Name" value={form.ownerName} onChange={v => set('ownerName', v)}
                    placeholder="Your full name" error={errors.ownerName} required />
                  <Field label="GST Number" value={form.gstNumber} onChange={v => set('gstNumber', v.toUpperCase())}
                    placeholder="15-character GST number" error={errors.gstNumber} required />
                  <Field label="PAN Number" value={form.panNumber} onChange={v => set('panNumber', v.toUpperCase())}
                    placeholder="10-character PAN (optional)" error={errors.panNumber} />
                  <Field label="WhatsApp / Phone" value={form.phone} onChange={v => set('phone', v)}
                    placeholder="10-digit mobile number" type="tel" error={errors.phone} required />
                </div>
              )}

              {/* ── Step 3: Location ──────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Your shop location</h2>
                    <p className="text-sm text-gray-500">Where do buyers come to pick up or where you deliver from</p>
                  </div>
                  <Field label="Shop Address" value={form.shopAddress} onChange={v => set('shopAddress', v)}
                    placeholder="Shop number, street, area" error={errors.shopAddress} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City" value={form.city} onChange={v => set('city', v)}
                      placeholder="e.g. Jaipur" error={errors.city} required />
                    <Field label="Pincode" value={form.pincode} onChange={v => set('pincode', v.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit pincode" type="tel" error={errors.pincode} required />
                  </div>
                  <Field label="State" value={form.state} onChange={() => {}} error={errors.state} required>
                    <select
                      value={form.state}
                      onChange={e => set('state', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:border-gray-400 focus:outline-none ${
                        errors.state ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {/* ── Step 4: Shop Images ───────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Add shop photos</h2>
                    <p className="text-sm text-gray-500">
                      Dealers with photos get 3× more trust from buyers. Upload your shop, products, or logo.
                    </p>
                  </div>

                  <input
                    ref={shopImgRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => e.target.files && handleShopImages(e.target.files)}
                    className="hidden"
                  />

                  {shopPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {shopPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                          <img src={src} alt={`Shop ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeShopImage(i)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-gray-900/80 text-white rounded-full flex items-center justify-center hover:bg-gray-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {shopImages.length < 5 && (
                        <button
                          type="button"
                          onClick={() => shopImgRef.current?.click()}
                          className="aspect-square rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-gray-400 hover:bg-gray-50 transition-all"
                        >
                          <Camera className="w-5 h-5 text-gray-400" />
                          <span className="text-xs text-gray-400">Add more</span>
                        </button>
                      )}
                    </div>
                  )}

                  {shopPreviews.length === 0 && (
                    <button
                      type="button"
                      onClick={() => shopImgRef.current?.click()}
                      className="w-full h-44 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">Upload shop photos</p>
                        <p className="text-xs text-gray-400 mt-1">Up to 5 photos · JPG or PNG</p>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={next}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Skip for now →
                  </button>
                </div>
              )}

              {/* ── Step 5: Account ───────────────────────────────────────── */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h2>
                    <p className="text-sm text-gray-500">You'll use these to log in and manage your leads</p>
                  </div>
                  <Field label="Work Email" value={form.email} onChange={v => set('email', v)}
                    type="email" placeholder="you@yourshop.com" error={errors.email} required />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => set('password', e.target.value)}
                        placeholder="At least 8 characters"
                        className={`w-full px-4 py-2.5 border text-sm rounded-lg focus:outline-none pr-10 transition-colors ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                  </div>
                </div>
              )}

              {/* ── Step 6: Review ────────────────────────────────────────── */}
              {step === 6 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Review your details</h2>
                    <p className="text-sm text-gray-500">Everything looks right? Submit to complete registration.</p>
                  </div>

                  <div className="space-y-3 divide-y divide-gray-100">
                    {[
                      { label: 'Business', value: form.businessName || '—' },
                      { label: 'Owner', value: form.ownerName || '—' },
                      { label: 'Type', value: DEALER_TYPES.find(d => d.value === form.dealerType)?.label || '—' },
                      { label: 'Phone', value: form.phone || '—' },
                      { label: 'Email', value: form.email || '—' },
                      { label: 'GST', value: form.gstNumber || 'Not provided' },
                      { label: 'City', value: `${form.city}${form.state ? ', ' + form.state : ''}` || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2.5">
                        <span className="text-sm text-gray-500">{label}</span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                      After submission, our team will review your details and verify your business within 24–48 hours.
                      You'll get an email once you're approved.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Navigation ────────────────────────────────────────────── */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <Link
                    to="/dealer/login"
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Already registered? Sign in
                  </Link>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={step === 4 ? next : next}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Submit Registration</>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Success Page ─────────────────────────────────────────────────────────────

export function DealerRegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Registration Submitted</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          We've received your details. Our team will review and verify your business within 24–48 hours.
          You'll get an email when you're approved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Home
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
