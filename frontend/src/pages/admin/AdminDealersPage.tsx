import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { Tabs, StatusBadge, EmptyState, ListSkeleton, Button, Modal } from '../../components/ui';
import {
  Store, MapPin, Calendar, CheckCircle, XCircle, Ban,
  FileText, ChevronRight, Phone, Mail, Shield
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
  createdAt: string;
}

const tabs = [
  { id: 'PENDING_VERIFICATION', label: 'Pending' },
  { id: 'VERIFIED', label: 'Verified' },
  { id: 'SUSPENDED', label: 'Suspended' },
  { id: 'REJECTED', label: 'Rejected' },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default' }> = {
  PENDING_VERIFICATION: { label: 'Pending', variant: 'pending' },
  VERIFIED: { label: 'Verified', variant: 'success' },
  SUSPENDED: { label: 'Suspended', variant: 'error' },
  REJECTED: { label: 'Rejected', variant: 'error' },
};

export function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING_VERIFICATION');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    const fetchDealers = async () => {
      setIsLoading(true);
      try {
        let response;
        if (activeTab === 'PENDING_VERIFICATION') {
          response = await adminApi.getPendingDealers();
        } else {
          response = await adminApi.getPendingDealers();
        }
        setDealers(response.data.dealers || []);
      } catch (error) {
        console.error('Failed to fetch dealers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealers();
  }, [activeTab]);

  const handleVerify = async (action: 'verify' | 'reject') => {
    if (!selectedDealer) return;

    setActionLoading(true);
    try {
      await adminApi.verifyDealer(selectedDealer.id, action, actionNotes);

      setDealers(prev => prev.filter(d => d.id !== selectedDealer.id));
      setShowModal(false);
      setSelectedDealer(null);
      setActionNotes('');
    } catch (error) {
      console.error('Failed to verify dealer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedDealer) return;

    setActionLoading(true);
    try {
      await adminApi.suspendDealer(selectedDealer.id, actionNotes || 'Account suspended by admin');
      setDealers(prev => prev.filter(d => d.id !== selectedDealer.id));
      setShowModal(false);
      setSelectedDealer(null);
    } catch (error) {
      console.error('Failed to suspend dealer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Dealer Management</h1>
              <p className="text-neutral-300 font-medium">Verify, manage, and monitor dealer accounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container-custom">
          {/* Tabs */}
          <div className="mb-8 flex items-center gap-1 overflow-x-auto border-b-2 border-neutral-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-4 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dealers List */}
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : dealers.length === 0 ? (
            <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
              <EmptyState
                icon={Store}
                title="No dealers found"
                description={`No dealers with status "${statusConfig[activeTab]?.label || activeTab}"`}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {dealers.map((dealer, index) => {
                const status = statusConfig[dealer.status] || statusConfig.PENDING_VERIFICATION;

                return (
                  <div
                    key={dealer.id}
                    className="bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all p-6"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Dealer Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-neutral-900 flex items-center justify-center">
                          <span className="text-xl font-black text-white">
                            {dealer.businessName.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-neutral-900 truncate">
                              {dealer.businessName}
                            </h3>
                            <StatusBadge status={status.label} variant={status.variant} />
                          </div>
                          <p className="text-sm text-neutral-500 font-medium">{dealer.ownerName}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-500 font-medium">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {dealer.city}, {dealer.state}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(dealer.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="px-3 py-2 bg-neutral-100 border-2 border-neutral-200">
                          <span className="text-neutral-500 font-medium">GST:</span>
                          <span className="ml-2 font-mono font-bold text-neutral-900">{dealer.gstNumber}</span>
                        </div>
                        <div className="px-3 py-2 bg-neutral-100 border-2 border-neutral-200">
                          <span className="text-neutral-500 font-medium">PAN:</span>
                          <span className="ml-2 font-mono font-bold text-neutral-900">{dealer.panNumber}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDealer(dealer);
                            setShowModal(true);
                          }}
                          className="btn-secondary text-sm"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>

                        {dealer.status === 'PENDING_VERIFICATION' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDealer(dealer);
                                handleVerify('verify');
                              }}
                              className="btn-primary text-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDealer(dealer);
                                handleVerify('reject');
                              }}
                              className="btn-secondary text-sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}

                        {dealer.status === 'VERIFIED' && (
                          <button
                            onClick={() => {
                              setSelectedDealer(dealer);
                              handleSuspend();
                            }}
                            className="btn-secondary text-sm"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Dealer Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDealer(null);
          setActionNotes('');
        }}
        title="Dealer Details"
        size="lg"
      >
        {selectedDealer && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Business Name</label>
                <p className="font-bold text-neutral-900 mt-1">{selectedDealer.businessName}</p>
              </div>
              <div>
                <label className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Owner Name</label>
                <p className="font-bold text-neutral-900 mt-1">{selectedDealer.ownerName}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-900 font-medium">{selectedDealer.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-900 font-medium">{selectedDealer.phone}</span>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-neutral-100 border-2 border-neutral-200 p-4">
              <h4 className="font-bold text-neutral-900 mb-3 flex items-center uppercase tracking-wider text-sm">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-neutral-500 font-medium">GST Number</label>
                  <p className="font-mono font-bold text-neutral-900">{selectedDealer.gstNumber}</p>
                </div>
                <div>
                  <label className="text-neutral-500 font-medium">PAN Number</label>
                  <p className="font-mono font-bold text-neutral-900">{selectedDealer.panNumber}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Shop Address</label>
              <p className="font-bold text-neutral-900 mt-1">{selectedDealer.shopAddress}</p>
              <p className="text-neutral-600 font-medium">{selectedDealer.city}, {selectedDealer.state} - {selectedDealer.pincode}</p>
            </div>

            {/* Action Notes */}
            {selectedDealer.status === 'PENDING_VERIFICATION' && (
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add notes about this verification..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="input-primary"
                />
              </div>
            )}

            {/* Actions */}
            {selectedDealer.status === 'PENDING_VERIFICATION' && (
              <div className="flex gap-4 pt-4 border-t-2 border-neutral-200">
                <button
                  className="btn-primary flex-1 justify-center"
                  onClick={() => handleVerify('verify')}
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {actionLoading ? 'Processing...' : 'Verify Dealer'}
                </button>
                <button
                  className="btn-secondary flex-1 justify-center"
                  onClick={() => handleVerify('reject')}
                  disabled={actionLoading}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
