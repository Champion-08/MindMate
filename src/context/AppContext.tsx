import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast, ToastMessage } from '../hooks/useToast';

interface Notification {
  id: number;
  text: string;
  isRead: boolean;
}

interface AuthUser {
  name: string;
  email: string;
}

interface AppContextType {
  // Auth
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  // Online status
  isOnline: boolean;
  toggleOnline: () => void;
  // Notifications
  notifications: Notification[];
  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  // Modal
  activeModal: string | null;
  setActiveModal: (modalId: string | null) => void;
}

const AUTH_KEY = 'mindmate_user';

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isOnline, toggleOnline } = useOnlineStatus();
  const { toasts, showToast, removeToast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const [notifications] = useState<Notification[]>([
    { id: 1, text: 'New insight available on OOP', isRead: false },
    { id: 2, text: 'Sarah K. challenged you to an Adaptive Battle', isRead: false },
    { id: 3, text: 'You completed your daily goal!', isRead: true },
  ]);

  const login = (authUser: AuthUser) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        isOnline,
        toggleOnline,
        notifications,
        toasts,
        showToast,
        removeToast,
        activeModal,
        setActiveModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
