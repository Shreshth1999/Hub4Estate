import { Settings, Shield, Mail, Key, Globe, Lock, Server } from 'lucide-react';

interface SettingItem { name: string; value: string; description?: string }
interface SettingsSection { title: string; icon: typeof Settings; settings: SettingItem[] }

export function AdminSettingsPage() {
  const sections: SettingsSection[] = [
    {
      title: 'General Settings',
      icon: Globe,
      settings: [
        { name: 'Platform Name', value: 'Hub4Estate', description: 'The public-facing name of the platform' },
        { name: 'Platform URL', value: 'https://hub4estate.com', description: 'Primary domain for the platform' },
        { name: 'Support Email', value: 'support@hub4estate.com', description: 'Email displayed for user support inquiries' },
        { name: 'Default Currency', value: 'INR', description: 'Default currency for all transactions' },
        { name: 'Default Language', value: 'English (en-IN)', description: 'Primary language of the platform' },
      ],
    },
    {
      title: 'Security Settings',
      icon: Shield,
      settings: [
        { name: 'Two-Factor Authentication', value: 'Enabled', description: 'Require 2FA for admin accounts' },
        { name: 'Session Timeout', value: '30 minutes', description: 'Auto-logout after period of inactivity' },
        { name: 'Password Policy', value: 'Strong (8+ chars, mixed case, numbers)', description: 'Minimum requirements for account passwords' },
        { name: 'Max Login Attempts', value: '5 attempts', description: 'Lock account after consecutive failed logins' },
        { name: 'JWT Token Expiry', value: '24 hours', description: 'Authentication token lifetime' },
      ],
    },
    {
      title: 'Email Settings',
      icon: Mail,
      settings: [
        { name: 'SMTP Provider', value: 'SendGrid', description: 'Email delivery service provider' },
        { name: 'From Address', value: 'noreply@hub4estate.com', description: 'Default sender email address' },
        { name: 'Email Verification', value: 'Required', description: 'Users must verify email on signup' },
        { name: 'Daily Email Limit', value: '10,000', description: 'Maximum transactional emails per day' },
      ],
    },
    {
      title: 'API Keys & Integrations',
      icon: Key,
      settings: [
        { name: 'Google OAuth', value: 'Configured', description: 'Google sign-in integration status' },
        { name: 'Razorpay', value: 'Test Mode', description: 'Payment gateway configuration' },
        { name: 'AWS S3', value: 'Configured', description: 'File storage bucket status' },
        { name: 'Twilio SMS', value: 'Configured', description: 'OTP and SMS notification service' },
        { name: 'Analytics Tracking', value: 'Google Analytics (GA4)', description: 'Web analytics provider' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">View platform configuration</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-700">Settings are in read-only mode. Contact the system administrator to modify configuration values.</p>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto space-y-4">
        {sections.map((section, i) => {
          const SectionIcon = section.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <SectionIcon className="w-3.5 h-3.5 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {section.settings.map((setting, j) => (
                  <div key={j} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{setting.name}</p>
                      {setting.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                      )}
                    </div>
                    <span className="inline-block px-3 py-1.5 bg-gray-100 rounded-lg font-mono text-xs font-medium text-gray-700 flex-shrink-0">
                      {setting.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* System Info */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">System Information</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Environment', value: 'Production' },
                { label: 'Node Version', value: 'v20.x LTS' },
                { label: 'Database', value: 'PostgreSQL 15' },
                { label: 'Framework', value: 'React + Vite' },
                { label: 'Backend', value: 'Express + Prisma' },
                { label: 'Hosting', value: 'Amplify + EC2' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
                  <p className="font-mono text-xs font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
