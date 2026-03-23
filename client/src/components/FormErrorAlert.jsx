/**
 * Prominent validation / API error for auth forms (not only a toast).
 */
export function FormErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm leading-relaxed text-rose-100"
    >
      {message}
    </div>
  );
}
