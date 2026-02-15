import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import {
  Building2, FileText, MapPin, CheckCircle, ArrowRight,
  ChevronRight, ChevronLeft, Eye, EyeOff, Shield, Clock, TrendingUp, Users,
  Upload, X, File, AlertCircle, Store, Truck, Wrench, Factory, Package
} from 'lucide-react';

// Dealer types with descriptions
const DEALER_TYPES = [
  { value: 'RETAILER', label: 'Retailer', icon: Store, description: 'Sell directly to end customers' },
  { value: 'DISTRIBUTOR', label: 'Distributor', icon: Truck, description: 'Supply to retailers and dealers' },
  { value: 'SYSTEM_INTEGRATOR', label: 'System Integrator', icon: Wrench, description: 'Provide complete solutions' },
  { value: 'CONTRACTOR', label: 'Contractor', icon: Building2, description: 'Electrical contracting services' },
  { value: 'OEM_PARTNER', label: 'OEM Partner', icon: Factory, description: 'Manufacturing partnership' },
  { value: 'WHOLESALER', label: 'Wholesaler', icon: Package, description: 'Bulk supply operations' },
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];

const YEARS_OPTIONS = [
  { value: 1, label: 'Less than 1 year' },
  { value: 2, label: '1-2 years' },
  { value: 5, label: '3-5 years' },
  { value: 10, label: '5-10 years' },
  { value: 15, label: '10+ years' },
];

const benefits = [
  { icon: Users, title: 'Get Quality Leads', description: 'Verified buyers actively looking for electrical products' },
  { icon: TrendingUp, title: 'Grow Your Business', description: 'Average dealer sees 40% increase in orders' },
  { icon: Clock, title: 'Save Time', description: 'No more chasing customers - they come to you' },
  { icon: Shield, title: 'Verified Badge', description: 'Build trust with buyers through our verification' },
];

// Input component - MUST be outside the main component to prevent re-mounting on state changes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

function FormInput({ label, error, helper, required, ...props }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`block w-full border-2 px-4 py-3 text-base font-medium transition-all duration-200 ${
          error ? 'border-red-500 focus:border-red-600 bg-red-50' : 'border-neutral-300 focus:border-neutral-900'
        } focus:outline-none focus:ring-0`}
        {...props}
      />
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      {helper && !error && <p className="mt-2 text-xs text-neutral-500">{helper}</p>}
    </div>
  );
}

// Alert component - MUST be outside the main component
function FormAlert({ variant, title, children }: { variant: 'error' | 'info' | 'success'; title?: string; children: React.ReactNode }) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
  };
  return (
    <div className={`border-2 p-4 mb-6 ${styles[variant]}`}>
      <div className="flex gap-3">
        {icons[variant]}
        <div>
          {title && <p className="font-bold mb-1">{title}</p>}
          <p className="text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
}

export function DealerOnboarding() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

  const [gstDocument, setGstDocument] = useState<File | null>(null);
  const [panDocument, setPanDocument] = useState<File | null>(null);
  const [shopLicense, setShopLicense] = useState<File | null>(null);
  const gstInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { label: 'Type', description: 'Dealer type' },
    { label: 'Business', description: 'Company details' },
    { label: 'Documents', description: 'GST & PAN' },
    { label: 'Location', description: 'Service area' },
    { label: 'Review', description: 'Submit' },
  ];

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSubmitError(null);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.dealerType) newErrors.dealerType = 'Please select your dealer type';
    }

    if (step === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (formData.phone.length < 10) newErrors.phone = 'Invalid phone number';
    }

    if (step === 2) {
      if (!formData.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
      else if (formData.gstNumber.length !== 15) newErrors.gstNumber = 'GST number must be 15 characters';
      if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
      else if (formData.panNumber.length !== 10) newErrors.panNumber = 'PAN number must be 10 characters';
    }

    if (step === 3) {
      if (!formData.shopAddress.trim()) newErrors.shopAddress = 'Shop address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (formData.pincode.length !== 6) newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError(null);
    setErrors({});

    try {
      const response = await authApi.dealerRegister({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        phone: formData.phone,
        dealerType: formData.dealerType || undefined, // Don't send empty string
        yearsInOperation: formData.yearsInOperation || undefined,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        shopAddress: formData.shopAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });

      if (response.data.token) {
        // Set auth first, then navigate after a brief delay to ensure state is synced
        setAuth(
          {
            id: response.data.dealer.id,
            email: response.data.dealer.email,
            name: response.data.dealer.businessName,
            type: 'dealer',
            status: response.data.dealer.status,
            onboardingStep: response.data.dealer.onboardingStep,
          },
          response.data.token
        );
        // Use window.location for a clean navigation that ensures state is persisted
        window.location.href = '/dealer';
      } else {
        navigate('/dealer/registration-success');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const details = err.response.data.details;
        const fieldErrors: Record<string, string> = {};
        details.forEach((d: any) => {
          if (d.path) fieldErrors[d.path] = d.message;
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          errorMessage = details.map((d: any) => d.message).filter(Boolean).join('. ');
        }
      }
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-neutral-900 text-white py-8 border-b-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Link to="/" className="inline-flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-white flex items-center justify-center">
                  <span className="text-xl font-black text-neutral-900">H4</span>
                </div>
                <span className="text-xl font-bold">Hub4Estate</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                Join 500+ Dealers.<br />
                <span className="text-amber-400">Grow Your Business.</span>
              </h1>
              <p className="text-neutral-400">Start receiving quality leads in 24 hours after verification</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400 mb-1">500+</div>
                <div className="text-xs uppercase tracking-wider text-neutral-400">Active Dealers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400 mb-1">40%</div>
                <div className="text-xs uppercase tracking-wider text-neutral-400">Order Growth</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-10">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 flex items-center justify-center font-bold text-sm ${
                        index < currentStep ? 'bg-green-600 text-white' : index === currentStep ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className="text-xs font-bold mt-2 uppercase tracking-wide text-neutral-600">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 w-8 md:w-16 mx-2 ${index < currentStep ? 'bg-green-600' : 'bg-neutral-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-neutral-900 bg-white p-8 lg:p-10">
              {submitError && <FormAlert variant="error" title="Registration Failed">{submitError}</FormAlert>}

              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center"><Store className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">What type of dealer are you?</h2>
                      <p className="text-neutral-500">This helps us match you with the right buyers</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEALER_TYPES.map((type) => (
                      <button key={type.value} type="button" onClick={() => updateField('dealerType', type.value)}
                        className={`p-4 border-2 text-left transition-all ${formData.dealerType === type.value ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                        <div className="flex items-start gap-3">
                          <type.icon className={`w-6 h-6 ${formData.dealerType === type.value ? 'text-neutral-900' : 'text-neutral-400'}`} />
                          <div>
                            <p className="font-bold text-neutral-900">{type.label}</p>
                            <p className="text-sm text-neutral-500">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.dealerType && <p className="text-sm font-medium text-red-600">{errors.dealerType}</p>}
                  <div className="mt-6">
                    <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">Years in Operation (Optional)</label>
                    <select className="block w-full border-2 border-neutral-300 px-4 py-3 text-base font-medium focus:border-neutral-900 focus:outline-none"
                      value={formData.yearsInOperation} onChange={(e) => updateField('yearsInOperation', parseInt(e.target.value) || 0)}>
                      <option value={0}>Select years</option>
                      {YEARS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center"><Building2 className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Business Information</h2>
                      <p className="text-neutral-500">Tell us about your electrical business</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Business Name"
                      placeholder="e.g., Krishna Electricals"
                      value={formData.businessName}
                      onChange={(e) => updateField('businessName', e.target.value)}
                      error={errors.businessName}
                      required
                    />
                    <FormInput
                      label="Owner Name"
                      placeholder="Your full name"
                      value={formData.ownerName}
                      onChange={(e) => updateField('ownerName', e.target.value)}
                      error={errors.ownerName}
                      required
                    />
                  </div>
                  <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="you@business.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    required
                  />
                  <div className="relative">
                    <FormInput
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      error={errors.password}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-11 text-neutral-500 hover:text-neutral-900">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <FormInput
                    label="Phone Number"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    error={errors.phone}
                    required
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center"><FileText className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Business Documents</h2>
                      <p className="text-neutral-500">Required for verification</p>
                    </div>
                  </div>
                  <FormAlert variant="info">Your documents will be verified within <strong>24-48 hours</strong>. You can start using the platform immediately.</FormAlert>
                  <div className="space-y-3">
                    <FormInput
                      label="GST Number"
                      placeholder="e.g., 29AABCU9603R1ZM"
                      value={formData.gstNumber}
                      onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase().slice(0, 15))}
                      error={errors.gstNumber}
                      helper="15-character GSTIN starting with state code"
                      required
                    />
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">GST Certificate (Optional)</label>
                      <input type="file" ref={gstInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setGstDocument(e.target.files?.[0] || null)} className="hidden" />
                      {gstDocument ? (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200">
                          <File className="w-5 h-5 text-green-600" />
                          <span className="flex-1 text-sm font-medium text-green-800 truncate">{gstDocument.name}</span>
                          <button type="button" onClick={() => setGstDocument(null)} className="text-green-600 hover:text-green-800"><X className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => gstInputRef.current?.click()} className="w-full p-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 flex items-center justify-center gap-2 text-neutral-600">
                          <Upload className="w-5 h-5" /><span className="font-medium">Upload GST Certificate</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <FormInput
                      label="PAN Number"
                      placeholder="e.g., AABCU9603R"
                      value={formData.panNumber}
                      onChange={(e) => updateField('panNumber', e.target.value.toUpperCase().slice(0, 10))}
                      error={errors.panNumber}
                      helper="10-character PAN of business or proprietor"
                      required
                    />
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">PAN Card Copy (Optional)</label>
                      <input type="file" ref={panInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPanDocument(e.target.files?.[0] || null)} className="hidden" />
                      {panDocument ? (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200">
                          <File className="w-5 h-5 text-green-600" />
                          <span className="flex-1 text-sm font-medium text-green-800 truncate">{panDocument.name}</span>
                          <button type="button" onClick={() => setPanDocument(null)} className="text-green-600 hover:text-green-800"><X className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => panInputRef.current?.click()} className="w-full p-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 flex items-center justify-center gap-2 text-neutral-600">
                          <Upload className="w-5 h-5" /><span className="font-medium">Upload PAN Card</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Shop License (Optional)</label>
                    <input type="file" ref={licenseInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setShopLicense(e.target.files?.[0] || null)} className="hidden" />
                    {shopLicense ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200">
                        <File className="w-5 h-5 text-green-600" />
                        <span className="flex-1 text-sm font-medium text-green-800 truncate">{shopLicense.name}</span>
                        <button type="button" onClick={() => setShopLicense(null)} className="text-green-600 hover:text-green-800"><X className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => licenseInputRef.current?.click()} className="w-full p-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 flex items-center justify-center gap-2 text-neutral-600">
                        <Upload className="w-5 h-5" /><span className="font-medium">Upload Shop License</span>
                      </button>
                    )}
                    <p className="mt-2 text-xs text-neutral-500">Accepted: PDF, JPG, PNG (max 5MB)</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center"><MapPin className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Location Details</h2>
                      <p className="text-neutral-500">Where is your shop located?</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">Shop Address <span className="text-red-500">*</span></label>
                    <textarea className={`block w-full border-2 px-4 py-4 text-base font-medium ${errors.shopAddress ? 'border-red-500 bg-red-50' : 'border-neutral-300 focus:border-neutral-900'} focus:outline-none`}
                      rows={3} placeholder="Complete shop address with landmark" value={formData.shopAddress} onChange={(e) => updateField('shopAddress', e.target.value)} />
                    {errors.shopAddress && <p className="mt-2 text-sm font-medium text-red-600">{errors.shopAddress}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="City"
                      placeholder="e.g., Mumbai"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      error={errors.city}
                      required
                    />
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">State <span className="text-red-500">*</span></label>
                      <select className={`block w-full border-2 px-4 py-3 text-base font-medium ${errors.state ? 'border-red-500 bg-red-50' : 'border-neutral-300 focus:border-neutral-900'} focus:outline-none`}
                        value={formData.state} onChange={(e) => updateField('state', e.target.value)}>
                        <option value="">Select state</option>
                        {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                      {errors.state && <p className="mt-2 text-sm font-medium text-red-600">{errors.state}</p>}
                    </div>
                  </div>
                  <FormInput
                    label="Pincode"
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    error={errors.pincode}
                    helper="You can add more service areas after registration"
                    required
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Review & Submit</h2>
                      <p className="text-neutral-500">Verify your details before submitting</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-2 border-neutral-200 p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 flex items-center uppercase tracking-wide text-sm"><Store className="w-4 h-4 mr-2" />Dealer Type</h3>
                      <p className="font-bold text-neutral-900">{DEALER_TYPES.find(t => t.value === formData.dealerType)?.label || 'Not selected'}</p>
                      {formData.yearsInOperation > 0 && <p className="text-neutral-600 text-sm mt-1">{YEARS_OPTIONS.find(y => y.value === formData.yearsInOperation)?.label} experience</p>}
                    </div>
                    <div className="border-2 border-neutral-200 p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 flex items-center uppercase tracking-wide text-sm"><Building2 className="w-4 h-4 mr-2" />Business Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-neutral-500 block">Business Name</span><p className="font-bold text-neutral-900">{formData.businessName}</p></div>
                        <div><span className="text-neutral-500 block">Owner</span><p className="font-bold text-neutral-900">{formData.ownerName}</p></div>
                        <div><span className="text-neutral-500 block">Email</span><p className="font-bold text-neutral-900">{formData.email}</p></div>
                        <div><span className="text-neutral-500 block">Phone</span><p className="font-bold text-neutral-900">{formData.phone}</p></div>
                      </div>
                    </div>
                    <div className="border-2 border-neutral-200 p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 flex items-center uppercase tracking-wide text-sm"><FileText className="w-4 h-4 mr-2" />Documents</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-neutral-500 block">GST Number</span><p className="font-bold text-neutral-900 font-mono">{formData.gstNumber}</p>
                          {gstDocument && <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" />Certificate uploaded</span>}</div>
                        <div><span className="text-neutral-500 block">PAN Number</span><p className="font-bold text-neutral-900 font-mono">{formData.panNumber}</p>
                          {panDocument && <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" />Card uploaded</span>}</div>
                      </div>
                    </div>
                    <div className="border-2 border-neutral-200 p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 flex items-center uppercase tracking-wide text-sm"><MapPin className="w-4 h-4 mr-2" />Location</h3>
                      <p className="font-bold text-neutral-900">{formData.shopAddress}</p>
                      <p className="text-neutral-600">{formData.city}, {formData.state} - {formData.pincode}</p>
                    </div>
                  </div>
                  <FormAlert variant="info">By submitting, you agree to our <Link to="/terms" className="font-bold underline">Terms of Service</Link> and confirm all information is accurate.</FormAlert>
                </div>
              )}

              <div className="flex items-center justify-between mt-10 pt-8 border-t-2 border-neutral-200">
                {currentStep > 0 ? (
                  <button type="button" onClick={handleBack} className="flex items-center gap-2 px-6 py-3 text-neutral-700 font-bold hover:text-neutral-900"><ChevronLeft className="w-5 h-5" />Back</button>
                ) : (
                  <Link to="/dealer/login" className="text-neutral-600 hover:text-neutral-900 font-bold text-sm uppercase tracking-wide">Already registered? Sign in</Link>
                )}
                {currentStep < 4 ? (
                  <button type="button" onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white font-bold hover:bg-neutral-800">Continue<ChevronRight className="w-5 h-5" /></button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-neutral-900 font-bold hover:bg-amber-400 disabled:opacity-50">
                    {isLoading ? (<><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Submitting...</>) : (<>Submit Registration<ArrowRight className="w-5 h-5" /></>)}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-neutral-900 text-white p-8 mb-6">
                <h3 className="text-xl font-bold mb-6">Why Join Hub4Estate?</h3>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/10 flex items-center justify-center flex-shrink-0"><benefit.icon className="w-5 h-5 text-amber-400" /></div>
                      <div><h4 className="font-bold text-white mb-1">{benefit.title}</h4><p className="text-sm text-neutral-400">{benefit.description}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-2 border-neutral-200 p-6">
                <h4 className="font-bold text-neutral-900 mb-4">Need Help?</h4>
                <p className="text-sm text-neutral-600 mb-4">Our team is available to assist with your registration.</p>
                <a href="tel:+917690001999" className="block w-full text-center py-3 border-2 border-neutral-900 font-bold hover:bg-neutral-900 hover:text-white transition-colors">Call: +91 76900 01999</a>
                <a href="mailto:support@hub4estate.com" className="text-sm text-neutral-600 block text-center mt-3 hover:text-neutral-900">support@hub4estate.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DealerRegistrationSuccess() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="w-24 h-24 bg-green-600 flex items-center justify-center mx-auto mb-8"><CheckCircle className="w-12 h-12 text-white" /></div>
        <h1 className="text-4xl font-black text-neutral-900 mb-4">Registration Submitted!</h1>
        <p className="text-xl text-neutral-600 mb-8">You can now access your dealer dashboard. Verification completes within <span className="font-bold text-neutral-900">24-48 hours</span>.</p>
        <div className="bg-neutral-900 text-white p-8 mb-8 text-left">
          <h3 className="font-bold text-lg mb-4">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3"><span className="w-6 h-6 bg-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0 text-neutral-900">1</span><span className="text-neutral-300">Access your dashboard immediately</span></div>
            <div className="flex items-start gap-3"><span className="w-6 h-6 bg-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0 text-neutral-900">2</span><span className="text-neutral-300">Add your brands and service areas</span></div>
            <div className="flex items-start gap-3"><span className="w-6 h-6 bg-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0 text-neutral-900">3</span><span className="text-neutral-300">Get verified and unlock all features</span></div>
            <div className="flex items-start gap-3"><span className="w-6 h-6 bg-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0 text-neutral-900">4</span><span className="text-neutral-300">Start receiving RFQs from buyers</span></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dealer" className="px-8 py-3 bg-neutral-900 text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-neutral-800">Go to Dashboard<ArrowRight className="w-5 h-5" /></Link>
          <Link to="/" className="px-8 py-3 border-2 border-neutral-900 font-bold inline-flex items-center justify-center hover:bg-neutral-100">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
