import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUrl, fetchCollections } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

function isValidUrl(s) {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}

export default function CreateUrl() {
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const [longUrl,  setLongUrl]  = useState('');
  const [alias,    setAlias]    = useState('');
  const [collId,   setCollId]   = useState('');
  const [colls,    setColls]    = useState([]);
  const [error,    setError]    = useState('');
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const COMMON_DOMAINS = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 
    'linkedin.com', 'github.com', 'netflix.com', 'amazon.com', 'reddit.com',
    'discord.com', 'spotify.com', 'twitch.tv', 'pinterest.com', 'tiktok.com',
    'apple.com', 'microsoft.com', 'adobe.com', 'zoom.us', 'slack.com',
    'figma.com', 'dribbble.com', 'behance.net', 'medium.com', 'quora.com',
    'stackoverflow.com', 'npmjs.com', 'pypi.org', 'docker.com', 'replit.com',
    'openai.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'notion.so',
    'trello.com', 'asana.com', 'monday.com', 'clickup.com', 'jira.com',
    'stripe.com', 'paypal.com', 'shopify.com', 'woocommerce.com', 'etsy.com',
    'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'home-depot.com',
    'nike.com', 'adidas.com', 'zara.com', 'h&m.com', 'unicef.org',
    'wikipedia.org', 'britannica.com', 'nationalgeographic.com', 'wired.com', 'theverge.com'
  ];

  useEffect(() => {
    fetchCollections().then(setColls).catch(() => {});
  }, []);

  function handleUrlChange(val) {
    setLongUrl(val);
    
    // Clear and hide if empty 
    if (!val || val.length < 1) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }

    // Strip protocols for matching
    let search = val.toLowerCase();
    search = search.replace(/^https?:\/\//, '').replace(/^https?:?/, '');
    
    // If it's just 'https://' or similar, show some top suggestions
    if (!search && (val.includes(':') || val.includes('/'))) {
      setSuggestions(COMMON_DOMAINS.slice(0, 3));
      setShowSuggest(true);
      return;
    }

    if (search) {
      const filtered = COMMON_DOMAINS
        .filter(d => d.includes(search))
        .sort((a, b) => {
          // Boost those that start with the search term
          const aStart = a.startsWith(search);
          const bStart = b.startsWith(search);
          if (aStart && !bStart) return -1;
          if (!aStart && bStart) return 1;
          return a.length - b.length;
        })
        .slice(0, 3);
        
      setSuggestions(filtered);
      setShowSuggest(true);
    } else {
      setShowSuggest(false);
    }
  }

  function selectSuggestion(domain) {
    setLongUrl(`https://${domain}`);
    setShowSuggest(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setShowSuggest(false);

    if (!longUrl.trim()) { setError('Please enter a URL.'); return; }
    if (!isValidUrl(longUrl.trim())) { setError('URL must start with http:// or https://'); return; }

    setLoading(true);
    try {
      const res = await createUrl({ 
        originalUrl: longUrl.trim(), 
        alias: alias.trim() || undefined,
        collectionId: collId || undefined 
      });
      const data = res.data?.url ?? res.data;
      setResult(data);
      toast?.('Short link created!', 'success');
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to create link. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result.shortUrl ?? result.shortCode ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast?.('Copied!', 'success');
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Create</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-100 mt-1">New Short Link</h1>
        <p className="mt-1 text-sm text-slate-400">Paste any URL and get a trackable short link instantly.</p>
      </div>

      {/* Form card */}
      <div className="snip-card p-6 animate-fade-up stagger-1">
        {error && (
          <div className="snip-alert-error mb-5 flex items-center gap-2 text-sm">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-red-400">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5 relative">
            <label htmlFor="longUrl" className="snip-label">Destination URL</label>
            <input
              id="longUrl"
              type="url"
              className="snip-input font-mono text-xs"
              placeholder="https://example.com/very/long/path?with=params"
              value={longUrl}
              onChange={e => handleUrlChange(e.target.value)}
              onFocus={() => longUrl && !longUrl.includes('://') && setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
              autoFocus
              autoComplete="off"
            />
            
            {showSuggest && longUrl && !longUrl.includes('://') && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 overflow-hidden rounded-xl border border-white/10 bg-surface-900 shadow-2xl backdrop-blur-xl animate-scale-in origin-top">
                {suggestions.length > 0 ? (
                  suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="flex w-full items-center px-4 py-3 text-left text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="text-violet-400 mr-2">https://</span>{s}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-slate-500 italic">
                    No website found
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500">Must start with https:// or http://</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="alias" className="snip-label">
              Custom alias <span className="ml-1 normal-case text-slate-600">(optional)</span>
            </label>
            <div className="flex items-center gap-0">
              <span className="flex h-10 items-center rounded-l-lg border border-r-0 border-surface-500/80 bg-surface-600/50 px-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                snip.io/
              </span>
              <input
                id="alias"
                type="text"
                className="snip-input rounded-l-none font-mono text-xs"
                placeholder="my-custom-slug"
                value={alias}
                onChange={e => setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
              />
            </div>
            <p className="text-xs text-slate-500">Letters, numbers, hyphens and underscores only.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="collection" className="snip-label">Collection <span className="ml-1 normal-case text-slate-600">(optional)</span></label>
            <select
              id="collection"
              className="snip-input bg-white/[0.05] border-white/[0.1] focus:border-violet-500/50"
              value={collId}
              onChange={e => setCollId(e.target.value)}
            >
              <option value="" className="bg-surface-800">None (General)</option>
              {colls.map(c => (
                <option key={c.id} value={c.id} className="bg-surface-800">{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="snip-btn-primary w-full justify-center py-2.5 bg-violet-600 hover:bg-violet-700 shadow-violet-900/20"
          >
            {loading ? <span className="snip-spinner border-t-white" /> : (
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 10-2.828 2.828L11.172 9H4.75a.75.75 0 000 1.5h6.422l-1.414 1.414a2 2 0 102.828 2.828l4-4a2 2 0 000-2.828l-4-4z" clipRule="evenodd"/>
              </svg>
            )}
            {loading ? 'Shortening…' : 'Shorten link'}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-6 animate-fade-up rounded-xl border border-accent/25 bg-accent/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent-bright">
              ✓ Link created
            </p>
            <div className="flex items-center gap-3">
              <span className="flex-1 truncate font-mono text-sm text-slate-200">
                {result.shortUrl ?? result.shortCode}
              </span>
              <button onClick={handleCopy} className={`snip-btn text-xs px-3 py-1.5 ${copied ? 'border-emerald-500/40 text-emerald-400' : ''}`}>
                {copied ? '✓ Copied' : '⎘ Copy'}
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setResult(null); setLongUrl(''); setAlias(''); }} className="snip-btn-ghost text-xs px-3 py-1.5">
                Shorten another
              </button>
              <button onClick={() => navigate('/urls')} className="snip-btn text-xs px-3 py-1.5">
                View all links →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 snip-card p-4 animate-fade-up stagger-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Tips</p>
        <ul className="space-y-2 text-xs text-slate-400">
          {[
            'Every click on your short link is tracked automatically.',
            'Use a custom alias to make your links memorable.',
            'Visit the Analytics page to see click history over time.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">›</span> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
