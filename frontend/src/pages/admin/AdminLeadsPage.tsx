import { useState, useEffect } from 'react';
import { contactApi } from '../../lib/api';
import {
  Mail, Phone, User, Clock, Filter,
  ChevronRight, Check, X, Loader2,
} from 'lucide-react';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  message: string;
  source: string;
  status: string;
  emailSent: boolean;
  createdAt: string;
  notes?: string;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  recentWeek: number;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  new:       { bg: 'bg-blue-50',   color: 'text-blue-700' },
  contacted: { bg: 'bg-amber-50',  color: 'text-amber-700' },
  qualified: { bg: 'bg-violet-50', color: 'text-violet-700' },
  converted: { bg: 'bg-green-50',  color: 'text-green-700' },
  closed:    { bg: 'bg-gray-100',  color: 'text-gray-600' },
};

const roleLabels: Record<string, string> = {
  homeowner:  'Homeowner / Individual',
  contractor: 'Contractor / Builder',
  dealer:     'Electrical Dealer',
  brand:      'Brand / Manufacturer',
  other:      'Other',
};

export function AdminLeadsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      const [submissionsRes, statsRes] = await Promise.all([
        contactApi.getSubmissions({ status: selectedStatus || undefined, page, limit: 20 }),
        contactApi.getStats(),
      ]);
      setSubmissions(submissionsRes.data.submissions);
      setTotalPages(submissionsRes.data.pagination.totalPages);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, page]);

  const handleStatusUpdate = async (id: string, newStatus: string, notes?: string) => {
    setIsUpdating(true);
    try {
      await contactApi.updateSubmission(id, { status: newStatus, notes });
      await fetchData();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission((prev) =>
          prev ? { ...prev, status: newStatus, notes } : null
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
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
        <h1 className="text-lg font-semibold text-gray-900">Contact Leads</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage contact form submissions</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Leads', value: stats?.total || 0, bg: 'bg-white' },
            { label: 'New', value: stats?.byStatus.new || 0, bg: 'bg-blue-50' },
            { label: 'Converted', value: stats?.byStatus.converted || 0, bg: 'bg-green-50' },
            { label: 'This Week', value: stats?.recentWeek || 0, bg: 'bg-violet-50' },
          ].map(({ label, value, bg }) => (
            <div key={label} className={`${bg} rounded-xl border border-gray-200 p-4`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-gray-400 focus:outline-none bg-white"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No submissions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => {
              const statusCfg = STATUS_CONFIG[submission.status] || STATUS_CONFIG.closed;
              return (
                <div
                  key={submission.id}
                  className={`bg-white rounded-xl border transition-all cursor-pointer hover:border-gray-300 hover:shadow-sm ${
                    selectedSubmission?.id === submission.id ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{submission.name}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                          {submission.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {submission.email}
                        </span>
                        {submission.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {submission.phone}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                          {roleLabels[submission.role] || submission.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{submission.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                      {submission.emailSent && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Email sent
                        </p>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
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

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Lead Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Name', value: selectedSubmission.name },
                  { label: 'Role', value: roleLabels[selectedSubmission.role] || selectedSubmission.role },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Email</p>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-sm text-blue-600 hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Phone</p>
                  {selectedSubmission.phone ? (
                    <a href={`tel:${selectedSubmission.phone}`} className="text-sm text-blue-600 hover:underline">
                      {selectedSubmission.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">Not provided</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Message</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['new', 'contacted', 'qualified', 'converted', 'closed'].map((status) => {
                    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.closed;
                    const isActive = selectedSubmission.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedSubmission.id, status)}
                        disabled={isUpdating || isActive}
                        className={`px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-all disabled:opacity-50 capitalize ${
                          isActive
                            ? `${cfg.bg} ${cfg.color} border-current`
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {isUpdating && isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : status}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Submitted</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
