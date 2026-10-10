import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast, ToastMessage } from '../hooks/useToast';
import { supabase } from '../lib/supabase';

interface Notification {
  id: number;
  text: string;
  isRead: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  goal?: string;
}

interface AppContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; goal?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isOnline: boolean;
  toggleOnline: () => void;
  notifications: Notification[];
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  activeModal: string | null;
  setActiveModal: (modalId: string | null) => void;
}

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0],
          email: session.user.email!,
          goal: session.user.user_metadata.goal,
        });
      }
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0],
          email: session.user.email!,
          goal: session.user.user_metadata.goal,
        });
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (data: { name: string; email: string; password: string; goal?: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          goal: data.goal,
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
