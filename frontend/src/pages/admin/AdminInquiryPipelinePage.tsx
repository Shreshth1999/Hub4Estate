import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inquiryPipelineApi, inquiryApi } from '../../lib/api';
import {
  ArrowLeft, Loader2, Zap, Users, MessageSquare, Send, CheckCircle,
  Phone, MapPin, Plus, X, Copy, ExternalLink, IndianRupee, Truck,
  Clock, AlertCircle, ChevronRight, User, Package, Hash, Image, Trash2
} from 'lucide-react';

interface Pipeline {
  id: string;
  inquiryId: string;
  identifiedBrandId: string | null;
  identifiedBrand: string | null;
  identifiedProduct: string | null;
  identifiedCategory: string | null;
  status: string;
  aiAnalysis: string | null;
  sentToCustomerAt: string | null;
  sentVia: string | null;
  customerMessage: string | null;
  createdAt: string;
  inquiry: {
    id: string;
    inquiryNumber: string | null;
    name: string;
    phone: string;
    email: string | null;
    modelNumber: string | null;
    quantity: number;
    deliveryCity: string;
    productPhoto: string | null;
    notes: string | null;
    status: string;
  };
  dealerQuotes: DealerQuote[];
}

interface DealerQuote {
  id: string;
  dealerName: string;
  dealerPhone: string;
  dealerShopName: string | null;
  dealerCity: string | null;
  contactMethod: string;
  contactedAt: string | null;
  whatsappMessage: string | null;
  quotedPrice: number | null;
  shippingCost: number | null;
  totalQuotedPrice: number | null;
  deliveryDays: number | null;
  warrantyInfo: string | null;
  quoteNotes: string | null;
  responseStatus: string;
  brandDealer: { id: string; name: string; source: string } | null;
  createdAt: string;
}

const pipelineSteps = [
  { key: 'BRAND_IDENTIFIED', label: 'Brand ID', icon: Zap },
  { key: 'DEALERS_FOUND', label: 'Dealers Found', icon: Users },
  { key: 'QUOTES_REQUESTED', label: 'Quotes Requested', icon: MessageSquare },
  { key: 'QUOTES_RECEIVED', label: 'Quotes In', icon: IndianRupee },
  { key: 'SENT_TO_CUSTOMER', label: 'Sent', icon: Send },
];

const statusOrder: Record<string, number> = {
  BRAND_IDENTIFIED: 0,
  DEALERS_FOUND: 1,
  QUOTES_REQUESTED: 2,
  QUOTES_RECEIVED: 3,
  SENT_TO_CUSTOMER: 4,
  CLOSED: 5,
};

const quoteStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'text-gray-700', bg: 'bg-gray-100' },
  CONTACTED: { label: 'Contacted', color: 'text-blue-700', bg: 'bg-blue-100' },
  QUOTED: { label: 'Quoted', color: 'text-green-700', bg: 'bg-green-100' },
  NO_RESPONSE: { label: 'No Response', color: 'text-red-700', bg: 'bg-red-100' },
  DECLINED: { label: 'Declined', color: 'text-gray-700', bg: 'bg-gray-200' },
};

export function AdminInquiryPipelinePage() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // AI Analysis parsed
  const [aiData, setAiData] = useState<any>(null);

  // Add dealer modal
  const [showAddDealer, setShowAddDealer] = useState(false);
  const [addForm, setAddForm] = useState({
    dealerName: '',
    dealerPhone: '',
    dealerShopName: '',
    dealerCity: '',
    whatsappMessage: '',
    saveToDirectory: true,
  });
  const [addingSaving, setAddingSaving] = useState(false);

  // Auto-match results
  const [matchResults, setMatchResults] = useState<any>(null);
  const [matching, setMatching] = useState(false);

  // Send to customer
  const [showSend, setShowSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendVia, setSendVia] = useState('email');

  // Inline quote edit
  const [editingQuote, setEditingQuote] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    quotedPrice: '',
    shippingCost: '',
    deliveryDays: '',
    warrantyInfo: '',
    quoteNotes: '',
  });

  const [copied, setCopied] = useState(false);

  const fetchPipeline = async () => {
    if (!inquiryId) return;
    try {
      const res = await inquiryPipelineApi.get(inquiryId);
      setPipeline(res.data.pipeline);
      if (res.data.pipeline.aiAnalysis) {
        try {
          setAiData(JSON.parse(res.data.pipeline.aiAnalysis));
        } catch { /* ignore parse errors */ }
      }
      setError('');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPipeline(null);
      } else {
        setError(err.response?.data?.error || 'Failed to load pipeline');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, [inquiryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!inquiryId) return;
    setCreating(true);
    try {
      await inquiryPipelineApi.create(inquiryId);
      await fetchPipeline();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create pipeline');
    } finally {
      setCreating(false);
    }
  };

  const handleAutoMatch = async () => {
    if (!pipeline) return;
    setMatching(true);
    try {
      const res = await inquiryPipelineApi.autoMatch(pipeline.id);
      setMatchResults(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Auto-match failed');
    } finally {
      setMatching(false);
    }
  };

  const handleAddDealer = async () => {
    if (!pipeline || !addForm.dealerName || !addForm.dealerPhone) return;
    setAddingSaving(true);
    try {
      const whatsappMsg = addForm.whatsappMessage || aiData?.suggestedWhatsAppTemplate || '';
      await inquiryPipelineApi.addDealer(pipeline.id, {
        dealerName: addForm.dealerName,
        dealerPhone: addForm.dealerPhone,
        dealerShopName: addForm.dealerShopName || undefined,
        dealerCity: addForm.dealerCity || undefined,
        contactMethod: 'WHATSAPP',
        whatsappMessage: whatsappMsg,
        saveToDirectory: addForm.saveToDirectory,
        brandId: pipeline.identifiedBrandId || undefined,
      });
      setShowAddDealer(false);
      setAddForm({ dealerName: '', dealerPhone: '', dealerShopName: '', dealerCity: '', whatsappMessage: '', saveToDirectory: true });
      await fetchPipeline();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add dealer');
    } finally {
      setAddingSaving(false);
    }
  };

  const addMatchedDealer = async (dealer: any, source: 'platform' | 'brand') => {
    if (!pipeline) return;
    try {
      const whatsappMsg = aiData?.suggestedWhatsAppTemplate || '';
      await inquiryPipelineApi.addDealer(pipeline.id, {
        dealerName: dealer.name || dealer.ownerName,
        dealerPhone: dealer.phone,
        dealerShopName: dealer.shopName || dealer.businessName,
        dealerCity: dealer.city,
        contactMethod: 'WHATSAPP',
        whatsappMessage: whatsappMsg,
        brandDealerId: source === 'brand' ? dealer.id : undefined,
        dealerId: source === 'platform' ? dealer.dealerId : undefined,
      });
      await fetchPipeline();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add dealer');
    }
  };

  const startEditQuote = (q: DealerQuote) => {
    setEditingQuote(q.id);
    setQuoteForm({
      quotedPrice: q.quotedPrice?.toString() || '',
      shippingCost: q.shippingCost?.toString() || '',
      deliveryDays: q.deliveryDays?.toString() || '',
      warrantyInfo: q.warrantyInfo || '',
      quoteNotes: q.quoteNotes || '',
    });
  };

  const saveQuote = async () => {
    if (!pipeline || !editingQuote) return;
    try {
      const data: any = {};
      if (quoteForm.quotedPrice) data.quotedPrice = parseFloat(quoteForm.quotedPrice);
      if (quoteForm.shippingCost) data.shippingCost = parseFloat(quoteForm.shippingCost);
      if (quoteForm.deliveryDays) data.deliveryDays = parseInt(quoteForm.deliveryDays);
      if (quoteForm.warrantyInfo) data.warrantyInfo = quoteForm.warrantyInfo;
      if (quoteForm.quoteNotes) data.quoteNotes = quoteForm.quoteNotes;
      data.responseStatus = data.quotedPrice ? 'QUOTED' : 'CONTACTED';

      await inquiryPipelineApi.updateQuote(pipeline.id, editingQuote, data);
      setEditingQuote(null);
      await fetchPipeline();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save quote');
    }
  };

  const markStatus = async (quoteId: string, status: string) => {
    if (!pipeline) return;
    try {
      await inquiryPipelineApi.updateQuote(pipeline.id, quoteId, { responseStatus: status });
      await fetchPipeline();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const removeQuote = async (quoteId: string) => {
    if (!pipeline || !confirm('Remove this dealer from the pipeline?')) return;
    try {
      await inquiryPipelineApi.removeQuote(pipeline.id, quoteId);
      await fetchPipeline();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleSendToCustomer = async () => {
    if (!pipeline) return;
    setSending(true);
    try {
      await inquiryPipelineApi.sendToCustomer(pipeline.id, { sentVia: sendVia });
      setShowSend(false);
      await fetchPipeline();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppLink = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // No pipeline yet - show creation prompt
  if (!pipeline) {
    return (
      <div className="p-6 space-y-6">
        <button onClick={() => navigate('/admin/inquiries')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to Inquiries
        </button>

        <div className="text-center py-20">
          <Zap className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Start Dealer Quote Pipeline</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            AI will analyze this inquiry, identify the brand & product, find matching dealers,
            and generate WhatsApp message templates for outreach.
          </p>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {creating ? 'Analyzing...' : 'Start Pipeline'}
          </button>
        </div>
      </div>
    );
  }

  const currentStep = statusOrder[pipeline.status] ?? 0;
  const quotedDealers = pipeline.dealerQuotes.filter(q => q.responseStatus === 'QUOTED');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/inquiries')} className="p-2 hover:bg-gray-200 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              Pipeline: {pipeline.inquiry.inquiryNumber || pipeline.inquiry.name}
            </h1>
            <p className="text-sm text-gray-500">
              {pipeline.inquiry.name} | {pipeline.inquiry.phone} | {pipeline.inquiry.deliveryCity}
            </p>
          </div>
        </div>
        {pipeline.status !== 'SENT_TO_CUSTOMER' && pipeline.status !== 'CLOSED' && quotedDealers.length > 0 && (
          <button
            onClick={() => setShowSend(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold text-sm hover:bg-green-700"
          >
            <Send className="w-4 h-4" /> Send to Customer
          </button>
        )}
      </div>

      {/* Pipeline Stepper */}
      <div className="bg-white border-2 border-gray-200 p-5">
        <div className="flex items-center justify-between">
          {pipelineSteps.map((step, i) => {
            const Icon = step.icon;
            const isComplete = currentStep > i;
            const isCurrent = currentStep === i;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-orange-500 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1.5 font-bold ${
                    isComplete ? 'text-green-600' :
                    isCurrent ? 'text-orange-600' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${isComplete ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inquiry Details */}
      <div className="bg-blue-50 border border-blue-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-blue-900">{pipeline.inquiry.modelNumber || 'No model'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-400" />
          <span className="text-blue-800">Qty: {pipeline.inquiry.quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-blue-800">{pipeline.inquiry.deliveryCity}</span>
        </div>
        {pipeline.inquiry.productPhoto && (
          <a href={pipeline.inquiry.productPhoto} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
            <Image className="w-4 h-4" /> View Photo
          </a>
        )}
      </div>

      {/* AI Analysis Card */}
      {aiData && (
        <div className="bg-white border-2 border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-black text-gray-900">AI Analysis</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Identified Brand</p>
              <p className="text-lg font-black text-gray-900">{aiData.identifiedBrand || 'Unknown'}</p>
              {aiData.brandConfidence !== undefined && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${(aiData.brandConfidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-500">{Math.round(aiData.brandConfidence * 100)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Product</p>
              <p className="font-bold text-gray-900">{aiData.identifiedProduct || 'Not identified'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Category</p>
              <p className="font-bold text-gray-900">{aiData.identifiedCategory || 'N/A'}</p>
            </div>
          </div>

          {/* WhatsApp Template */}
          {aiData.suggestedWhatsAppTemplate && (
            <div className="mx-5 mb-5 bg-green-50 border border-green-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-green-700">WhatsApp Template</p>
                <button
                  onClick={() => copyToClipboard(aiData.suggestedWhatsAppTemplate)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold hover:bg-green-700"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{aiData.suggestedWhatsAppTemplate}</p>
            </div>
          )}

          {/* Insights */}
          {aiData.insights?.length > 0 && (
            <div className="mx-5 mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Insights</p>
              <ul className="space-y-1">
                {aiData.insights.map((insight: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-orange-500 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Dealer Quotes Section */}
      <div className="bg-white border-2 border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="font-black text-gray-900">Dealers ({pipeline.dealerQuotes.length})</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAutoMatch}
              disabled={matching}
              className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 border border-blue-200"
            >
              {matching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Auto-Match
            </button>
            <button
              onClick={() => {
                setAddForm(f => ({ ...f, whatsappMessage: aiData?.suggestedWhatsAppTemplate || '' }));
                setShowAddDealer(true);
              }}
              className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-white font-bold text-xs hover:bg-gray-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dealer
            </button>
          </div>
        </div>

        {/* Auto-match results */}
        {matchResults && (
          <div className="mx-5 mt-4 mb-2 bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-blue-900">
                Matched Dealers for {matchResults.identifiedBrand || 'brand'} in {matchResults.city}
              </p>
              <button onClick={() => setMatchResults(null)} className="text-blue-400 hover:text-blue-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {matchResults.dealers?.platformDealers?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-blue-700 mb-2">Platform Dealers</p>
                {matchResults.dealers.platformDealers.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-0">
                    <div>
                      <span className="font-bold text-sm">{d.shopName}</span>
                      <span className="text-xs text-blue-600 ml-2">{d.city}</span>
                    </div>
                    <button
                      onClick={() => addMatchedDealer(d, 'platform')}
                      className="text-xs px-3 py-1 bg-blue-600 text-white font-bold hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {matchResults.dealers?.brandDealers?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-blue-700 mb-2">External Brand Dealers</p>
                {matchResults.dealers.brandDealers.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-0">
                    <div>
                      <span className="font-bold text-sm">{d.shopName || d.name}</span>
                      <span className="text-xs text-blue-600 ml-2">{d.city}</span>
                      <span className="text-xs text-gray-400 ml-2">{d.phone}</span>
                    </div>
                    <button
                      onClick={() => addMatchedDealer(d, 'brand')}
                      className="text-xs px-3 py-1 bg-blue-600 text-white font-bold hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(!matchResults.dealers?.platformDealers?.length && !matchResults.dealers?.brandDealers?.length) && (
              <p className="text-sm text-blue-600">No matching dealers found. Add them manually below.</p>
            )}
          </div>
        )}

        {/* Dealer Quote Cards */}
        {pipeline.dealerQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No dealers added yet</p>
            <p className="text-sm">Use Auto-Match or add dealers manually.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pipeline.dealerQuotes.map(q => {
              const qs = quoteStatusConfig[q.responseStatus] || quoteStatusConfig.PENDING;
              const isEditing = editingQuote === q.id;
              const waLink = getWhatsAppLink(
                q.dealerPhone,
                q.whatsappMessage || aiData?.suggestedWhatsAppTemplate || ''
              );

              return (
                <div key={q.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Dealer Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">{q.dealerShopName || q.dealerName}</h4>
                        <span className={`px-2 py-0.5 text-xs font-bold ${qs.bg} ${qs.color}`}>
                          {qs.label}
                        </span>
                        {q.brandDealer && (
                          <span className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 font-medium">
                            {q.brandDealer.source === 'PLATFORM_DEALER' ? 'Platform' : 'Directory'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {q.dealerName}
                        </span>
                        <a href={`tel:${q.dealerPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="w-3.5 h-3.5" /> {q.dealerPhone}
                        </a>
                        {q.dealerCity && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {q.dealerCity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold hover:bg-green-600"
                        title="Open WhatsApp"
                      >
                        <ExternalLink className="w-3 h-3" /> WhatsApp
                      </a>
                      {q.whatsappMessage && (
                        <button
                          onClick={() => copyToClipboard(q.whatsappMessage!)}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => removeQuote(q.id)}
                        className="p-1.5 hover:bg-red-100 rounded"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Quote Details / Edit Form */}
                  {isEditing ? (
                    <div className="mt-3 bg-gray-50 border border-gray-200 p-4 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={quoteForm.quotedPrice}
                            onChange={e => setQuoteForm(f => ({ ...f, quotedPrice: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-gray-900"
                            placeholder="e.g. 1200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Shipping (₹)</label>
                          <input
                            type="number"
                            value={quoteForm.shippingCost}
                            onChange={e => setQuoteForm(f => ({ ...f, shippingCost: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-gray-900"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Delivery (days)</label>
                          <input
                            type="number"
                            value={quoteForm.deliveryDays}
                            onChange={e => setQuoteForm(f => ({ ...f, deliveryDays: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-gray-900"
                            placeholder="3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Warranty</label>
                          <input
                            type="text"
                            value={quoteForm.warrantyInfo}
                            onChange={e => setQuoteForm(f => ({ ...f, warrantyInfo: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-gray-900"
                            placeholder="1 year"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveQuote}
                          className="px-4 py-2 bg-green-600 text-white font-bold text-xs hover:bg-green-700"
                        >
                          Save Quote
                        </button>
                        <button
                          onClick={() => setEditingQuote(null)}
                          className="px-4 py-2 text-gray-500 font-bold text-xs hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : q.quotedPrice ? (
                    <div className="mt-3 bg-green-50 border border-green-200 p-3 flex items-center justify-between">
                      <div className="flex gap-6 text-sm">
                        <span className="text-green-800">
                          <span className="font-bold">₹{q.quotedPrice.toLocaleString('en-IN')}</span>
                          {q.shippingCost ? ` + ₹${q.shippingCost.toLocaleString('en-IN')} shipping` : ''}
                        </span>
                        {q.deliveryDays && (
                          <span className="text-green-600 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> {q.deliveryDays} days
                          </span>
                        )}
                        {q.warrantyInfo && (
                          <span className="text-green-600">{q.warrantyInfo}</span>
                        )}
                      </div>
                      <button
                        onClick={() => startEditQuote(q)}
                        className="text-xs text-green-700 font-bold hover:text-green-900"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => startEditQuote(q)}
                        className="px-4 py-2 bg-orange-500 text-white font-bold text-xs hover:bg-orange-600"
                      >
                        Enter Quote
                      </button>
                      <button
                        onClick={() => markStatus(q.id, 'CONTACTED')}
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                      >
                        Mark Contacted
                      </button>
                      <button
                        onClick={() => markStatus(q.id, 'NO_RESPONSE')}
                        className="text-xs text-red-400 hover:text-red-600 font-medium"
                      >
                        No Response
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sent to Customer Summary */}
      {pipeline.status === 'SENT_TO_CUSTOMER' && pipeline.sentToCustomerAt && (
        <div className="bg-green-50 border-2 border-green-300 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-black text-green-800">Quotes Sent to Customer</h3>
          </div>
          <p className="text-sm text-green-700">
            Sent via {pipeline.sentVia} on {new Date(pipeline.sentToCustomerAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      )}

      {/* Add Dealer Modal */}
      {showAddDealer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-900 max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gray-50">
              <h2 className="text-lg font-black text-gray-900">Add Dealer to Pipeline</h2>
              <button onClick={() => setShowAddDealer(false)} className="p-2 hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={addForm.dealerName}
                    onChange={e => setAddForm(f => ({ ...f, dealerName: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-gray-900 outline-none text-sm"
                    placeholder="Dealer name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={addForm.dealerPhone}
                    onChange={e => setAddForm(f => ({ ...f, dealerPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-gray-900 outline-none text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={addForm.dealerShopName}
                    onChange={e => setAddForm(f => ({ ...f, dealerShopName: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-gray-900 outline-none text-sm"
                    placeholder="Business name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={addForm.dealerCity}
                    onChange={e => setAddForm(f => ({ ...f, dealerCity: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-gray-900 outline-none text-sm"
                    placeholder="Delhi"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">WhatsApp Message</label>
                <textarea
                  value={addForm.whatsappMessage}
                  onChange={e => setAddForm(f => ({ ...f, whatsappMessage: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-gray-900 outline-none text-sm resize-none"
                  placeholder="Pre-filled WhatsApp message..."
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.saveToDirectory}
                  onChange={e => setAddForm(f => ({ ...f, saveToDirectory: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Save to Brand Dealer Directory</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowAddDealer(false)} className="px-6 py-2.5 text-sm font-bold text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleAddDealer}
                disabled={addingSaving || !addForm.dealerName || !addForm.dealerPhone}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {addingSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Dealer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Customer Modal */}
      {showSend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-900 max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gray-50">
              <h2 className="text-lg font-black text-gray-900">Send Quotes to Customer</h2>
              <button onClick={() => setShowSend(false)} className="p-2 hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-bold text-green-800 mb-2">
                  {quotedDealers.length} dealer quote{quotedDealers.length > 1 ? 's' : ''} ready
                </p>
                <p className="text-xs text-green-700">
                  Best price: ₹{Math.min(...quotedDealers.map(q => q.totalQuotedPrice || q.quotedPrice || Infinity)).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Send Via</label>
                <div className="flex gap-3">
                  {['email', 'sms', 'both'].map(v => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sendVia"
                        value={v}
                        checked={sendVia === v}
                        onChange={() => setSendVia(v)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium capitalize">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              {sendVia !== 'sms' && !pipeline.inquiry.email && (
                <div className="bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Customer has no email on file. Quote details will be saved but no email will be sent.
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowSend(false)} className="px-6 py-2.5 text-sm font-bold text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleSendToCustomer}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send to Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
