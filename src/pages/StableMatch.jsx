import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, RotateCcw, ChevronRight, SlidersHorizontal, Trophy, Zap, TrendingUp } from 'lucide-react';
import { styleColors } from '../data/forecastConstants';
import { useJSON } from '../hooks/useJSON';
import { SkeletonList, SkeletonCards, Skeleton, LoadError } from '../components/Loading';
import { getPortrait } from '../data/portraits';

const STYLE_OPTIONS = ['Any', 'Front Runner', 'Stalker', 'Closer'];
const SURFACE_OPTIONS = ['Any', 'Dirt', 'Turf'];
const ODDS_RANGES = [
  { label: 'Any Odds', min: 0, max: 999 },
  { label: 'Favorites (< 4/1)', min: 0, max: 4 },
  { label: 'Mid-range (4/1 – 12/1)', min: 4, max: 12 },
  { label: 'Longshots (> 12/1)', min: 12, max: 999 },
];

function parseOdds(oddsStr) {
  if (!oddsStr) return 99;
  const parts = oddsStr.split('/');
  if (parts.length === 2) return parseInt(parts[0]) / parseInt(parts[1]);
  return parseFloat(oddsStr) || 99;
}

function getStrideLengthLabel(speeds) {
  if (!speeds?.length) return null;
  const peak = Math.max(...speeds);
  // Approximate stride length from peak speed (correlation)
  const stride = (peak * 0.62).toFixed(1);
  return stride;
}

function SwipeCard({ horse, onSwipe, isTop, exitDirection }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const color = horse.style ? (styleColors[horse.style] || '#C59757') : '#8A847E';
  const strideLen = getStrideLengthLabel(horse.speeds);
  const oddsNum = parseOdds(horse.odds);

  const exitX = exitDirection === 'right' ? 400 : exitDirection === 'left' ? -400 : (x.get() > 0 ? 400 : -400);

  return (
    <motion.div
      style={{
        position: 'absolute', width: '100%', height: '100%',
        x, rotate, cursor: isTop ? 'grab' : 'default',
        zIndex: isTop ? 10 : 1,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe('right');
        else if (info.offset.x < -120) onSwipe('left');
      }}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.6 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.6 }}
      exit={{ x: exitX, opacity: 0, rotate: exitX > 0 ? 25 : -25, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden',
        background: '#141A10', border: '1px solid rgba(197,151,87,0.1)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'row',
      }}>
        {/* Horse image: left half */}
        <div style={{ position: 'relative', flex: '0 0 50%', overflow: 'hidden' }}>
          <img
            src={getPortrait(horse.name)}
            alt={horse.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
            draggable={false}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 50%, rgba(20,26,16,0.4) 100%)',
          }} />

          {/* LIKE / NOPE overlays */}
          {isTop && (
            <>
              <motion.div style={{
                position: 'absolute', top: 24, left: 24, opacity: likeOpacity,
                padding: '8px 20px', borderRadius: 4, border: '3px solid #52B788',
                color: '#52B788', fontSize: 24, fontWeight: 700, letterSpacing: 2,
                transform: 'rotate(-12deg)',
              }}>
                BET
              </motion.div>
              <motion.div style={{
                position: 'absolute', top: 24, right: 24, opacity: nopeOpacity,
                padding: '8px 20px', borderRadius: 4, border: '3px solid #C2653A',
                color: '#C2653A', fontSize: 24, fontWeight: 700, letterSpacing: 2,
                transform: 'rotate(12deg)',
              }}>
                PASS
              </motion.div>
            </>
          )}
        </div>

        {/* Data: right half */}
        <div style={{ flex: '1 1 50%', padding: '24px 26px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header: name, badges, odds */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500,
                color: '#D6D1CC', lineHeight: 1.15, margin: 0,
              }}>
                {horse.name}
              </h3>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600,
                color: oddsNum <= 4 ? '#C59757' : oddsNum <= 12 ? '#D6D1CC' : '#8A847E',
                background: 'rgba(13,17,10,0.7)', padding: '5px 12px', borderRadius: 4,
                flexShrink: 0,
              }}>
                {horse.odds}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {horse.style && (
                <span style={{
                  fontSize: 13, padding: '3px 9px', borderRadius: 3,
                  color, background: `${color}18`,
                }}>
                  {horse.style === 'Front Runner' ? 'Speed' : horse.style}
                </span>
              )}
              <span style={{
                fontSize: 13, padding: '3px 9px', borderRadius: 3,
                color: '#8A847E', background: 'rgba(28,36,24,0.8)',
              }}>
                {horse.raceName}
              </span>
            </div>
          </div>

          {/* Top stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { icon: Zap, label: 'Peak Speed', value: horse.peakMPH ? `${horse.peakMPH} mph` : '–', highlight: horse.peakMPH >= 39 },
              { icon: TrendingUp, label: 'Stride Est.', value: strideLen ? `${strideLen} ft` : '–', highlight: strideLen >= 24 },
              { icon: Trophy, label: 'GPS Score', value: horse.gpsScore != null ? `${horse.gpsScore}` : '–', highlight: horse.gpsScore >= 80 },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <stat.icon style={{ width: 16, height: 16, color: stat.highlight ? '#C59757' : '#5A5550', margin: '0 auto 5px' }} />
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600,
                  color: stat.highlight ? '#C59757' : '#D6D1CC', marginBottom: 2,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 10, color: '#5A5550', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Secondary metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Closing', value: horse.closingMPH ? `${horse.closingMPH} mph` : '–' },
              { label: 'Stride Fade', value: horse.strideFade != null ? `${horse.strideFade}%` : '–' },
              { label: 'Efficiency', value: horse.efficiency ? `${horse.efficiency}%` : '–' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: 3,
                background: 'rgba(197,151,87,0.04)', border: '1px solid rgba(197,151,87,0.06)',
              }}>
                <span style={{ fontSize: 14, color: '#8A847E' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#D6D1CC', fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Jockey/Trainer */}
          <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 13, color: '#5A5550', paddingTop: 8, borderTop: '1px solid rgba(197,151,87,0.06)' }}>
            J: {horse.jockey} &middot; T: {horse.trainer}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PreferencesScreen({ onStart }) {
  const [style, setStyle] = useState('Any');
  const [odds, setOdds] = useState(0);
  const [surface, setSurface] = useState('Any');
  const [minGPS, setMinGPS] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ maxWidth: 624, margin: '0 auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 58 }}>
        <div className="gold-line" style={{ margin: '0 auto 29px' }} />
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 6vw, 48px)',
          fontWeight: 500, color: '#D6D1CC', marginBottom: 14,
        }}>
          Set Your Preferences
        </h2>
        <p style={{ fontSize: 20, color: '#8A847E', maxWidth: 456, margin: '0 auto', lineHeight: 1.6 }}>
          Tell us what you like in a horse. We'll show you matches from upcoming races.
        </p>
      </div>

      {/* Running Style */}
      <div style={{ marginBottom: 38 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Running Style</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {STYLE_OPTIONS.map(s => {
            const active = style === s;
            const col = s !== 'Any' ? styleColors[s] : '#C59757';
            return (
              <button key={s} onClick={() => setStyle(s)} style={{
                padding: '12px 24px', borderRadius: 4, cursor: 'pointer', fontSize: 19, fontWeight: 500,
                transition: 'all 250ms',
                background: active ? `${col}15` : 'transparent',
                border: active ? `1px solid ${col}40` : '1px solid rgba(197,151,87,0.06)',
                color: active ? col : '#5A5550',
              }}>
                {s === 'Front Runner' ? 'Speed' : s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Odds Range */}
      <div style={{ marginBottom: 38 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Odds Range</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {ODDS_RANGES.map((r, i) => {
            const active = odds === i;
            return (
              <button key={r.label} onClick={() => setOdds(i)} style={{
                padding: '12px 22px', borderRadius: 4, cursor: 'pointer', fontSize: 18, fontWeight: 500,
                transition: 'all 250ms',
                background: active ? '#141A10' : 'transparent',
                border: active ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                color: active ? '#C59757' : '#5A5550',
              }}>
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Surface */}
      <div style={{ marginBottom: 38 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Surface</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {SURFACE_OPTIONS.map(s => {
            const active = surface === s;
            return (
              <button key={s} onClick={() => setSurface(s)} style={{
                padding: '12px 24px', borderRadius: 4, cursor: 'pointer', fontSize: 19, fontWeight: 500,
                transition: 'all 250ms',
                background: active ? '#141A10' : 'transparent',
                border: active ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                color: active ? '#C59757' : '#5A5550',
              }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min GPS Score */}
      <div style={{ marginBottom: 58 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>
          Minimum GPS Score: <span style={{ color: '#C59757', fontFamily: 'var(--font-mono)', fontSize: 17 }}>{minGPS || 'Any'}</span>
        </div>
        <input
          type="range" min={0} max={90} step={5} value={minGPS}
          onChange={e => setMinGPS(parseInt(e.target.value))}
          style={{
            width: '100%', height: 4, appearance: 'none', cursor: 'pointer',
            background: `linear-gradient(to right, #C59757 ${(minGPS / 90) * 100}%, #1C2418 ${(minGPS / 90) * 100}%)`,
            borderRadius: 2, accentColor: '#C59757',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#5A5550', marginTop: 8 }}>
          <span>Any</span><span>90+</span>
        </div>
      </div>

      <div style={{ marginBottom: 38, padding: '20px 24px', borderRadius: 4, background: 'rgba(232,184,109,0.06)', border: '1px solid rgba(232,184,109,0.12)' }}>
        <p style={{ fontSize: 18, color: '#E8B86D', fontWeight: 600, lineHeight: 1.7, margin: 0 }}>
          Fun fact: A horse's left heart ventricle size is one of the strongest predictors of racing success. Bigger chamber, more blood per beat, more speed when it counts.
        </p>
      </div>

      <button
        onClick={() => onStart({ style, odds: ODDS_RANGES[odds], surface, minGPS })}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '20px 34px', fontSize: 19 }}
      >
        Find My Horses <ChevronRight style={{ width: 22, height: 22 }} />
      </button>
    </motion.div>
  );
}

function MatchesScreen({ matches, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="gold-line" style={{ margin: '0 auto 24px' }} />
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 500, color: '#D6D1CC', marginBottom: 12,
        }}>
          {matches.length > 0 ? 'Your Stable' : 'No Matches'}
        </h2>
        <p style={{ fontSize: 17, color: '#5A5550' }}>
          {matches.length > 0
            ? `You matched with ${matches.length} horse${matches.length > 1 ? 's' : ''} for upcoming races.`
            : 'You passed on everyone. Try again with different preferences.'}
        </p>
      </div>

      {matches.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {matches.map((horse, i) => {
            const color = horse.style ? (styleColors[horse.style] || '#C59757') : '#8A847E';
            const strideLen = getStrideLengthLabel(horse.speeds);
            return (
              <motion.div
                key={horse.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-flat"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                  borderColor: 'rgba(197,151,87,0.1)',
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
                  border: `2px solid ${color}40`,
                }}>
                  <img src={getPortrait(horse.name)} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: '#D6D1CC' }}>{horse.name}</span>
                    {horse.style && (
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 2,
                        color, background: `${color}15`,
                      }}>
                        {horse.style === 'Front Runner' ? 'Speed' : horse.style}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 16, color: '#5A5550' }}>
                    {horse.raceName} &middot; J: {horse.jockey}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: '#C59757' }}>
                      {horse.odds}
                    </div>
                    <div style={{ fontSize: 9, color: '#5A5550', textTransform: 'uppercase', letterSpacing: '1px' }}>Odds</div>
                  </div>
                  {strideLen && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: '#D6D1CC' }}>
                        {strideLen}
                      </div>
                      <div style={{ fontSize: 9, color: '#5A5550', textTransform: 'uppercase', letterSpacing: '1px' }}>Stride</div>
                    </div>
                  )}
                  {horse.gpsScore != null && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600,
                        color: horse.gpsScore >= 80 ? '#C59757' : '#8A847E',
                      }}>
                        {horse.gpsScore}
                      </div>
                      <div style={{ fontSize: 9, color: '#5A5550', textTransform: 'uppercase', letterSpacing: '1px' }}>GPS</div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <button onClick={onReset} className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '16px 28px', fontSize: 17, gap: 10 }}>
        <RotateCcw style={{ width: 16, height: 16 }} /> Start Over
      </button>
    </motion.div>
  );
}

export default function StableMatch() {
  const [phase, setPhase] = useState('prefs'); // prefs | swiping | results
  const [prefs, setPrefs] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [matches, setMatches] = useState([]);
  const [passed, setPassed] = useState([]);
  const [horses, setHorses] = useState([]);
  const [lastSwipe, setLastSwipe] = useState(null);
  const { data: forecastRaces, loading, error, retry } = useJSON('/data/forecast.json', []);

  const buildDeck = (preferences) => {
    const allHorses = [];
    forecastRaces.forEach(race => {
      const raceName = `${race.trackName} R${race.raceNumber}`;
      race.horses.forEach(h => {
        if (!h.hasGPS) return;
        allHorses.push({ ...h, raceName, raceDate: race.date, surface: race.surface });
      });
    });

    const filtered = allHorses.filter(h => {
      if (preferences.style !== 'Any' && h.style !== preferences.style) return false;
      if (preferences.surface !== 'Any' && h.surface !== preferences.surface) return false;
      const oddsNum = parseOdds(h.odds);
      if (oddsNum < preferences.odds.min || oddsNum > preferences.odds.max) return false;
      if (preferences.minGPS > 0 && (h.gpsScore == null || h.gpsScore < preferences.minGPS)) return false;
      return true;
    });

    // Sort by GPS score descending, take up to 20
    filtered.sort((a, b) => (b.gpsScore || 0) - (a.gpsScore || 0));
    return filtered.slice(0, 20);
  };

  const handleStart = (preferences) => {
    setPrefs(preferences);
    const deck = buildDeck(preferences);
    setHorses(deck);
    setCurrentIdx(0);
    setMatches([]);
    setPassed([]);
    setPhase(deck.length > 0 ? 'swiping' : 'results');
  };

  const handleSwipe = (direction) => {
    const horse = horses[currentIdx];
    setLastSwipe(direction);
    if (direction === 'right') {
      setMatches(prev => [...prev, horse]);
    } else {
      setPassed(prev => [...prev, horse]);
    }

    if (currentIdx >= horses.length - 1) {
      // Small delay for exit animation
      setTimeout(() => setPhase('results'), 350);
    }
    setCurrentIdx(prev => prev + 1);
  };

  const handleReset = () => {
    setPhase('prefs');
    setPrefs(null);
    setCurrentIdx(0);
    setMatches([]);
    setPassed([]);
    setHorses([]);
  };

  const remaining = horses.length - currentIdx;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: phase === 'swiping' ? '96px 32px 32px' : '120px 32px 80px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {phase !== 'swiping' && (
          <div className="label" style={{ color: '#C59757', marginBottom: 16, fontSize: 19 }}>
            <SlidersHorizontal style={{ width: 15, height: 15, display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            Matchmaking
          </div>
        )}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: phase === 'swiping' ? 'clamp(28px, 3vw, 36px)' : 'clamp(40px, 6vw, 58px)',
          fontWeight: 500, color: '#D6D1CC',
          marginBottom: phase === 'swiping' ? 14 : 12,
        }}>
          Stable<span style={{ color: '#C59757' }}>Match</span>
        </h1>
        {phase !== 'swiping' && (
          <p style={{ fontSize: 19, color: '#8A847E', maxWidth: 620, lineHeight: 1.7, marginBottom: 56 }}>
            Swipe through upcoming horses like a dating app. Set your preferences, see the data, and build your betting stable.
          </p>
        )}
      </motion.div>

      {error ? (
        <LoadError message="Could not load the upcoming races." onRetry={retry} />
      ) : loading ? (
        <SkeletonCards count={4} height={180} minWidth={240} />
      ) : (
        <>
      <AnimatePresence mode="wait">
        {phase === 'prefs' && (
          <PreferencesScreen key="prefs" onStart={handleStart} />
        )}

        {phase === 'swiping' && (
          <motion.div
            key="swiping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: 760, margin: '0 auto' }}
          >
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, color: '#5A5550' }}>
                {remaining > 0 ? `${remaining} horse${remaining > 1 ? 's' : ''} remaining` : 'All done!'}
              </span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 15, color: '#52B788' }}>
                  <Heart style={{ width: 13, height: 13, display: 'inline', verticalAlign: 'middle', fill: '#52B788' }} /> {matches.length}
                </span>
                <span style={{ fontSize: 15, color: '#C2653A' }}>
                  <X style={{ width: 13, height: 13, display: 'inline', verticalAlign: 'middle' }} /> {passed.length}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: '#1C2418', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${((currentIdx) / horses.length) * 100}%` }}
                style={{ height: '100%', background: '#C59757', borderRadius: 2 }}
              />
            </div>

            {/* Card stack */}
            <div style={{
              position: 'relative', width: '100%',
              height: 'min(470px, calc(100vh - 380px))',
              minHeight: 360,
              marginBottom: 20,
            }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <AnimatePresence>
                  {horses.slice(currentIdx, currentIdx + 2).reverse().map((horse, i, arr) => (
                    <SwipeCard
                      key={horse.name + horse.raceName}
                      horse={horse}
                      onSwipe={handleSwipe}
                      isTop={i === arr.length - 1}
                      exitDirection={lastSwipe}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Action buttons */}
            {remaining > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                <button
                  onClick={() => handleSwipe('right')}
                  style={{
                    width: 60, height: 60, borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(82,183,136,0.08)', border: '2px solid rgba(82,183,136,0.25)',
                    color: '#52B788', transition: 'all 250ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(82,183,136,0.15)'; e.currentTarget.style.borderColor = 'rgba(82,183,136,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(82,183,136,0.08)'; e.currentTarget.style.borderColor = 'rgba(82,183,136,0.25)'; }}
                >
                  <Heart style={{ width: 26, height: 26 }} />
                </button>
                <button
                  onClick={() => handleSwipe('left')}
                  style={{
                    width: 60, height: 60, borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(194,101,58,0.08)', border: '2px solid rgba(194,101,58,0.25)',
                    color: '#C2653A', transition: 'all 250ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(194,101,58,0.15)'; e.currentTarget.style.borderColor = 'rgba(194,101,58,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(194,101,58,0.08)'; e.currentTarget.style.borderColor = 'rgba(194,101,58,0.25)'; }}
                >
                  <X style={{ width: 26, height: 26 }} />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'results' && (
          <MatchesScreen key="results" matches={matches} onReset={handleReset} />
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
