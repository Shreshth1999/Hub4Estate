/** @type {import('tailwindcss').Config} */
export default {
  // PRD §10.1.1: "prefers-color-scheme: dark is IGNORED" — NO darkMode toggle
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      // PRD §10.1: MOBILE FIRST — 360px starting canvas
      sm:   '360px',
      md:   '768px',
      lg:   '1024px',
      xl:   '1280px',
      '2xl':'1440px',
    },
    extend: {
      colors: {
        // ─── THREE-SHADE SYSTEM (2026 refresh) ────────────────────────────────
        // No blue, no navy, no orange, no gold, no yellow.
        // Only: warm cream (bg) · near-black brown (ink/CTA) · muted tan (accent).
        //
        // Shade 1 — cream (#faf7f2)  : page backgrounds
        // Shade 2 — ink   (#1a1410)  : text, dark sections, primary CTA
        // Shade 3 — tan   (#8b6f47)  : borders, secondary accent, hover
        //
        // All legacy color tokens (amber/violet/purple/accent/navy) are
        // REMAPPED to this palette so existing classes auto-convert.
        primary: {
          50:  '#faf7f2',
          100: '#f2ece2',
          200: '#e6dcc9',
          300: '#d4c5a8',
          400: '#b8a484',
          500: '#8b6f47',
          600: '#6b5537',
          700: '#4d3d27',
          800: '#33281a',
          900: '#241c12',
          950: '#1a1410',
        },
        // Legacy "accent" palette — retuned from terracotta → warm brown.
        accent: {
          50:  '#faf7f2',
          100: '#f2ece2',
          200: '#e6dcc9',
          300: '#d4c5a8',
          400: '#b8a484',
          500: '#8b6f47',
          600: '#6b5537',
          700: '#4d3d27',
          800: '#33281a',
          900: '#241c12',
          950: '#1a1410',
        },
        // Override Tailwind's built-in amber (was orange). Now maps to brown.
        amber: {
          50:  '#faf7f2',
          100: '#f2ece2',
          200: '#e6dcc9',
          300: '#d4c5a8',
          400: '#b8a484',
          500: '#8b6f47',
          600: '#1a1410',
          700: '#0f0a07',
          800: '#0a0704',
          900: '#000000',
          950: '#000000',
        },
        // Override violet/purple — kill any lingering logo or card purples.
        violet: {
          50:  '#faf7f2',
          100: '#f2ece2',
          200: '#e6dcc9',
          300: '#d4c5a8',
          400: '#b8a484',
          500: '#8b6f47',
          600: '#4d3d27',
          700: '#33281a',
          800: '#241c12',
          900: '#1a1410',
          950: '#0f0a07',
        },
        purple: {
          50:  '#faf7f2',
          100: '#f2ece2',
          200: '#e6dcc9',
          300: '#d4c5a8',
          400: '#b8a484',
          500: '#8b6f47',
          600: '#4d3d27',
          700: '#33281a',
          800: '#241c12',
          900: '#1a1410',
          950: '#0f0a07',
        },

        // ─── §10.2.4 Semantic Colors ──────────────────────────────────────────
        success: {
          DEFAULT: '#22C55E',
          bg:      '#DCFCE7',
          text:    '#166534',
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
        warning: {
          // Desaturated into brown palette — no orange/gold anywhere
          DEFAULT: '#8b6f47',
          bg:      '#f2ece2',
          text:    '#33281a',
          50:  '#faf7f2',
          100: '#f2ece2',
          200: '#e6dcc9',
          500: '#8b6f47',
          700: '#33281a',
          800: '#241c12',
        },
        error: {
          DEFAULT: '#EF4444',
          bg:      '#FEE2E2',
          text:    '#991B1B',
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          700: '#b91c1c',
          800: '#991b1b',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg:      '#DBEAFE',
          text:    '#1E40AF',
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          700: '#1d4ed8',
          800: '#1e40af',
        },
        // ─── §10.2.5 Special Colors ───────────────────────────────────────────
        // navy remapped from blue #0B1628 → warm dark brown #1a1410
        navy: '#1a1410',
        'warm-white': '#faf7f2',
        cream: '#f2ece2',
        'light-beige': '#e6dcc9',
      },
      fontFamily: {
        // PRD §10.3.1
        sans:    ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', "'Times New Roman'", 'serif'],
        mono:    ['JetBrains Mono', "'Fira Code'", "'Source Code Pro'", 'monospace'],
      },
      fontSize: {
        // PRD §10.3.2 Display Scale (marketing pages, hero sections)
        'display-2xl': ['4.5rem',   { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '900' }],
        'display-xl':  ['3.75rem',  { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg':  ['3rem',     { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md':  ['2.25rem',  { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm':  ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        // Heading Scale (app UI)
        'heading-xl':  ['1.5rem',   { lineHeight: '1.3', fontWeight: '700' }],
        'heading-lg':  ['1.25rem',  { lineHeight: '1.3', fontWeight: '700' }],
        'heading-md':  ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm':  ['1rem',     { lineHeight: '1.4', fontWeight: '600' }],
        // Body Scale
        'body-lg':     ['1rem',     { lineHeight: '1.6', fontWeight: '400' }],
        'body-md':     ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm':     ['0.75rem',  { lineHeight: '1.5', fontWeight: '400' }],
        // Label Scale
        'label-lg':    ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md':    ['0.75rem',  { lineHeight: '1.25', letterSpacing: '0.06em', fontWeight: '600' }],
        'label-sm':    ['0.625rem', { lineHeight: '1.25', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      spacing: {
        // 4px base grid extensions
        4.5:  '1.125rem',
        13:   '3.25rem',
        15:   '3.75rem',
        18:   '4.5rem',
        22:   '5.5rem',
        26:   '6.5rem',
        30:   '7.5rem',
        34:   '8.5rem',
        38:   '9.5rem',
        42:   '10.5rem',
        46:   '11.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // PRD §10.5 — Neobrutalist shadow system
        // Hard offset shadows give the "serious about business" feel
        'neo-sm':    '2px 2px 0px 0px #2a2418',
        'neo-md':    '4px 4px 0px 0px #2a2418',
        'neo-lg':    '6px 6px 0px 0px #2a2418',
        'neo-xl':    '8px 8px 0px 0px #2a2418',
        'neo-amber': '4px 4px 0px 0px #1a1410',
        // Soft elevation shadows for cards, modals
        'warm-sm':   '0 1px 3px 0 rgba(42,36,24,0.06), 0 1px 2px -1px rgba(42,36,24,0.04)',
        'warm':      '0 4px 16px -2px rgba(42,36,24,0.08), 0 2px 6px -2px rgba(42,36,24,0.05)',
        'warm-md':   '0 8px 24px -4px rgba(42,36,24,0.10), 0 4px 10px -4px rgba(42,36,24,0.06)',
        'warm-lg':   '0 16px 40px -6px rgba(42,36,24,0.12), 0 8px 16px -6px rgba(42,36,24,0.07)',
        'warm-xl':   '0 24px 56px -8px rgba(42,36,24,0.14), 0 12px 24px -8px rgba(42,36,24,0.08)',
        // Focus ring
        'focus-amber': '0 0 0 3px rgba(26,20,16,0.30)',
        'focus-primary': '0 0 0 3px rgba(42,36,24,0.20)',
        // Legacy (keep for existing components that reference these)
        'soft':    '0 4px 20px -2px rgba(0,0,0,0.08)',
        'soft-lg': '0 8px 30px -4px rgba(0,0,0,0.12)',
        'soft-xl': '0 16px 48px -8px rgba(0,0,0,0.15)',
      },
      borderWidth: {
        // PRD §10: Neobrutalist — hard 2px borders
        '2': '2px',
        '3': '3px',
      },
      animation: {
        // PRD §10.1.4: Every state change communicates through motion
        'slide-up':    'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down':  'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':     'fadeIn 0.4s ease-out',
        'scale-in':    'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':     'shimmer 1.8s linear infinite',
        'toast-in':    'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-out':   'toastOut 0.2s ease-in forwards',
        'modal-in':    'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'backdrop-in': 'backdropIn 0.2s ease-out',
        'sheet-up':    'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'float':       'float 6s ease-in-out infinite',
        'bounce-sm':   'bounceSm 0.6s ease-out',
        'tile-reveal': 'tileReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'tile-lift':   'tileLift 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-ring':  'pulseRing 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'drift':       'drift 14s ease-in-out infinite',
        'text-reveal': 'textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'gradient-pan':'gradientPan 8s ease infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        toastIn: {
          '0%':   { transform: 'translateX(100%) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateX(0) scale(1)',        opacity: '1' },
        },
        toastOut: {
          '0%':   { transform: 'translateX(0) scale(1)',        opacity: '1' },
          '100%': { transform: 'translateX(100%) scale(0.95)', opacity: '0' },
        },
        modalIn: {
          '0%':   { transform: 'scale(0.96) translateY(8px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)',       opacity: '1' },
        },
        backdropIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        sheetUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        bounceSm: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.08)' },
          '70%':  { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        tileReveal: {
          '0%':   { transform: 'translateY(20px) scale(0.96)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)',        opacity: '1' },
        },
        tileLift: {
          '0%':   { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-4px) scale(1.02)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.95)', opacity: '0.6' },
          '70%':  { transform: 'scale(1.08)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%':      { transform: 'translate(6px, -8px)' },
        },
        textReveal: {
          '0%':   { transform: 'translateY(18px)', opacity: '0', filter: 'blur(6px)' },
          '100%': { transform: 'translateY(0)',    opacity: '1', filter: 'blur(0)' },
        },
        gradientPan: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      transitionTimingFunction: {
        'smooth':    'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-quart':  'cubic-bezier(0.5, 0, 0.75, 0)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      backgroundImage: {
        // PRD section alternating pattern: white > warm-white > white
        'warm-gradient':  'linear-gradient(135deg, #faf7f2 0%, #f2ece2 100%)',
        'hero-gradient':  'linear-gradient(160deg, #ffffff 0%, #faf7f2 40%, #f2ece2 100%)',
        'amber-gradient': 'linear-gradient(135deg, #4d3d27 0%, #1a1410 100%)',
        'shimmer-warm':   'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
