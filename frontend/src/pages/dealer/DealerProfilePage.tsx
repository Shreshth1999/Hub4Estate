import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dealerApi, productsApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import {
  ArrowLeft, Upload, FileText, Trash2, CheckCircle, X,
  Building2, Phone, Mail, MapPin, Award, Shield, Plus, Clock,
  AlertCircle, Loader2
} from 'lucide-react';

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
  gstDocument?: string;
  panDocument?: string;
  shopLicense?: string;
  brandMappings: Array<{
    id: string;
    brand: { id: string; name: string; logo?: string };
    isVerified: boolean;
  }>;
  categoryMappings: Array<{
    id: string;
    category: { id: string; name: string; slug: string };
  }>;
  serviceAreas: Array<{
    id: string;
    pincode: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories?: Category[];
}

interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export function DealerProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const gstInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // Category/Brand selection
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [savingCategories, setSavingCategories] = useState(false);
  const [savingBrands, setSavingBrands] = useState(false);

  // Service area
  const [newPincode, setNewPincode] = useState('');
  const [addingArea, setAddingArea] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, categoriesRes] = await Promise.all([
        dealerApi.getProfile(),
        productsApi.getCategories(),
      ]);

      setProfile(profileRes.data);
      setCategories(categoriesRes.data.categories || []);

      // Set already selected categories
      const existingCategoryIds = new Set<string>(
        profileRes.data.categoryMappings?.map((m: any) => m.category.id as string) || []
      );
      setSelectedCategories(existingCategoryIds);

      // Set already selected brands
      const existingBrandIds = new Set<string>(
        profileRes.data.brandMappings?.map((m: any) => m.brand.id as string) || []
      );
      setSelectedBrands(existingBrandIds);

      // Fetch brands separately
      // For now using mock brands - you would fetch from API
      setBrands([
        { id: '1', name: 'Havells' },
        { id: '2', name: 'Polycab' },
        { id: '3', name: 'Legrand' },
        { id: '4', name: 'Schneider Electric' },
        { id: '5', name: 'L&T' },
        { id: '6', name: 'Anchor by Panasonic' },
        { id: '7', name: 'GM Modular' },
        { id: '8', name: 'Finolex' },
        { id: '9', name: 'V-Guard' },
        { id: '10', name: 'Crompton' },
        { id: '11', name: 'Syska' },
        { id: '12', name: 'Philips' },
        { id: '13', name: 'ABB' },
        { id: '14', name: 'Siemens' },
        { id: '15', name: 'KEI' },
      ]);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingDoc(documentType);
    setUploadError(null);

    try {
      const response = await dealerApi.uploadDocument(documentType, file);
      // Update profile with new document URL
      setProfile(prev => prev ? {
        ...prev,
        [documentType]: response.data.url,
        status: response.data.dealer.status,
      } : null);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDeleteDocument = async (documentType: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await dealerApi.deleteDocument(documentType);
      setProfile(prev => prev ? { ...prev, [documentType]: null } : null);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to delete document');
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const toggleBrand = (brandId: string) => {
    const newSelected = new Set(selectedBrands);
    if (newSelected.has(brandId)) {
      newSelected.delete(brandId);
    } else {
      newSelected.add(brandId);
    }
    setSelectedBrands(newSelected);
  };

  const saveCategories = async () => {
    setSavingCategories(true);
    try {
      // Get current category IDs
      const currentIds = new Set(profile?.categoryMappings?.map(m => m.category.id) || []);

      // Add new categories
      for (const categoryId of selectedCategories) {
        if (!currentIds.has(categoryId)) {
          await dealerApi.addCategory({ categoryId });
        }
      }

      // Refresh profile
      await fetchData();
      setShowCategoryModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save categories');
    } finally {
      setSavingCategories(false);
    }
  };

  const saveBrands = async () => {
    setSavingBrands(true);
    try {
      // Get current brand IDs
      const currentIds = new Set(profile?.brandMappings?.map(m => m.brand.id) || []);

      // Add new brands
      for (const brandId of selectedBrands) {
        if (!currentIds.has(brandId)) {
          await dealerApi.addBrand({ brandId });
        }
      }

      // Refresh profile
      await fetchData();
      setShowBrandModal(false);
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

  const removeServiceArea = async (areaId: string) => {
    try {
      await dealerApi.removeServiceArea(areaId);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove service area');
    }
  };

  const isPending = profile?.status && ['PENDING_VERIFICATION', 'DOCUMENTS_PENDING', 'UNDER_REVIEW'].includes(profile.status);

  const getStatusBadge = () => {
    switch (profile?.status) {
      case 'VERIFIED':
        return { color: 'green', icon: Shield, label: 'Verified Dealer' };
      case 'PENDING_VERIFICATION':
        return { color: 'amber', icon: Clock, label: 'Pending Verification' };
      case 'DOCUMENTS_PENDING':
        return { color: 'orange', icon: AlertCircle, label: 'Documents Required' };
      case 'UNDER_REVIEW':
        return { color: 'blue', icon: Clock, label: 'Under Review' };
      default:
        return { color: 'gray', icon: Clock, label: 'Processing' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <div className="bg-red-50 border-2 border-red-200 p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-800 font-bold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <Link to="/dealer" className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${statusBadge.color}-500 text-white text-sm font-bold uppercase tracking-wider mb-4`}>
                <StatusIcon className="w-4 h-4" />
                {statusBadge.label}
              </div>
              <h1 className="text-3xl md:text-4xl font-black">{profile?.businessName}</h1>
              <p className="text-neutral-400 mt-2">{profile?.ownerName} • {profile?.city}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Status Alert */}
            {isPending && (
              <div className="bg-amber-50 border-2 border-amber-200 p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-neutral-900">Complete Your Profile</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {profile?.status === 'DOCUMENTS_PENDING'
                        ? 'Please upload your GST certificate and PAN card to complete verification.'
                        : 'Your application is being reviewed. Add brands and service areas while you wait.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Business Details */}
            <div className="bg-white border-2 border-neutral-200 shadow-brutal">
              <div className="p-4 bg-neutral-900 text-white">
                <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Business Name</label>
                    <p className="text-lg font-bold text-neutral-900">{profile?.businessName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">GST Number</label>
                    <p className="text-lg font-bold text-neutral-900 font-mono">{profile?.gstNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />Phone
                    </label>
                    <p className="text-lg font-bold text-neutral-900">{profile?.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />Email
                    </label>
                    <p className="text-lg font-bold text-neutral-900">{profile?.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />Address
                    </label>
                    <p className="text-lg font-bold text-neutral-900">
                      {profile?.shopAddress}, {profile?.city}, {profile?.state} - {profile?.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-white border-2 border-neutral-200 shadow-brutal">
              <div className="p-4 bg-neutral-900 text-white">
                <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Verification Documents
                </h2>
              </div>
              <div className="p-6">
                {uploadError && (
                  <div className="bg-red-50 border-2 border-red-200 p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-800">{uploadError}</p>
                    <button onClick={() => setUploadError(null)} className="ml-auto"><X className="w-4 h-4 text-red-500" /></button>
                  </div>
                )}

                <div className="space-y-4">
                  {/* GST Document */}
                  <DocumentUploadRow
                    label="GST Certificate"
                    required
                    documentType="gstDocument"
                    currentUrl={profile?.gstDocument}
                    isUploading={uploadingDoc === 'gstDocument'}
                    inputRef={gstInputRef}
                    onUpload={(file) => handleDocumentUpload('gstDocument', file)}
                    onDelete={() => handleDeleteDocument('gstDocument')}
                  />

                  {/* PAN Document */}
                  <DocumentUploadRow
                    label="PAN Card"
                    required
                    documentType="panDocument"
                    currentUrl={profile?.panDocument}
                    isUploading={uploadingDoc === 'panDocument'}
                    inputRef={panInputRef}
                    onUpload={(file) => handleDocumentUpload('panDocument', file)}
                    onDelete={() => handleDeleteDocument('panDocument')}
                  />

                  {/* Shop License */}
                  <DocumentUploadRow
                    label="Shop License"
                    documentType="shopLicense"
                    currentUrl={profile?.shopLicense}
                    isUploading={uploadingDoc === 'shopLicense'}
                    inputRef={licenseInputRef}
                    onUpload={(file) => handleDocumentUpload('shopLicense', file)}
                    onDelete={() => handleDeleteDocument('shopLicense')}
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-2 border-neutral-200 shadow-brutal">
              <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
                <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Product Categories
                </h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
              <div className="p-6">
                {profile?.categoryMappings && profile.categoryMappings.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profile.categoryMappings.map((mapping) => (
                      <span
                        key={mapping.id}
                        className="px-4 py-2 bg-neutral-100 border-2 border-neutral-200 font-bold text-neutral-900"
                      >
                        {mapping.category.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">No categories added yet. Click "Add Category" to get started.</p>
                )}
              </div>
            </div>

            {/* Brands */}
            <div className="bg-white border-2 border-neutral-200 shadow-brutal">
              <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
                <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Authorized Brands
                </h2>
                <button
                  onClick={() => setShowBrandModal(true)}
                  className="text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Brand
                </button>
              </div>
              <div className="p-6">
                {profile?.brandMappings && profile.brandMappings.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profile.brandMappings.map((mapping) => (
                      <span
                        key={mapping.id}
                        className={`px-4 py-2 border-2 font-bold ${
                          mapping.isVerified
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-neutral-100 border-neutral-200 text-neutral-900'
                        }`}
                      >
                        {mapping.brand.name}
                        {mapping.isVerified && <CheckCircle className="w-4 h-4 inline ml-2" />}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">No brands added yet. Click "Add Brand" to get started.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`bg-${statusBadge.color}-50 border-2 border-${statusBadge.color}-200 p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-${statusBadge.color}-500 rounded-full flex items-center justify-center`}>
                  <StatusIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-bold text-${statusBadge.color}-800`}>{statusBadge.label}</p>
                </div>
              </div>
              <p className={`text-sm text-${statusBadge.color}-700`}>
                {profile?.status === 'VERIFIED'
                  ? 'Your profile is complete and verified. You can receive and respond to RFQs.'
                  : 'Complete your profile to get verified and start receiving RFQs.'}
              </p>
            </div>

            {/* Service Areas */}
            <div className="bg-white border-2 border-neutral-200 shadow-brutal">
              <div className="p-4 bg-neutral-900 text-white">
                <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Service Areas
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {profile?.serviceAreas && profile.serviceAreas.length > 0 ? (
                    profile.serviceAreas.map((area) => (
                      <div key={area.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-neutral-700 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {area.pincode}
                        </span>
                        <button
                          onClick={() => removeServiceArea(area.id)}
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500">No service areas added</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 px-3 py-2 border-2 border-neutral-200 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                  <button
                    onClick={addServiceArea}
                    disabled={newPincode.length !== 6 || addingArea}
                    className="px-3 py-2 bg-neutral-900 text-white font-bold text-sm disabled:opacity-50"
                  >
                    {addingArea ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-neutral-900 text-white p-6">
              <h3 className="font-bold mb-4">Need Help?</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Contact our team for any questions about your dealer account.
              </p>
              <div className="space-y-3 text-sm">
                <a href="mailto:support@hub4estate.com" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
                  <Mail className="w-4 h-4" />
                  support@hub4estate.com
                </a>
                <a href="tel:+917690001999" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
                  <Phone className="w-4 h-4" />
                  +91 76900 01999
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold">Select Categories</h3>
              <button onClick={() => setShowCategoryModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-neutral-600 mb-4">Select the product categories you deal in:</p>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 border-2 transition-all ${
                        selectedCategories.has(category.id)
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span className="font-bold text-neutral-900">{category.name}</span>
                      {selectedCategories.has(category.id) && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t-2 border-neutral-200 flex gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2 border-2 border-neutral-200 font-bold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCategories}
                disabled={savingCategories}
                className="flex-1 px-4 py-2 bg-neutral-900 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingCategories && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Selection Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold">Select Brands</h3>
              <button onClick={() => setShowBrandModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-neutral-600 mb-4">Select the brands you are authorized to sell:</p>
              <div className="grid grid-cols-2 gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => toggleBrand(brand.id)}
                    className={`flex items-center justify-between p-3 border-2 transition-all text-left ${
                      selectedBrands.has(brand.id)
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <span className="font-bold text-neutral-900 text-sm">{brand.name}</span>
                    {selectedBrands.has(brand.id) && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t-2 border-neutral-200 flex gap-3">
              <button
                onClick={() => setShowBrandModal(false)}
                className="flex-1 px-4 py-2 border-2 border-neutral-200 font-bold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={saveBrands}
                disabled={savingBrands}
                className="flex-1 px-4 py-2 bg-neutral-900 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingBrands && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Brands
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Document Upload Row Component
function DocumentUploadRow({
  label,
  required,
  documentType,
  currentUrl,
  isUploading,
  inputRef,
  onUpload,
  onDelete,
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-2 border-neutral-200">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 flex items-center justify-center ${currentUrl ? 'bg-green-100' : 'bg-neutral-100'}`}>
          {currentUrl ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <FileText className="w-5 h-5 text-neutral-400" />
          )}
        </div>
        <div>
          <p className="font-bold text-neutral-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <p className="text-sm text-neutral-500">
            {currentUrl ? 'Uploaded' : 'Not uploaded'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        {currentUrl ? (
          <>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border-2 border-neutral-200 text-sm font-bold hover:bg-neutral-50"
            >
              View
            </a>
            <button
              onClick={onDelete}
              className="p-2 text-neutral-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-neutral-900 text-white text-sm font-bold disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
