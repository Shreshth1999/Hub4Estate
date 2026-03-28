import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView, revealStyle } from '../hooks/useInView';

const ROLE_COLORS = [
  {
    cardBg: 'bg-amber-50',
    border: 'border-amber-100 hover:border-amber-200',
    check: 'text-amber-500',
    metricBg: 'bg-amber-100 text-amber-800',
    cta: 'bg-amber-700 hover:bg-amber-800',
    label: 'bg-amber-500',
  },
  {
    cardBg: 'bg-violet-50',
    border: 'border-violet-100 hover:border-violet-200',
    check: 'text-violet-400',
    metricBg: 'bg-violet-100 text-violet-700',
    cta: 'bg-violet-700 hover:bg-violet-800',
    label: 'bg-violet-500',
  },
  {
    cardBg: 'bg-slate-50',
    border: 'border-slate-100 hover:border-slate-200',
    check: 'text-slate-400',
    metricBg: 'bg-slate-200 text-slate-700',
    cta: 'bg-slate-800 hover:bg-slate-900',
    label: 'bg-slate-600',
  },
  {
    cardBg: 'bg-green-50',
    border: 'border-green-100 hover:border-green-200',
    check: 'text-green-500',
    metricBg: 'bg-green-100 text-green-700',
    cta: 'bg-green-700 hover:bg-green-800',
    label: 'bg-green-500',
  },
] as const;

export function PersonaSection() {
  const { tx } = useLanguage();
  const { personas } = tx;
  const sectionRef = useRef<HTMLElement>(null);
  const { ref, inView } = useInView(0.06);

  return (
    <section ref={sectionRef as any} className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

        {/* Header */}
        <div ref={ref as any} className="mb-12 sm:mb-14">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3"
            style={revealStyle(inView, 0)}
          >
            {personas.label}
          </p>
          <h2
            className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3 tracking-tight"
            style={revealStyle(inView, 0.08)}
          >
            {personas.title}
          </h2>
          <p
            className="text-base text-gray-500 max-w-xl leading-relaxed"
            style={revealStyle(inView, 0.14)}
          >
            {personas.subtitle}
          </p>
        </div>

        {/* 2×2 Grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {personas.items.map((item, i) => {
            const color = ROLE_COLORS[i];
            return (
              <div
                key={item.role}
                className={`${color.cardBg} border ${color.border} rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                style={revealStyle(inView, 0.1 + i * 0.08)}
              >
                {/* Icon + Role */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl leading-none">{item.icon}</span>
                  <div>
                    <span className="text-sm font-bold text-gray-900">{item.role}</span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 leading-snug">
                  {item.headline}
                </h3>

                {/* Bullets */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {item.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className={`w-4 h-4 ${color.check} flex-shrink-0 mt-0.5`} />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Metric pill */}
                <div className="mb-5">
                  <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${color.metricBg}`}>
                    {item.metric}
                  </span>
                </div>

                {/* CTA */}
                {item.isLink ? (
                  <Link
                    to={item.ctaLink}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 ${color.cta} text-white text-sm font-medium rounded-xl transition-all duration-200 self-start hover:shadow-md`}
                  >
                    {item.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => document.getElementById(item.ctaLink)?.scrollIntoView({ behavior: 'smooth' })}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 ${color.cta} text-white text-sm font-medium rounded-xl transition-all duration-200 self-start hover:shadow-md`}
                  >
                    {item.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
