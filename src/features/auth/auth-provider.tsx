/**
 * Auth context: exposes the current session to the app.
 * Mounted by src/providers/app-providers.tsx inside QueryClientProvider (uses TanStack Query).
 */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession, signOut as apiSignOut } from './services/auth-api';
import type { Permission, Session, SessionUser } from './types/session';

export const SESSION_QUERY_KEY = ['auth', 'session'] as const;

export interface AuthContextValue {
  session: Session | null;
  user: SessionUser | null;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  permissions: [],
  can: () => false,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getSession,
    staleTime: 60_000,
    retry: false,
  });

  const signOut = async () => {
    try {
      await apiSignOut();
    } finally {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    }
  };

  const session = data?.user ? data : null;
  // Permissions only decide what the UI shows; the API checks every request itself
  const permissions = session?.permissions || [];
  const can = (permission: Permission) => permissions.includes(permission);

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, permissions, can, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
