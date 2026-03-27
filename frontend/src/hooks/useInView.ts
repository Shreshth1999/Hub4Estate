import { useEffect, useRef, useState } from 'react';

/**
 * Fires `inView = true` once when the element scrolls into the viewport.
 * Disconnects the observer after first trigger (once = true by default).
 */
export function useInView(threshold = 0.08, once = true) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

/**
 * Returns a style object for a staggered fade-up reveal.
 * @param inView  whether the parent container is in view
 * @param delay   stagger delay in seconds (e.g. 0, 0.1, 0.2)
 */
export function revealStyle(inView: boolean, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  };
}
