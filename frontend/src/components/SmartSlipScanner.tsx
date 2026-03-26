import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle, Sparkles, FileText, Star, DollarSign, Zap } from 'lucide-react';
import { api } from '../lib/api';

interface BrandSuggestion {
  name: string;
  segment: 'premium' | 'quality' | 'budget';
  reason: string;
}

interface ParsedItem {
  productName: string;
  quantity: number;
  unit: string;
  brand?: string;
  modelNumber?: string;
  notes?: string;
  confidence: number;
  brandSuggestions?: BrandSuggestion[];
}

interface ParsedSlip {
  items: ParsedItem[];
  totalItems: number;
  warnings: string[];
  needsConfirmation: boolean;
  detectedLocation?: string;
}

const segmentConfig = {
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Star },
  quality: { label: 'Best Quality', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Zap },
  budget: { label: 'Budget', color: 'bg-green-100 text-green-800 border-green-200', icon: DollarSign },
};

export function SmartSlipScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPDF, setIsPDF] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSlip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);

  // User details for creating inquiries
  const [userDetails, setUserDetails] = useState({ name: '', phone: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      processFile(f);
    }
  };

  const processFile = (f: File) => {
    const isImage = f.type.startsWith('image/');
    const isPdfFile = f.type === 'application/pdf';

    if (!isImage && !isPdfFile) {
      setError('Please upload an image (JPG, PNG, WebP) or PDF file');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }

    setFile(f);
    setIsPDF(isPdfFile);
    setError(null);

    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null); // no preview for PDFs
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setUseCamera(true);
      setError(null);
    } catch {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const f = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        processFile(f);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const scanFile = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/slip-scanner/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60s for AI processing
      });

      setParsedData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process file. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const editItem = (index: number, field: keyof ParsedItem, value: any) => {
    if (!parsedData) return;
    const updatedItems = [...parsedData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setParsedData({ ...parsedData, items: updatedItems });
  };

  const selectBrand = (index: number, brandName: string) => {
    editItem(index, 'brand', brandName);
  };

  const createInquiries = async () => {
    if (!parsedData) return;
    if (!userDetails.name || !userDetails.phone || !userDetails.city) {
      setError('Please fill in your name, phone, and city to create inquiries.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/slip-scanner/create-inquiries', {
        items: parsedData.items,
        customerName: userDetails.name,
        customerPhone: userDetails.phone,
        deliveryCity: userDetails.city,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create inquiries');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setFilePreview(null);
    setIsPDF(false);
    setParsedData(null);
    setError(null);
    setSubmitted(false);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Inquiries Created!</h2>
        <p className="text-sm text-gray-600 mb-6">
          Our team will contact you at <strong>{userDetails.phone}</strong> with quotes shortly.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/track" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">Track Inquiries</a>
          <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors">Scan Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Smart Slip Scanner</h2>
          <p className="text-xs text-gray-500">Upload slip, photo, or PDF — AI extracts all items instantly</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Section */}
      {!file && !useCamera && (
        <div className="space-y-4">
          <div
            className="border border-dashed border-gray-300 hover:border-gray-500 rounded-xl transition-colors p-8 text-center cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) processFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">Upload Photo or PDF</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP, PDF — Max 20MB. Drag & drop supported.</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">OR</p>
            <button onClick={startCamera} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors">
              <Camera className="w-4 h-4" />
              Use Camera
            </button>
          </div>
        </div>
      )}

      {/* Camera View */}
      {useCamera && (
        <div className="space-y-4">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl border border-gray-200" />
          <div className="flex gap-2">
            <button onClick={capturePhoto} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              <Camera className="w-4 h-4" /> Capture
            </button>
            <button onClick={stopCamera} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* File Preview */}
      {file && !parsedData && (
        <div className="space-y-4">
          {filePreview ? (
            <div className="relative">
              <img src={filePreview} alt="Preview" className="w-full rounded-xl border border-gray-200" />
              <button onClick={reset} className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB — PDF</p>
              </div>
              <button onClick={reset} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button onClick={scanFile} disabled={processing} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />AI is reading your {isPDF ? 'PDF' : 'image'}...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Scan & Extract Items</>
            )}
          </button>
        </div>
      )}

      {/* Parsed Results */}
      {parsedData && (
        <div className="space-y-6">
          {/* Warnings */}
          {parsedData.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" /> Notes
              </h3>
              {parsedData.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700">• {w}</p>
              ))}
            </div>
          )}

          {/* Extracted Items */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Extracted Items ({parsedData.totalItems})
            </h3>
            <div className="space-y-3">
              {parsedData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => editItem(index, 'productName', e.target.value)}
                      className="text-sm font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-gray-400 outline-none px-1 flex-1 bg-transparent"
                    />
                    {item.confidence < 0.7 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full whitespace-nowrap">
                        Low Confidence
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => editItem(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => editItem(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Brand</label>
                    <input
                      type="text"
                      value={item.brand || ''}
                      onChange={(e) => editItem(index, 'brand', e.target.value)}
                      placeholder="Enter brand or select below"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm"
                    />
                  </div>

                  {/* Brand Suggestions when no brand */}
                  {!item.brand && item.brandSuggestions && item.brandSuggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Suggested Brands — select one or leave blank for all quotes
                      </p>
                      <div className="space-y-1.5">
                        {item.brandSuggestions.map((suggestion, si) => {
                          const cfg = segmentConfig[suggestion.segment];
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={si}
                              onClick={() => selectBrand(index, suggestion.name)}
                              className={`w-full text-left px-3 py-2 border rounded-lg ${cfg.color} hover:opacity-80 transition-opacity flex items-start gap-3`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-sm">{suggestion.name}</span>
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full border ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                                <p className="text-xs mt-0.5 opacity-75">{suggestion.reason}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 italic">
                        No selection = we'll quote from all top brands
                      </p>
                    </div>
                  )}

                  {/* Confidence bar */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">AI Confidence:</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.confidence >= 0.8 ? 'bg-green-500' : item.confidence >= 0.6 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">{Math.round(item.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Details */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Your Details (to receive quotes)</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Your Name *"
                value={userDetails.name}
                onChange={(e) => setUserDetails((d) => ({ ...d, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm"
              />
              <input
                type="tel"
                placeholder="Phone Number * (we'll call with quotes)"
                value={userDetails.phone}
                onChange={(e) => setUserDetails((d) => ({ ...d, phone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Delivery City *"
                value={userDetails.city}
                onChange={(e) => setUserDetails((d) => ({ ...d, city: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={createInquiries} disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating inquiries...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Get Quotes for All Items</>
              )}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors">
              <X className="w-4 h-4" /> Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
