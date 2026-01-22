import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'trail' | 'arc';
}

interface LightningSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  width: number;
}

const SPARK_COLORS = [
  '#FFFFFF', // White
  '#FFF9C4', // Light yellow
  '#FFEB3B', // Yellow
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#FFE082', // Light amber
  '#FFFDE7', // Very light yellow
];

const getRandomColor = (): string => {
  return SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
};

export function ElectricalCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const prevMousePos = useRef({ x: 0, y: 0 });
  const particles = useRef<Particle[]>([]);
  const lightningSegments = useRef<LightningSegment[]>([]);
  const animationFrameId = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to full window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      prevMousePos.current = { ...mousePos.current };
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);

      // Calculate velocity
      const dx = mousePos.current.x - prevMousePos.current.x;
      const dy = mousePos.current.y - prevMousePos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Create particles based on movement speed
      const particleCount = Math.min(Math.floor(speed / 2) + 1, 8);

      for (let i = 0; i < particleCount; i++) {
        // Trail particles
        particles.current.push({
          x: mousePos.current.x + (Math.random() - 0.5) * 10,
          y: mousePos.current.y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 4 - dx * 0.1,
          vy: (Math.random() - 0.5) * 4 - dy * 0.1,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.5,
          size: 1 + Math.random() * 3,
          color: getRandomColor(),
          type: 'trail',
        });

        // Spark particles (larger, brighter)
        if (Math.random() > 0.6) {
          particles.current.push({
            x: mousePos.current.x,
            y: mousePos.current.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1,
            maxLife: 0.3 + Math.random() * 0.3,
            size: 2 + Math.random() * 4,
            color: '#FFFFFF',
            type: 'spark',
          });
        }
      }

      // Create lightning arcs occasionally
      if (speed > 5 && Math.random() > 0.7) {
        createLightningArc(mousePos.current.x, mousePos.current.y);
      }
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Create a lightning arc from cursor
    const createLightningArc = (startX: number, startY: number) => {
      const segments: LightningSegment[] = [];
      const arcLength = 20 + Math.random() * 40;
      const direction = Math.random() * Math.PI * 2;

      let currentX = startX;
      let currentY = startY;
      const segmentCount = 3 + Math.floor(Math.random() * 4);

      for (let i = 0; i < segmentCount; i++) {
        const segmentLength = arcLength / segmentCount;
        const angleVariation = (Math.random() - 0.5) * 1.2;
        const nextX = currentX + Math.cos(direction + angleVariation) * segmentLength;
        const nextY = currentY + Math.sin(direction + angleVariation) * segmentLength;

        segments.push({
          x1: currentX,
          y1: currentY,
          x2: nextX,
          y2: nextY,
          life: 1,
          maxLife: 0.15 + Math.random() * 0.1,
          width: 2 - (i * 0.3),
        });

        currentX = nextX;
        currentY = nextY;
      }

      lightningSegments.current.push(...segments);
    };

    // Draw lightning bolt cursor
    const drawCursor = (x: number, y: number) => {
      ctx.save();

      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
      gradient.addColorStop(0, 'rgba(255, 235, 59, 0.4)');
      gradient.addColorStop(0.5, 'rgba(255, 193, 7, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 152, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Lightning bolt shape
      ctx.translate(x, y);
      ctx.scale(0.8, 0.8);

      // Main bolt
      ctx.beginPath();
      ctx.moveTo(-3, -12);
      ctx.lineTo(3, -12);
      ctx.lineTo(1, -3);
      ctx.lineTo(5, -3);
      ctx.lineTo(-2, 12);
      ctx.lineTo(0, 2);
      ctx.lineTo(-4, 2);
      ctx.closePath();

      // Gradient fill for bolt
      const boltGradient = ctx.createLinearGradient(0, -12, 0, 12);
      boltGradient.addColorStop(0, '#FFFFFF');
      boltGradient.addColorStop(0.3, '#FFEB3B');
      boltGradient.addColorStop(0.7, '#FFC107');
      boltGradient.addColorStop(1, '#FF9800');

      ctx.fillStyle = boltGradient;
      ctx.fill();

      // White core
      ctx.beginPath();
      ctx.moveTo(-1, -10);
      ctx.lineTo(1, -10);
      ctx.lineTo(0, -2);
      ctx.lineTo(2, -2);
      ctx.lineTo(-1, 8);
      ctx.lineTo(0, 1);
      ctx.lineTo(-2, 1);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();

      // Glow effect on bolt
      ctx.shadowColor = '#FFEB3B';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#FFF9C4';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    };

    // Draw particle
    const drawParticle = (particle: Particle) => {
      const alpha = particle.life;

      ctx.save();

      if (particle.type === 'spark') {
        // Bright spark with glow
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle effect
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.size * 2, particle.y);
        ctx.lineTo(particle.x + particle.size * 2, particle.y);
        ctx.moveTo(particle.x, particle.y - particle.size * 2);
        ctx.lineTo(particle.x, particle.y + particle.size * 2);
        ctx.stroke();
      } else {
        // Trail particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.4, particle.color.replace(')', `, ${alpha * 0.8})`).replace('rgb', 'rgba').replace('#', 'rgba('));
        gradient.addColorStop(1, 'rgba(255, 152, 0, 0)');

        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw lightning segment
    const drawLightningSegment = (segment: LightningSegment) => {
      const alpha = segment.life;

      ctx.save();

      // Main lightning line
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = segment.width;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#FFEB3B';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.stroke();

      // Glow layer
      ctx.strokeStyle = `rgba(255, 235, 59, ${alpha * 0.6})`;
      ctx.lineWidth = segment.width + 2;
      ctx.shadowBlur = 20;
      ctx.stroke();

      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw lightning segments
      lightningSegments.current = lightningSegments.current.filter(segment => {
        segment.life -= 0.05;
        if (segment.life <= 0) return false;
        drawLightningSegment(segment);
        return true;
      });

      // Update and draw particles
      particles.current = particles.current.filter(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Add some gravity and friction
        particle.vy += 0.1;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update life
        particle.life -= 0.02 / particle.maxLife;

        if (particle.life <= 0) return false;

        drawParticle(particle);
        return true;
      });

      // Draw cursor
      if (isVisible) {
        drawCursor(mousePos.current.x, mousePos.current.y);
      }

      // Create ambient electrical crackle around cursor
      if (isVisible && Math.random() > 0.85) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 15;
        particles.current.push({
          x: mousePos.current.x + Math.cos(angle) * distance,
          y: mousePos.current.y + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          maxLife: 0.2 + Math.random() * 0.2,
          size: 1 + Math.random() * 2,
          color: getRandomColor(),
          type: 'spark',
        });
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [isVisible]);

  return (
    <>
      <style>
        {`
          * {
            cursor: none !important;
          }
        `}
      </style>
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
