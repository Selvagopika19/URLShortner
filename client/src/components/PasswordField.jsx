import { useId, useState } from 'react';

/**
 * Password input with show/hide toggle for easier troubleshooting (typos, caps lock).
 */
export function PasswordField({
  label = 'Password',
  value,
  onChange,
  autoComplete = 'current-password',
  minLength,
  required,
  disabled,
}) {
  const id = useId();
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="neo-inset w-full rounded-xl py-2.5 pl-3 pr-24 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/40"
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          minLength={minLength}
          required={required}
          disabled={disabled}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
