import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView, revealStyle } from '../hooks/useInView';

export function PersonaSection() {
  const { tx } = useLanguage();
  const { personas } = tx;
  const { ref, inView } = useInView(0.06);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div ref={ref as any} className="max-w-2xl mb-16">
          <span
            className="inline-block text-[11px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full"
            style={revealStyle(inView, 0)}
          >
            {personas.label}
          </span>
          <h2
            className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight"
            style={revealStyle(inView, 0.07)}
          >
            {personas.title}
          </h2>
          <p
            className="text-lg text-gray-500 leading-relaxed"
            style={revealStyle(inView, 0.13)}
          >
            {personas.subtitle}
          </p>
        </div>

        {/* 2×2 Grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {personas.items.map((item, i) => (
            <div
              key={item.role}
              className="border border-gray-100 rounded-2xl overflow-hidden hover:border-amber-200 hover:shadow-lg transition-all duration-300 group"
              style={revealStyle(inView, 0.1 + i * 0.07)}
            >
              {/* Amber top accent bar */}
              <div className="h-[3px] bg-amber-600" />

              <div className="p-7 sm:p-8 flex flex-col h-full">
                {/* Role header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    {item.role}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 leading-snug">
                  {item.headline}
                </h3>

                {/* Bullets */}
                <ul className="space-y-3 mb-7 flex-1">
                  {item.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-amber-600" />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Metric pill */}
                <div className="inline-block px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl mb-6">
                  <p className="text-xs font-bold text-amber-700">{item.metric}</p>
                </div>

                {/* CTA */}
                {item.isLink ? (
                  <Link
                    to={item.ctaLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1628] text-white text-sm font-semibold rounded-xl hover:bg-[#0F2040] transition-all duration-200 self-start group-hover:gap-3"
                  >
                    {item.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => document.getElementById(item.ctaLink)?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1628] text-white text-sm font-semibold rounded-xl hover:bg-[#0F2040] transition-all duration-200 self-start group-hover:gap-3"
                  >
                    {item.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
