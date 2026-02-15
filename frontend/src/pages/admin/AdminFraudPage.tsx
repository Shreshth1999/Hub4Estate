import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock, User } from 'lucide-react';

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

const severityConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  LOW: { label: 'Low', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  HIGH: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  CRITICAL: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  OPEN: { label: 'Open', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  RESOLVED: { label: 'Resolved', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  DISMISSED: { label: 'Dismissed', bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200' },
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
          flag.id === id
            ? { ...flag, status, resolvedAt: new Date().toISOString() }
            : flag
        )
      );
    } catch (err) {
      console.error('Failed to resolve fraud flag:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredFlags =
    filterStatus === 'ALL'
      ? flags
      : flags.filter((flag) => flag.status === filterStatus);

  const openCount = flags.filter((f) => f.status === 'OPEN').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-neutral-900 text-white">
          <div className="container-custom py-12">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-red-500 flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Fraud Monitoring</h1>
                <p className="text-neutral-300 font-medium">Loading flags...</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-8">
          <div className="container-custom">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border-2 border-neutral-200 p-6 animate-pulse"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neutral-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-neutral-200 w-48" />
                      <div className="h-4 bg-neutral-100 w-72" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-neutral-900 text-white">
          <div className="container-custom py-12">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-red-500 flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Fraud Monitoring</h1>
                <p className="text-neutral-300 font-medium">Error loading data</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container-custom">
            <div className="border-2 border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-700 font-bold text-lg">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  fetchFlags();
                }}
                className="mt-4 px-6 py-3 bg-neutral-900 text-white font-bold uppercase tracking-wider text-sm hover:bg-neutral-800 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
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
              <div className="w-14 h-14 bg-red-500 flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Fraud Monitoring</h1>
                <p className="text-neutral-300 font-medium">
                  Review and resolve flagged activities
                </p>
              </div>
            </div>
            {openCount > 0 && (
              <div className="hidden md:flex items-center space-x-2 bg-red-500/20 border-2 border-red-500/40 px-4 py-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-bold text-red-300">
                  {openCount} open flag{openCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="border-b-2 border-neutral-200">
        <div className="container-custom">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['ALL', 'OPEN', 'RESOLVED', 'DISMISSED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-4 transition-all whitespace-nowrap ${
                  filterStatus === status
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {status === 'ALL' ? 'All Flags' : status}
                {status === 'OPEN' && openCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold">
                    {openCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Flags List */}
      <section className="py-8">
        <div className="container-custom">
          {filteredFlags.length === 0 ? (
            <div className="border-2 border-neutral-200 bg-neutral-50 p-16 text-center">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 uppercase tracking-wider mb-2">
                No Fraud Flags Detected
              </h3>
              <p className="text-neutral-500 font-medium max-w-md mx-auto">
                {filterStatus === 'ALL'
                  ? 'The platform is running clean. No suspicious activities have been flagged.'
                  : `No flags with status "${filterStatus}" found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlags.map((flag, index) => {
                const severity = severityConfig[flag.severity] || severityConfig.LOW;
                const status = statusConfig[flag.status] || statusConfig.OPEN;

                return (
                  <div
                    key={flag.id}
                    className={`bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all p-6 ${
                      flag.status === 'OPEN' ? 'border-l-4 border-l-red-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Flag Icon */}
                      <div
                        className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${
                          flag.status === 'OPEN' ? 'bg-red-500' : 'bg-neutral-300'
                        }`}
                      >
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>

                      {/* Flag Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-neutral-900">{flag.type}</h3>
                          <span
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${severity.bg} ${severity.text} ${severity.border}`}
                          >
                            {severity.label}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${status.bg} ${status.text} ${status.border}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="text-neutral-600 font-medium mb-3">
                          {flag.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 font-medium">
                          {(flag.userName || flag.dealerName) && (
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {flag.userName || flag.dealerName}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(flag.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {flag.resolvedAt && (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved{' '}
                              {new Date(flag.resolvedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
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
                            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {resolvingId === flag.id ? 'Processing...' : 'Resolve'}
                          </button>
                          <button
                            onClick={() => handleResolve(flag.id, 'DISMISSED')}
                            disabled={resolvingId === flag.id}
                            className="flex items-center gap-1 px-4 py-2 bg-neutral-200 text-neutral-700 font-bold text-sm uppercase tracking-wider hover:bg-neutral-300 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
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
      </section>
    </div>
  );
}
