import { useEffect, useState } from 'react';

/**
 * ElectricalBackgroundSystem - MINIMAL VERSION
 *
 * Basic implementation:
 * - One small element on the side only
 * - No central wires
 * - No heavy visual elements
 * - Subtle cursor glow only
 */

// Simple cursor glow
function ElectricalCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: pos.x - 20,
        top: pos.y - 20,
        width: 40,
        height: 40,
        background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    />
  );
}

// Minimal side element - just a small decorative circuit pattern
function SideElement() {
  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: 0.15,
      }}
    >
      <svg width="30" height="120" viewBox="0 0 30 120">
        {/* Simple vertical line */}
        <line x1="15" y1="0" x2="15" y2="120" stroke="#525252" strokeWidth="1" strokeDasharray="4 4" />

        {/* Small connection dots */}
        <circle cx="15" cy="20" r="3" fill="#525252" />
        <circle cx="15" cy="60" r="3" fill="#525252" />
        <circle cx="15" cy="100" r="3" fill="#525252" />
      </svg>
    </div>
  );
}

export function ElectricalBackgroundSystem() {
  return (
    <>
      <ElectricalCursor />
      <SideElement />
    </>
  );
}

export default ElectricalBackgroundSystem;
