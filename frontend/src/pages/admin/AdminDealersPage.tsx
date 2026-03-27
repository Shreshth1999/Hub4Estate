import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import {
  Store, MapPin, CheckCircle, XCircle, Ban,
  FileText, Phone, Mail, X, Loader2, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';

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
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; color: string }> = {
  PENDING_VERIFICATION: { label: 'Pending',   dot: 'bg-amber-400', color: 'text-amber-600' },
  VERIFIED:             { label: 'Verified',   dot: 'bg-green-400', color: 'text-green-600' },
  SUSPENDED:            { label: 'Suspended',  dot: 'bg-red-400',   color: 'text-red-600' },
  REJECTED:             { label: 'Rejected',   dot: 'bg-gray-400',  color: 'text-gray-500' },
};

const TABS = [
  { id: 'PENDING_VERIFICATION', label: 'Pending' },
  { id: 'VERIFIED', label: 'Verified' },
  { id: 'SUSPENDED', label: 'Suspended' },
  { id: 'REJECTED', label: 'Rejected' },
];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING_VERIFICATION');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    setIsLoading(true);
    adminApi.getPendingDealers()
      .then(res => setDealers(res.data.dealers || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const handleVerify = async (dealer: Dealer, action: 'verify' | 'reject') => {
    setActionLoading(true);
    try {
      await adminApi.verifyDealer(dealer.id, action, actionNotes);
      setDealers(prev => prev.filter(d => d.id !== dealer.id));
      setExpanded(null);
      setActionNotes('');
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleSuspend = async (dealer: Dealer) => {
    setActionLoading(true);
    try {
      await adminApi.suspendDealer(dealer.id, actionNotes || 'Account suspended by admin');
      setDealers(prev => prev.filter(d => d.id !== dealer.id));
      setExpanded(null);
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const filtered = dealers.filter(d => d.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">Dealer Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Verify, manage, and monitor dealer accounts</p>

        <div className="flex gap-1 mt-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-14 text-center">
            <Store className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No dealers found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(dealer => {
              const s = STATUS_CONFIG[dealer.status] || STATUS_CONFIG.PENDING_VERIFICATION;
              const isOpen = expanded === dealer.id;
              return (
                <div key={dealer.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : dealer.id)}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-700">{dealer.businessName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{dealer.businessName}</p>
                      <p className="text-xs text-gray-400">
                        {dealer.ownerName}
                        <MapPin className="inline w-3 h-3 mx-1" />
                        {dealer.city}, {dealer.state}
                        {' · '}{fmtDate(dealer.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`flex items-center gap-1.5`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {isOpen && (() => {
                    const { checks, score } = dealerCompleteness(dealer);
                    const scoreColor = score === 100 ? 'bg-green-500' : score >= 66 ? 'bg-amber-400' : 'bg-red-400';
                    const missing = checks.filter(c => !c.ok);
                    return (
                    <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                      {/* Profile completeness */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Profile completeness</span>
                          </div>
                          <span className={`text-xs font-semibold ${score === 100 ? 'text-green-600' : score >= 66 ? 'text-amber-600' : 'text-red-500'}`}>
                            {score}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${scoreColor} rounded-full transition-all`} style={{ width: `${score}%` }} />
                        </div>
                        {missing.length > 0 && (
                          <p className="text-[11px] text-gray-400 mt-2">
                            Missing: {missing.map(c => c.label).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Contact</p>
                          <p className="flex items-center gap-1 text-gray-700"><Mail className="w-3 h-3" /> {dealer.email}</p>
                          <p className="flex items-center gap-1 text-gray-700 mt-1"><Phone className="w-3 h-3" /> {dealer.phone}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Documents</p>
                          <p className="text-gray-700">GST: <span className="font-mono font-medium">{dealer.gstNumber || '—'}</span></p>
                          <p className="text-gray-700 mt-1">PAN: <span className="font-mono font-medium">{dealer.panNumber || '—'}</span></p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[11px] text-gray-400 mb-0.5">Address</p>
                          <p className="text-gray-700">{dealer.shopAddress}, {dealer.city}, {dealer.state} - {dealer.pincode}</p>
                        </div>
                      </div>

                      {dealer.status === 'PENDING_VERIFICATION' && (
                        <div>
                          <textarea
                            rows={2}
                            placeholder="Notes (optional)"
                            value={actionNotes}
                            onChange={e => setActionNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none mb-3"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(dealer, 'verify')}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerify(dealer, 'reject')}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {dealer.status === 'VERIFIED' && (
                        <button
                          onClick={() => handleSuspend(dealer)}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Suspend account
                        </button>
                      )}
                    </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
