import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  Zap, CheckCircle, ArrowRight, ArrowLeft, Upload, X, Briefcase,
  MapPin, Calendar, FileText, ShieldCheck,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'ARCHITECT', label: 'Architect', desc: 'Licensed architecture professional', docLabel: 'COA Registration Certificate' },
  { value: 'INTERIOR_DESIGNER', label: 'Interior Designer', desc: 'Interior design professional or firm', docLabel: 'Professional membership or degree certificate' },
  { value: 'CONTRACTOR', label: 'Contractor', desc: 'Construction or MEP contractor', docLabel: 'Contractor license / GST certificate' },
  { value: 'ELECTRICIAN', label: 'Electrician', desc: 'Licensed electrical contractor', docLabel: 'Electrical license / ITI certificate' },
  { value: 'SMALL_BUILDER', label: 'Builder', desc: 'Small to mid-scale residential builder', docLabel: 'Business registration / GST certificate' },
  { value: 'DEVELOPER', label: 'Real Estate Developer', desc: 'Property development firm or promoter', docLabel: 'Company registration / RERA certificate' },
];

interface FormData {
  role: string;
  businessName: string;
  registrationNo: string;
  city: string;
  state: string;
  yearsExperience: string;
  websiteUrl: string;
  bio: string;
  document: File | null;
  additionalDoc: File | null;
}

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export function ProfessionalOnboarding() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormData>({
    role: user?.role || '',
    businessName: '',
    registrationNo: '',
    city: user?.city || '',
    state: '',
    yearsExperience: '',
    websiteUrl: '',
    bio: '',
    document: null,
    additionalDoc: null,
  });

  const totalSteps = 4;
  const selectedRole = ROLE_OPTIONS.find(r => r.value === form.role);

  const updateForm = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return !!form.role;
    if (step === 2) return !!form.businessName.trim() && !!form.city.trim() && !!form.state;
    if (step === 3) return !!form.document;
    return true;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('role', form.role);
      data.append('businessName', form.businessName);
      data.append('registrationNo', form.registrationNo);
      data.append('city', form.city);
      data.append('state', form.state);
      data.append('yearsExperience', form.yearsExperience);
      data.append('websiteUrl', form.websiteUrl);
      data.append('bio', form.bio);
      if (form.document) data.append('document', form.document);
      if (form.additionalDoc) data.append('additionalDoc', form.additionalDoc);

      await api.post('/professional/onboarding', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setTimeout(() => navigate('/pro'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application submitted</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We'll review your documents within 24 hours. Once approved, your verified badge will appear on all your RFQs.
          </p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[400px] bg-gray-950 flex-col justify-between p-12 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-600 flex items-center justify-center rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold text-white block leading-tight">Hub4Estate</span>
            <span className="text-[10px] text-amber-500 font-medium">Professional Portal</span>
          </div>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-white leading-snug">
              Get your verified badge. Build trust with dealers.
            </h1>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Dealers see your verification badge on every RFQ you post. It signals that you're a professional — leading to faster responses, better prices, and long-term relationships.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">What changes after verification</p>
            {[
              'Verified badge shown on every RFQ',
              'Dealers recognize you as a professional buyer',
              'Better pricing and priority responses',
              'Build a public professional profile',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                <p className="text-sm text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">hub4estate.com · Bengaluru, India</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md pt-4">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-gray-900 flex items-center justify-center rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Hub4Estate</span>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Step {step} of {totalSteps}</p>
              <p className="text-xs text-gray-400">{Math.round((step / totalSteps) * 100)}% complete</p>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">What best describes you?</h2>
              <p className="text-sm text-gray-500 mb-6">Choose the role that matches your profession.</p>

              <div className="space-y-2">
                {ROLE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateForm('role', option.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      form.role === option.value
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                      form.role === option.value ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                    }`}>
                      {form.role === option.value && (
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-400">{option.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Business details */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Your practice details</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us about your business or practice.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Briefcase className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                    Business / Practice name *
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={e => updateForm('businessName', e.target.value)}
                    placeholder="e.g. Sharma Architects"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FileText className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                    {selectedRole ? selectedRole.docLabel.replace('Certificate', 'No.').replace(' certificate', ' no.') : 'Registration no.'} (optional)
                  </label>
                  <input
                    type="text"
                    value={form.registrationNo}
                    onChange={e => updateForm('registrationNo', e.target.value)}
                    placeholder="e.g. COA/RJ/12345"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                      City *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => updateForm('city', e.target.value)}
                      placeholder="Jaipur"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                    <select
                      value={form.state}
                      onChange={e => updateForm('state', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors bg-white"
                    >
                      <option value="">Select</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                    Years of experience
                  </label>
                  <select
                    value={form.yearsExperience}
                    onChange={e => updateForm('yearsExperience', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors bg-white"
                  >
                    <option value="">Select</option>
                    {['0-2', '3-5', '6-10', '11-20', '20+'].map(v => <option key={v} value={v}>{v} years</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Short bio (optional)</label>
                  <textarea
                    value={form.bio}
                    onChange={e => updateForm('bio', e.target.value)}
                    placeholder="Tell dealers and buyers a bit about your work..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document upload */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Upload credentials</h2>
              <p className="text-sm text-gray-500 mb-2">
                We verify your documents within 24 hours.
              </p>
              {selectedRole && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-700">Required for {selectedRole.label}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{selectedRole.docLabel}</p>
                </div>
              )}

              <div className="space-y-4">
                <FileUploadField
                  label={selectedRole?.docLabel || 'Primary document'} required
                  file={form.document}
                  onFile={f => updateForm('document', f)}
                />
                <FileUploadField
                  label="Additional document (optional)"
                  file={form.additionalDoc}
                  onFile={f => updateForm('additionalDoc', f)}
                />
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Accepted: PDF, JPG, PNG. Max 10MB per file.
              </p>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Review and submit</h2>
              <p className="text-sm text-gray-500 mb-6">Everything looks good? Submit to start the verification process.</p>

              <div className="space-y-3 mb-6">
                <ReviewRow label="Role" value={selectedRole?.label || form.role} />
                <ReviewRow label="Business name" value={form.businessName} />
                <ReviewRow label="City" value={`${form.city}, ${form.state}`} />
                {form.registrationNo && <ReviewRow label="Registration no." value={form.registrationNo} />}
                {form.yearsExperience && <ReviewRow label="Experience" value={`${form.yearsExperience} years`} />}
                <ReviewRow label="Primary document" value={form.document?.name || '—'} />
                {form.additionalDoc && <ReviewRow label="Additional doc" value={form.additionalDoc.name} />}
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Verification timeline</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Documents reviewed within 24 hours on business days. You'll receive a notification once approved.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                Skip for now
              </Link>
            )}

            {step < totalSteps ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit for verification
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileUploadField({
  label, required = false, file, onFile,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {file ? (
        <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
          <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 flex-1 truncate">{file.name}</p>
          <button onClick={() => onFile(null)} className="text-green-600 hover:text-green-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
