import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Instant Shortening",
    desc: "Paste any URL and get a clean short link in milliseconds.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/>
        <rect x="2" y="13" width="4" height="8"/>
      </svg>
    ),
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Click Analytics",
    desc: "Track every click with timestamps and visit history.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Private Dashboard",
    desc: "Your links, your data — protected with authentication.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    title: "Fast Redirects",
    desc: "Sub-millisecond redirects powered by a smart router.",
  },
];

export default function SnipLanding() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen text-white font-sans relative overflow-hidden"
      style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif", backgroundColor: "#0d0d0d" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        html, body { background-color: #0d0d0d !important; margin: 0; }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
        }

        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.22s; }
        .delay-3 { transition-delay: 0.36s; }
        .delay-4 { transition-delay: 0.5s; }
        .delay-5 { transition-delay: 0.62s; }
        .delay-6 { transition-delay: 0.72s; }

        .btn-primary-landing {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }
        .btn-primary-landing:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 32px rgba(124,58,237,0.455);
          filter: brightness(1.1);
        }
        .btn-primary-landing:active {
          transform: scale(0.98);
        }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(124,58,237,0.3);
          transform: translateY(-3px);
        }

        /* Noise texture overlay */
        .noise::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }
      `}</style>

      {/* Background glow orbs */}
      <div className="glow-orb w-[600px] h-[600px] bg-violet-700/20 top-[-200px] left-1/2 -translate-x-1/2" />
      <div className="glow-orb w-[300px] h-[300px] bg-violet-500/10 top-[400px] left-[-100px]" />
      <div className="glow-orb w-[250px] h-[250px] bg-indigo-600/10 top-[300px] right-[-60px]" />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Navbar */}
      <nav className={`relative z-10 flex items-center justify-between px-8 py-5 fade-up ${visible ? "visible" : ""}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>Snip</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/login")}
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate("/signup")}
            className="btn-primary-landing text-sm font-semibold px-5 py-2 rounded-lg text-white"
          >
            Sign up free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24">
        {/* Badge */}
        <div className={`fade-up delay-1 ${visible ? "visible" : ""} mb-6`}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-violet-400 border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
            Link Shortener &amp; Analytics
          </span>
        </div>

        {/* Headline */}
        <h1 className={`hero-title fade-up delay-2 ${visible ? "visible" : ""} text-6xl md:text-8xl max-w-3xl`}>
          <span className="text-white">Make your links</span>
          <br />
          <span className="text-violet-500">unforgettably</span>
          <br />
          <span className="text-violet-500">short</span>
        </h1>

        {/* Subheadline */}
        <p className={`fade-up delay-3 ${visible ? "visible" : ""} mt-6 text-gray-400 text-lg max-w-md leading-relaxed`}>
          Shorten, share, and track every click. Beautiful analytics for links that matter.
        </p>

        {/* CTA Button */}
        <div className={`fade-up delay-4 ${visible ? "visible" : ""} mt-10`}>
          <button 
            onClick={() => navigate("/signup")}
            className="btn-primary-landing flex items-center gap-2.5 text-base font-bold px-8 py-4 rounded-xl text-white shadow-lg shadow-violet-900/30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
            Get Started — It's Free
          </button>
          <p className="mt-3 text-xs text-gray-600">No credit card required</p>
        </div>

        {/* Feature Cards */}
        <div className={`fade-up delay-5 ${visible ? "visible" : ""} mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl`}>
          {features.map((f, i) => (
            <div key={i} className="feature-card rounded-2xl p-6 text-left">
              <div className={`${f.bg} ${f.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-base mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
