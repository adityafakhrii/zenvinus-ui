import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export interface RevealProps {
  children: ReactNode;
  /** Optional stagger delay in ms (capped to short unslop intervals, e.g. 0–180ms). */
  delayMs?: number;
  className?: string;
}

/**
 * Progressive below-the-fold reveal (6px vertical settle + opacity over 320ms cubic-bezier(0.22,1,0.36,1)).
 * Renders visibly on SSR and for elements already inside the initial viewport; respects reduced motion.
 */
export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight - 24) {
      return undefined;
    }

    setHidden(true);

    if (typeof IntersectionObserver === 'undefined') {
      setHidden(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]',
        hidden ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
