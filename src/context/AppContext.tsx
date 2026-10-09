import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast, ToastMessage } from '../hooks/useToast';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetMe,
  AuthUser,
} from '../services/api';

interface Notification {
  id: number;
  text: string;
  isRead: boolean;
}

interface AppContextType {
  // Auth
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; goal?: string }) => Promise<void>;
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

const TOKEN_KEY = 'mindmate_token';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isOnline, toggleOnline } = useOnlineStatus();
  const { toasts, showToast, removeToast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [notifications] = useState<Notification[]>([
    { id: 1, text: 'New insight available on OOP', isRead: false },
    { id: 2, text: 'Sarah K. challenged you to an Adaptive Battle', isRead: false },
    { id: 3, text: 'You completed your daily goal!', isRead: true },
  ]);

  // On mount: restore session from token
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsAuthLoading(false);
      return;
    }
    apiGetMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('mindmate_user');
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    setUser(res.data.user);
    showToast(`Welcome back, ${res.data.user.name}!`, 'success');
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    goal?: string;
  }) => {
    const res = await apiRegister(payload);
    setUser(res.data.user);
    showToast(`Welcome to MindMate, ${res.data.user.name}!`, 'success');
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAuthLoading,
        login,
        register,
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
