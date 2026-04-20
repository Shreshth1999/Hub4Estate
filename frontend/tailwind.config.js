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
        // ─── FOUR-SHADE SYSTEM (matches reference screenshots) ────────────────
        // white · cream (alt) · pure black (dark) · terracotta (accent)
        //
        // NO dark blue, NO navy, NO yellow-gold amber. The rust/terracotta
        // accent is a muted earth tone — distinct from the yellow-gold orange
        // we banned.
        //
        //   Accent (terracotta): #d3815e (500) · #c4724f (600) · #a85f42 (700)
        //   Dark (pure black):   #09090B
        //   Alt bg (cream):      #f5f3ef · #faf9f7
        //   Primary bg:          white
        primary: {
          50:  '#f5f0eb',
          100: '#ede5db',
          200: '#e0d5c5',
          300: '#d4cdc0',
          400: '#b8ad9a',
          500: '#9c8e78',
          600: '#8a7a62',
          700: '#726452',
          800: '#5e5345',
          900: '#4d4439',
          950: '#2a2418',
        },
        accent: {
          // Terracotta / rust — the earth-tone accent from the reference.
          50:  '#fdf8f5',
          100: '#faeee8',
          200: '#f5dcd0',
          300: '#edc4b0',
          400: '#e3a688',
          500: '#d3815e',
          600: '#c4724f',
          700: '#a85f42',
          800: '#8c4e37',
          900: '#74412f',
          950: '#3d2118',
        },
        // Override Tailwind's built-in amber — remap to terracotta so every
        // legacy `bg-amber-600` on the site renders as the reference rust tone,
        // not the banned yellow-gold #D97706.
        amber: {
          50:  '#fdf8f5',
          100: '#faeee8',
          200: '#f5dcd0',
          300: '#edc4b0',
          400: '#e3a688',
          500: '#d3815e',
          600: '#c4724f',
          700: '#a85f42',
          800: '#8c4e37',
          900: '#74412f',
          950: '#3d2118',
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
        // Override Tailwind's built-in blue — remap to neutral slate/grey.
        // User banned dark blue + navy; routing all blue-* classes to
        // greys keeps semantic contrast without color-casting.
        blue: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#09090b',
        },
        // Also map indigo/sky to the same neutral scale.
        indigo: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#09090b',
        },
        sky: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#09090b',
        },
        // Also override yellow → terracotta so stray yellow stars/badges
        // on older screenshots render as the accent instead of banned gold.
        yellow: {
          50:  '#fdf8f5',
          100: '#faeee8',
          200: '#f5dcd0',
          300: '#edc4b0',
          400: '#e3a688',
          500: '#d3815e',
          600: '#c4724f',
          700: '#a85f42',
          800: '#8c4e37',
          900: '#74412f',
          950: '#3d2118',
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
          // Warning uses the terracotta family — earth tone, no yellow-gold.
          DEFAULT: '#c4724f',
          bg:      '#faeee8',
          text:    '#74412f',
          50:  '#fdf8f5',
          100: '#faeee8',
          200: '#f5dcd0',
          500: '#d3815e',
          700: '#a85f42',
          800: '#8c4e37',
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
          // info remapped from blue to neutral slate — no dark blue anywhere.
          DEFAULT: '#64748b',
          bg:      '#f1f5f9',
          text:    '#334155',
          50:  '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          700: '#334155',
          800: '#1e293b',
        },
        // ─── §10.2.5 Special Colors ───────────────────────────────────────────
        // "navy" is a misnomer — #09090B is pure near-black (RGB 9,9,11).
        // Used for dark sections (hero category grid, dark CTAs, footer).
        navy: '#09090B',
        'warm-white': '#faf9f7',
        cream: '#f5f3ef',
        'light-beige': '#e8e4db',
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
        'neo-amber': '4px 4px 0px 0px #c4724f',
        // Soft elevation shadows for cards, modals
        'warm-sm':   '0 1px 3px 0 rgba(42,36,24,0.06), 0 1px 2px -1px rgba(42,36,24,0.04)',
        'warm':      '0 4px 16px -2px rgba(42,36,24,0.08), 0 2px 6px -2px rgba(42,36,24,0.05)',
        'warm-md':   '0 8px 24px -4px rgba(42,36,24,0.10), 0 4px 10px -4px rgba(42,36,24,0.06)',
        'warm-lg':   '0 16px 40px -6px rgba(42,36,24,0.12), 0 8px 16px -6px rgba(42,36,24,0.07)',
        'warm-xl':   '0 24px 56px -8px rgba(42,36,24,0.14), 0 12px 24px -8px rgba(42,36,24,0.08)',
        // Focus ring
        'focus-amber': '0 0 0 3px rgba(196,114,79,0.35)',
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
        'warm-gradient':  'linear-gradient(135deg, #faf9f7 0%, #f5f0eb 100%)',
        'hero-gradient':  'linear-gradient(160deg, #ffffff 0%, #faf9f7 40%, #f5f0eb 100%)',
        'amber-gradient': 'linear-gradient(135deg, #d3815e 0%, #c4724f 100%)',
        'shimmer-warm':   'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
