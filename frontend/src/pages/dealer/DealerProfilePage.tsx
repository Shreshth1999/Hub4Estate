import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dealerApi, productsApi } from '../../lib/api';
import {
  ArrowLeft, Upload, FileText, Trash2, CheckCircle, X,
  Building2, Phone, Mail, MapPin, Award, Shield, Plus, Clock,
  AlertCircle, Loader2, Edit3, Save, Image, Star, Globe,
  Camera, Package, Calendar,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

interface DealerProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  dealerType?: string;
  yearsInOperation?: number;
  establishedYear?: number;
  description?: string;
  certifications?: string[];
  website?: string;
  shopPhoto?: string;
  shopImages?: string[];
  gstDocument?: string;
  panDocument?: string;
  shopLicense?: string;
  brandMappings: Array<{ id: string; brand: { id: string; name: string; logo?: string }; isVerified: boolean }>;
  categoryMappings: Array<{ id: string; category: { id: string; name: string; slug: string } }>;
  serviceAreas: Array<{ id: string; pincode: string }>;
  totalRFQs?: number;
  quotesSubmitted?: number;
  quotesWon?: number;
}

interface Category { id: string; name: string; slug: string }
interface Brand { id: string; name: string; logo?: string }

const STATUS_CONFIG: Record<string, { dot: string; color: string; bg: string; label: string }> = {
  VERIFIED:             { dot: 'bg-green-400', color: 'text-green-700', bg: 'bg-green-50 border-green-200', label: 'Verified' },
  PENDING_VERIFICATION: { dot: 'bg-amber-400', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Pending Verification' },
  DOCUMENTS_PENDING:    { dot: 'bg-amber-500', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200', label: 'Documents Required' },
  UNDER_REVIEW:         { dot: 'bg-blue-400',  color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200',  label: 'Under Review' },
};

const ALL_BRANDS = [
  'Havells', 'Polycab', 'Legrand', 'Schneider Electric', 'L&T', 'Anchor by Panasonic',
  'GM Modular', 'Finolex', 'V-Guard', 'Crompton', 'Syska', 'Philips', 'ABB', 'Siemens',
  'KEI Industries', 'RR Kabel', 'Hager', 'Luminous', 'Bajaj Electricals', 'Orient Electric',
  'Wipro Lighting', 'Goldmedal', 'Sterlite Power', 'CONA', 'Fybros',
];

export function DealerProfilePage() {
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands] = useState<Brand[]>(ALL_BRANDS.map((n, i) => ({ id: String(i + 1), name: n })));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState<'none' | 'about' | 'contact'>('none');
  const [editData, setEditData] = useState<Partial<DealerProfile>>({});
  const [saving, setSaving] = useState(false);

  // Documents
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const gstRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);

  // Shop images
  const [uploadingImg, setUploadingImg] = useState(false);
  const shopImgRef = useRef<HTMLInputElement>(null);

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [savingCategories, setSavingCategories] = useState(false);
  const [savingBrands, setSavingBrands] = useState(false);

  // Service areas
  const [newPincode, setNewPincode] = useState('');
  const [addingArea, setAddingArea] = useState(false);

  // Certifications
  const [newCert, setNewCert] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, categoriesRes] = await Promise.all([
        dealerApi.getProfile(),
        productsApi.getCategories(),
      ]);
      setProfile(profileRes.data);
      setCategories(categoriesRes.data.categories || []);
      setSelectedCategories(new Set<string>(profileRes.data.categoryMappings?.map((m: any) => m.category.id) || []));
      setSelectedBrands(new Set<string>(profileRes.data.brandMappings?.map((m: any) => m.brand.name) || []));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const startEdit = (mode: 'about' | 'contact') => {
    setEditData({
      description: profile?.description || '',
      establishedYear: profile?.establishedYear,
      website: profile?.website || '',
      businessName: profile?.businessName || '',
      ownerName: profile?.ownerName || '',
      phone: profile?.phone || '',
      shopAddress: profile?.shopAddress || '',
      city: profile?.city || '',
      state: profile?.state || '',
      pincode: profile?.pincode || '',
    });
    setEditMode(mode);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await dealerApi.updateProfile(editData);
      await fetchData();
      setEditMode('none');
      showSuccess('Profile updated');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    setUploadingDoc(documentType);
    setUploadError(null);
    try {
      const response = await dealerApi.uploadDocument(documentType, file);
      setProfile(prev => prev ? { ...prev, [documentType]: response.data.url, status: response.data.dealer.status } : null);
      showSuccess('Document uploaded successfully');
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDeleteDocument = async (documentType: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await dealerApi.deleteDocument(documentType);
      setProfile(prev => prev ? { ...prev, [documentType]: null } : null);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleShopImageUpload = async (file: File) => {
    setUploadingImg(true);
    try {
      const res = await dealerApi.uploadShopImage(file);
      setProfile(prev => prev ? { ...prev, shopImages: res.data.shopImages } : null);
      showSuccess('Photo added');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleDeleteShopImage = async (index: number) => {
    try {
      const res = await dealerApi.deleteShopImage(index);
      setProfile(prev => prev ? { ...prev, shopImages: res.data.shopImages } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const saveCategories = async () => {
    setSavingCategories(true);
    try {
      const currentIds = new Set(profile?.categoryMappings?.map(m => m.category.id) || []);
      for (const id of selectedCategories) {
        if (!currentIds.has(id)) await dealerApi.addCategory({ categoryId: id });
      }
      await fetchData();
      setShowCategoryModal(false);
      showSuccess('Categories saved');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save categories');
    } finally {
      setSavingCategories(false);
    }
  };

  const saveBrands = async () => {
    setSavingBrands(true);
    try {
      const currentNames = new Set(profile?.brandMappings?.map(m => m.brand.name) || []);
      for (const name of selectedBrands) {
        if (!currentNames.has(name)) {
          const brand = brands.find(b => b.name === name);
          if (brand) await dealerApi.addBrand({ brandId: brand.id });
        }
      }
      await fetchData();
      setShowBrandModal(false);
      showSuccess('Brands saved');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save brands');
    } finally {
      setSavingBrands(false);
    }
  };

  const addServiceArea = async () => {
    if (newPincode.length !== 6) return;
    setAddingArea(true);
    try {
      await dealerApi.addServiceArea({ pincode: newPincode });
      setNewPincode('');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add service area');
    } finally {
      setAddingArea(false);
    }
  };

  const saveCertification = async () => {
    if (!newCert.trim()) return;
    const updated = [...(profile?.certifications || []), newCert.trim()];
    try {
      await dealerApi.updateProfile({ certifications: updated });
      setProfile(prev => prev ? { ...prev, certifications: updated } : null);
      setNewCert('');
      showSuccess('Certification added');
    } catch (err: any) {
      setError('Failed to save');
    }
  };

  const removeCertification = async (index: number) => {
    const updated = (profile?.certifications || []).filter((_, i) => i !== index);
    try {
      await dealerApi.updateProfile({ certifications: updated });
      setProfile(prev => prev ? { ...prev, certifications: updated } : null);
    } catch {
      setError('Failed to remove');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const s = STATUS_CONFIG[profile?.status || ''] || { dot: 'bg-gray-300', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', label: 'Processing' };
  const isPending = profile?.status && ['PENDING_VERIFICATION', 'DOCUMENTS_PENDING', 'UNDER_REVIEW'].includes(profile.status);
  const shopImages = profile?.shopImages || [];
  const imgUrl = (p: string) => p.startsWith('http') ? p : `${API_BASE}${p}`;

  // Profile completion percentage
  const completionChecks = [
    { label: 'Business name', done: !!profile?.businessName },
    { label: 'GST number', done: !!profile?.gstNumber },
    { label: 'Shop address', done: !!profile?.shopAddress },
    { label: 'Description', done: !!profile?.description },
    { label: 'Shop photos', done: (profile?.shopImages || []).length > 0 },
    { label: 'Brands added', done: (profile?.brandMappings || []).length > 0 },
    { label: 'Categories set', done: (profile?.categoryMappings || []).length > 0 },
    { label: 'Service areas', done: (profile?.serviceAreas || []).length > 0 },
    { label: 'GST document', done: !!profile?.gstDocument },
    { label: 'PAN document', done: !!profile?.panDocument },
  ];
  const completedCount = completionChecks.filter(c => c.done).length;
  const completionPct = Math.round((completedCount / completionChecks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toasts */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg animate-slide-up">
          <CheckCircle className="w-4 h-4 text-green-400" /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <Link to="/dealer" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium mb-2 ${s.bg} ${s.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{profile?.businessName}</h1>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {profile?.city}, {profile?.state}
            </p>
          </div>
          {/* Profile completion indicator in header */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${completionPct === 100 ? 'bg-green-500' : completionPct >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className={`text-sm font-semibold ${completionPct === 100 ? 'text-green-600' : completionPct >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                {completionPct}%
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Profile Complete</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Profile Completion Banner */}
        {completionPct < 100 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-900">Profile Completion - {completionPct}%</p>
              <span className="text-xs text-gray-400">{completedCount}/{completionChecks.length} items</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full transition-all ${completionPct >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {completionChecks.filter(c => !c.done).map(c => (
                <span key={c.label} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 mb-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {isPending && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Complete Your Profile</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {profile?.status === 'DOCUMENTS_PENDING'
                  ? 'Please upload your GST certificate and PAN card to complete verification.'
                  : 'Your application is under review. Add shop photos, brands and service areas while you wait.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Column ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Shop Photos */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-3.5 h-3.5 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Shop Photos</h2>
                  <span className="text-xs text-gray-400">({shopImages.length}/6)</span>
                </div>
                {shopImages.length < 6 && (
                  <button
                    onClick={() => shopImgRef.current?.click()}
                    disabled={uploadingImg}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    {uploadingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Add Photo
                  </button>
                )}
              </div>
              <input
                ref={shopImgRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleShopImageUpload(file);
                  if (shopImgRef.current) shopImgRef.current.value = '';
                }}
              />
              <div className="p-4">
                {shopImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {shopImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
                        <img src={imgUrl(img)} alt={`Shop ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeleteShopImage(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-gray-900/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {shopImages.length < 6 && (
                      <button
                        onClick={() => shopImgRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center gap-1 transition-colors"
                      >
                        <Camera className="w-5 h-5 text-gray-300" />
                        <span className="text-xs text-gray-400">Add</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => shopImgRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">Add shop photos</p>
                    <p className="text-xs text-gray-400">Shop, warehouse, products, team — up to 6 photos</p>
                  </button>
                )}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">About the Shop</h2>
                </div>
                {editMode !== 'about' ? (
                  <button
                    onClick={() => startEdit('about')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditMode('none')} className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                {editMode === 'about' ? (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">About your shop</label>
                      <textarea
                        value={editData.description || ''}
                        onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                        placeholder="Describe your shop, expertise, what you specialize in, years of experience..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Established Year</label>
                        <input
                          type="number"
                          value={editData.establishedYear || ''}
                          onChange={e => setEditData(d => ({ ...d, establishedYear: parseInt(e.target.value) }))}
                          placeholder="e.g. 2005"
                          min="1900" max="2026"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Website (optional)</label>
                        <input
                          type="url"
                          value={editData.website || ''}
                          onChange={e => setEditData(d => ({ ...d, website: e.target.value }))}
                          placeholder="https://yourshop.com"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {profile?.description ? (
                      <p className="text-sm text-gray-700 leading-relaxed">{profile.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Add a description of your shop to build trust with buyers.</p>
                    )}
                    <div className="flex flex-wrap gap-4 pt-1">
                      {profile?.establishedYear && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Est. {profile.establishedYear}
                        </div>
                      )}
                      {profile?.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700">
                          <Globe className="w-3.5 h-3.5" />
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Contact & Location</h2>
                </div>
                {editMode !== 'contact' ? (
                  <button
                    onClick={() => startEdit('contact')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditMode('none')} className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
                {editMode === 'contact' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Business Name</label>
                        <input value={editData.businessName || ''} onChange={e => setEditData(d => ({ ...d, businessName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Owner Name</label>
                        <input value={editData.ownerName || ''} onChange={e => setEditData(d => ({ ...d, ownerName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phone</label>
                      <input value={editData.phone || ''} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Shop Address</label>
                      <input value={editData.shopAddress || ''} onChange={e => setEditData(d => ({ ...d, shopAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">City</label>
                        <input value={editData.city || ''} onChange={e => setEditData(d => ({ ...d, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">State</label>
                        <input value={editData.state || ''} onChange={e => setEditData(d => ({ ...d, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pincode</label>
                        <input value={editData.pincode || ''} onChange={e => setEditData(d => ({ ...d, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Business Name', value: profile?.businessName, icon: Building2 },
                      { label: 'Owner', value: profile?.ownerName, icon: null },
                      { label: 'Phone', value: profile?.phone, icon: Phone },
                      { label: 'Email', value: profile?.email, icon: Mail },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
                          {value}
                        </p>
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 mb-0.5">Address</p>
                      <p className="text-sm font-medium text-gray-900 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        {profile?.shopAddress}, {profile?.city}, {profile?.state} — {profile?.pincode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">GST Number</p>
                      <p className="text-sm font-mono font-medium text-gray-900">{profile?.gstNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Authorized Brands */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Authorized Brands</h2>
                  {profile?.brandMappings && profile.brandMappings.length > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {profile.brandMappings.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowBrandModal(true)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="p-4">
                {profile?.brandMappings && profile.brandMappings.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.brandMappings.map(m => (
                      <div
                        key={m.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                          m.isVerified
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {m.brand.name}
                        {m.isVerified && <CheckCircle className="w-3 h-3" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No brands added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add brands you're authorized to sell</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Product Categories</h2>
                </div>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="p-4">
                {profile?.categoryMappings && profile.categoryMappings.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.categoryMappings.map(m => (
                      <span key={m.id} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 border border-gray-200">
                        {m.category.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No categories added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Documents */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">Verification Documents</h2>
              </div>
              <div className="p-4 space-y-3">
                {uploadError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {uploadError}
                    <button onClick={() => setUploadError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                <DocumentRow label="GST Certificate" required documentType="gstDocument"
                  currentUrl={profile?.gstDocument} isUploading={uploadingDoc === 'gstDocument'}
                  inputRef={gstRef} onUpload={f => handleDocumentUpload('gstDocument', f)}
                  onDelete={() => handleDeleteDocument('gstDocument')} />
                <DocumentRow label="PAN Card" required documentType="panDocument"
                  currentUrl={profile?.panDocument} isUploading={uploadingDoc === 'panDocument'}
                  inputRef={panRef} onUpload={f => handleDocumentUpload('panDocument', f)}
                  onDelete={() => handleDeleteDocument('panDocument')} />
                <DocumentRow label="Shop License" documentType="shopLicense"
                  currentUrl={profile?.shopLicense} isUploading={uploadingDoc === 'shopLicense'}
                  inputRef={licenseRef} onUpload={f => handleDocumentUpload('shopLicense', f)}
                  onDelete={() => handleDeleteDocument('shopLicense')} />
              </div>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Status Card */}
            <div className={`rounded-xl border p-4 ${s.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                <p className={`text-sm font-semibold ${s.color}`}>{s.label}</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {profile?.status === 'VERIFIED'
                  ? 'Your profile is live. You receive RFQs and can submit quotes.'
                  : 'Complete your profile to get verified and start receiving inquiries.'}
              </p>
              {profile?.status === 'VERIFIED' && (
                <div className="mt-3 pt-3 border-t border-green-200 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Quotes', value: profile.quotesSubmitted || 0 },
                    { label: 'Won', value: profile.quotesWon || 0 },
                    { label: 'RFQs', value: profile.totalRFQs || 0 },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-base font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-[10px] text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Certifications</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2 mb-3">
                  {profile?.certifications && profile.certifications.length > 0 ? (
                    profile.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-medium text-gray-700">{cert}</span>
                        </div>
                        <button onClick={() => removeCertification(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No certifications added</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Havells Certified"
                    value={newCert}
                    onChange={e => setNewCert(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveCertification()}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-400"
                  />
                  <button
                    onClick={saveCertification}
                    disabled={!newCert.trim()}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Service Areas</h3>
              </div>
              <div className="p-4">
                <div className="space-y-1.5 mb-3">
                  {profile?.serviceAreas && profile.serviceAreas.length > 0 ? (
                    profile.serviceAreas.map(area => (
                      <div key={area.id} className="flex items-center justify-between py-1">
                        <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {area.pincode}
                        </span>
                        <button
                          onClick={() => dealerApi.removeServiceArea(area.id).then(() => fetchData())}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No service areas added</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    value={newPincode}
                    onChange={e => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && addServiceArea()}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-400"
                  />
                  <button
                    onClick={addServiceArea}
                    disabled={newPincode.length !== 6 || addingArea}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-40 transition-colors"
                  >
                    {addingArea ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-700 mb-1">Need help?</p>
              <p className="text-xs text-gray-500 mb-3">Contact our dealer support.</p>
              <a href="tel:+917690001999"
                className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> +91 76900 01999
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Select Product Categories</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const s = new Set(selectedCategories);
                    s.has(cat.id) ? s.delete(cat.id) : s.add(cat.id);
                    setSelectedCategories(s);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-colors text-left ${
                    selectedCategories.has(cat.id) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span className="font-medium text-gray-900">{cat.name}</span>
                  {selectedCategories.has(cat.id) && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={saveCategories} disabled={savingCategories}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {savingCategories && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Select Authorized Brands</h3>
              <button onClick={() => setShowBrandModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-1.5">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      const s = new Set(selectedBrands);
                      s.has(brand.name) ? s.delete(brand.name) : s.add(brand.name);
                      setSelectedBrands(s);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${
                      selectedBrands.has(brand.name) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-medium text-gray-900 text-xs">{brand.name}</span>
                    {selectedBrands.has(brand.name) && <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setShowBrandModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={saveBrands} disabled={savingBrands}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {savingBrands && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentRow({
  label, required, documentType, currentUrl, isUploading, inputRef, onUpload, onDelete,
}: {
  label: string;
  required?: boolean;
  documentType: string;
  currentUrl?: string | null;
  isUploading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentUrl ? 'bg-green-50' : 'bg-gray-100'}`}>
          {currentUrl ? <CheckCircle className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4 text-gray-400" />}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {label}{required && <span className="text-red-400 ml-1">*</span>}
          </p>
          <p className="text-xs text-gray-400">{currentUrl ? 'Uploaded ✓' : 'Not yet uploaded'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); if (inputRef.current) inputRef.current.value = ''; }} className="hidden" />
        {currentUrl ? (
          <>
            <a href={currentUrl} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              View
            </a>
            <button onClick={onDelete} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {isUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</> : <><Upload className="w-3.5 h-3.5" /> Upload</>}
          </button>
        )}
      </div>
    </div>
  );
}
