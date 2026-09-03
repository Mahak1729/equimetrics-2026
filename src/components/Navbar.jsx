import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/live-replay', label: 'Live Replay' },
  { path: '/deep-dive', label: 'Deep Dive' },
  { path: '/horse-profiles', label: 'Horse Profiles' },
  { path: '/forecast', label: 'Forecast' },
  { path: '/gps-edge', label: 'GPS Edge' },
  { path: '/horsellm', label: 'HorseLLM' },
  { path: '/stable-match', label: 'StableMatch' },
  { path: '/equibets', label: 'EquiBets' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);


  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 72,
        backgroundColor: 'rgba(13, 17, 10, 0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(197, 151, 87, 0.08)' : 'rgba(197, 151, 87, 0.03)'}`,
        transition: 'border-color 400ms ease',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 600, color: '#D6D1CC', letterSpacing: '0.5px' }}>
            EQUI
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 600, color: '#C59757', letterSpacing: '0.5px' }}>
            METRICS
          </span>
        </Link>

        <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 'clamp(14px, 1.7vw, 30px)' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontSize: 'clamp(14px, 1.15vw, 17px)', fontWeight: 400, textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  color: isActive ? '#C59757' : '#8A847E',
                  transition: 'color 300ms ease',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#D6D1CC'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#8A847E'; }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Below lg the links do not fit, so they move into a toggle panel.
            Without this there is no navigation at all on a phone. */}
        {/* Display is set by these classes, not inline: an inline `display`
            would override Tailwind's `lg:hidden` and leave the button visible
            on desktop alongside the full nav. */}
        <button
          className="flex items-center lg:hidden"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#D6D1CC', padding: 8, margin: -8,
          }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            className="lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: 'rgba(13, 17, 10, 0.98)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(197, 151, 87, 0.12)',
              padding: '10px clamp(20px, 4vw, 40px) 20px',
              maxHeight: 'calc(100vh - 72px)', overflowY: 'auto',
            }}
          >
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', padding: '14px 0', fontSize: 18, textDecoration: 'none',
                    color: isActive ? '#C59757' : '#D6D1CC',
                    borderBottom: '1px solid rgba(197, 151, 87, 0.07)',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
