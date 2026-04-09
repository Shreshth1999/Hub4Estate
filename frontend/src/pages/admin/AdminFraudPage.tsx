import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock, User, Loader2 } from 'lucide-react';

interface FraudFlag {
  id: string;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  userId?: string;
  dealerId?: string;
  userName?: string;
  dealerName?: string;
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  LOW:      { label: 'Low',      bg: 'bg-blue-50',   color: 'text-blue-700' },
  MEDIUM:   { label: 'Medium',   bg: 'bg-amber-50',  color: 'text-amber-700' },
  HIGH:     { label: 'High',     bg: 'bg-amber-50', color: 'text-amber-800' },
  CRITICAL: { label: 'Critical', bg: 'bg-red-50',    color: 'text-red-700' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  OPEN:      { label: 'Open',      bg: 'bg-red-50',   color: 'text-red-700' },
  RESOLVED:  { label: 'Resolved',  bg: 'bg-green-50', color: 'text-green-700' },
  DISMISSED: { label: 'Dismissed', bg: 'bg-gray-100', color: 'text-gray-600' },
};

export function AdminFraudPage() {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED' | 'DISMISSED'>('ALL');

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const response = await api.get('/admin/fraud-flags');
      setFlags(response.data.flags || response.data || []);
    } catch (err) {
      console.error('Failed to fetch fraud flags:', err);
      setError('Failed to load fraud flags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    setResolvingId(id);
    try {
      await api.post(`/admin/fraud-flags/${id}/resolve`, { status });
      setFlags((prev) =>
        prev.map((flag) =>
          flag.id === id ? { ...flag, status, resolvedAt: new Date().toISOString() } : flag
        )
      );
    } catch (err) {
      console.error('Failed to resolve fraud flag:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredFlags = filterStatus === 'ALL' ? flags : flags.filter((f) => f.status === filterStatus);
  const openCount = flags.filter((f) => f.status === 'OPEN').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setIsLoading(true); fetchFlags(); }}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Fraud Monitoring</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and resolve flagged activities</p>
          </div>
          {openCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                {openCount} open flag{openCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-1">
          {(['ALL', 'OPEN', 'RESOLVED', 'DISMISSED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {status === 'ALL' ? 'All Flags' : status.charAt(0) + status.slice(1).toLowerCase()}
              {status === 'OPEN' && openCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                  {openCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Flags List */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {filteredFlags.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
            <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">No fraud flags detected</p>
            <p className="text-xs text-gray-400 mt-1">
              {filterStatus === 'ALL'
                ? 'The platform is running clean.'
                : `No flags with status "${filterStatus.toLowerCase()}" found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFlags.map((flag) => {
              const severity = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.LOW;
              const statusCfg = STATUS_CONFIG[flag.status] || STATUS_CONFIG.OPEN;

              return (
                <div
                  key={flag.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all ${
                    flag.status === 'OPEN' ? 'border-red-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4 p-5">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      flag.status === 'OPEN' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${flag.status === 'OPEN' ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{flag.type}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severity.bg} ${severity.color}`}>
                          {severity.label}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{flag.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        {(flag.userName || flag.dealerName) && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {flag.userName || flag.dealerName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(flag.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        {flag.resolvedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Resolved {new Date(flag.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {flag.status === 'OPEN' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleResolve(flag.id, 'RESOLVED')}
                          disabled={resolvingId === flag.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {resolvingId === flag.id ? 'Processing...' : 'Resolve'}
                        </button>
                        <button
                          onClick={() => handleResolve(flag.id, 'DISMISSED')}
                          disabled={resolvingId === flag.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
