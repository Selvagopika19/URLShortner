import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/format.js';

export function CollectionCard({ collection, onDelete, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="neo-panel flex flex-col justify-between p-5"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{collection.name}</h3>
            <p className="mt-1 text-xs text-slate-500">Since {formatDate(collection.createdAt)}</p>
          </div>
          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-xs font-mono text-cyan-200">
            {collection.urlCount ?? 0} links
          </span>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <Link to={`/collections/${collection.id}`} className="neo-btn-primary flex-1 text-center text-sm no-underline">
          Open
        </Link>
        <button
          type="button"
          className="neo-btn border-rose-500/20 text-rose-200"
          onClick={() => onDelete(collection)}
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
}
