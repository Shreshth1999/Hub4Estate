import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import {
  Store, MapPin, CheckCircle, XCircle, Ban,
  Phone, Mail, X, Loader2, ChevronDown, ChevronUp,
  Search, RefreshCw, Sparkles, AlertTriangle,
} from 'lucide-react';

interface Dealer {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  dealerType: string | null;
  createdAt: string;
}

interface DealerCounts {
  pending: number;
  verified: number;
  suspended: number;
  rejected: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; textColor: string; badgeBg: string; badgeText: string }> = {
  PENDING_VERIFICATION: {
    label: 'Pending',
    dot: 'bg-amber-400',
    textColor: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
  },
  VERIFIED: {
    label: 'Verified',
    dot: 'bg-green-500',
    textColor: 'text-green-600',
    badgeBg: 'bg-green-50',
    badgeText: 'text-green-700',
  },
  SUSPENDED: {
    label: 'Suspended',
    dot: 'bg-red-400',
    textColor: 'text-red-600',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
  },
  REJECTED: {
    label: 'Rejected',
    dot: 'bg-gray-400',
    textColor: 'text-gray-500',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
  },
};

const TAB_IDS = ['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED', 'REJECTED'] as const;
type TabId = typeof TAB_IDS[number];

const TAB_LABELS: Record<TabId, string> = {
  ALL:                  'All',
  PENDING_VERIFICATION: 'Pending',
  VERIFIED:             'Verified',
  SUSPENDED:            'Suspended',
  REJECTED:             'Rejected',
};

function dealerCompleteness(dealer: Dealer) {
  const checks = [
    { label: 'GST number', ok: !!dealer.gstNumber },
    { label: 'PAN number', ok: !!dealer.panNumber },
    { label: 'Phone', ok: !!dealer.phone },
    { label: 'Email', ok: !!dealer.email },
    { label: 'Shop address', ok: !!dealer.shopAddress },
    { label: 'City & state', ok: !!(dealer.city && dealer.state) },
  ];
  const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 100);
  return { checks, score };
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [counts, setCounts] = useState<DealerCounts>({ pending: 0, verified: 0, suspended: 0, rejected: 0 });
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('PENDING_VERIFICATION');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  const fetchDealers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (activeTab !== 'ALL') params.status = activeTab;
      if (search) params.search = search;

      const res = await adminApi.getAllDealers(params);
      setDealers(res.data.dealers || []);
      setCounts(res.data.counts || { pending: 0, verified: 0, suspended: 0, rejected: 0 });
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
    } catch (e) {
      console.error('Failed to fetch dealers:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setPage(1);
    setExpanded(null);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleVerify = async (dealer: Dealer, action: 'verify' | 'reject') => {
    setActionLoading(true);
    try {
      await adminApi.verifyDealer(dealer.id, action, actionNotes);
      setExpanded(null);
      setActionNotes('');
      await fetchDealers();
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleSuspend = async (dealer: Dealer) => {
    setActionLoading(true);
    try {
      await adminApi.suspendDealer(dealer.id, actionNotes || 'Account suspended by admin');
      setExpanded(null);
      await fetchDealers();
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const getTabCount = (tab: TabId): number | null => {
    if (tab === 'ALL') return counts.pending + counts.verified + counts.suspended + counts.rejected;
    if (tab === 'PENDING_VERIFICATION') return counts.pending;
    if (tab === 'VERIFIED') return counts.verified;
    if (tab === 'SUSPENDED') return counts.suspended;
    if (tab === 'REJECTED') return counts.rejected;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dealer Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Verify, manage, and monitor dealer accounts</p>
          </div>
          <button
            onClick={fetchDealers}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {TAB_IDS.map(tab => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab;
            const isPending = tab === 'PENDING_VERIFICATION' && (counts.pending > 0);
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {TAB_LABELS[tab]}
                {count !== null && count > 0 && (
                  <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isPending
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2 max-w-md">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-gray-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, or GST..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      <div className="px-6 py-5 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-sm text-gray-400">Loading dealers...</p>
            </div>
          </div>
        ) : dealers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No dealers found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? `No results for "${search}"` : `No dealers with status "${TAB_LABELS[activeTab]}"`}
            </p>
          </div>
        ) : (
          <>
            {/* Count label */}
            <p className="text-xs text-gray-400 mb-3 font-medium">
              Showing {dealers.length} of {pagination.total} dealer{pagination.total !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </p>

            <div className="space-y-2">
              {dealers.map(dealer => {
                const s = STATUS_CONFIG[dealer.status] || STATUS_CONFIG.PENDING_VERIFICATION;
                const isOpen = expanded === dealer.id;
                return (
                  <div
                    key={dealer.id}
                    className={`bg-white rounded-xl border overflow-hidden transition-all ${
                      dealer.status === 'PENDING_VERIFICATION'
                        ? 'border-amber-200 shadow-sm'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Card Row */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : dealer.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-left transition-colors"
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base ${
                        dealer.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        dealer.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-700' :
                        dealer.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {dealer.businessName.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{dealer.businessName}</p>
                          {dealer.status === 'PENDING_VERIFICATION' && (
                            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse inline-block" />
                              Needs review
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {dealer.ownerName}
                          {dealer.city && <> · <MapPin className="inline w-3 h-3 mx-0.5" />{dealer.city}, {dealer.state}</>}
                          {' · '}{fmtDate(dealer.createdAt)}
                        </p>
                      </div>

                      {/* Status + Chevron */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.badgeBg} ${s.badgeText}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </div>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isOpen && (() => {
                      const { checks, score } = dealerCompleteness(dealer);
                      const scoreColor = score === 100 ? 'bg-green-500' : score >= 66 ? 'bg-amber-400' : 'bg-red-400';
                      const missing = checks.filter(c => !c.ok);
                      return (
                        <div className="border-t border-gray-100 px-5 py-5 space-y-5 bg-gray-50/50">

                          {/* Profile completeness */}
                          <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-600">Profile completeness</span>
                              </div>
                              <span className={`text-sm font-bold ${
                                score === 100 ? 'text-green-600' : score >= 66 ? 'text-amber-600' : 'text-red-500'
                              }`}>
                                {score}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${scoreColor} rounded-full transition-all`} style={{ width: `${score}%` }} />
                            </div>
                            {missing.length > 0 && (
                              <p className="text-[11px] text-gray-400 mt-2">
                                Missing: {missing.map(c => c.label).join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</p>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${dealer.email}`} className="hover:text-blue-600 transition-colors truncate">{dealer.email}</a>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a href={`tel:${dealer.phone}`} className="hover:text-blue-600 transition-colors">{dealer.phone || '—'}</a>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documents</p>
                              <div className="text-sm">
                                <span className="text-gray-400">GST: </span>
                                <span className="font-mono font-semibold text-gray-900">{dealer.gstNumber || <span className="text-red-400">Missing</span>}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">PAN: </span>
                                <span className="font-mono font-semibold text-gray-900">{dealer.panNumber || <span className="text-amber-400">Not provided</span>}</span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:col-span-2">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Address</p>
                              <p className="text-sm text-gray-700">
                                {dealer.shopAddress
                                  ? `${dealer.shopAddress}, ${dealer.city}, ${dealer.state} - ${dealer.pincode}`
                                  : <span className="text-gray-400 italic">Address not provided</span>
                                }
                              </p>
                            </div>
                          </div>

                          {/* Action Area */}
                          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin Action</p>

                            {dealer.status === 'PENDING_VERIFICATION' && (
                              <>
                                <textarea
                                  rows={2}
                                  placeholder="Notes (optional) — visible in audit log"
                                  value={actionNotes}
                                  onChange={e => setActionNotes(e.target.value)}
                                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none bg-gray-50"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleVerify(dealer, 'verify')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                                  >
                                    {actionLoading
                                      ? <Loader2 className="w-4 h-4 animate-spin" />
                                      : <CheckCircle className="w-4 h-4" />
                                    }
                                    Verify Dealer
                                  </button>
                                  <button
                                    onClick={() => handleVerify(dealer, 'reject')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </div>
                              </>
                            )}

                            {dealer.status === 'VERIFIED' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <p className="text-sm font-medium text-green-700">This dealer is verified and active</p>
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="Reason for suspension (optional)"
                                  value={actionNotes}
                                  onChange={e => setActionNotes(e.target.value)}
                                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none bg-gray-50"
                                />
                                <button
                                  onClick={() => handleSuspend(dealer)}
                                  disabled={actionLoading}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors"
                                >
                                  <Ban className="w-4 h-4" />
                                  Suspend Account
                                </button>
                              </div>
                            )}

                            {dealer.status === 'SUSPENDED' && (
                              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <p className="text-sm font-medium text-red-700">This account is suspended</p>
                              </div>
                            )}

                            {dealer.status === 'REJECTED' && (
                              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                <XCircle className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-600">This application was rejected</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-xs text-gray-400">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
