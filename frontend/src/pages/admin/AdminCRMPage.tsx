import { useState, useEffect } from 'react';
import { crmApi } from '../../lib/api';
import {
  Building2, Users, Mail, Phone, Globe, MapPin, Calendar, Plus, Search, Filter,
  ChevronRight, Edit, Trash2, Send, Clock, MessageSquare, User, ExternalLink,
  CheckCircle, Loader2, X, Copy, Sparkles, TrendingUp, AlertTriangle,
} from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  prospect:    { bg: 'bg-blue-50',   color: 'text-blue-700',   label: 'Prospect' },
  contacted:   { bg: 'bg-amber-50',  color: 'text-amber-700',  label: 'Contacted' },
  interested:  { bg: 'bg-violet-50', color: 'text-violet-700', label: 'Interested' },
  negotiating: { bg: 'bg-orange-50', color: 'text-orange-700', label: 'Negotiating' },
  partner:     { bg: 'bg-green-50',  color: 'text-green-700',  label: 'Partner' },
  inactive:    { bg: 'bg-gray-100',  color: 'text-gray-600',   label: 'Inactive' },
};

const OUTREACH_STATUS: Record<string, { bg: string; color: string }> = {
  sent:    { bg: 'bg-green-50',  color: 'text-green-700' },
  opened:  { bg: 'bg-blue-50',   color: 'text-blue-700' },
  replied: { bg: 'bg-violet-50', color: 'text-violet-700' },
  bounced: { bg: 'bg-red-50',    color: 'text-red-700' },
  pending: { bg: 'bg-amber-50',  color: 'text-amber-700' },
};

const typeLabels: Record<string, string> = {
  brand:       'Brand / Manufacturer',
  dealer:      'Dealer / Distributor',
  contractor:  'Contractor',
  supplier:    'Supplier',
  other:       'Other',
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
    name: '', type: 'brand', location: '', website: '', description: '',
    contactName: '', contactEmail: '', contactPhone: '',
  });

  const fetchPipeline = async () => {
    try {
      const res = await crmApi.getPipeline();
      setPipeline(res.data);
    } catch (error) { console.error('Failed to fetch pipeline:', error); }
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
    } catch (error) { console.error('Failed to fetch companies:', error); }
  };

  const fetchOutreaches = async () => {
    try {
      const res = await crmApi.getOutreaches({ page, limit: 20 });
      setOutreaches(res.data.outreaches || res.data);
    } catch (error) { console.error('Failed to fetch outreaches:', error); }
  };

  const fetchTemplates = async () => {
    try {
      const res = await crmApi.getEmailTemplates();
      setTemplates(res.data.templates || res.data);
    } catch (error) { console.error('Failed to fetch templates:', error); }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchPipeline(), fetchCompanies(), fetchOutreaches(), fetchTemplates()]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!isLoading) fetchCompanies();
  }, [searchQuery, selectedStatus, selectedType, page]);

  const handleStatusUpdate = async (companyId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await crmApi.updateCompany(companyId, { status: newStatus });
      await fetchCompanies();
      await fetchPipeline();
      if (selectedCompany?.id === companyId) {
        setSelectedCompany((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) { console.error('Failed to update status:', error); }
    finally { setIsUpdating(false); }
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
        contacts: newCompany.contactName ? [{
          name: newCompany.contactName,
          email: newCompany.contactEmail,
          phone: newCompany.contactPhone,
          isPrimary: true,
        }] : [],
      });
      setShowAddModal(false);
      setNewCompany({ name: '', type: 'brand', location: '', website: '', description: '', contactName: '', contactEmail: '', contactPhone: '' });
      await fetchCompanies();
      await fetchPipeline();
    } catch (error) { console.error('Failed to add company:', error); }
    finally { setIsUpdating(false); }
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
    } catch (error) { console.error('Failed to copy template:', error); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Brand CRM</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage brand partnerships and outreach</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-1">
          {([
            { id: 'pipeline' as TabType, label: 'Pipeline', icon: ChevronRight },
            { id: 'companies' as TabType, label: 'Companies', icon: Building2 },
            { id: 'outreach' as TabType, label: 'Outreach', icon: Send },
            { id: 'templates' as TabType, label: 'Templates', icon: MessageSquare },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Partnership Pipeline</h2>

            {/* Pipeline Intelligence */}
            {pipeline && (() => {
              const stages = [
                { key: 'prospects', val: pipeline.prospects, label: 'Prospects' },
                { key: 'contacted', val: pipeline.contacted, label: 'Contacted' },
                { key: 'interested', val: pipeline.interested, label: 'Interested' },
                { key: 'negotiating', val: pipeline.negotiating, label: 'Negotiating' },
              ];
              const bottleneck = stages.reduce((a, b) => b.val > a.val ? b : a, stages[0]);
              const warmPipeline = (pipeline.interested + pipeline.negotiating);
              const coldPipeline = pipeline.prospects + pipeline.contacted;
              const momentum = warmPipeline > coldPipeline ? 'strong' : warmPipeline > 0 ? 'moderate' : 'weak';
              return (
                <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-xs font-semibold text-violet-700">Pipeline Intelligence</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white/70 rounded-lg px-3 py-2.5">
                      <p className="text-[11px] text-gray-400 mb-0.5">Bottleneck stage</p>
                      <p className="text-sm font-semibold text-gray-900">{bottleneck.label}</p>
                      <p className="text-xs text-gray-500">{bottleneck.val} companies stuck here</p>
                    </div>
                    <div className="bg-white/70 rounded-lg px-3 py-2.5">
                      <p className="text-[11px] text-gray-400 mb-0.5">Pipeline momentum</p>
                      <p className={`text-sm font-semibold ${momentum === 'strong' ? 'text-green-600' : momentum === 'moderate' ? 'text-amber-600' : 'text-red-500'}`}>
                        {momentum === 'strong' ? 'Strong' : momentum === 'moderate' ? 'Moderate' : 'Needs attention'}
                      </p>
                      <p className="text-xs text-gray-500">{warmPipeline} warm, {coldPipeline} cold</p>
                    </div>
                    <div className="bg-white/70 rounded-lg px-3 py-2.5">
                      <p className="text-[11px] text-gray-400 mb-0.5">Active partners</p>
                      <p className="text-sm font-semibold text-green-600">{pipeline.partners}</p>
                      <p className="text-xs text-gray-500">
                        {pipeline.inactive > 0 ? `${pipeline.inactive} inactive — re-engage` : 'All partners active'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {[
                { key: 'prospect',    value: pipeline?.prospects || 0 },
                { key: 'contacted',   value: pipeline?.contacted || 0 },
                { key: 'interested',  value: pipeline?.interested || 0 },
                { key: 'negotiating', value: pipeline?.negotiating || 0 },
                { key: 'partner',     value: pipeline?.partners || 0 },
                { key: 'inactive',    value: pipeline?.inactive || 0 },
              ].map(({ key, value }) => {
                const cfg = STATUS_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => handlePipelineClick(key)}
                    className={`${cfg.bg} rounded-xl border border-gray-200 p-4 text-left hover:border-gray-300 hover:shadow-sm transition-all`}
                  >
                    <p className={`text-xs font-medium ${cfg.color} mb-1`}>{cfg.label}</p>
                    <p className={`text-2xl font-semibold ${cfg.color}`}>{value}</p>
                  </button>
                );
              })}
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {companies.slice(0, 5).map((company) => {
                  const cfg = STATUS_CONFIG[company.status] || STATUS_CONFIG.inactive;
                  return (
                    <div
                      key={company.id}
                      className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-400">{typeLabels[company.type] || company.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none bg-white"
                >
                  <option value="">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none bg-white"
                >
                  <option value="">All Types</option>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            {companies.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">No companies found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companies.map((company) => {
                  const cfg = STATUS_CONFIG[company.status] || STATUS_CONFIG.inactive;
                  return (
                    <div
                      key={company.id}
                      className={`bg-white rounded-xl border transition-all cursor-pointer hover:border-gray-300 hover:shadow-sm ${
                        selectedCompany?.id === company.id ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="flex items-start justify-between gap-4 p-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-2">
                            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">{company.name}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                              {typeLabels[company.type] || company.type}
                            </span>
                            {company.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {company.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {company.contacts?.length || 0} contacts
                            </span>
                          </div>
                          {company.description && (
                            <p className="text-xs text-gray-400 line-clamp-2">{company.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <select
                            value={company.status}
                            onChange={(e) => { e.stopPropagation(); handleStatusUpdate(company.id, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isUpdating}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:border-gray-400 focus:outline-none bg-white"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(company.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 transition-colors"
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
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Outreach History</h2>
            {outreaches.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">No outreach records found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outreaches.map((outreach) => {
                  const statusCfg = OUTREACH_STATUS[outreach.status] || OUTREACH_STATUS.pending;
                  return (
                    <div key={outreach.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{outreach.subject}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                              {outreach.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {outreach.companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {outreach.sentBy}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{outreach.type}</span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{outreach.content}</p>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(outreach.sentAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Email Templates</h2>
            {templates.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">No templates found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          {template.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyTemplate(template)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors"
                      >
                        {copiedTemplateId === template.id ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-500" />Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" />Copy</>
                        )}
                      </button>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-400 mb-1">Subject</p>
                      <p className="text-sm text-gray-700">{template.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">Content</p>
                      <p className="text-xs text-gray-500 line-clamp-4 whitespace-pre-wrap">{template.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Company Details</h2>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Company Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCompany.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Type</p>
                  <p className="text-sm font-medium text-gray-900">{typeLabels[selectedCompany.type] || selectedCompany.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Location</p>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {selectedCompany.location || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Website</p>
                  {selectedCompany.website ? (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {selectedCompany.website.replace('https://', '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">Not provided</p>
                  )}
                </div>
              </div>

              {selectedCompany.description && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Description</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCompany.description}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                    const isActive = selectedCompany.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedCompany.id, status)}
                        disabled={isUpdating || isActive}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all disabled:opacity-50 ${
                          isActive
                            ? `${cfg.bg} ${cfg.color} border-current`
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {isUpdating && isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">
                  Contacts ({selectedCompany.contacts?.length || 0})
                </p>
                {selectedCompany.contacts && selectedCompany.contacts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCompany.contacts.map((contact) => (
                      <div key={contact.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                          {contact.isPrimary && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Primary</span>
                          )}
                          {contact.role && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{contact.role}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                            <Mail className="w-3.5 h-3.5" />{contact.email}
                          </a>
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                              <Phone className="w-3.5 h-3.5" />{contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No contacts added yet.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Added</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedCompany.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Add New Company</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Company Name *</label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type *</label>
                  <select
                    value={newCompany.type}
                    onChange={(e) => setNewCompany({ ...newCompany, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none bg-white"
                  >
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label>
                  <input
                    type="text"
                    value={newCompany.location}
                    onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Website</label>
                  <input
                    type="url"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Description</label>
                  <textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none min-h-[80px] resize-none"
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Primary Contact (Optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Contact Name</label>
                    <input
                      type="text"
                      value={newCompany.contactName}
                      onChange={(e) => setNewCompany({ ...newCompany, contactName: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={newCompany.contactEmail}
                      onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone</label>
                    <input
                      type="tel"
                      value={newCompany.contactPhone}
                      onChange={(e) => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompany}
                  disabled={!newCompany.name || isUpdating}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Adding...</>
                  ) : (
                    <><Plus className="w-4 h-4" />Add Company</>
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
