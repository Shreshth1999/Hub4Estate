import { useState } from 'react';
import { Settings, Shield, Mail, Key, Globe, Lock, Database, Bell, Server } from 'lucide-react';

interface SettingItem {
  name: string;
  value: string;
  description?: string;
}

interface SettingsSection {
  title: string;
  icon: typeof Settings;
  color: string;
  settings: SettingItem[];
}

export function AdminSettingsPage() {
  const sections: SettingsSection[] = [
    {
      title: 'General Settings',
      icon: Globe,
      color: 'bg-blue-500',
      settings: [
        {
          name: 'Platform Name',
          value: 'Hub4Estate',
          description: 'The public-facing name of the platform',
        },
        {
          name: 'Platform URL',
          value: 'https://hub4estate.com',
          description: 'Primary domain for the platform',
        },
        {
          name: 'Support Email',
          value: 'support@hub4estate.com',
          description: 'Email displayed for user support inquiries',
        },
        {
          name: 'Default Currency',
          value: 'INR',
          description: 'Default currency for all transactions',
        },
        {
          name: 'Default Language',
          value: 'English (en-IN)',
          description: 'Primary language of the platform',
        },
      ],
    },
    {
      title: 'Security Settings',
      icon: Shield,
      color: 'bg-emerald-500',
      settings: [
        {
          name: 'Two-Factor Authentication',
          value: 'Enabled',
          description: 'Require 2FA for admin accounts',
        },
        {
          name: 'Session Timeout',
          value: '30 minutes',
          description: 'Auto-logout after period of inactivity',
        },
        {
          name: 'Password Policy',
          value: 'Strong (8+ chars, mixed case, numbers)',
          description: 'Minimum requirements for account passwords',
        },
        {
          name: 'Max Login Attempts',
          value: '5 attempts',
          description: 'Lock account after consecutive failed logins',
        },
        {
          name: 'JWT Token Expiry',
          value: '24 hours',
          description: 'Authentication token lifetime',
        },
      ],
    },
    {
      title: 'Email Settings',
      icon: Mail,
      color: 'bg-amber-500',
      settings: [
        {
          name: 'SMTP Provider',
          value: 'SendGrid',
          description: 'Email delivery service provider',
        },
        {
          name: 'From Address',
          value: 'noreply@hub4estate.com',
          description: 'Default sender email address',
        },
        {
          name: 'Email Verification',
          value: 'Required',
          description: 'Users must verify email on signup',
        },
        {
          name: 'Daily Email Limit',
          value: '10,000',
          description: 'Maximum transactional emails per day',
        },
      ],
    },
    {
      title: 'API Keys & Integrations',
      icon: Key,
      color: 'bg-purple-500',
      settings: [
        {
          name: 'Google OAuth',
          value: 'Configured',
          description: 'Google sign-in integration status',
        },
        {
          name: 'Razorpay',
          value: 'Test Mode',
          description: 'Payment gateway configuration',
        },
        {
          name: 'AWS S3',
          value: 'Configured',
          description: 'File storage bucket status',
        },
        {
          name: 'Twilio SMS',
          value: 'Configured',
          description: 'OTP and SMS notification service',
        },
        {
          name: 'Analytics Tracking',
          value: 'Google Analytics (GA4)',
          description: 'Web analytics provider',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Platform Settings</h1>
              <p className="text-neutral-300 font-medium">
                View and manage platform configuration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-4 bg-blue-50 border-b-2 border-blue-200">
        <div className="container-custom">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-800 text-sm">
              Settings are currently in read-only mode. Contact the system administrator to
              modify configuration values.
            </span>
          </div>
        </div>
      </section>

      {/* Settings Sections */}
      <section className="py-8">
        <div className="container-custom space-y-8">
          {sections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;

            return (
              <div
                key={sectionIndex}
                className="border-2 border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                {/* Section Header */}
                <div className="flex items-center space-x-3 p-6 border-b-2 border-neutral-200 bg-neutral-50">
                  <div
                    className={`w-10 h-10 ${section.color} flex items-center justify-center`}
                  >
                    <SectionIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
                    {section.title}
                  </h2>
                </div>

                {/* Settings List */}
                <div className="divide-y-2 divide-neutral-100">
                  {section.settings.map((setting, settingIndex) => (
                    <div
                      key={settingIndex}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-neutral-50 transition-colors gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 text-sm">
                          {setting.name}
                        </p>
                        {setting.description && (
                          <p className="text-xs text-neutral-400 font-medium mt-0.5">
                            {setting.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block px-4 py-2 bg-neutral-100 border-2 border-neutral-200 font-mono font-bold text-sm text-neutral-700">
                          {setting.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* System Info Card */}
          <div className="border-2 border-neutral-200">
            <div className="flex items-center space-x-3 p-6 border-b-2 border-neutral-200 bg-neutral-50">
              <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
                System Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 border-2 border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Environment
                  </p>
                  <p className="font-mono font-bold text-neutral-900">Production</p>
                </div>
                <div className="p-4 bg-neutral-50 border-2 border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Node Version
                  </p>
                  <p className="font-mono font-bold text-neutral-900">v20.x LTS</p>
                </div>
                <div className="p-4 bg-neutral-50 border-2 border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Database
                  </p>
                  <p className="font-mono font-bold text-neutral-900">PostgreSQL 15</p>
                </div>
                <div className="p-4 bg-neutral-50 border-2 border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Framework
                  </p>
                  <p className="font-mono font-bold text-neutral-900">React + Vite</p>
                </div>
                <div className="p-4 bg-neutral-50 border-2 border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Backend
                  </p>
                  <p className="font-mono font-bold text-neutral-900">Express + Prisma</p>
                </div>
                <div className="p-4 bg-neutral-50 border-2 border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Hosting
                  </p>
                  <p className="font-mono font-bold text-neutral-900">Vercel + Render</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
