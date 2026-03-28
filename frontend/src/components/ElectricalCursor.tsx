import { useEffect, useRef } from 'react';

export function ElectricalCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const visible = useRef(false);
  const trail = useRef<{ x: number; y: number }[]>([]);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      visible.current = true;
      trail.current.push({ x: e.clientX, y: e.clientY });
      if (trail.current.length > 8) trail.current.shift();
    };

    const onLeave = () => {
      visible.current = false;
      trail.current = [];
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (visible.current) {
        const { x, y } = mouse.current;

        // Ring follows with smooth easing (lags slightly for elegance)
        ring.current.x += (x - ring.current.x) * 0.14;
        ring.current.y += (y - ring.current.y) * 0.14;

        // Subtle trail
        trail.current.forEach((pt, i) => {
          const ratio = (i + 1) / trail.current.length;
          const alpha = ratio * 0.1;
          const size = ratio * 2;
          if (size < 0.5) return;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 83, 9, ${alpha})`;
          ctx.fill();
        });

        // Outer ring — amber gold, soft
        ctx.beginPath();
        ctx.arc(ring.current.x, ring.current.y, 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.38)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner dot — deep navy, precise
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0B1628';
        ctx.fill();
      }

      rafId.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </>
  );
}
