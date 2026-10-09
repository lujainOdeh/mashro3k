import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { seedState } from '../data/seed';

const STORAGE_KEY = 'mashrouak-demo-v1';
const SESSION_STORAGE_KEY = 'mashrouak-demo-session-v1';
type DemoRole = 'customer' | 'merchant' | 'courier';
type DemoSession = { role: DemoRole; userId: string; rememberMe: boolean; signedInAt: string };
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

function isDemoSession(value: unknown): value is DemoSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<DemoSession>;
  return ['customer', 'merchant', 'courier'].includes(session.role ?? '')
    && typeof session.userId === 'string'
    && typeof session.rememberMe === 'boolean'
    && typeof session.signedInAt === 'string';
}

function readInitialState(): State {
  let saved: Partial<State> = {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) saved = JSON.parse(stored) as Partial<State>;
  } catch {
    saved = {};
  }

  let temporarySession: unknown;
  try {
    const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) temporarySession = JSON.parse(storedSession);
  } catch {
    temporarySession = undefined;
  }

  const session = isDemoSession(saved.demoSession) && saved.demoSession.rememberMe
    ? saved.demoSession
    : isDemoSession(temporarySession) && !temporarySession.rememberMe
      ? temporarySession
      : undefined;
  const initial = { ...seedState, ...saved } as State;
  if (session) {
    initial.demoSession = session;
    initial.role = session.role;
    initial.userId = session.userId;
  } else {
    delete initial.demoSession;
    initial.role = 'customer';
    initial.userId = 'user-customer';
  }
  return initial;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(readInitialState);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const persisted = { ...state };
    const session = isDemoSession(state.demoSession) ? state.demoSession : undefined;
    if (session?.rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      delete persisted.demoSession;
      persisted.role = 'customer';
      persisted.userId = 'user-customer';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
      if (session) sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
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
