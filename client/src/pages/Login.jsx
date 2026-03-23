import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: '#0d0d0d', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        .auth-title { font-family: 'Syne', sans-serif; }
      `}</style>
      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-6 w-6">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </div>
          <h1 className="auth-title text-2xl font-bold tracking-tight text-slate-100">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">Sign in to your Snip account</p>
        </div>

        {/* Card */}
        <div className="snip-card p-6 bg-white/[0.03] border-white/[0.07]">
          {error && (
            <div className="snip-alert-error mb-5 flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-red-400">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="snip-label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="snip-input bg-white/[0.05] border-white/[0.1] focus:border-violet-500/50"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="snip-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="snip-input bg-white/[0.05] border-white/[0.1] focus:border-violet-500/50 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path d="M8 3a5 5 0 00-4.546 2.914.5.5 0 000 .414A5 5 0 008 13a5 5 0 004.546-2.914.5.5 0 000-.414A5 5 0 008 3zM8 11.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path d="M8 3a5 5 0 00-4.546 2.914.5.5 0 000 .414 4.973 4.973 0 00.73 1.137l-.736.736a.5.5 0 10.707.707l.736-.736A4.986 4.986 0 008 13a5 5 0 004.546-2.914.5.5 0 000-.414A5 5 0 008 3zm0 8.5a3.5 3.5 0 01-1.637-.406l.73-.73a2 2 0 002.513-2.513l.73-.73A3.5 3.5 0 018 11.5zm-1.121-2.286l-1.01 1.01A2.002 2.002 0 016 8a2 2 0 01.879-1.636l-.01.01c.004-.007.01-.013.01-.021l1.01-1.01c.008.008.014.014.021.021A2 2 0 0110 8c0 .35-.09.678-.249.963l.01-.01-.01-.01z"/>
                      <path d="M2.146 2.854a.5.5 0 11.708-.708l11 11a.5.5 0 01-.708.708l-11-11z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="snip-btn-primary mt-2 w-full justify-center py-2.5 bg-violet-600 hover:bg-violet-700 shadow-violet-900/20"
            >
              {loading ? <span className="snip-spinner border-t-white" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
