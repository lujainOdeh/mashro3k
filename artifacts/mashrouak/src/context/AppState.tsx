import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { seedState } from '../data/seed';

const STORAGE_KEY = 'mashrouak-demo-v1';
type State = {
  projects: any[];
  products: any[];
  users: any[];
  cart: any[];
  orders: any[];
  groups: any[];
  [key: string]: any;
};
type ContextValue = { state: State; patch: (fn: (draft: any) => void) => void; toast: (message: string) => void; message: string; clearToast: () => void };
const AppContext = createContext<ContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved ? { ...seedState, ...JSON.parse(saved) } : seedState) as State;
    } catch {
      return seedState as State;
    }
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state]);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const value = useMemo(() => ({
    state,
    patch: (fn: (draft: any) => void) => setState((previous) => {
      const draft = structuredClone(previous);
      fn(draft);
      return draft;
    }),
    toast: setMessage,
    message,
    clearToast: () => setMessage(''),
  }), [state, message]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
