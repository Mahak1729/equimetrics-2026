import { motion } from 'framer-motion';

/**
 * Shared loading affordances.
 *
 * The dataset files are large, so a page that renders immediately shows an
 * empty shell and then snaps into place when the fetch lands. These components
 * keep that transition calm: content fades and un-blurs rather than popping,
 * and skeletons hold the layout so nothing jumps.
 */

// Keyframes are injected once rather than pulled in as a stylesheet, so this
// component stays self-contained.
const SHIMMER_ID = 'equimetrics-shimmer-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(SHIMMER_ID)) {
  const style = document.createElement('style');
  style.id = SHIMMER_ID;
  style.textContent = `
@keyframes equimetricsShimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .equimetrics-shimmer { animation: none !important; }
}`;
  document.head.appendChild(style);
}

/** A single placeholder block that mimics the shape of the content to come. */
export function Skeleton({ height = 20, width = '100%', radius = 8, style = {} }) {
  return (
    <div
      className="equimetrics-shimmer"
      aria-hidden="true"
      style={{
        height,
        width,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #1C1A18 0%, #262320 50%, #1C1A18 100%)',
        backgroundSize: '600px 100%',
        animation: 'equimetricsShimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/** A stack of skeleton rows, for lists and tables. */
export function SkeletonList({ rows = 5, height = 84, gap = 14, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} />
      ))}
    </div>
  );
}

/** A grid of skeleton cards. */
export function SkeletonCards({ count = 6, height = 150, minWidth = 260, gap = 20, style = {} }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap,
        ...style,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={height} radius={12} />
      ))}
    </div>
  );
}

/**
 * Wraps real content and blurs it while `loading` is true, then eases it into
 * focus. Use where a skeleton would be overkill, such as a panel whose layout
 * is already correct and only the numbers are pending.
 */
export function Veil({ loading, children, blur = 10, style = {} }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: loading ? 0.45 : 1, filter: `blur(${loading ? blur : 0}px)` }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: loading ? 'none' : 'auto', ...style }}
      aria-busy={loading || undefined}
    >
      {children}
    </motion.div>
  );
}

/** Fades content in once, for the first paint after data lands. */
export function FadeIn({ children, delay = 0, y = 12, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** Small inline spinner with an optional label. */
export function Spinner({ size = 18, label, color = '#C59757' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }} role="status">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `2px solid ${color}33`,
          borderTopColor: color,
          display: 'block',
        }}
      />
      {label && <span style={{ fontSize: 15, color: '#8A847E' }}>{label}</span>}
    </div>
  );
}

/** Shown when a dataset fails to load, so the page never sits silently empty. */
export function LoadError({ message = 'Could not load this data.', onRetry }) {
  return (
    <div
      role="alert"
      style={{
        padding: '40px 32px',
        textAlign: 'center',
        border: '1px solid #2A2724',
        borderRadius: 12,
        background: '#141210',
      }}
    >
      <div style={{ color: '#D6D1CC', fontSize: 17, marginBottom: 6 }}>{message}</div>
      <div style={{ color: '#8A847E', fontSize: 15, marginBottom: onRetry ? 18 : 0 }}>
        Check your connection and try again.
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'transparent',
            border: '1px solid #C59757',
            color: '#C59757',
            borderRadius: 8,
            padding: '9px 20px',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
