import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Interactive Category Grid for Hub4Estate
 *
 * Each tile contains:
 * - Blueprint-style electrical illustrations
 * - Category-specific micro-interactions on hover
 * - Connected wiring between tiles
 * - Scroll-based animations
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface InteractiveCategoryGridProps {
  categories: Category[];
  loading?: boolean;
}

// Static fallback categories to display when API fails or returns empty
export const STATIC_CATEGORIES: Category[] = [
  { id: '1', name: 'Wires & Cables', slug: 'wires-cables', description: 'House wiring and armoured cables' },
  { id: '2', name: 'Modular Switches & Sockets', slug: 'switches-sockets', description: 'Premium modular switches' },
  { id: '3', name: 'MCBs & Distribution', slug: 'mcbs-distribution', description: 'Circuit breakers and distribution boards' },
  { id: '4', name: 'Switchgear & Protection', slug: 'switchgear-protection', description: 'MCBs, RCCBs, and surge protection' },
  { id: '5', name: 'Lighting', slug: 'lighting', description: 'LED bulbs, panels, and tubes' },
  { id: '6', name: 'Lighting & Luminaires', slug: 'lighting-luminaires', description: 'LED panels and decorative fixtures' },
  { id: '7', name: 'Fans & Ventilation', slug: 'fans-ventilation', description: 'Ceiling fans and exhaust systems' },
  { id: '8', name: 'Water Heaters', slug: 'water-heaters', description: 'Geysers and water heating solutions' },
  { id: '9', name: 'Earthing & Safety Systems', slug: 'earthing-safety-systems', description: 'Earth pits and lightning protection' },
  { id: '10', name: 'Power Backup & Solar', slug: 'power-backup-solar', description: 'Inverters, batteries, and solar' },
  { id: '11', name: 'Doorbells & Accessories', slug: 'doorbells-accessories', description: 'Wired and wireless doorbells' },
  { id: '12', name: 'Conduits & Accessories', slug: 'conduits-accessories', description: 'PVC conduits and wiring accessories' },
  { id: '13', name: 'Tools & Testers', slug: 'tools-testers', description: 'Multimeters and hand tools' },
  { id: '14', name: 'Smart Electrical & Automation', slug: 'smart-electrical-automation', description: 'Smart switches and home automation' },
];

// Category illustration configurations
export const categoryIllustrations: Record<string, {
  renderSVG: (isHovered: boolean, animationPhase: number) => JSX.Element;
}> = {
  'electrical-wiring': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <defs>
          <linearGradient id="wire-flow-wiring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#525252" />
            <stop offset={`${(phase * 30) % 100}%`} stopColor="#d3815e" />
            <stop offset={`${((phase * 30) + 20) % 100}%`} stopColor="#525252" />
          </linearGradient>
        </defs>
        {/* Wall section with conduits */}
        <rect x="10" y="10" width="100" height="80" fill="none" stroke="#404040" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Phase wire - red */}
        <path
          d="M 15 30 H 50 V 50 H 80 V 30 H 105"
          fill="none"
          stroke={isHovered ? "url(#wire-flow-wiring)" : "#ef4444"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        <text x="20" y="26" fill="#71717a" fontSize="6" fontFamily="monospace">L</text>

        {/* Neutral wire - blue */}
        <path
          d="M 15 50 H 40 V 70 H 90 V 50 H 105"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          opacity={isHovered ? 1 : 0.7}
        />
        <text x="20" y="46" fill="#71717a" fontSize="6" fontFamily="monospace">N</text>

        {/* Earth wire - green */}
        <path
          d="M 15 70 H 60 V 85 H 105"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          opacity={isHovered ? 1 : 0.7}
        />
        <text x="20" y="66" fill="#71717a" fontSize="6" fontFamily="monospace">E</text>

        {/* Junction boxes */}
        <rect x="48" y="45" width="8" height="10" fill="#262626" stroke="#525252" strokeWidth="0.5" />
        <rect x="78" y="45" width="8" height="10" fill="#262626" stroke="#525252" strokeWidth="0.5" />

        {/* Current flow indicators */}
        {isHovered && (
          <>
            <circle cx={20 + (phase * 8) % 85} cy="30" r="2" fill="#d3815e" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={25 + (phase * 6) % 75} cy="50" r="1.5" fill="#60a5fa" opacity="0.6" />
          </>
        )}

        {/* Measurement labels */}
        <text x="95" y="95" fill="#52525b" fontSize="5" fontFamily="monospace">4 sq mm Cu</text>
      </svg>
    ),
  },

  'led-lighting': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <defs>
          <radialGradient id="bulb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={isHovered ? 0.6 : 0.1} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Light glow */}
        {isHovered && (
          <circle cx="60" cy="40" r="35" fill="url(#bulb-glow)" filter="url(#blur-glow)">
            <animate attributeName="r" values="30;35;30" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Bulb outline */}
        <ellipse cx="60" cy="35" rx="20" ry="25" fill="none" stroke="#525252" strokeWidth="1.5" />

        {/* LED chips inside */}
        <rect x="52" y="25" width="4" height="4" fill={isHovered ? "#fbbf24" : "#525252"} rx="0.5" />
        <rect x="58" y="25" width="4" height="4" fill={isHovered ? "#fbbf24" : "#525252"} rx="0.5" />
        <rect x="64" y="25" width="4" height="4" fill={isHovered ? "#fbbf24" : "#525252"} rx="0.5" />
        <rect x="55" y="32" width="4" height="4" fill={isHovered ? "#fbbf24" : "#525252"} rx="0.5" />
        <rect x="61" y="32" width="4" height="4" fill={isHovered ? "#fbbf24" : "#525252"} rx="0.5" />

        {/* Base/cap */}
        <rect x="50" y="58" width="20" height="8" fill="#404040" stroke="#525252" strokeWidth="0.5" />
        <path d="M 52 66 L 52 72 L 68 72 L 68 66" fill="none" stroke="#525252" strokeWidth="1" />

        {/* Light rays (dotted) */}
        <g stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="2,2" opacity={isHovered ? 0.8 : 0.2}>
          <line x1="60" y1="10" x2="60" y2="0" />
          <line x1="40" y1="20" x2="30" y2="10" />
          <line x1="80" y1="20" x2="90" y2="10" />
          <line x1="35" y1="40" x2="25" y2="40" />
          <line x1="85" y1="40" x2="95" y2="40" />
        </g>

        {/* Driver circuit */}
        <rect x="85" y="70" width="25" height="15" fill="none" stroke="#404040" strokeWidth="0.5" />
        <text x="87" y="80" fill="#52525b" fontSize="5" fontFamily="monospace">Driver</text>

        {/* Power label */}
        <text x="55" y="95" fill="#52525b" fontSize="6" fontFamily="monospace">9W LED</text>
      </svg>
    ),
  },

  'mcbs-distribution': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Distribution board outline */}
        <rect x="15" y="10" width="90" height="80" fill="#1a1a1a" stroke="#404040" strokeWidth="1" rx="2" />

        {/* Busbar */}
        <rect x="20" y="15" width="80" height="4" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />

        {/* MCB slots */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${25 + i * 20}, 25)`}>
            <rect width="15" height="35" fill="#262626" stroke="#404040" strokeWidth="0.5" rx="1" />
            {/* Toggle */}
            <rect
              x="3"
              y={isHovered && i === phase % 4 ? 5 : 20}
              width="9"
              height="10"
              fill={isHovered && i === phase % 4 ? "#22c55e" : "#404040"}
              rx="1"
              className="transition-all duration-200"
            />
            {/* Rating label */}
            <text x="7.5" y="50" fill="#71717a" fontSize="5" textAnchor="middle" fontFamily="monospace">
              {[16, 32, 20, 25][i]}A
            </text>
          </g>
        ))}

        {/* Neutral bar */}
        <rect x="20" y="70" width="80" height="3" fill="#3b82f6" opacity="0.6" />

        {/* Earth bar */}
        <rect x="20" y="76" width="80" height="3" fill="#22c55e" opacity="0.6" />

        {/* Fault indicator */}
        {isHovered && (
          <g>
            <circle cx="100" cy="20" r="4" fill="#ef4444">
              <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <text x="85" y="10" fill="#ef4444" fontSize="5" fontFamily="monospace">FAULT</text>
          </g>
        )}

        {/* Label */}
        <text x="60" y="95" fill="#52525b" fontSize="6" textAnchor="middle" fontFamily="monospace">DB 4-Way</text>
      </svg>
    ),
  },

  'switchgear-protection': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Surge protector symbol */}
        <rect x="40" y="20" width="40" height="50" fill="none" stroke="#404040" strokeWidth="1" rx="2" />

        {/* MOV symbol inside */}
        <circle cx="60" cy="45" r="12" fill="none" stroke="#525252" strokeWidth="1" />
        <path d="M 52 45 L 68 45" stroke="#525252" strokeWidth="1" />
        <path d="M 60 37 L 60 53" stroke="#525252" strokeWidth="1" />

        {/* Lightning bolt - incoming surge */}
        <path
          d="M 25 10 L 35 25 L 28 25 L 38 45"
          fill="none"
          stroke={isHovered ? "#fbbf24" : "#525252"}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        >
          {isHovered && (
            <animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.3s" repeatCount="3" />
          )}
        </path>

        {/* Diverted to ground */}
        <path
          d="M 60 70 L 60 80 L 60 85"
          fill="none"
          stroke={isHovered ? "#22c55e" : "#525252"}
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Earth symbol */}
        <g transform="translate(50, 85)">
          <line x1="10" y1="0" x2="10" y2="5" stroke={isHovered ? "#22c55e" : "#525252"} strokeWidth="2" />
          <line x1="0" y1="5" x2="20" y2="5" stroke={isHovered ? "#22c55e" : "#525252"} strokeWidth="2" />
          <line x1="3" y1="8" x2="17" y2="8" stroke={isHovered ? "#22c55e" : "#525252"} strokeWidth="1.5" />
          <line x1="6" y1="11" x2="14" y2="11" stroke={isHovered ? "#22c55e" : "#525252"} strokeWidth="1" />
        </g>

        {/* Status indicator */}
        <circle cx="60" cy="25" r="3" fill={isHovered ? "#22c55e" : "#404040"} />

        {/* Labels */}
        <text x="85" y="40" fill="#52525b" fontSize="5" fontFamily="monospace">SPD</text>
        <text x="85" y="50" fill="#52525b" fontSize="5" fontFamily="monospace">Type 2</text>
      </svg>
    ),
  },

  'modular-switches-sockets': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Switch plate */}
        <rect x="30" y="15" width="60" height="70" fill="#262626" stroke="#404040" strokeWidth="1" rx="3" />

        {/* Switch module */}
        <g transform="translate(40, 25)">
          <rect width="40" height="25" fill="#1a1a1a" stroke="#525252" strokeWidth="0.5" rx="2" />
          {/* Rocker */}
          <rect
            x="5"
            y={isHovered ? 3 : 12}
            width="30"
            height="10"
            fill={isHovered ? "#404040" : "#333"}
            rx="2"
            className="transition-all duration-200"
          />
          {/* Indicator */}
          <circle cx="35" cy="6" r="2" fill={isHovered ? "#22c55e" : "#404040"} />
        </g>

        {/* Socket module */}
        <g transform="translate(40, 55)">
          <rect width="40" height="25" fill="#1a1a1a" stroke="#525252" strokeWidth="0.5" rx="2" />
          {/* Pin holes */}
          <circle cx="12" cy="10" r="3" fill="none" stroke="#525252" strokeWidth="1" />
          <circle cx="28" cy="10" r="3" fill="none" stroke="#525252" strokeWidth="1" />
          <circle cx="20" cy="18" r="3" fill="none" stroke="#525252" strokeWidth="1" />
        </g>

        {/* Internal spring (exploded view hint) */}
        {isHovered && (
          <g opacity="0.5">
            <path d="M 95 35 Q 100 40 95 45 Q 100 50 95 55" fill="none" stroke="#71717a" strokeWidth="1" />
            <line x1="90" y1="35" x2="95" y2="35" stroke="#71717a" strokeWidth="0.5" strokeDasharray="2,1" />
            <line x1="90" y1="55" x2="95" y2="55" stroke="#71717a" strokeWidth="0.5" strokeDasharray="2,1" />
            <text x="100" y="47" fill="#52525b" fontSize="4" fontFamily="monospace">spring</text>
          </g>
        )}

        {/* Screws */}
        <circle cx="40" cy="20" r="2" fill="#404040" />
        <circle cx="80" cy="20" r="2" fill="#404040" />
        <circle cx="40" cy="80" r="2" fill="#404040" />
        <circle cx="80" cy="80" r="2" fill="#404040" />
      </svg>
    ),
  },

  'fans-ventilation': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <defs>
          <linearGradient id="airflow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fan housing circle */}
        <circle cx="60" cy="45" r="35" fill="none" stroke="#404040" strokeWidth="1" />

        {/* Fan blades */}
        <g
          style={{
            transformOrigin: '60px 45px',
            transform: isHovered ? `rotate(${phase * 45}deg)` : 'rotate(0deg)',
            transition: 'transform 0.1s linear'
          }}
        >
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <ellipse
              key={i}
              cx="60"
              cy="25"
              rx="6"
              ry="18"
              fill="#333"
              stroke="#525252"
              strokeWidth="0.5"
              transform={`rotate(${angle} 60 45)`}
            />
          ))}
        </g>

        {/* Center hub */}
        <circle cx="60" cy="45" r="8" fill="#262626" stroke="#525252" strokeWidth="1" />
        <circle cx="60" cy="45" r="3" fill="#404040" />

        {/* Airflow lines */}
        {isHovered && (
          <g stroke="#60a5fa" strokeWidth="0.5" opacity="0.6">
            <path d="M 60 85 Q 50 90 40 95">
              <animate attributeName="d" values="M 60 85 Q 50 90 40 95;M 60 85 Q 55 92 45 98;M 60 85 Q 50 90 40 95" dur="1s" repeatCount="indefinite" />
            </path>
            <path d="M 60 85 Q 60 92 60 98">
              <animate attributeName="d" values="M 60 85 Q 60 92 60 98;M 60 85 Q 62 94 65 100;M 60 85 Q 60 92 60 98" dur="1.2s" repeatCount="indefinite" />
            </path>
            <path d="M 60 85 Q 70 90 80 95">
              <animate attributeName="d" values="M 60 85 Q 70 90 80 95;M 60 85 Q 65 92 75 98;M 60 85 Q 70 90 80 95" dur="1.1s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {/* RPM indicator */}
        <text x="95" y="20" fill="#52525b" fontSize="5" fontFamily="monospace">RPM</text>
        <text x="95" y="28" fill={isHovered ? "#60a5fa" : "#52525b"} fontSize="6" fontFamily="monospace">
          {isHovered ? "380" : "0"}
        </text>
      </svg>
    ),
  },

  'lighting-luminaires': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <defs>
          <linearGradient id="beam-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={isHovered ? 0.4 : 0.1} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ceiling mount */}
        <rect x="50" y="5" width="20" height="5" fill="#404040" />
        <line x1="60" y1="10" x2="60" y2="20" stroke="#525252" strokeWidth="2" />

        {/* Fixture body */}
        <path d="M 40 20 L 80 20 L 85 30 L 35 30 Z" fill="#333" stroke="#525252" strokeWidth="0.5" />

        {/* Light beam cone */}
        <path
          d={isHovered ? "M 35 30 L 20 90 L 100 90 L 85 30 Z" : "M 40 30 L 30 90 L 90 90 L 80 30 Z"}
          fill="url(#beam-grad)"
          className="transition-all duration-500"
        />

        {/* Beam angle markings */}
        <g stroke="#525252" strokeWidth="0.5" strokeDasharray="2,2">
          <line x1="60" y1="30" x2="30" y2="80" />
          <line x1="60" y1="30" x2="90" y2="80" />
        </g>

        {/* Angle labels */}
        <text x="15" y="60" fill="#52525b" fontSize="5" fontFamily="monospace" transform="rotate(-35 15 60)">
          {isHovered ? "60°" : "30°"}
        </text>

        {/* Lux indicator */}
        {isHovered && (
          <g>
            <text x="60" y="70" fill="#fbbf24" fontSize="8" textAnchor="middle" fontFamily="monospace" opacity="0.8">
              850 lux
            </text>
          </g>
        )}

        {/* Ground line */}
        <line x1="10" y1="90" x2="110" y2="90" stroke="#404040" strokeWidth="0.5" strokeDasharray="4,2" />
      </svg>
    ),
  },

  'water-heaters': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Tank body */}
        <rect x="35" y="10" width="50" height="70" fill="#262626" stroke="#404040" strokeWidth="1" rx="5" />

        {/* Heating coil at bottom */}
        <path
          d="M 45 65 Q 50 70 55 65 Q 60 60 65 65 Q 70 70 75 65"
          fill="none"
          stroke={isHovered ? "#ef4444" : "#525252"}
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Water layers */}
        <rect x="40" y="25" width="40" height="35" fill="#1e40af" opacity="0.3" rx="2" />

        {/* Heat waves rising */}
        {isHovered && (
          <g stroke="#ef4444" strokeWidth="1" opacity="0.5">
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M ${50 + i * 10} 60 Q ${52 + i * 10} 50 ${50 + i * 10} 40`}
              >
                <animate
                  attributeName="d"
                  values={`M ${50 + i * 10} 60 Q ${52 + i * 10} 50 ${50 + i * 10} 40;M ${50 + i * 10} 55 Q ${48 + i * 10} 45 ${50 + i * 10} 35;M ${50 + i * 10} 60 Q ${52 + i * 10} 50 ${50 + i * 10} 40`}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </g>
        )}

        {/* Temperature gauge */}
        <rect x="90" y="30" width="15" height="40" fill="none" stroke="#404040" strokeWidth="0.5" rx="2" />
        <rect
          x="93"
          y={isHovered ? 35 : 55}
          width="9"
          height={isHovered ? 32 : 12}
          fill={isHovered ? "#d3815e" : "#3b82f6"}
          rx="1"
          className="transition-all duration-1000"
        />
        <text x="97.5" y="78" fill="#52525b" fontSize="4" textAnchor="middle" fontFamily="monospace">°C</text>

        {/* Inlet/Outlet pipes */}
        <line x1="45" y1="10" x2="45" y2="0" stroke="#525252" strokeWidth="3" />
        <line x1="75" y1="10" x2="75" y2="0" stroke="#525252" strokeWidth="3" />
        <text x="40" y="95" fill="#52525b" fontSize="5" fontFamily="monospace">Cold</text>
        <text x="70" y="95" fill="#52525b" fontSize="5" fontFamily="monospace">Hot</text>
      </svg>
    ),
  },

  'doorbells-accessories': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Bell body */}
        <path
          d="M 60 15 Q 40 15 35 40 L 35 55 Q 35 60 40 60 L 80 60 Q 85 60 85 55 L 85 40 Q 80 15 60 15"
          fill="none"
          stroke="#525252"
          strokeWidth="1.5"
        />

        {/* Clapper */}
        <circle
          cx={isHovered ? 55 + Math.sin(phase * 0.5) * 5 : 60}
          cy="55"
          r="5"
          fill="#404040"
          className="transition-all duration-100"
        />

        {/* Sound waves */}
        {isHovered && (
          <g stroke="#60a5fa" strokeWidth="0.5" fill="none">
            <circle cx="60" cy="40" r="25" opacity="0.3">
              <animate attributeName="r" values="25;35;25" dur="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="40" r="30" opacity="0.2">
              <animate attributeName="r" values="30;45;30" dur="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0;0.2" dur="0.5s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Push button */}
        <g transform="translate(20, 70)">
          <rect width="25" height="20" fill="#262626" stroke="#404040" strokeWidth="0.5" rx="2" />
          <circle
            cx="12.5"
            cy="10"
            r={isHovered ? 5 : 6}
            fill={isHovered ? "#22c55e" : "#404040"}
            className="transition-all duration-150"
          />
        </g>

        {/* Wiring to bell */}
        <path d="M 32 75 Q 25 60 35 55" fill="none" stroke="#525252" strokeWidth="1" strokeDasharray="2,2" />

        {/* Labels */}
        <text x="20" y="98" fill="#52525b" fontSize="5" fontFamily="monospace">Button</text>
        <text x="70" y="75" fill="#52525b" fontSize="5" fontFamily="monospace">Chime</text>
      </svg>
    ),
  },

  'wires-cables': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Cable cross-section */}
        <circle cx="60" cy="50" r="35" fill="#262626" stroke="#404040" strokeWidth="1" />

        {/* Outer sheath */}
        <circle cx="60" cy="50" r="30" fill="none" stroke="#404040" strokeWidth="3" />

        {/* Inner cores */}
        {[
          { cx: 45, cy: 40, color: '#ef4444', label: 'L' },
          { cx: 75, cy: 40, color: '#3b82f6', label: 'N' },
          { cx: 60, cy: 65, color: '#22c55e', label: 'E' },
        ].map((core, i) => (
          <g key={i}>
            {/* Insulation */}
            <circle cx={core.cx} cy={core.cy} r="10" fill={core.color} opacity="0.3" />
            {/* Conductor */}
            <circle
              cx={core.cx}
              cy={core.cy}
              r="5"
              fill="#b45309"
              stroke={core.color}
              strokeWidth="2"
            />
            {/* Current flow indicator */}
            {isHovered && (
              <circle cx={core.cx} cy={core.cy} r="3" fill="#fff" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.6;0.2;0.6"
                  dur={`${0.3 + i * 0.1}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
            {/* Label (shown on hover) */}
            {isHovered && (
              <text
                x={core.cx}
                y={core.cy + 3}
                fill="#fff"
                fontSize="6"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {core.label}
              </text>
            )}
          </g>
        ))}

        {/* Spec label */}
        <text x="60" y="95" fill="#52525b" fontSize="6" textAnchor="middle" fontFamily="monospace">
          3C × 2.5 sq mm
        </text>
      </svg>
    ),
  },

  'earthing-safety-systems': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Ground layers */}
        <rect x="10" y="50" width="100" height="45" fill="#262626" />
        <line x1="10" y1="60" x2="110" y2="60" stroke="#404040" strokeWidth="0.5" strokeDasharray="4,2" />
        <line x1="10" y1="75" x2="110" y2="75" stroke="#404040" strokeWidth="0.5" strokeDasharray="4,2" />

        {/* Earth rod */}
        <rect x="55" y="20" width="10" height="70" fill="#b45309" stroke="#78350f" strokeWidth="1" />

        {/* Fault current path */}
        <path
          d="M 20 30 L 40 30 L 55 45"
          fill="none"
          stroke={isHovered ? "#ef4444" : "#525252"}
          strokeWidth="2"
          strokeDasharray={isHovered ? "none" : "4,2"}
        >
          {isHovered && (
            <animate attributeName="stroke-dashoffset" values="20;0" dur="0.5s" repeatCount="3" />
          )}
        </path>

        {/* Current arrow to ground */}
        {isHovered && (
          <g>
            <path d="M 60 50 L 60 85" stroke="#22c55e" strokeWidth="2">
              <animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
            </path>
            <polygon points="55,85 60,95 65,85" fill="#22c55e">
              <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
            </polygon>
          </g>
        )}

        {/* Earth symbol at top */}
        <g transform="translate(50, 5)">
          <line x1="10" y1="0" x2="10" y2="8" stroke="#22c55e" strokeWidth="2" />
          <line x1="0" y1="8" x2="20" y2="8" stroke="#22c55e" strokeWidth="2" />
          <line x1="3" y1="11" x2="17" y2="11" stroke="#22c55e" strokeWidth="1.5" />
          <line x1="6" y1="14" x2="14" y2="14" stroke="#22c55e" strokeWidth="1" />
        </g>

        {/* Labels */}
        <text x="15" y="28" fill="#ef4444" fontSize="5" fontFamily="monospace">Fault</text>
        <text x="90" y="65" fill="#52525b" fontSize="4" fontFamily="monospace">Topsoil</text>
        <text x="90" y="80" fill="#52525b" fontSize="4" fontFamily="monospace">Clay</text>
        <text x="90" y="92" fill="#52525b" fontSize="4" fontFamily="monospace">Rock</text>
      </svg>
    ),
  },

  'power-backup-solar': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Solar panel */}
        <g transform="translate(5, 10)">
          <rect width="30" height="25" fill="#1e3a5f" stroke="#404040" strokeWidth="0.5" rx="1" />
          <line x1="10" y1="0" x2="10" y2="25" stroke="#404040" strokeWidth="0.5" />
          <line x1="20" y1="0" x2="20" y2="25" stroke="#404040" strokeWidth="0.5" />
          <line x1="0" y1="8" x2="30" y2="8" stroke="#404040" strokeWidth="0.5" />
          <line x1="0" y1="16" x2="30" y2="16" stroke="#404040" strokeWidth="0.5" />
          <text x="15" y="42" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">PV</text>
        </g>

        {/* DC arrow */}
        <path
          d="M 38 22 L 48 22"
          fill="none"
          stroke={isHovered ? "#fbbf24" : "#525252"}
          strokeWidth="1.5"
          markerEnd="url(#arrow)"
        >
          {isHovered && (
            <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
          )}
        </path>
        <text x="43" y="18" fill="#52525b" fontSize="4" fontFamily="monospace">DC</text>

        {/* Inverter */}
        <rect x="50" y="15" width="20" height="20" fill="#262626" stroke="#404040" strokeWidth="0.5" rx="2" />
        <text x="60" y="28" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">INV</text>

        {/* AC arrow */}
        <path
          d="M 73 25 L 83 25"
          fill="none"
          stroke={isHovered ? "#22c55e" : "#525252"}
          strokeWidth="1.5"
        >
          {isHovered && (
            <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
          )}
        </path>
        <text x="78" y="21" fill="#52525b" fontSize="4" fontFamily="monospace">AC</text>

        {/* Battery */}
        <g transform="translate(50, 50)">
          <rect width="30" height="35" fill="#262626" stroke="#404040" strokeWidth="0.5" rx="2" />
          <rect x="10" y="-3" width="10" height="3" fill="#404040" />
          {/* Battery level */}
          <rect
            x="3"
            y={isHovered ? 5 : 25}
            width="24"
            height={isHovered ? 27 : 7}
            fill={isHovered ? "#22c55e" : "#404040"}
            rx="1"
            className="transition-all duration-1000"
          />
          <text x="15" y="48" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">BAT</text>
        </g>

        {/* Load */}
        <g transform="translate(90, 15)">
          <rect width="20" height="20" fill="#262626" stroke="#404040" strokeWidth="0.5" rx="2" />
          <circle cx="10" cy="10" r="5" fill="none" stroke={isHovered ? "#fbbf24" : "#525252"} strokeWidth="1" />
          {isHovered && <circle cx="10" cy="10" r="2" fill="#fbbf24" />}
          <text x="10" y="30" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">Load</text>
        </g>

        {/* Energy flow line */}
        {isHovered && (
          <path
            d="M 65 35 L 65 50"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          >
            <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
          </path>
        )}
      </svg>
    ),
  },

  'tools-testers': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Multimeter body */}
        <rect x="30" y="10" width="60" height="80" fill="#262626" stroke="#404040" strokeWidth="1" rx="5" />

        {/* Display */}
        <rect x="38" y="18" width="44" height="25" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" rx="2" />
        {/* Digital reading */}
        <text
          x="60"
          y="36"
          fill={isHovered ? "#22c55e" : "#404040"}
          fontSize="14"
          textAnchor="middle"
          fontFamily="monospace"
          className="transition-all duration-300"
        >
          {isHovered ? "230.5" : "---"}
        </text>
        <text x="85" y="36" fill="#52525b" fontSize="6" fontFamily="monospace">V</text>

        {/* Dial */}
        <circle cx="60" cy="60" r="15" fill="#1a1a1a" stroke="#404040" strokeWidth="0.5" />
        <line
          x1="60"
          y1="60"
          x2={60 + Math.cos((isHovered ? -45 : 45) * Math.PI / 180) * 12}
          y2={60 + Math.sin((isHovered ? -45 : 45) * Math.PI / 180) * 12}
          stroke="#ef4444"
          strokeWidth="2"
          className="transition-all duration-300"
        />
        <circle cx="60" cy="60" r="3" fill="#404040" />

        {/* Mode labels around dial */}
        <text x="45" y="52" fill="#52525b" fontSize="4" fontFamily="monospace">V~</text>
        <text x="72" y="52" fill="#52525b" fontSize="4" fontFamily="monospace">V=</text>
        <text x="45" y="72" fill="#52525b" fontSize="4" fontFamily="monospace">Ω</text>
        <text x="72" y="72" fill="#52525b" fontSize="4" fontFamily="monospace">A</text>

        {/* Probe ports */}
        <circle cx="45" cy="82" r="3" fill="#1a1a1a" stroke="#ef4444" strokeWidth="1" />
        <circle cx="60" cy="82" r="3" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <circle cx="75" cy="82" r="3" fill="#1a1a1a" stroke="#333" strokeWidth="1" />

        {/* Probes */}
        <line x1="45" y1="85" x2="30" y2="95" stroke="#ef4444" strokeWidth="2" />
        <line x1="60" y1="85" x2="75" y2="95" stroke="#333" strokeWidth="2" />

        {/* Probe tips touching circuit */}
        {isHovered && (
          <g>
            <circle cx="25" cy="95" r="2" fill="#ef4444">
              <animate attributeName="opacity" values="1;0.5;1" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="95" r="2" fill="#333" />
          </g>
        )}
      </svg>
    ),
  },

  'smart-electrical-automation': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Phone */}
        <rect x="10" y="20" width="30" height="55" fill="#262626" stroke="#404040" strokeWidth="1" rx="4" />
        <rect x="13" y="25" width="24" height="40" fill="#1a1a1a" rx="2" />
        {/* App UI */}
        {isHovered && (
          <g>
            <rect x="15" y="28" width="20" height="8" fill="#22c55e" rx="1" opacity="0.6" />
            <rect x="15" y="38" width="20" height="8" fill="#3b82f6" rx="1" opacity="0.4" />
            <rect x="15" y="48" width="20" height="8" fill="#d3815e" rx="1" opacity="0.4" />
          </g>
        )}
        <circle cx="25" cy="70" r="2" fill="#404040" />

        {/* Signal waves */}
        {isHovered && (
          <g stroke="#60a5fa" strokeWidth="0.5" fill="none">
            <path d="M 42 47 Q 52 47 52 37">
              <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
            </path>
            <path d="M 45 50 Q 58 50 58 34">
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" begin="0.3s" />
            </path>
          </g>
        )}

        {/* Cloud/Hub */}
        <ellipse cx="65" cy="25" rx="15" ry="10" fill="#262626" stroke="#404040" strokeWidth="0.5" />
        <text x="65" y="28" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">Hub</text>

        {/* Smart switch */}
        <g transform="translate(80, 35)">
          <rect width="30" height="40" fill="#262626" stroke="#404040" strokeWidth="0.5" rx="3" />
          {/* Touch panel */}
          <rect x="5" y="5" width="20" height="20" fill="#1a1a1a" rx="2" />
          <circle cx="15" cy="15" r="5" fill={isHovered ? "#22c55e" : "#404040"} className="transition-all duration-300" />
          {/* Status LEDs */}
          <circle cx="8" cy="32" r="2" fill={isHovered ? "#22c55e" : "#404040"} />
          <circle cx="15" cy="32" r="2" fill={isHovered ? "#3b82f6" : "#404040"} />
          <circle cx="22" cy="32" r="2" fill="#404040" />
        </g>

        {/* Connection line hub to switch */}
        <path
          d="M 75 30 Q 85 30 88 35"
          fill="none"
          stroke={isHovered ? "#22c55e" : "#525252"}
          strokeWidth="1"
          strokeDasharray="3,2"
        >
          {isHovered && (
            <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
          )}
        </path>

        {/* Labels */}
        <text x="25" y="85" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">App</text>
        <text x="95" y="85" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">Switch</text>
      </svg>
    ),
  },

  'air-conditioning': {
    renderSVG: (isHovered, phase) => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Indoor unit (wall mounted) */}
        <g transform="translate(20, 10)">
          <rect x="0" y="0" width="80" height="30" fill="#262626" stroke="#404040" strokeWidth="1.5" rx="4" />

          {/* Air vents */}
          <g stroke="#525252" strokeWidth="0.5">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line key={i} x1={10 + i * 10} y1="22" x2={10 + i * 10} y2="28" />
            ))}
          </g>

          {/* Display */}
          <rect x="5" y="5" width="20" height="12" fill="#1a1a1a" rx="1" />
          <text
            x="15"
            y="13"
            fill={isHovered ? "#60a5fa" : "#404040"}
            fontSize="7"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {isHovered ? "24°" : "--"}
          </text>

          {/* Status LED */}
          <circle cx="70" cy="10" r="2" fill={isHovered ? "#22c55e" : "#404040"} />

          {/* Cool air flow lines */}
          {isHovered && (
            <g stroke="#60a5fa" strokeWidth="0.5" opacity="0.6">
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M ${20 + i * 15} 30 Q ${20 + i * 15} 50 ${15 + i * 15} 65`}
                >
                  <animate
                    attributeName="d"
                    values={`M ${20 + i * 15} 30 Q ${20 + i * 15} 50 ${15 + i * 15} 65;M ${20 + i * 15} 30 Q ${25 + i * 15} 52 ${20 + i * 15} 70;M ${20 + i * 15} 30 Q ${20 + i * 15} 50 ${15 + i * 15} 65`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
              ))}
            </g>
          )}
        </g>

        {/* Refrigerant pipes */}
        <path d="M 100 25 L 110 25 L 110 70" stroke="#525252" strokeWidth="2" />
        <path d="M 100 15 L 115 15 L 115 70" stroke="#525252" strokeWidth="2" strokeDasharray="4,2" />

        {/* Outdoor unit */}
        <g transform="translate(85, 70)">
          <rect x="0" y="0" width="30" height="25" fill="#262626" stroke="#404040" strokeWidth="1" rx="2" />

          {/* Fan grille */}
          <circle cx="15" cy="12" r="8" fill="none" stroke="#525252" strokeWidth="0.5" />

          {/* Fan */}
          <g
            style={{
              transformOrigin: '100px 82px',
              animation: isHovered ? 'spin 2s linear infinite' : 'none'
            }}
          >
            {[0, 90, 180, 270].map((angle, i) => (
              <line
                key={i}
                x1="15"
                y1="12"
                x2={15 + Math.cos(angle * Math.PI / 180) * 6}
                y2={12 + Math.sin(angle * Math.PI / 180) * 6}
                stroke="#525252"
                strokeWidth="1.5"
              />
            ))}
          </g>
        </g>

        {/* Temperature indicator */}
        <g transform="translate(5, 50)">
          <rect x="0" y="0" width="12" height="40" fill="none" stroke="#404040" strokeWidth="0.5" rx="2" />
          <rect
            x="2"
            y={isHovered ? 5 : 30}
            width="8"
            height={isHovered ? 33 : 8}
            fill={isHovered ? "#60a5fa" : "#ef4444"}
            rx="1"
            style={{ transition: 'all 1s ease' }}
          />
          <text x="6" y="48" fill="#52525b" fontSize="4" textAnchor="middle">°C</text>
        </g>

        {/* Labels */}
        <text x="60" y="48" fill="#52525b" fontSize="6" textAnchor="middle" fontFamily="monospace">Split AC</text>
        <text x="100" y="98" fill="#52525b" fontSize="5" textAnchor="middle" fontFamily="monospace">1.5T</text>
      </svg>
    ),
  },
};

// Map category slugs to illustration keys
// Actual database slugs mapped to our illustration keys
export function getIllustrationKey(slug: string): string {
  const mapping: Record<string, string> = {
    // Primary mappings from actual database slugs (matching seed data)
    'electrical-wiring': 'electrical-wiring',
    'led-lighting': 'led-lighting',
    'mcbs-distribution': 'mcbs-distribution',
    'water-heaters': 'water-heaters',
    'doorbells-accessories': 'doorbells-accessories',
    'wires-cables': 'wires-cables',
    'switchgear-protection': 'switchgear-protection',
    'switches-sockets': 'modular-switches-sockets',
    'lighting-luminaires': 'lighting-luminaires',
    'fans-ventilation': 'fans-ventilation',
    'earthing-safety-systems': 'earthing-safety-systems',
    'power-backup-solar': 'power-backup-solar',
    'tools-testers': 'tools-testers',
    'smart-electrical-automation': 'smart-electrical-automation',

    // Fallback aliases for different naming conventions
    'lighting': 'led-lighting',
    'lighting-fixtures': 'led-lighting',
    'circuit-protection': 'mcbs-distribution',
    'water-heating': 'water-heaters',
    'earthing-safety': 'earthing-safety-systems',
    'power-backup': 'power-backup-solar',
    'smart-electrical': 'smart-electrical-automation',
    'smart-automation': 'smart-electrical-automation',
    'conduits-accessories': 'electrical-wiring',
    'air-conditioning': 'air-conditioning',
    'modular-switches-sockets': 'modular-switches-sockets',

    // Additional database slugs from earlier seed
    'mcbs-switchgear': 'mcbs-distribution',
    'fans': 'fans-ventilation',
    'earthing-lightning': 'earthing-safety-systems',
    'smart-home': 'smart-electrical-automation',
    'solar-renewable': 'power-backup-solar',
    'ups-power-backup': 'power-backup-solar',
    'meters-instruments': 'tools-testers',
    'tools-safety': 'tools-testers',
  };
  return mapping[slug] || 'electrical-wiring';
}

// Individual category tile component - exported for reuse in CategoriesPage
export function CategoryTile({ category, index }: { category: Category; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const illustrationKey = getIllustrationKey(category.slug);
  const illustration = categoryIllustrations[illustrationKey];

  // Animation loop for hover effects
  useEffect(() => {
    if (!isHovered) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative bg-gray-700/50 border border-gray-600 overflow-hidden transition-all duration-500"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-20 transition-opacity duration-300"
        style={{
          backgroundImage: `
            linear-gradient(rgba(64,64,64,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(64,64,64,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(211,129,94,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Active border on hover */}
      <div
        className={`absolute inset-0 border-2 transition-all duration-300 ${
          isHovered ? 'border-orange-500/50' : 'border-transparent'
        }`}
      />

      {/* Content */}
      <div className="relative p-5 h-full flex flex-col">
        {/* Illustration area */}
        <div className="h-24 mb-4 flex items-center justify-center">
          {illustration ? (
            illustration.renderSVG(isHovered, animationPhase)
          ) : (
            <div className="w-12 h-12 bg-gray-700 rounded-lg" />
          )}
        </div>

        {/* Category info */}
        <div className="flex-1">
          <h3 className={`text-base font-semibold transition-colors duration-300 ${
            isHovered ? 'text-orange-400' : 'text-white'
          }`}>
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">100+ Products</p>
        </div>

        {/* Arrow indicator */}
        <ArrowRight
          className={`absolute bottom-5 right-5 w-5 h-5 transition-all duration-300 ${
            isHovered ? 'text-orange-500 translate-x-1' : 'text-gray-600'
          }`}
        />

        {/* Corner measurement marks (blueprint style) */}
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-gray-600 opacity-30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-gray-600 opacity-30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-gray-600 opacity-30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-gray-600 opacity-30" />
      </div>
    </Link>
  );
}

// Main grid component
export function InteractiveCategoryGrid({ categories, loading }: InteractiveCategoryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll-based animation
  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use static categories as fallback when API returns empty or fails
  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(14)].map((_, i) => (
          <div key={i} className="bg-gray-700/50 border border-gray-600 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  return (
    <div ref={gridRef} className="relative">
      {/* Connecting wires background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wire-pulse-grid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#525252" />
            <stop offset={`${scrollProgress * 100}%`} stopColor="#d3815e" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#525252" />
          </linearGradient>
        </defs>
        {/* Horizontal connection lines */}
        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="url(#wire-pulse-grid)" strokeWidth="1" opacity="0.2" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#wire-pulse-grid)" strokeWidth="1" opacity="0.2" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="url(#wire-pulse-grid)" strokeWidth="1" opacity="0.2" />
      </svg>

      {/* Category grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayCategories.map((category, index) => (
          <CategoryTile key={category.id} category={category} index={index} />
        ))}
      </div>
    </div>
  );
}

export default InteractiveCategoryGrid;
