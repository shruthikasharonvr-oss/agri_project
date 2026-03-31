import { useAuthContext } from '../contexts/AuthContext';

export interface User {
  name: string | null;
  role: 'farmer' | 'customer' | null;
  isLoggedIn: boolean;
}

/**
 * Hook to access logged-in user information
 * Now uses the global AuthContext for session persistence
 * Usage: const { name, role, isLoggedIn, logout } = useAuth();
 */
export function useAuth() {
  const { user, logout } = useAuthContext();

  return {
    name: user.name,
    role: user.role,
    isLoggedIn: user.isLoggedIn,
    logout,
  };
}
