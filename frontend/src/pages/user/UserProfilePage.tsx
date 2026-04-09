import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import {
  User, Mail, Phone, MapPin, Building2, FileText,
  Loader2, CheckCircle, AlertCircle, Save, Bell, MessageSquare,
  Smartphone, Shield,
} from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  companyName: string;
  gstNumber: string;
}

interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export function UserProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: '',
    companyName: '',
    gstNumber: '',
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    sms: true,
    whatsapp: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    authApi.getMe()
      .then(res => {
        const data = res.data.user || res.data;
        setProfile(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          city: data.city || prev.city,
          state: data.state || prev.state,
          companyName: data.companyName || '',
          gstNumber: data.gstNumber || '',
        }));
      })
      .catch(() => {
        // Use existing store data
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      await authApi.completeProfile({
        name: profile.name,
        city: profile.city,
        phone: profile.phone,
      });

      // Update the store with new data
      if (user) {
        updateUser({
          ...user,
          name: profile.name,
          city: profile.city,
          phone: profile.phone,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Failed to save profile. Please try again.');
      setTimeout(() => setSaveError(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (key: keyof NotificationPrefs) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* Profile Avatar + Name Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-semibold text-amber-600">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{profile.name || 'User'}</p>
              <p className="text-sm text-gray-400">{profile.email || profile.phone}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Verified Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                    placeholder="Your city"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">State</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={e => handleChange('state', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                  placeholder="Your state"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Information (Optional) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            Company Information
          </h2>
          <p className="text-xs text-gray-400 mb-4">Optional - for business purchases and GST invoicing</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={e => handleChange('companyName', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                  placeholder="Your company name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">GST Number</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.gstNumber}
                  onChange={e => handleChange('gstNumber', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            Notification Preferences
          </h2>
          <p className="text-xs text-gray-400 mb-4">Choose how you want to receive updates about your inquiries and quotes</p>

          <div className="space-y-3">
            {[
              { key: 'email' as const, icon: Mail, label: 'Email Notifications', desc: 'Quote updates and order confirmations' },
              { key: 'sms' as const, icon: Smartphone, label: 'SMS Notifications', desc: 'Important alerts via text message' },
              { key: 'whatsapp' as const, icon: MessageSquare, label: 'WhatsApp Updates', desc: 'Real-time updates on WhatsApp' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle(item.key)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors ${
                      notifications[item.key] ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                    style={{ height: '22px' }}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                        notifications[item.key] ? 'translate-x-[18px]' : ''
                      }`}
                      style={{ width: '18px', height: '18px' }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Saved successfully</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-1.5 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{saveError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
