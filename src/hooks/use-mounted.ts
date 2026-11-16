import { useEffect, useState } from 'react';

/**
 * false during SSR and the first hydration render, true after mount.
 * Use it to gate rendering that depends on router.query: `router.isReady` is already true on the first client
 * render of a static page, which causes the hydration mismatch "Expected server HTML to contain…".
 */
const useMounted = (): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

export default useMounted;
