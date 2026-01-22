import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, Trash2, Download, CheckCircle,
  Building2, Phone, Mail, MapPin, Award, Shield, Plus
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';

interface UploadedPDF {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: 'catalog' | 'pricelist' | 'authorization';
}

export function DealerProfilePage() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'catalog' | 'pricelist' | 'authorization'>('catalog');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Mock data - would come from API
  const [profile] = useState({
    businessName: 'Krishna Electricals',
    ownerName: user?.name || 'Dealer',
    gstNumber: '27AABCU9603R1ZM',
    phone: '+91 98765 43210',
    email: 'dealer@example.com',
    address: '123 Main Street, Mumbai, Maharashtra - 400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    establishedYear: '2015',
    brands: ['Havells', 'Polycab', 'Legrand', 'Schneider Electric'],
    serviceAreas: ['Mumbai', 'Thane', 'Navi Mumbai'],
    status: 'verified',
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedPDF[]>([
    {
      id: '1',
      name: 'Havells_Catalog_2024.pdf',
      size: '4.2 MB',
      uploadedAt: '2024-01-15',
      type: 'catalog',
    },
    {
      id: '2',
      name: 'Polycab_PriceList_Jan2024.pdf',
      size: '1.8 MB',
      uploadedAt: '2024-01-10',
      type: 'pricelist',
    },
  ]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsUploading(true);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newFile: UploadedPDF = {
      id: Date.now().toString(),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      type: uploadType,
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setIsUploading(false);
    setUploadSuccess(true);

    setTimeout(() => setUploadSuccess(false), 3000);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Here you would actually send the file to your backend
    // which would then forward to the founder's email
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);
    formData.append('dealerName', profile.businessName);
    formData.append('dealerEmail', profile.email);

    // TODO: API call to upload and email to founder
    console.log('Would upload and send to: shresth.agarwal@hub4estate.com');
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'catalog': return 'Product Catalog';
      case 'pricelist': return 'Price List';
      case 'authorization': return 'Brand Authorization';
      default: return type;
    }
  };

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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-bold uppercase tracking-wider mb-4">
                <Shield className="w-4 h-4" />
                Verified Dealer
              </div>
              <h1 className="text-3xl md:text-4xl font-black">{profile.businessName}</h1>
              <p className="text-neutral-400 mt-2">{profile.ownerName} • {profile.city}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Business Name
                    </label>
                    <p className="text-lg font-bold text-neutral-900">{profile.businessName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      GST Number
                    </label>
                    <p className="text-lg font-bold text-neutral-900">{profile.gstNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </label>
                    <p className="text-lg font-bold text-neutral-900">{profile.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <p className="text-lg font-bold text-neutral-900">{profile.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address
                    </label>
                    <p className="text-lg font-bold text-neutral-900">{profile.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Upload Section */}
            <div className="bg-white border-2 border-neutral-200 shadow-brutal">
              <div className="p-4 bg-neutral-900 text-white">
                <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Upload Documents
                </h2>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-6">
                  Upload your product catalogs, price lists, and brand authorizations.
                  All documents will be reviewed by our team and sent to the founder for verification.
                </p>

                {/* Upload Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-neutral-900 mb-3">
                    Document Type
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(['catalog', 'pricelist', 'authorization'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setUploadType(type)}
                        className={`px-4 py-2 border-2 font-bold text-sm transition-all ${
                          uploadType === type
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {getFileTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  onClick={handleFileSelect}
                  className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                    isUploading
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div>
                      <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="font-bold text-neutral-900">Uploading...</p>
                    </div>
                  ) : uploadSuccess ? (
                    <div>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="font-bold text-green-600">Upload Successful!</p>
                      <p className="text-sm text-neutral-500 mt-2">
                        Document sent to our team for review
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="font-bold text-neutral-900 mb-2">
                        Click to upload PDF
                      </p>
                      <p className="text-sm text-neutral-500">
                        Maximum file size: 10MB
                      </p>
                    </>
                  )}
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-neutral-900 mb-4">Uploaded Documents</h3>
                    <div className="space-y-3">
                      {uploadedFiles.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 border-2 border-neutral-200 hover:border-neutral-300 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900">{file.name}</p>
                              <p className="text-sm text-neutral-500">
                                {getFileTypeLabel(file.type)} • {file.size} • {file.uploadedAt}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                <button className="text-sm font-bold text-accent-400 hover:text-accent-300 flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add Brand
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {profile.brands.map((brand, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-neutral-100 border-2 border-neutral-200 font-bold text-neutral-900"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-green-50 border-2 border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-green-800">Verified Dealer</p>
                  <p className="text-sm text-green-600">Since 2024</p>
                </div>
              </div>
              <p className="text-sm text-green-700">
                Your profile is complete and verified. You can receive and respond to RFQs.
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
                <div className="space-y-2">
                  {profile.serviceAreas.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {area}
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-sm font-bold text-accent-600 hover:text-accent-700">
                  + Add more areas
                </button>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-neutral-900 text-white p-6">
              <h3 className="font-bold mb-4">Need Help?</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Contact our founder directly for any questions about your dealer account.
              </p>
              <div className="space-y-3 text-sm">
                <a
                  href="mailto:shresth.agarwal@hub4estate.com"
                  className="flex items-center gap-2 text-accent-400 hover:text-accent-300"
                >
                  <Mail className="w-4 h-4" />
                  shresth.agarwal@hub4estate.com
                </a>
                <a
                  href="tel:+917690001999"
                  className="flex items-center gap-2 text-accent-400 hover:text-accent-300"
                >
                  <Phone className="w-4 h-4" />
                  +91 76900 01999
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
