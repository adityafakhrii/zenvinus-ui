import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { animationCreate } from '@/lib/wow';

/** Outer wrapper of every page: starts the WOW.js scroll animations once the page has mounted. */
const Wrapper = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const timer = setTimeout(() => animationCreate(), 100);
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
};

export default Wrapper;
