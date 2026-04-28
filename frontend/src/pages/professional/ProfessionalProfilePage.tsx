import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { professionalApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Briefcase, MapPin, Globe, Calendar, FileText, Upload,
  X, Edit3, Check, ChevronLeft, Image as ImageIcon,
  ShieldCheck, Clock, AlertCircle, CheckCircle2, Loader2,
  ExternalLink, Trash2, Eye,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_BACKEND_API_URL || '/api').replace(/\/api$/, '');

const ROLE_LABELS: Record<string, string> = {
  ARCHITECT: 'Architect',
  INTERIOR_DESIGNER: 'Interior Designer',
  CONTRACTOR: 'Contractor',
  ELECTRICIAN: 'Electrician',
  SMALL_BUILDER: 'Builder',
  DEVELOPER: 'Real Estate Developer',
  INDIVIDUAL_HOME_BUILDER: 'Home Builder',
  RENOVATION_HOMEOWNER: 'Renovation / Homeowner',
};

const VERIF_STATUS = {
  NOT_APPLIED: {
    label: 'Not verified',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: AlertCircle,
  },
  PENDING_DOCUMENTS: {
    label: 'Documents needed',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: FileText,
  },
  UNDER_REVIEW: {
    label: 'Under review',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Clock,
  },
  VERIFIED: {
    label: 'Verified',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
  },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  primary: 'Primary Document',
  additional: 'Additional Document',
  portfolio: 'Portfolio',
};

interface ProfDocument {
  id: string;
  docType: string;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
}

interface ProfProfile {
  id: string;
  businessName: string | null;
  registrationNo: string | null;
  websiteUrl: string | null;
  bio: string | null;
  officeAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  yearsExperience: number | null;
  documents: ProfDocument[];
}

interface UserData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  city: string | null;
  profVerificationStatus: string;
}

function imgUrl(url: string) {
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in">
      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
      {msg}
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ProfessionalProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfProfile | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Edit state
  const [editMode, setEditMode] = useState<'none' | 'about' | 'contact'>('none');
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Upload state
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    professionalApi.getProfile()
      .then(res => {
        setProfile(res.data.profile);
        setUserData(res.data.user);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const startEdit = (section: 'about' | 'contact') => {
    setEditMode(section);
    if (section === 'about') {
      setEditData({
        businessName: profile?.businessName || '',
        registrationNo: profile?.registrationNo || '',
        bio: profile?.bio || '',
        yearsExperience: profile?.yearsExperience?.toString() || '',
        websiteUrl: profile?.websiteUrl || '',
      });
    } else {
      setEditData({
        city: profile?.city || userData?.city || '',
        state: profile?.state || '',
        pincode: profile?.pincode || '',
        officeAddress: profile?.officeAddress || '',
      });
    }
  };

  const cancelEdit = () => {
    setEditMode('none');
    setEditData({});
  };

  const saveEdit = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = { ...editData };
      if (editData.yearsExperience) payload.yearsExperience = parseInt(editData.yearsExperience) || null;
      const res = await professionalApi.updateProfile(payload);
      setProfile(res.data.profile);
      setEditMode('none');
      showToast('Profile updated');
    } catch {
      showToast('Failed to save — try again');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePortfolioUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Only image files allowed for portfolio');
      return;
    }
    setUploadingPortfolio(true);
    try {
      const res = await professionalApi.uploadPortfolio(file);
      setProfile(prev => prev ? { ...prev, documents: [...prev.documents, res.data.doc] } : prev);
      showToast('Portfolio image uploaded');
    } catch {
      showToast('Upload failed — try again');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await professionalApi.deleteDocument(docId);
      setProfile(prev => prev
        ? { ...prev, documents: prev.documents.filter(d => d.id !== docId) }
        : prev
      );
      showToast('Document removed');
    } catch {
      showToast('Failed to remove document');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const verifKey = (userData?.profVerificationStatus || 'NOT_APPLIED') as keyof typeof VERIF_STATUS;
  const verif = VERIF_STATUS[verifKey] || VERIF_STATUS.NOT_APPLIED;
  const VerifIcon = verif.icon;
  const roleLabel = ROLE_LABELS[userData?.role || ''] || userData?.role || 'Professional';

  const portfolioDocs = profile?.documents.filter(d => d.docType === 'portfolio') || [];
  const verificationDocs = profile?.documents.filter(d => d.docType !== 'portfolio') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/pro" className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {profile?.businessName || userData?.name || 'My Profile'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{roleLabel}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${verif.bg} ${verif.border} ${verif.color}`}>
            <VerifIcon className="w-3.5 h-3.5" />
            {verif.label}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Verification call-to-action if not verified */}
        {verifKey === 'NOT_APPLIED' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-amber-900">Get verified to unlock priority matching</p>
              <p className="text-xs text-amber-700 mt-0.5">Upload your credentials and get a verified badge visible to buyers.</p>
            </div>
            <Link
              to="/pro/onboarding"
              className="flex-shrink-0 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Get verified
            </Link>
          </div>
        )}

        {verifKey === 'REJECTED' && profile && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-medium text-red-900">Verification rejected</p>
            <p className="text-xs text-red-700 mt-1">Please re-submit with the correct documents. Contact support if you need help.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">

            {/* About section */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">About</h2>
                </div>
                {editMode !== 'about' && (
                  <button
                    onClick={() => startEdit('about')}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              <div className="p-5">
                {editMode === 'about' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Business / Firm name</label>
                      <input
                        value={editData.businessName || ''}
                        onChange={e => setEditData(p => ({ ...p, businessName: e.target.value }))}
                        placeholder="e.g. Sharma Architects"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Registration / License no.</label>
                      <input
                        value={editData.registrationNo || ''}
                        onChange={e => setEditData(p => ({ ...p, registrationNo: e.target.value }))}
                        placeholder="e.g. COA-RJ-12345"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio / Description</label>
                      <textarea
                        value={editData.bio || ''}
                        onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                        rows={4}
                        placeholder="Describe your work, specializations, and experience..."
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Years of experience</label>
                        <input
                          type="number"
                          value={editData.yearsExperience || ''}
                          onChange={e => setEditData(p => ({ ...p, yearsExperience: e.target.value }))}
                          placeholder="e.g. 8"
                          min={0}
                          max={60}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Website</label>
                        <input
                          value={editData.websiteUrl || ''}
                          onChange={e => setEditData(p => ({ ...p, websiteUrl: e.target.value }))}
                          placeholder="https://yoursite.com"
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={saveEdit}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.bio ? (
                      <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No bio added yet. Click Edit to describe your work.</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      {profile?.businessName && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Firm / Business</p>
                          <p className="text-sm font-medium text-gray-900">{profile.businessName}</p>
                        </div>
                      )}
                      {profile?.registrationNo && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Registration no.</p>
                          <p className="text-sm font-medium text-gray-900">{profile.registrationNo}</p>
                        </div>
                      )}
                      {profile?.yearsExperience != null && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700">{profile.yearsExperience} years experience</span>
                        </div>
                      )}
                      {profile?.websiteUrl && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <a
                            href={profile.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Website <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {!profile?.businessName && !profile?.bio && !profile?.yearsExperience && (
                      <button
                        onClick={() => startEdit('about')}
                        className="mt-1 text-sm text-amber-700 hover:text-amber-800 font-medium"
                      >
                        + Add your professional details
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location section */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Location</h2>
                </div>
                {editMode !== 'contact' && (
                  <button
                    onClick={() => startEdit('contact')}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              <div className="p-5">
                {editMode === 'contact' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Office address</label>
                      <input
                        value={editData.officeAddress || ''}
                        onChange={e => setEditData(p => ({ ...p, officeAddress: e.target.value }))}
                        placeholder="Full office address"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                        <input
                          value={editData.city || ''}
                          onChange={e => setEditData(p => ({ ...p, city: e.target.value }))}
                          placeholder="City"
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
                        <input
                          value={editData.state || ''}
                          onChange={e => setEditData(p => ({ ...p, state: e.target.value }))}
                          placeholder="State"
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Pincode</label>
                        <input
                          value={editData.pincode || ''}
                          onChange={e => setEditData(p => ({ ...p, pincode: e.target.value }))}
                          placeholder="6 digits"
                          maxLength={6}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={saveEdit}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save
                      </button>
                      <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(profile?.city || profile?.state) ? (
                      <>
                        {profile?.officeAddress && (
                          <p className="text-sm text-gray-700">{profile.officeAddress}</p>
                        )}
                        <p className="text-sm text-gray-700">
                          {[profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(', ')}
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 italic">No location added</p>
                        <button onClick={() => startEdit('contact')} className="text-sm text-amber-700 hover:text-amber-800 font-medium">
                          + Add location
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Portfolio Gallery */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Portfolio</h2>
                  {portfolioDocs.length > 0 && (
                    <span className="text-xs text-gray-400 font-normal">{portfolioDocs.length} image{portfolioDocs.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  disabled={uploadingPortfolio}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploadingPortfolio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Add photo
                </button>
                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handlePortfolioUpload(e.target.files[0]); e.target.value = ''; }}
                />
              </div>

              <div className="p-5">
                {portfolioDocs.length === 0 ? (
                  <button
                    onClick={() => portfolioInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <Upload className="w-6 h-6 text-gray-300 group-hover:text-gray-400 transition-colors" />
                    <p className="text-sm text-gray-400">Upload project photos, completed work, or portfolio images</p>
                    <p className="text-xs text-gray-300">JPG, PNG supported</p>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolioDocs.map((doc) => (
                      <div key={doc.id} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square bg-gray-50">
                        <img
                          src={imgUrl(doc.fileUrl)}
                          alt={doc.fileName || 'Portfolio'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a
                            href={imgUrl(doc.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-white" />
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-500/70 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Add more slot */}
                    <button
                      onClick={() => portfolioInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <Upload className="w-5 h-5 text-gray-300" />
                      <span className="text-xs text-gray-400">Add more</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Verification status card */}
            <div className={`rounded-xl border p-5 ${verif.bg} ${verif.border}`}>
              <div className="flex items-center gap-2 mb-3">
                <VerifIcon className={`w-4 h-4 ${verif.color}`} />
                <h3 className={`text-sm font-semibold ${verif.color}`}>{verif.label}</h3>
              </div>
              {verifKey === 'NOT_APPLIED' && (
                <p className="text-xs text-gray-600 mb-3">Submit your credentials to get a verified badge that builds buyer trust.</p>
              )}
              {verifKey === 'UNDER_REVIEW' && (
                <p className="text-xs text-gray-600">Documents submitted. Our team will review within 1–2 business days.</p>
              )}
              {verifKey === 'VERIFIED' && (
                <p className="text-xs text-green-700">You're verified. Your badge is visible to all buyers on the platform.</p>
              )}
              {(verifKey === 'NOT_APPLIED' || verifKey === 'REJECTED') && (
                <Link
                  to="/pro/onboarding"
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Apply for verification
                </Link>
              )}
            </div>

            {/* Verification Documents */}
            {verificationDocs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
                </div>
                <div className="p-4 space-y-2">
                  {verificationDocs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {doc.fileName || DOC_TYPE_LABELS[doc.docType] || doc.docType}
                        </p>
                        <p className="text-xs text-gray-400">{DOC_TYPE_LABELS[doc.docType] || doc.docType}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={imgUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
              <Link
                to="/pro"
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <Briefcase className="w-4 h-4 text-gray-400" /> Dashboard
              </Link>
              <Link
                to="/rfq/create"
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <FileText className="w-4 h-4 text-gray-400" /> Submit RFQ
              </Link>
            </div>

          </div>
        </div>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
