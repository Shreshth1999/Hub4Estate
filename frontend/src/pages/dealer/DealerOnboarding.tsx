import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Stepper, Button, Input, Alert } from '../../components/ui';
import {
  Building2, FileText, MapPin, CheckCircle, ArrowRight,
  ChevronRight, ChevronLeft, Eye, EyeOff, Shield, Clock, TrendingUp, Users,
  Upload, X, File, Image
} from 'lucide-react';

const steps = [
  { label: 'Business', description: 'Company details' },
  { label: 'Documents', description: 'GST & PAN' },
  { label: 'Location', description: 'Service area' },
  { label: 'Review', description: 'Submit' },
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];

const benefits = [
  { icon: Users, title: 'Get Quality Leads', description: 'Verified buyers actively looking for electrical products' },
  { icon: TrendingUp, title: 'Grow Your Business', description: 'Average dealer sees 40% increase in orders' },
  { icon: Clock, title: 'Save Time', description: 'No more chasing customers - they come to you' },
  { icon: Shield, title: 'Verified Badge', description: 'Build trust with buyers through our verification' },
];

export function DealerOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    ownerName: '',
    phone: '',
    gstNumber: '',
    panNumber: '',
    shopAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  // File upload state
  const [gstDocument, setGstDocument] = useState<File | null>(null);
  const [panDocument, setPanDocument] = useState<File | null>(null);
  const [shopLicense, setShopLicense] = useState<File | null>(null);
  const gstInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (formData.phone.length < 10) newErrors.phone = 'Invalid phone number';
    }

    if (step === 1) {
      if (!formData.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
      else if (formData.gstNumber.length !== 15) newErrors.gstNumber = 'GST number must be 15 characters';
      if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
      else if (formData.panNumber.length !== 10) newErrors.panNumber = 'PAN number must be 10 characters';
    }

    if (step === 2) {
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
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await authApi.dealerRegister(formData);
      navigate('/dealer/registration-success');
    } catch (err: any) {
      let errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';

      // If there are validation details, show them
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const details = err.response.data.details;

        // Create a clean list of validation errors
        const errorList = details.map((d: any) => d.message).filter(Boolean);
        if (errorList.length > 0) {
          errorMessage = errorList.join('. ');
        }

        // Also set individual field errors
        const fieldErrors: Record<string, string> = { submit: errorMessage };
        details.forEach((d: any) => {
          if (d.path) {
            fieldErrors[d.path] = d.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="bg-neutral-900 text-white py-8 border-b-4 border-accent-500">
        <div className="container-custom">
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
                <span className="text-accent-400">Grow Your Business.</span>
              </h1>
              <p className="text-neutral-400">
                Start receiving quality leads in 24 hours after verification
              </p>
            </div>
            <div className="flex gap-6">
              {benefits.slice(0, 2).map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-black text-accent-400 mb-1">
                    {index === 0 ? '500+' : '40%'}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400">
                    {index === 0 ? 'Active Dealers' : 'Order Growth'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Stepper */}
            <div className="mb-10">
              <Stepper steps={steps} currentStep={currentStep} />
            </div>

            {/* Form Card */}
            <div className="border-2 border-neutral-900 bg-white p-8 lg:p-10">
              {errors.submit && (
                <Alert variant="error" title="Registration Failed">
                  {errors.submit}
                </Alert>
              )}

              {/* Step 1: Business Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="step-number">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Business Information</h2>
                      <p className="text-neutral-500">Tell us about your electrical business</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Business Name"
                      placeholder="e.g., Krishna Electricals"
                      value={formData.businessName}
                      onChange={(e) => updateField('businessName', e.target.value)}
                      error={errors.businessName}
                      required
                    />
                    <Input
                      label="Owner Name"
                      placeholder="Your full name"
                      value={formData.ownerName}
                      onChange={(e) => updateField('ownerName', e.target.value)}
                      error={errors.ownerName}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@business.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    required
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      error={errors.password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-12 text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <Input
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

              {/* Step 2: Documents */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="step-number">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Business Documents</h2>
                      <p className="text-neutral-500">Required for verification</p>
                    </div>
                  </div>

                  <Alert variant="info">
                    Your documents will be verified by our team within <strong>24-48 hours</strong>.
                    This ensures trust and quality for all platform users.
                  </Alert>

                  {/* GST Section */}
                  <div className="space-y-3">
                    <Input
                      label="GST Number"
                      placeholder="e.g., 29AABCU9603R1ZM"
                      value={formData.gstNumber}
                      onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase().slice(0, 15))}
                      error={errors.gstNumber}
                      helper="15-character GSTIN starting with state code"
                      required
                    />

                    {/* GST Document Upload */}
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">
                        GST Certificate (Optional but recommended)
                      </label>
                      <input
                        type="file"
                        ref={gstInputRef}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setGstDocument(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      {gstDocument ? (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200">
                          <File className="w-5 h-5 text-green-600" />
                          <span className="flex-1 text-sm font-medium text-green-800 truncate">
                            {gstDocument.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGstDocument(null)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => gstInputRef.current?.click()}
                          className="w-full p-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center justify-center gap-2 text-neutral-600"
                        >
                          <Upload className="w-5 h-5" />
                          <span className="font-medium">Upload GST Certificate</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PAN Section */}
                  <div className="space-y-3">
                    <Input
                      label="PAN Number"
                      placeholder="e.g., AABCU9603R"
                      value={formData.panNumber}
                      onChange={(e) => updateField('panNumber', e.target.value.toUpperCase().slice(0, 10))}
                      error={errors.panNumber}
                      helper="10-character PAN of business or proprietor"
                      required
                    />

                    {/* PAN Document Upload */}
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">
                        PAN Card Copy (Optional but recommended)
                      </label>
                      <input
                        type="file"
                        ref={panInputRef}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setPanDocument(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      {panDocument ? (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200">
                          <File className="w-5 h-5 text-green-600" />
                          <span className="flex-1 text-sm font-medium text-green-800 truncate">
                            {panDocument.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPanDocument(null)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => panInputRef.current?.click()}
                          className="w-full p-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center justify-center gap-2 text-neutral-600"
                        >
                          <Upload className="w-5 h-5" />
                          <span className="font-medium">Upload PAN Card</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shop License Upload */}
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                      Shop License / Trade License (Optional)
                    </label>
                    <input
                      type="file"
                      ref={licenseInputRef}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setShopLicense(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {shopLicense ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200">
                        <File className="w-5 h-5 text-green-600" />
                        <span className="flex-1 text-sm font-medium text-green-800 truncate">
                          {shopLicense.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShopLicense(null)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => licenseInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center justify-center gap-2 text-neutral-600"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">Upload Shop License</span>
                      </button>
                    )}
                    <p className="mt-2 text-xs text-neutral-500">
                      Accepted formats: PDF, JPG, PNG (max 5MB)
                    </p>
                  </div>

                  <div className="bg-primary-50 border-2 border-primary-200 p-6">
                    <h3 className="font-bold text-neutral-900 mb-3">Why We Need These</h3>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                        <span>Verify you're a legitimate electrical business</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                        <span>Build trust with buyers on the platform</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                        <span>Enable GST invoicing for B2B transactions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="step-number">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Location Details</h2>
                      <p className="text-neutral-500">Where is your shop located?</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
                      Shop Address <span className="text-error-500">*</span>
                    </label>
                    <textarea
                      className={`block w-full border-2 px-4 py-4 text-base font-medium transition-all duration-200 ${
                        errors.shopAddress
                          ? 'border-error-500 focus:border-error-600 bg-error-50'
                          : 'border-neutral-300 focus:border-neutral-900'
                      } focus:outline-none focus:ring-0`}
                      rows={3}
                      placeholder="Complete shop address with landmark"
                      value={formData.shopAddress}
                      onChange={(e) => updateField('shopAddress', e.target.value)}
                    />
                    {errors.shopAddress && <p className="mt-2 text-sm font-medium text-error-600">{errors.shopAddress}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="City"
                      placeholder="e.g., Mumbai"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      error={errors.city}
                      required
                    />

                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
                        State <span className="text-error-500">*</span>
                      </label>
                      <select
                        className={`block w-full border-2 px-4 py-4 text-base font-medium transition-all duration-200 ${
                          errors.state
                            ? 'border-error-500 focus:border-error-600 bg-error-50'
                            : 'border-neutral-300 focus:border-neutral-900'
                        } focus:outline-none focus:ring-0`}
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                      >
                        <option value="">Select state</option>
                        {STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && <p className="mt-2 text-sm font-medium text-error-600">{errors.state}</p>}
                    </div>
                  </div>

                  <Input
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

              {/* Step 4: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="step-number bg-success-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Review & Submit</h2>
                      <p className="text-neutral-500">Verify your details before submitting</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-neutral-200 p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 flex items-center uppercase tracking-wide text-sm">
                        <Building2 className="w-4 h-4 mr-2" />
                        Business Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500 block">Business Name</span>
                          <p className="font-bold text-neutral-900">{formData.businessName}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Owner</span>
                          <p className="font-bold text-neutral-900">{formData.ownerName}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Email</span>
                          <p className="font-bold text-neutral-900">{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Phone</span>
                          <p className="font-bold text-neutral-900">{formData.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-neutral-200 p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 flex items-center uppercase tracking-wide text-sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Documents
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500 block">GST Number</span>
                          <p className="font-bold text-neutral-900 font-mono">{formData.gstNumber}</p>
                          {gstDocument && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" /> Certificate uploaded
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-neutral-500 block">PAN Number</span>
                          <p className="font-bold text-neutral-900 font-mono">{formData.panNumber}</p>
                          {panDocument && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" /> Card uploaded
                            </span>
                          )}
                        </div>
                      </div>
                      {shopLicense && (
                        <div className="mt-4 pt-4 border-t border-neutral-200">
                          <span className="text-neutral-500 block text-sm">Shop License</span>
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" /> {shopLicense.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-2 border-neutral-200 p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 flex items-center uppercase tracking-wide text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location
                      </h3>
                      <div className="text-sm">
                        <p className="font-bold text-neutral-900">{formData.shopAddress}</p>
                        <p className="text-neutral-600">{formData.city}, {formData.state} - {formData.pincode}</p>
                      </div>
                    </div>
                  </div>

                  <Alert variant="info">
                    By submitting, you agree to our <Link to="/terms" className="font-bold underline">Terms of Service</Link> and
                    confirm that all information provided is accurate and verifiable.
                  </Alert>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-8 border-t-2 border-neutral-200">
                {currentStep > 0 ? (
                  <Button variant="ghost" onClick={handleBack}>
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back
                  </Button>
                ) : (
                  <Link to="/dealer/login" className="text-neutral-600 hover:text-neutral-900 font-bold text-sm uppercase tracking-wide">
                    Already registered? Sign in
                  </Link>
                )}

                {currentStep < 3 ? (
                  <Button onClick={handleNext} variant="primary" size="lg">
                    Continue
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} isLoading={isLoading} variant="accent" size="lg">
                    Submit Registration
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-neutral-900 text-white p-8 mb-6">
                <h3 className="text-xl font-bold mb-6">Why Join Hub4Estate?</h3>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-5 h-5 text-accent-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                        <p className="text-sm text-neutral-400">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-neutral-200 p-6">
                <h4 className="font-bold text-neutral-900 mb-4">Need Help?</h4>
                <p className="text-sm text-neutral-600 mb-4">
                  Our team is available to assist with your registration.
                </p>
                <a href="tel:+917690001999" className="btn-secondary w-full text-center">
                  Call: +91 76900 01999
                </a>
                <a href="mailto:shresth.agarwal@hub4estate.com" className="text-sm text-neutral-600 block text-center mt-3 hover:text-neutral-900">
                  shresth.agarwal@hub4estate.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Registration Success Page
export function DealerRegistrationSuccess() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="w-24 h-24 bg-success-600 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black text-neutral-900 mb-4">
          Registration Submitted!
        </h1>
        <p className="text-xl text-neutral-600 mb-8">
          Our team will verify your documents and activate your account within <span className="font-bold text-neutral-900">24-48 hours</span>.
        </p>

        <div className="bg-neutral-900 text-white p-8 mb-8 text-left">
          <h3 className="font-bold text-lg mb-4">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span className="text-neutral-300">We verify your GST and PAN details</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span className="text-neutral-300">You receive an email with login credentials</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span className="text-neutral-300">Complete your profile with brands & service areas</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <span className="text-neutral-300">Start receiving RFQs from verified buyers</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dealer/registration-status" className="btn-primary inline-flex">
            Check Registration Status
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/" className="btn-secondary inline-flex">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
