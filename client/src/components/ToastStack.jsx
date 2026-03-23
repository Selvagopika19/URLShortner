import { useToast } from '../context/ToastContext.jsx';

const icons = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400 flex-shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-red-400 flex-shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-accent-bright flex-shrink-0">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
    </svg>
  ),
};

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error:   'border-danger/30 bg-danger/10',
  info:    'border-accent/30 bg-accent/10',
};

export function ToastStack() {
  const { toasts, dismiss } = useToast();

  if (!toasts?.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2" role="region" aria-label="Notifications">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-toast-in flex w-80 items-start gap-3 rounded-xl border px-4 py-3 shadow-card backdrop-blur-md ${styles[t.type] ?? styles.info}`}
        >
          {icons[t.type] ?? icons.info}
          <p className="flex-1 text-sm text-slate-200 leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-auto text-slate-500 transition hover:text-slate-300"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
