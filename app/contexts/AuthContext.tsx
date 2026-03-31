'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: 'farmer' | 'customer' | null;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: AuthUser;
  isLoading: boolean;
  login: (userData: Omit<AuthUser, 'isLoggedIn'>) => void;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>({
    name: null,
    username: null,
    email: null,
    phone: null,
    role: null,
    isLoggedIn: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const isLoggedIn =
          localStorage.getItem('isLoggedIn') === 'true' ||
          localStorage.getItem('loggedIn') === 'true';

        if (isLoggedIn) {
          const userName =
            localStorage.getItem('userName') || localStorage.getItem('username') || null;
          const userUsername = localStorage.getItem('username') || null;
          const userEmail = localStorage.getItem('userEmail') || null;
          const userPhone = localStorage.getItem('userPhone') || null;
          const rawRole =
            localStorage.getItem('userRole') || localStorage.getItem('role') || null;
          const userRole = (
            rawRole ? rawRole.toLowerCase() : null
          ) as 'farmer' | 'customer' | null;

          setUser({
            name: userName,
            username: userUsername,
            email: userEmail,
            phone: userPhone,
            role: userRole,
            isLoggedIn: true,
          });
        } else {
          setUser({
            name: null,
            username: null,
            email: null,
            phone: null,
            role: null,
            isLoggedIn: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser({
          name: null,
          username: null,
          email: null,
          phone: null,
          role: null,
          isLoggedIn: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const isLoggedIn =
        localStorage.getItem('isLoggedIn') === 'true' ||
        localStorage.getItem('loggedIn') === 'true';

      if (isLoggedIn) {
        const userName =
          localStorage.getItem('userName') || localStorage.getItem('username') || null;
        const userUsername = localStorage.getItem('username') || null;
        const userEmail = localStorage.getItem('userEmail') || null;
        const userPhone = localStorage.getItem('userPhone') || null;
        const rawRole =
          localStorage.getItem('userRole') || localStorage.getItem('role') || null;
        const userRole = (
          rawRole ? rawRole.toLowerCase() : null
        ) as 'farmer' | 'customer' | null;

        setUser({
          name: userName,
          username: userUsername,
          email: userEmail,
          phone: userPhone,
          role: userRole,
          isLoggedIn: true,
        });
      } else {
        setUser({
          name: null,
          username: null,
          email: null,
          phone: null,
          role: null,
          isLoggedIn: false,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login-success', handleStorageChange);
    window.addEventListener('logout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login-success', handleStorageChange);
      window.removeEventListener('logout', handleStorageChange);
    };
  }, []);

  const login = (userData: Omit<AuthUser, 'isLoggedIn'>) => {
    setUser({
      ...userData,
      isLoggedIn: true,
    });

    // Persist to localStorage
    localStorage.setItem('userName', userData.name || '');
    localStorage.setItem('username', userData.username || '');
    localStorage.setItem('userEmail', userData.email || '');
    localStorage.setItem('userPhone', userData.phone || '');
    localStorage.setItem('userRole', userData.role || 'customer');
    localStorage.setItem('role', userData.role === 'farmer' ? 'Farmer' : 'Customer');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('loginTime', new Date().toISOString());
  };

  const logout = () => {
    setUser({
      name: null,
      username: null,
      email: null,
      phone: null,
      role: null,
      isLoggedIn: false,
    });

    // Clear localStorage
    localStorage.removeItem('userName');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userRole');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loginTime');

    // Dispatch logout event for other components
    window.dispatchEvent(new Event('logout'));
  };

  const refreshAuth = () => {
    const isLoggedIn =
      localStorage.getItem('isLoggedIn') === 'true' ||
      localStorage.getItem('loggedIn') === 'true';

    if (isLoggedIn) {
      const userName =
        localStorage.getItem('userName') || localStorage.getItem('username') || null;
      const userUsername = localStorage.getItem('username') || null;
      const userEmail = localStorage.getItem('userEmail') || null;
      const userPhone = localStorage.getItem('userPhone') || null;
      const rawRole =
        localStorage.getItem('userRole') || localStorage.getItem('role') || null;
      const userRole = (
        rawRole ? rawRole.toLowerCase() : null
      ) as 'farmer' | 'customer' | null;

      setUser({
        name: userName,
        username: userUsername,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        isLoggedIn: true,
      });
    } else {
      setUser({
        name: null,
        username: null,
        email: null,
        phone: null,
        role: null,
        isLoggedIn: false,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
