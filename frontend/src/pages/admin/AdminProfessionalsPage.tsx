import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { UserBadge } from '../../components/common/UserBadge';
import {
  ShieldCheck, X, CheckCircle, Clock, FileText,
  ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  profVerificationStatus: string;
  createdAt: string;
  professionalProfile?: {
    id: string;
    businessName?: string;
    registrationNo?: string;
    city?: string;
    state?: string;
    yearsExperience?: number;
    bio?: string;
    documents: {
      id: string;
      docType: string;
      fileUrl: string;
      fileName?: string;
    }[];
  };
}

export function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    adminApi.getPendingProfessionals()
      .then(res => setProfessionals(res.data.professionals || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      await adminApi.verifyProfessional(id, action, rejectionNotes[id]);
      setProfessionals(prev => prev.filter(p => p.id !== id));
      setExpanded(null);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const toggleExpand = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Professional Verification</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review document submissions from Architects, Designers, Contractors, and Electricians
            </p>
          </div>
        </div>
      </div>

      {/* Pending count */}
      {professionals.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{professionals.length} pending review{professionals.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          </div>
        ) : professionals.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">All caught up</p>
            <p className="text-xs text-gray-400 mt-1">No pending professional verification requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {professionals.map(pro => {
              const isOpen = expanded === pro.id;
              const docs = pro.professionalProfile?.documents || [];

              return (
                <div key={pro.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Summary row */}
                  <button
                    onClick={() => toggleExpand(pro.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{pro.name}</p>
                        <UserBadge role={pro.role} verified={false} />
                      </div>
                      <p className="text-xs text-gray-400">
                        {pro.professionalProfile?.businessName || 'No business name'}
                        {pro.professionalProfile?.city && ` · ${pro.professionalProfile.city}`}
                        {pro.professionalProfile?.state && `, ${pro.professionalProfile.state}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(pro.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {docs.length} doc{docs.length !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                      {/* Profile details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {pro.email && (
                          <div><span className="text-gray-400">Email</span><p className="font-medium text-gray-900 truncate">{pro.email}</p></div>
                        )}
                        {pro.phone && (
                          <div><span className="text-gray-400">Phone</span><p className="font-medium text-gray-900">{pro.phone}</p></div>
                        )}
                        {pro.professionalProfile?.registrationNo && (
                          <div><span className="text-gray-400">Reg. no.</span><p className="font-medium text-gray-900">{pro.professionalProfile.registrationNo}</p></div>
                        )}
                        {pro.professionalProfile?.yearsExperience != null && (
                          <div><span className="text-gray-400">Experience</span><p className="font-medium text-gray-900">{pro.professionalProfile.yearsExperience} yrs</p></div>
                        )}
                      </div>

                      {pro.professionalProfile?.bio && (
                        <p className="text-sm text-gray-600 italic">"{pro.professionalProfile.bio}"</p>
                      )}

                      {/* Documents */}
                      {docs.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Uploaded documents</p>
                          <div className="space-y-2">
                            {docs.map(doc => (
                              <a
                                key={doc.id}
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 flex-1 truncate">
                                  {doc.fileName || doc.docType}
                                </span>
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection notes */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          Notes (required if rejecting)
                        </label>
                        <textarea
                          value={rejectionNotes[pro.id] || ''}
                          onChange={e => setRejectionNotes(prev => ({ ...prev, [pro.id]: e.target.value }))}
                          placeholder="Reason for rejection or verification notes..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => handleAction(pro.id, 'approve')}
                          disabled={processing === pro.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve & Verify
                        </button>
                        <button
                          onClick={() => handleAction(pro.id, 'reject')}
                          disabled={processing === pro.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-100"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        {processing === pro.id && (
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
