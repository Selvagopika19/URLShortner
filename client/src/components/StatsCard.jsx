import { motion } from 'framer-motion';

export function StatsCard({ label, value, hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ scale: 1.02 }}
      className="neo-panel p-5 transition-shadow hover:shadow-glow"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{hint}</p>}
    </motion.div>
  );
}
