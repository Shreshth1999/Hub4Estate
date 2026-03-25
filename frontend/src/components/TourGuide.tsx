import { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface TourStep {
  title: string;
  description: string;
  /** CSS selector for the element to highlight. If omitted, shows as centered modal. */
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOURS: Record<string, TourStep[]> = {
  user: [
    {
      title: 'Welcome to Hub4Estate',
      description: 'Get the best prices on electrical products — no middlemen, full transparency. Let us show you around.',
    },
    {
      title: 'Post a Requirement (RFQ)',
      description: 'Tell us what you need. Verified dealers in your city will quote directly. You compare and choose.',
      target: '[data-tour="new-rfq"]',
    },
    {
      title: 'See all your RFQs',
      description: 'Track every request — from posted to quotes received to order placed.',
      target: '[data-tour="my-rfqs"]',
    },
    {
      title: 'Spark AI is here to help',
      description: 'Ask Spark anything — product specs, estimated prices, which brand suits your project. Always on, always free.',
      target: '[data-tour="spark-ai"]',
    },
  ],
  professional: [
    {
      title: 'Your Professional Portal',
      description: 'As a verified professional, dealers see your badge on every RFQ you post. It builds trust and gets you better quotes.',
    },
    {
      title: 'Get your verification badge',
      description: 'Upload your credentials (COA, trade license, etc.) and we\'ll verify you within 24 hours. Your badge shows to dealers automatically.',
      target: '[data-tour="verification"]',
    },
    {
      title: 'Post project requirements',
      description: 'Post RFQs for your projects. Dealers see you\'re a verified professional and treat you accordingly.',
      target: '[data-tour="new-rfq"]',
    },
    {
      title: 'Build your portfolio',
      description: 'Add your completed projects to your profile. Dealers and clients can see your track record.',
      target: '[data-tour="projects"]',
    },
  ],
  dealer: [
    {
      title: 'Your Dealer Dashboard',
      description: 'See incoming RFQs, submit quotes, and track your conversion. Everything you need in one place.',
    },
    {
      title: 'Browse open RFQs',
      description: 'See RFQs from verified buyers in your area — with their role badge. Architect? Interior Designer? You know who you\'re dealing with.',
      target: '[data-tour="rfq-inbox"]',
    },
    {
      title: 'Submit a quote',
      description: 'Quote on any RFQ that matches your product range. The buyer sees your quote alongside others and picks the best.',
      target: '[data-tour="submit-quote"]',
    },
    {
      title: 'Build your profile',
      description: 'Add the brands you stock, your service areas, and verified documents. A complete profile gets more RFQs.',
      target: '[data-tour="dealer-profile"]',
    },
  ],
  admin: [
    {
      title: 'Admin Panel',
      description: 'Manage the entire platform — dealers, users, RFQs, verification requests, and analytics.',
    },
    {
      title: 'Verify professionals',
      description: 'Review document uploads from Architects, Interior Designers, and Contractors. Approve or reject to assign their badge.',
    },
    {
      title: 'Fraud monitoring',
      description: 'Real-time flags on suspicious activity. Review and take action from the Fraud Monitoring page.',
    },
  ],
};

const STORAGE_KEY = 'h4e_tour';

interface TourStorage {
  [roleKey: string]: { completed: boolean; dismissed: boolean; step: number };
}

function getTourStorage(): TourStorage {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setTourStorage(data: TourStorage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface TourGuideProps {
  /** Which tour to run. Maps to TOURS keys. */
  tourKey: string;
  /** If true, forces the tour to show even if already completed */
  forceShow?: boolean;
}

export function TourGuide({ tourKey, forceShow = false }: TourGuideProps) {
  const { user } = useAuthStore();
  const steps = TOURS[tourKey] ?? [];
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user || steps.length === 0) return;
    const storage = getTourStorage();
    const state = storage[tourKey];
    if (forceShow || !state?.completed && !state?.dismissed) {
      setStep(state?.step ?? 0);
      setVisible(true);
    }
  }, [user, tourKey, forceShow, steps.length]);

  const saveState = useCallback((updates: Partial<{ completed: boolean; dismissed: boolean; step: number }>) => {
    const storage = getTourStorage();
    const current = storage[tourKey] ?? { completed: false, dismissed: false, step: 0 };
    setTourStorage({ ...storage, [tourKey]: { ...current, step, ...updates } });
  }, [tourKey, step]);

  const next = () => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      saveState({ step: nextStep });
    } else {
      complete();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const complete = () => {
    saveState({ completed: true });
    setVisible(false);
  };

  const dismiss = () => {
    saveState({ dismissed: true });
    setVisible(false);
  };

  if (!visible || steps.length === 0) return null;

  const current = steps[step];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[998]"
        onClick={dismiss}
      />

      {/* Card — always centered for now (full spotlight targeting is complex; can extend later) */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto">

          {/* Progress bar */}
          <div className="h-1 bg-gray-100 rounded-t-2xl overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-1">
                  Step {step + 1} of {steps.length}
                </p>
                <h3 className="text-base font-semibold text-gray-900">{current.title}</h3>
              </div>
              <button
                onClick={dismiss}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 -mr-1 -mt-1"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">{current.description}</p>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prev}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === step ? 'bg-gray-900 w-4' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors"
              >
                {step === steps.length - 1 ? 'Done' : 'Next'}
                {step < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Hook to programmatically re-trigger the tour */
export function useRestartTour(tourKey: string) {
  return () => {
    const storage = getTourStorage();
    setTourStorage({ ...storage, [tourKey]: { completed: false, dismissed: false, step: 0 } });
    window.location.reload();
  };
}
