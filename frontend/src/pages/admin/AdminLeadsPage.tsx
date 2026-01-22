import { useState, useEffect } from 'react';
import { contactApi } from '../../lib/api';
import { CardSkeleton, Alert } from '../../components/ui';
import {
  Mail, Phone, User, MessageSquare, Clock, Filter,
  ChevronDown, ChevronRight, Shield, Check, X, Loader2
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

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  closed: 'bg-neutral-100 text-neutral-800',
};

const roleLabels: Record<string, string> = {
  homeowner: 'Homeowner / Individual',
  contractor: 'Contractor / Builder',
  dealer: 'Electrical Dealer',
  brand: 'Brand / Manufacturer',
  other: 'Other',
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
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
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
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Contact Leads</h1>
              <p className="text-neutral-300 font-medium">Manage contact form submissions</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-2 border-neutral-200 p-6">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Leads</p>
            <p className="text-3xl font-black text-neutral-900">{stats?.total || 0}</p>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 p-6">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">New</p>
            <p className="text-3xl font-black text-blue-900">{stats?.byStatus.new || 0}</p>
          </div>
          <div className="bg-green-50 border-2 border-green-200 p-6">
            <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Converted</p>
            <p className="text-3xl font-black text-green-900">{stats?.byStatus.converted || 0}</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 p-6">
            <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">This Week</p>
            <p className="text-3xl font-black text-purple-900">{stats?.recentWeek || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
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
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <Alert>No submissions found.</Alert>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className={`bg-white border-2 ${
                  selectedSubmission?.id === submission.id
                    ? 'border-neutral-900'
                    : 'border-neutral-200'
                } p-6 cursor-pointer hover:shadow-brutal transition-all`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-neutral-400" />
                      <span className="font-bold text-neutral-900">{submission.name}</span>
                      <span
                        className={`px-2 py-1 text-xs font-bold uppercase ${
                          statusColors[submission.status]
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {submission.email}
                      </span>
                      {submission.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {submission.phone}
                        </span>
                      )}
                      <span className="bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                        {roleLabels[submission.role] || submission.role}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 line-clamp-2">{submission.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                    {submission.emailSent && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1 justify-end">
                        <Check className="w-3 h-3" />
                        Email sent
                      </p>
                    )}
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

        {/* Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="border-b-2 border-neutral-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-black">Lead Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Name
                    </p>
                    <p className="font-medium">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Role
                    </p>
                    <p className="font-medium">
                      {roleLabels[selectedSubmission.role] || selectedSubmission.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-accent-600 hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    {selectedSubmission.phone ? (
                      <a
                        href={`tel:${selectedSubmission.phone}`}
                        className="text-accent-600 hover:underline"
                      >
                        {selectedSubmission.phone}
                      </a>
                    ) : (
                      <p className="text-neutral-400">Not provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Message
                  </p>
                  <div className="bg-neutral-50 border-2 border-neutral-200 p-4">
                    <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Update Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['new', 'contacted', 'qualified', 'converted', 'closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedSubmission.id, status)}
                        disabled={isUpdating || selectedSubmission.status === status}
                        className={`px-4 py-2 font-bold uppercase text-sm transition-all ${
                          selectedSubmission.status === status
                            ? statusColors[status] + ' border-2 border-current'
                            : 'border-2 border-neutral-200 hover:border-neutral-900'
                        } disabled:opacity-50`}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Submitted
                  </p>
                  <p className="text-neutral-600">
                    {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
