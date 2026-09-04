import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ComparisonTable from '../components/ComparisonTable';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Home() {
  // The hero video is large. Load it only on a wide screen, over a connection
  // that is not metered or slow, and only when motion is welcome. Everyone
  // else keeps the poster, which is visually near-identical when still.
  const [showVideo, setShowVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const conn = navigator.connection || {};
    const slow = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 900px)').matches;
    if (wide && !slow && !reduced) {
      // Wait for first paint so the video never competes with the content.
      const id = window.setTimeout(() => setShowVideo(true), 600);
      return () => window.clearTimeout(id);
    }
  }, []);

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {/* The poster paints immediately; the hero video is 41 MB, so it is
              only fetched where it will not cost someone their data plan. */}
          <img
            src="/hero-poster.jpg"
            alt=""
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {showVideo && (
            <video autoPlay loop muted playsInline preload="none" poster="/hero-poster.jpg"
              onCanPlay={() => setVideoReady(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                // The poster is the video's own first frame, so playback continues
                // from exactly the image already on screen. The fade only masks any
                // colour difference between the JPEG and the first decoded frame.
                opacity: videoReady ? 1 : 0,
                transition: 'opacity 400ms ease',
              }}
              ref={el => { if (el) el.playbackRate = 2; }}>
              <source src="/horse.webm" type="video/webm" />
            </video>
          )}
          <div className="hero-overlay" style={{ position: 'absolute', inset: 0 }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 620, padding: '0 32px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="gold-line" style={{ margin: '0 auto 28px' }} />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(56px, 9vw, 82px)', fontWeight: 500, color: '#D6D1CC', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 52 }}>
              Equimetrics
            </h1>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/horsellm" className="btn-primary" style={{ fontSize: 17, padding: '17px 34px' }}>
                Ask HorseLLM <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link to="/stable-match" className="btn-primary" style={{ fontSize: 17, padding: '17px 34px' }}>
                StableMatch <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link to="/equibets" className="btn-primary" style={{ fontSize: 17, padding: '17px 34px' }}>
                EquiBets <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section style={{ maxWidth: 1280, margin: '-60px auto 0', padding: '0 clamp(18px, 4vw, 40px)', position: 'relative', zIndex: 20 }}>
        <motion.div {...fadeUp} transition={{ duration: 0.7 }}>
          <div className="card-flat" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', padding: 'clamp(28px, 5vw, 52px) 0' }}>
            {[
              { value: '12,919', label: 'Horses Profiled' },
              { value: '52,767', label: 'Race Starts Analyzed' },
              { value: '71', label: 'Tracks Covered' },
              { value: '8.1', label: 'Avg Field Size' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                textAlign: 'center', padding: '12px clamp(12px, 2vw, 28px)', minWidth: 0,
                borderRight: i < 3 ? '1px solid rgba(197, 151, 87, 0.08)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 400, color: '#C59757', marginBottom: 12 }}>
                  {stat.value}
                </div>
                <div className="label" style={{ fontSize: 14 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(80px, 12vw, 160px) 40px' }}>
        <motion.div {...fadeUp} style={{ marginBottom: 72 }}>
          <div className="label" style={{ color: '#C59757', marginBottom: 16, fontSize: 15 }}>What We Built</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.5vw, 56px)', fontWeight: 500, color: '#D6D1CC', maxWidth: 640 }}>
            Six tools that transform GPS telemetry into insight
          </h2>
          <p style={{ fontSize: 20, color: '#8A847E', maxWidth: 660, lineHeight: 1.7, marginTop: 22 }}>
            We analyze all 52,000+ race starts across 71 tracks, and for the 32 GPS-equipped tracks we unlock speed, stride, and ground loss data that traditional methods simply cannot capture.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(500px, 100%), 1fr))', gap: 28 }}>
          {[
            { label: 'Replay', title: 'Live Replay', desc: 'Gate-by-gate GPS tracking. Watch positions evolve in real time with animated telemetry data from every horse in the field.', to: '/live-replay' },
            { label: 'Analysis', title: 'Deep Dive', desc: 'Speed traces, stride patterns, and ground loss metrics. See what chart callers with binoculars physically cannot observe.', to: '/deep-dive' },
            { label: 'Profiling', title: 'Horse Profiles', desc: 'Running style classification, stride signatures, and performance radar charts built from each horse\'s GPS history.', to: '/horse-profiles' },
            { label: 'Prediction', title: 'Forecast', desc: 'AI-powered pace projections and value picks for upcoming races based on GPS-derived running styles and patterns.', to: '/forecast' },
            { label: 'AI Assistant', title: 'HorseLLM', desc: 'Your sharpest friend at the track. Ask anything about horses, races, or GPS data and get instant, data-backed answers powered by 12,919 profiles.', to: '/horsellm' },
            { label: 'Matchmaking', title: 'StableMatch', desc: 'Swipe through upcoming horses like a dating app. Set your style, odds, and GPS preferences, then build a betting stable tailored to you.', to: '/stable-match' },
          ].map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
              <Link to={f.to} className="card" style={{ display: 'block', padding: 44, textDecoration: 'none', height: '100%' }}>
                <div className="label" style={{ marginBottom: 14, fontSize: 14 }}>{f.label}</div>
                <div className="gold-line" style={{ marginBottom: 20 }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: '#D6D1CC', marginBottom: 16 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 18, color: '#8A847E', lineHeight: 1.7, marginBottom: 26 }}>
                  {f.desc}
                </p>
                <span style={{ fontSize: 17, color: '#C59757', opacity: 0.8 }}>
                  Explore &rarr;
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px clamp(80px, 12vw, 160px)' }}>
        <motion.div {...fadeUp} style={{ marginBottom: 72 }}>
          <div className="label" style={{ color: '#C59757', marginBottom: 16, fontSize: 15 }}>The Advantage</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.5vw, 56px)', fontWeight: 500, color: '#D6D1CC' }}>
            Why GPS changes everything
          </h2>
        </motion.div>
        <ComparisonTable />
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '0 40px clamp(80px, 12vw, 160px)', textAlign: 'center' }}>
        <motion.div {...fadeUp}>
          <div className="gold-line" style={{ margin: '0 auto 40px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 5vw, 50px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 22 }}>
            Ready to see racing differently?
          </h2>
          <p style={{ fontSize: 20, color: '#8A847E', marginBottom: 60, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Dive into a featured race with full GPS telemetry: speed, stride, ground loss, and more.
          </p>
          <Link to="/live-replay" className="btn-primary" style={{ fontSize: 17, padding: '17px 34px' }}>
            Launch Live Replay <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: '1px solid rgba(197, 151, 87, 0.06)', padding: '56px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#D6D1CC' }}>
            EQUI<span style={{ color: '#C59757' }}>METRICS</span>
          </span>
          <p style={{ fontSize: 15, color: '#8A847E' }}>
            985,000+ GPS data points &middot; 32 tracks &middot; Data by Equibase &middot; 2026 Econ Games
          </p>
          <div style={{ display: 'flex', gap: 28, fontSize: 16 }}>
            {[
              { to: '/live-replay', label: 'Live Replay' },
              { to: '/deep-dive', label: 'Deep Dive' },
              { to: '/forecast', label: 'Forecast' },
              { to: '/gps-edge', label: 'GPS Edge' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ color: '#8A847E', textDecoration: 'none', transition: 'color 300ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C59757'}
                onMouseLeave={e => e.currentTarget.style.color = '#8A847E'}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
