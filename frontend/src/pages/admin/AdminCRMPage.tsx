import { useState, useEffect } from 'react';
import { crmApi } from '../../lib/api';
import { CardSkeleton, Alert } from '../../components/ui';
import { Building2, Users, Mail, Phone, Globe, MapPin, Calendar, Plus, Search, Filter, ChevronDown, ChevronRight, Edit, Trash2, Send, Clock, MessageSquare, User, ExternalLink, CheckCircle, XCircle, AlertCircle, Loader2, X, Copy } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

interface Company {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  website?: string;
  description?: string;
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
}

interface Outreach {
  id: string;
  companyId: string;
  companyName: string;
  type: string;
  subject: string;
  content: string;
  status: string;
  sentAt: string;
  sentBy: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

interface PipelineStats {
  prospects: number;
  contacted: number;
  interested: number;
  negotiating: number;
  partners: number;
  inactive: number;
}

const statusColors: Record<string, string> = {
  prospect: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  interested: 'bg-purple-100 text-purple-800',
  negotiating: 'bg-orange-100 text-orange-800',
  partner: 'bg-green-100 text-green-800',
  inactive: 'bg-neutral-100 text-neutral-800',
};

const statusLabels: Record<string, string> = {
  prospect: 'Prospect',
  contacted: 'Contacted',
  interested: 'Interested',
  negotiating: 'Negotiating',
  partner: 'Partner',
  inactive: 'Inactive',
};

const typeLabels: Record<string, string> = {
  brand: 'Brand / Manufacturer',
  dealer: 'Dealer / Distributor',
  contractor: 'Contractor',
  supplier: 'Supplier',
  other: 'Other',
};

const outreachStatusColors: Record<string, string> = {
  sent: 'bg-green-100 text-green-800',
  opened: 'bg-blue-100 text-blue-800',
  replied: 'bg-purple-100 text-purple-800',
  bounced: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

type TabType = 'pipeline' | 'companies' | 'outreach' | 'templates';

export function AdminCRMPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pipeline');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const [newCompany, setNewCompany] = useState({
    name: '',
    type: 'brand',
    location: '',
    website: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const fetchPipeline = async () => {
    try {
      const res = await crmApi.getPipeline();
      setPipeline(res.data);
    } catch (error) {
      console.error('Failed to fetch pipeline:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await crmApi.getCompanies({
        search: searchQuery || undefined,
        status: selectedStatus || undefined,
        type: selectedType || undefined,
        page,
        limit: 20,
      });
      setCompanies(res.data.companies);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchOutreaches = async () => {
    try {
      const res = await crmApi.getOutreaches({ page, limit: 20 });
      setOutreaches(res.data.outreaches || res.data);
    } catch (error) {
      console.error('Failed to fetch outreaches:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await crmApi.getEmailTemplates();
      setTemplates(res.data.templates || res.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchPipeline(),
        fetchCompanies(),
        fetchOutreaches(),
        fetchTemplates(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchCompanies();
    }
  }, [searchQuery, selectedStatus, selectedType, page]);

  const handleStatusUpdate = async (companyId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await crmApi.updateCompany(companyId, { status: newStatus });
      await fetchCompanies();
      await fetchPipeline();
      if (selectedCompany?.id === companyId) {
        setSelectedCompany((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddCompany = async () => {
    setIsUpdating(true);
    try {
      await crmApi.createCompany({
        name: newCompany.name,
        type: newCompany.type,
        location: newCompany.location,
        website: newCompany.website,
        description: newCompany.description,
        contacts: newCompany.contactName
          ? [
              {
                name: newCompany.contactName,
                email: newCompany.contactEmail,
                phone: newCompany.contactPhone,
                isPrimary: true,
              },
            ]
          : [],
      });
      setShowAddModal(false);
      setNewCompany({
        name: '',
        type: 'brand',
        location: '',
        website: '',
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      });
      await fetchCompanies();
      await fetchPipeline();
    } catch (error) {
      console.error('Failed to add company:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePipelineClick = (status: string) => {
    setSelectedStatus(status);
    setActiveTab('companies');
    setPage(1);
  };

  const handleCopyTemplate = async (template: EmailTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedTemplateId(template.id);
      setTimeout(() => setCopiedTemplateId(null), 2000);
    } catch (error) {
      console.error('Failed to copy template:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Brand CRM</h1>
                <p className="text-neutral-300 font-medium">Manage brand partnerships and outreach</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 font-bold hover:bg-accent-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Company
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b-2 border-neutral-200">
        <div className="container-custom">
          <div className="flex gap-0">
            {[
              { id: 'pipeline' as TabType, label: 'Pipeline', icon: ChevronRight },
              { id: 'companies' as TabType, label: 'Companies', icon: Building2 },
              { id: 'outreach' as TabType, label: 'Outreach', icon: Send },
              { id: 'templates' as TabType, label: 'Templates', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-wider border-b-4 transition-colors ${
                  activeTab === tab.id
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div>
            <h2 className="text-xl font-black text-neutral-900 mb-6">Partnership Pipeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <button
                onClick={() => handlePipelineClick('prospect')}
                className="bg-blue-50 border-2 border-blue-200 p-6 text-left hover:shadow-brutal transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Prospects</p>
                <p className="text-3xl font-black text-blue-900">{pipeline?.prospects || 0}</p>
              </button>
              <button
                onClick={() => handlePipelineClick('contacted')}
                className="bg-yellow-50 border-2 border-yellow-200 p-6 text-left hover:shadow-brutal transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-1">Contacted</p>
                <p className="text-3xl font-black text-yellow-900">{pipeline?.contacted || 0}</p>
              </button>
              <button
                onClick={() => handlePipelineClick('interested')}
                className="bg-purple-50 border-2 border-purple-200 p-6 text-left hover:shadow-brutal transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Interested</p>
                <p className="text-3xl font-black text-purple-900">{pipeline?.interested || 0}</p>
              </button>
              <button
                onClick={() => handlePipelineClick('negotiating')}
                className="bg-orange-50 border-2 border-orange-200 p-6 text-left hover:shadow-brutal transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Negotiating</p>
                <p className="text-3xl font-black text-orange-900">{pipeline?.negotiating || 0}</p>
              </button>
              <button
                onClick={() => handlePipelineClick('partner')}
                className="bg-green-50 border-2 border-green-200 p-6 text-left hover:shadow-brutal transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Partners</p>
                <p className="text-3xl font-black text-green-900">{pipeline?.partners || 0}</p>
              </button>
              <button
                onClick={() => handlePipelineClick('inactive')}
                className="bg-neutral-50 border-2 border-neutral-200 p-6 text-left hover:shadow-brutal transition-all cursor-pointer"
              >
                <p className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-1">Inactive</p>
                <p className="text-3xl font-black text-neutral-900">{pipeline?.inactive || 0}</p>
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {companies.slice(0, 5).map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between bg-white border-2 border-neutral-200 p-4 hover:shadow-brutal transition-all cursor-pointer"
                    onClick={() => setSelectedCompany(company)}
                  >
                    <div className="flex items-center gap-4">
                      <Building2 className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-bold text-neutral-900">{company.name}</p>
                        <p className="text-sm text-neutral-500">{typeLabels[company.type] || company.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase ${statusColors[company.status]}`}>
                        {statusLabels[company.status] || company.status}
                      </span>
                      <ChevronRight className="w-5 h-5 text-neutral-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full border-2 border-neutral-200 p-2 pl-10 focus:border-neutral-900 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-neutral-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="border-2 border-neutral-200 p-2 focus:border-neutral-900 focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="prospect">Prospect</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="partner">Partner</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setPage(1);
                  }}
                  className="border-2 border-neutral-200 p-2 focus:border-neutral-900 focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="brand">Brand / Manufacturer</option>
                  <option value="dealer">Dealer / Distributor</option>
                  <option value="contractor">Contractor</option>
                  <option value="supplier">Supplier</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Companies List */}
            <div className="space-y-4">
              {companies.length === 0 ? (
                <Alert>No companies found.</Alert>
              ) : (
                companies.map((company) => (
                  <div
                    key={company.id}
                    className={`bg-white border-2 ${
                      selectedCompany?.id === company.id
                        ? 'border-neutral-900'
                        : 'border-neutral-200'
                    } p-6 cursor-pointer hover:shadow-brutal transition-all`}
                    onClick={() => setSelectedCompany(company)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-neutral-400" />
                          <span className="font-bold text-neutral-900">{company.name}</span>
                          <span className={`px-2 py-1 text-xs font-bold uppercase ${statusColors[company.status]}`}>
                            {statusLabels[company.status] || company.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                          <span className="bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                            {typeLabels[company.type] || company.type}
                          </span>
                          {company.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {company.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {company.contacts?.length || 0} contacts
                          </span>
                        </div>
                        {company.description && (
                          <p className="text-sm text-neutral-600 line-clamp-2">{company.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <select
                          value={company.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(company.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isUpdating}
                          className="border-2 border-neutral-200 p-1 text-sm focus:border-neutral-900 focus:outline-none"
                        >
                          <option value="prospect">Prospect</option>
                          <option value="contacted">Contacted</option>
                          <option value="interested">Interested</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="partner">Partner</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-2 justify-end">
                          <Clock className="w-3 h-3" />
                          {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                        <ChevronRight className="w-5 h-5 text-neutral-300 mt-2 ml-auto" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border-2 border-neutral-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border-2 border-neutral-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Outreach Tab */}
        {activeTab === 'outreach' && (
          <div>
            <h2 className="text-xl font-black text-neutral-900 mb-6">Outreach History</h2>
            <div className="space-y-4">
              {outreaches.length === 0 ? (
                <Alert>No outreach records found.</Alert>
              ) : (
                outreaches.map((outreach) => (
                  <div
                    key={outreach.id}
                    className="bg-white border-2 border-neutral-200 p-6 hover:shadow-brutal transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-5 h-5 text-neutral-400" />
                          <span className="font-bold text-neutral-900">{outreach.subject}</span>
                          <span className={`px-2 py-1 text-xs font-bold uppercase ${outreachStatusColors[outreach.status]}`}>
                            {outreach.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {outreach.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {outreach.sentBy}
                          </span>
                          <span className="bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                            {outreach.type}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2">{outreach.content}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {new Date(outreach.sentAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <h2 className="text-xl font-black text-neutral-900 mb-6">Email Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.length === 0 ? (
                <Alert>No templates found.</Alert>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border-2 border-neutral-200 p-6 hover:shadow-brutal transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-neutral-900">{template.name}</h3>
                        <span className="bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                          {template.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyTemplate(template)}
                        className="flex items-center gap-1 px-3 py-1 border-2 border-neutral-200 text-sm font-medium hover:border-neutral-900 transition-colors"
                      >
                        {copiedTemplateId === template.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Subject</p>
                      <p className="text-sm text-neutral-700">{template.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Content</p>
                      <p className="text-sm text-neutral-600 line-clamp-4 whitespace-pre-wrap">{template.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b-2 border-neutral-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-black">Company Details</h2>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Company Name
                  </p>
                  <p className="font-medium">{selectedCompany.name}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Type
                  </p>
                  <p className="font-medium">
                    {typeLabels[selectedCompany.type] || selectedCompany.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    {selectedCompany.location || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Website
                  </p>
                  {selectedCompany.website ? (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      {selectedCompany.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-neutral-400">Not provided</p>
                  )}
                </div>
              </div>

              {selectedCompany.description && (
                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <div className="bg-neutral-50 border-2 border-neutral-200 p-4">
                    <p className="whitespace-pre-wrap">{selectedCompany.description}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {['prospect', 'contacted', 'interested', 'negotiating', 'partner', 'inactive'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedCompany.id, status)}
                      disabled={isUpdating || selectedCompany.status === status}
                      className={`px-4 py-2 font-bold uppercase text-sm transition-all ${
                        selectedCompany.status === status
                          ? statusColors[status] + ' border-2 border-current'
                          : 'border-2 border-neutral-200 hover:border-neutral-900'
                      } disabled:opacity-50`}
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Contacts ({selectedCompany.contacts?.length || 0})
                </p>
                {selectedCompany.contacts && selectedCompany.contacts.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCompany.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-neutral-50 border-2 border-neutral-200 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-neutral-400" />
                          <span className="font-medium">{contact.name}</span>
                          {contact.isPrimary && (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 text-xs font-bold">
                              Primary
                            </span>
                          )}
                          {contact.role && (
                            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 text-xs">
                              {contact.role}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-1 text-accent-600 hover:underline"
                          >
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </a>
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-1 text-accent-600 hover:underline"
                            >
                              <Phone className="w-4 h-4" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400">No contacts added yet.</p>
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Added
                </p>
                <p className="text-neutral-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedCompany.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b-2 border-neutral-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-black">Add New Company</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Type *
                  </label>
                  <select
                    value={newCompany.type}
                    onChange={(e) => setNewCompany({ ...newCompany, type: e.target.value })}
                    className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none"
                  >
                    <option value="brand">Brand / Manufacturer</option>
                    <option value="dealer">Dealer / Distributor</option>
                    <option value="contractor">Contractor</option>
                    <option value="supplier">Supplier</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newCompany.location}
                    onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                    className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Website
                  </label>
                  <input
                    type="url"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Description
                  </label>
                  <textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none min-h-[100px]"
                    placeholder="Brief description of the company"
                  />
                </div>
              </div>

              <div className="border-t-2 border-neutral-200 pt-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Primary Contact (Optional)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={newCompany.contactName}
                      onChange={(e) => setNewCompany({ ...newCompany, contactName: e.target.value })}
                      className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newCompany.contactEmail}
                      onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                      className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newCompany.contactPhone}
                      onChange={(e) => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
                      className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border-2 border-neutral-200 font-bold hover:border-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompany}
                  disabled={!newCompany.name || isUpdating}
                  className="px-6 py-3 bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Company
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
