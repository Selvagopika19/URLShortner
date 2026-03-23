import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idSeq;
      const entry = { id, type: toast.type || 'info', message: toast.message };
      setToasts((t) => [...t, entry]);
      const ms = toast.duration ?? 4200;
      window.setTimeout(() => dismiss(id), ms);
      return id;
    },
    [dismiss]
  );

  const toast = useCallback(
    (message, type = 'info', duration) => push({ message, type, duration }),
    [push]
  );

  const value = useMemo(() => ({ toasts, push, toast, dismiss }), [toasts, push, toast, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
