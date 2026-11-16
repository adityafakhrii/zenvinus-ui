/**
 * Creates the Redux store once per app instance (one per request on the server) and restores the saved slices in
 * the browser before any component effect runs, so pages that read stored data in an effect see it on mount.
 */
import { useEffect, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { hydrateFromStorage, makeStore } from '@/store/store';

// useLayoutEffect warns on the server; it never runs there anyway
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  useIsomorphicLayoutEffect(() => {
    hydrateFromStorage(store);
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
