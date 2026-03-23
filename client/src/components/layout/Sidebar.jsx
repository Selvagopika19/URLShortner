import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/', label: 'Command', sub: 'Dashboard' },
  { to: '/create', label: 'Deploy', sub: 'New short link' },
  { to: '/urls', label: 'Fleet', sub: 'All links' },
  { to: '/collections', label: 'Campaigns', sub: 'Collections' },
];

export function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full flex-col border-r border-white/5 bg-surface-900/50 px-4 py-6">
      <div className="mb-8 px-2">
        <p className="font-display text-xl font-bold tracking-tight text-gradient">LinkForge</p>
        <p className="mt-1 text-xs text-slate-500">Short links · live analytics</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `group relative rounded-xl px-3 py-2.5 transition ${
                isActive
                  ? 'bg-surface-700/80 text-white shadow-neu'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-transparent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative block font-display text-sm font-semibold">{l.label}</span>
                <span className="relative block text-xs text-slate-500 group-hover:text-slate-400">
                  {l.sub}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
