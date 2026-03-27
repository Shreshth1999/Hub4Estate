import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function PersonaSection() {
  const { tx } = useLanguage();
  const { personas } = tx;

  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            {personas.label}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
            {personas.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed">
            {personas.subtitle}
          </p>
        </div>

        {/* 2×2 Grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {personas.items.map((item) => (
            <div
              key={item.role}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-7 flex flex-col"
            >
              {/* Icon + Role */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl leading-none">{item.icon}</span>
                <span className="text-sm font-semibold text-gray-900">{item.role}</span>
              </div>

              {/* Headline */}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 leading-snug">
                {item.headline}
              </h3>

              {/* Bullets */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {item.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Metric */}
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {item.metric}
              </p>

              {/* CTA */}
              {item.isLink ? (
                <Link
                  to={item.ctaLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors self-start"
                >
                  {item.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => document.getElementById(item.ctaLink)?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors self-start"
                >
                  {item.cta} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
