export function ElectricWireDivider({ dark = false }: { dark?: boolean }) {
  const id = dark ? 'dark' : 'light';
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '64px' }}>
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${id}`} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main circuit wire */}
        <path
          d="M -10 32 L 180 32 L 210 16 L 250 48 L 290 32 L 480 32 L 510 12 L 550 52 L 590 32 L 860 32 L 890 16 L 930 48 L 970 32 L 1200 32 L 1230 14 L 1270 50 L 1310 32 L 1460 32"
          stroke="#F97316"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 3"
          style={{
            filter: `url(#glow-${id})`,
            animation: 'electricDashForward 1.8s linear infinite',
          }}
        />

        {/* Glow blur layer */}
        <path
          d="M -10 32 L 180 32 L 210 16 L 250 48 L 290 32 L 480 32 L 510 12 L 550 52 L 590 32 L 860 32 L 890 16 L 930 48 L 970 32 L 1200 32 L 1230 14 L 1270 50 L 1310 32 L 1460 32"
          stroke="#F97316"
          strokeWidth="6"
          fill="none"
          opacity="0.15"
        />

        {/* Primary moving dot */}
        <circle r="5" fill="#F97316" filter={`url(#glow-${id})`}>
          <animateMotion
            dur="2.2s"
            repeatCount="indefinite"
            path="M -10 32 L 180 32 L 210 16 L 250 48 L 290 32 L 480 32 L 510 12 L 550 52 L 590 32 L 860 32 L 890 16 L 930 48 L 970 32 L 1200 32 L 1230 14 L 1270 50 L 1310 32 L 1460 32"
          />
        </circle>

        {/* Secondary dot, half-phase behind */}
        <circle r="3" fill="#FBBF24" opacity="0.8" filter={`url(#glow-${id})`}>
          <animateMotion
            dur="2.2s"
            begin="-1.1s"
            repeatCount="indefinite"
            path="M -10 32 L 180 32 L 210 16 L 250 48 L 290 32 L 480 32 L 510 12 L 550 52 L 590 32 L 860 32 L 890 16 L 930 48 L 970 32 L 1200 32 L 1230 14 L 1270 50 L 1310 32 L 1460 32"
          />
        </circle>

        {/* Node circles at key junctions */}
        {[210, 550, 890, 1230].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={32}
            r="3"
            fill="none"
            stroke="#F97316"
            strokeWidth="1.5"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
}
