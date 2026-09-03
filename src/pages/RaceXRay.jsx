import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trophy } from 'lucide-react';
import { SkeletonList, Skeleton, LoadError } from '../components/Loading';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getPortrait } from '../data/portraits';

const COLORS = ['#C59757','#52B788','#5B8DEF','#E8B86D','#9B72CF','#C2653A','#4ECDC4','#EF5B5B','#D4A574','#74C69D','#8B4226','#5BEF8D'];

const TRACK_NAMES = {
  AQU: 'Aqueduct', GP: 'Gulfstream Park', HOU: 'Sam Houston', LRL: 'Laurel Park',
  OP: 'Oaklawn Park', SA: 'Santa Anita', TAM: 'Tampa Bay', TP: 'Turfway Park',
  FG: 'Fair Grounds', CNL: 'Colonial Downs', CT: 'Charles Town', PEN: 'Penn National',
  PRX: 'Parx', MVR: 'Mahoning Valley',
};

const RACE_PHOTOS = [
  '/portraits/horse-24.jpg', '/portraits/horse-25.jpg', '/portraits/horse-26.jpg',
  '/portraits/horse-27.jpg', '/portraits/horse-28.jpg', '/portraits/horse-29.jpg',
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#141A10', border: '1px solid rgba(197,151,87,0.15)', borderRadius: 3, padding: '8px 12px', fontSize: 16 }}>
      <div style={{ color: '#C59757', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 17, padding: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
            <span style={{ color: '#8A847E', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#D6D1CC' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function RaceXRay() {
  const [query, setQuery] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeHorses, setActiveHorses] = useState([]);
  const [results, setResults] = useState([]);
  const [browseRaces, setBrowseRaces] = useState([]);
  const [totalGPSRaces, setTotalGPSRaces] = useState(155);
  const [allRaces, setAllRaces] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => setReloadKey(k => k + 1);

  // Fetch all GPS races from static file
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/data/gps-races.json')
      .then(r => { if (!r.ok) throw new Error(`Request failed (${r.status})`); return r.json(); })
      .then(d => {
      setAllRaces(d);
      setTotalGPSRaces(d.length);
      setBrowseRaces(d.slice(0, 12).map(r => {
        const w = [...r.horses].sort((a, b) => (a.position || 99) - (b.position || 99))[0];
        return { id: r.id, date: r.date, track: r.track, raceNum: r.raceNum, distance: r.distance, surface: r.surface, type: r.type, purse: r.purse, horseCount: r.horses.length, winnerName: w?.name, trackName: TRACK_NAMES[r.track] || r.track };
      }));
        setLoading(false);
      })
      .catch(err => { setError(err); setLoading(false); });
  }, [reloadKey]);

  // Instant in-memory search
  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    const filtered = allRaces.filter(r => {
      const tn = (TRACK_NAMES[r.track] || r.track).toLowerCase();
      return `${tn} r${r.raceNum} ${r.date}`.includes(q) || r.horses.some(h => h.name.toLowerCase().includes(q));
    }).slice(0, 12).map(r => {
      const w = [...r.horses].sort((a, b) => (a.position || 99) - (b.position || 99))[0];
      return { id: r.id, date: r.date, track: r.track, raceNum: r.raceNum, distance: r.distance, surface: r.surface, type: r.type, purse: r.purse, horseCount: r.horses.length, winnerName: w?.name, trackName: TRACK_NAMES[r.track] || r.track };
    });
    setResults(filtered);
  }, [query, allRaces]);

  const race = selected;
  const horses = useMemo(() => {
    if (!race) return [];
    return [...race.horses]
      .sort((a, b) => (a.position || 99) - (b.position || 99))
      .map((h, i) => ({ ...h, color: COLORS[i % COLORS.length] }));
  }, [race]);

  const winner = horses[0];

  const selectRace = (r) => {
    setQuery('');
    setShowDrop(false);
    // Full data is already in memory, so look it up by id
    const full = r.horses?.length && r.horses[0].speeds ? r : allRaces.find(x => x.id === r.id);
    if (full) {
      setSelected(full);
      setActiveHorses(full.horses.slice(0, 6).map(h => h.name));
    }
  };

  const toggleHorse = (name) => {
    setActiveHorses(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  // Build chart data
  const speedData = useMemo(() => {
    if (!race) return [];
    const maxGates = Math.max(...horses.map(h => h.speeds?.length || 0));
    const data = [];
    for (let i = 0; i < maxGates; i++) {
      const point = { gate: i === 0 ? 'Start' : i === maxGates - 1 ? 'Finish' : `${i}` };
      horses.forEach(h => { if (h.speeds?.[i] != null) point[h.name] = h.speeds[i]; });
      data.push(point);
    }
    return data;
  }, [race, horses]);

  const strideData = useMemo(() => {
    if (!race) return [];
    const maxGates = Math.max(...horses.map(h => h.strideLengths?.length || 0));
    const data = [];
    for (let i = 0; i < maxGates; i++) {
      const point = { gate: i === 0 ? 'Start' : i === maxGates - 1 ? 'Finish' : `${i}` };
      horses.forEach(h => { if (h.strideLengths?.[i] != null) point[h.name] = h.strideLengths[i]; });
      data.push(point);
    }
    return data;
  }, [race, horses]);

  // Compute effort-adjusted ranking
  const effortRanking = useMemo(() => {
    if (!race) return [];
    return horses
      .map(h => {
        const avgSpeed = h.speeds?.length ? h.speeds.reduce((a, b) => a + b, 0) / h.speeds.length : 0;
        const effortScore = avgSpeed > 0 ? avgSpeed + (h.groundLoss || 0) * 0.08 : 0;
        return { ...h, effortScore };
      })
      .sort((a, b) => b.effortScore - a.effortScore)
      .map((h, i) => ({ ...h, adjustedRank: i + 1 }));
  }, [race, horses]);

  // Key metrics from selected race
  const metrics = useMemo(() => {
    if (!horses.length) return [];
    const fastest = [...horses].sort((a, b) => (b.peakMPH || 0) - (a.peakMPH || 0))[0];
    const bestCloser = [...horses].sort((a, b) => (b.closingMPH || 0) - (a.closingMPH || 0))[0];
    const mostLoss = [...horses].sort((a, b) => (b.groundLoss || 0) - (a.groundLoss || 0))[0];
    const worstFade = [...horses].sort((a, b) => {
      const fadeA = a.strideLengths?.length >= 2 ? ((a.strideLengths[a.strideLengths.length - 1] - a.strideLengths[Math.floor(a.strideLengths.length / 2)]) / a.strideLengths[Math.floor(a.strideLengths.length / 2)] * 100) : 0;
      const fadeB = b.strideLengths?.length >= 2 ? ((b.strideLengths[b.strideLengths.length - 1] - b.strideLengths[Math.floor(b.strideLengths.length / 2)]) / b.strideLengths[Math.floor(b.strideLengths.length / 2)] * 100) : 0;
      return fadeA - fadeB;
    })[0];
    const fadePct = worstFade?.strideLengths?.length >= 2
      ? ((worstFade.strideLengths[worstFade.strideLengths.length - 1] - worstFade.strideLengths[Math.floor(worstFade.strideLengths.length / 2)]) / worstFade.strideLengths[Math.floor(worstFade.strideLengths.length / 2)] * 100).toFixed(1)
      : '–';
    return [
      { value: fastest?.peakMPH?.toFixed(1) || '–', unit: 'mph', label: 'Peak Speed', sub: fastest?.name },
      { value: bestCloser?.closingMPH?.toFixed(1) || '–', unit: 'mph', label: 'Closing Velocity', sub: bestCloser?.name },
      { value: mostLoss?.groundLoss != null ? `+${mostLoss.groundLoss}` : '–', unit: 'm', label: 'Max Ground Loss', sub: mostLoss?.name },
      { value: fadePct, unit: '%', label: 'Stride Fade', sub: worstFade?.name },
    ];
  }, [horses]);

  // Top races for browse
  const topRaces = browseRaces;

  const trackName = race ? (TRACK_NAMES[race.track] || race.track) : '';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 40px 80px' }}>
      <motion.div {...fadeUp}>
        <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 18 }}>Analysis</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 54px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 14 }}>Deep Dive</h1>
        <p style={{ fontSize: 19, color: '#8A847E', marginBottom: 48 }}>
          Search {totalGPSRaces} GPS races. Pick one to see speed, stride, ground loss, and effort-adjusted rankings.
        </p>
      </motion.div>

      {error ? (
        <LoadError message="Could not load the GPS race data." onRetry={retry} />
      ) : loading ? (
        <div>
          <Skeleton height={56} width="100%" radius={8} style={{ marginBottom: 32 }} />
          <SkeletonList rows={6} height={92} />
        </div>
      ) : (
        <>
      {/* Search */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} style={{ marginBottom: 48, position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 26px', borderRadius: 4, background: '#141A10', border: '1px solid rgba(197,151,87,0.1)' }}>
          <Search style={{ width: 24, height: 24, color: '#5A5550', flexShrink: 0 }} />
          <input type="text" placeholder="Search by track, race number, or horse name..."
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
            onFocus={() => { if (query.length >= 2) setShowDrop(true); }}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 20, color: '#D6D1CC', fontFamily: 'var(--font-sans)' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowDrop(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A5550', padding: 4 }}>
              <X style={{ width: 20, height: 20 }} />
            </button>
          )}
        </div>
        {showDrop && results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#141A10', border: '1px solid rgba(197,151,87,0.12)', borderRadius: 4, maxHeight: 480, overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
            {results.map(r => {
              return (
                <button key={r.id} onClick={() => selectRace(r)}
                  style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '18px 26px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(197,151,87,0.04)', cursor: 'pointer', textAlign: 'left', transition: 'background 200ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,151,87,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: '#D6D1CC' }}>
                      {r.trackName || TRACK_NAMES[r.track] || r.track} Race {r.raceNum}
                    </div>
                    <div style={{ fontSize: 16, color: '#5A5550', marginTop: 4 }}>
                      {r.date} · {r.distance} {r.surface} · {r.type} · {r.horseCount || r.horses?.length} horses GPS
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {r.winnerName && (
                      <span style={{ fontSize: 17, color: '#C59757' }}>
                        <Trophy style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                        {r.winnerName}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {race ? (
          <motion.div key={race.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

            {/* Race header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32, flexWrap: 'wrap', gap: 14 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 500, color: '#D6D1CC' }}>
                {trackName} Race {race.raceNum}
              </h2>
              <span style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#5A5550' }}>
                {race.date} · {race.distance} {race.surface} · {race.type} · ${race.purse?.toLocaleString()}
              </span>
            </div>

            {/* Winner highlight */}
            {winner && (
              <div className="card-flat" style={{ padding: '26px 36px', marginBottom: 32, borderColor: 'rgba(197,151,87,0.15)', display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(197,151,87,0.3)', flexShrink: 0 }}>
                  <img src={getPortrait(winner.name)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Trophy style={{ width: 22, height: 22, color: '#C59757' }} />
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: '#C59757' }}>{winner.name}</span>
                    <span style={{ fontSize: 19, color: '#5A5550' }}>Winner</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 16, flexWrap: 'wrap' }}>
                    {winner.peakMPH && <span style={{ color: '#8A847E' }}>Peak: <span style={{ fontFamily: 'var(--font-mono)', color: '#D6D1CC' }}>{winner.peakMPH} mph</span></span>}
                    {winner.closingMPH && <span style={{ color: '#8A847E' }}>Closing: <span style={{ fontFamily: 'var(--font-mono)', color: '#D6D1CC' }}>{winner.closingMPH} mph</span></span>}
                    {winner.groundLoss != null && <span style={{ color: '#8A847E' }}>Ground Loss: <span style={{ fontFamily: 'var(--font-mono)', color: '#D6D1CC' }}>+{winner.groundLoss}m</span></span>}
                    {winner.earnings != null && <span style={{ color: '#8A847E' }}>Earned: <span style={{ fontFamily: 'var(--font-mono)', color: '#C59757' }}>${winner.earnings.toLocaleString()}</span></span>}
                  </div>
                </div>
              </div>
            )}

            {/* Key metrics */}
            <div className="card-flat" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '40px 0', marginBottom: 36 }}>
              {metrics.map((s, i) => (
                <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(197,151,87,0.06)' : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 400, color: '#C59757' }}>
                    {s.value}<span style={{ fontSize: 20, color: '#5A5550', marginLeft: 3 }}>{s.unit}</span>
                  </div>
                  <div className="label" style={{ marginTop: 12, fontSize: 13 }}>{s.label}</div>
                  <div style={{ fontSize: 17, color: '#8A847E', marginTop: 6 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Horse toggles */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
              {horses.map(h => {
                const on = activeHorses.includes(h.name);
                return (
                  <button key={h.name} onClick={() => toggleHorse(h.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 4, fontSize: 17, cursor: 'pointer', background: 'transparent', color: on ? '#D6D1CC' : '#5A5550', border: 'none', transition: 'opacity 300ms', opacity: on ? 1 : 0.4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: on ? h.color : '#5A5550' }} />
                    {h.name}
                    {h.position === 1 && <Trophy style={{ width: 13, height: 13, color: '#C59757' }} />}
                  </button>
                );
              })}
            </div>

            {/* Speed chart */}
            {speedData.length > 0 && (
              <div className="card-flat" style={{ padding: 36, marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <div className="label" style={{ marginBottom: 10, fontSize: 13 }}>Velocity</div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC' }}>Speed Traces</h3>
                  </div>
                  <span style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#5A5550' }}>MPH</span>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={speedData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <defs>
                      {horses.map(h => (
                        <linearGradient key={h.name} id={`gs-${h.name.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={h.color} stopOpacity={0.06} />
                          <stop offset="100%" stopColor={h.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(197,151,87,0.03)" strokeDasharray="3 3" />
                    <XAxis dataKey="gate" tick={{ fontSize: 10, fill: '#5A5550', fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'rgba(197,151,87,0.06)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#5A5550', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 1']} />
                    <Tooltip content={<CustomTip />} />
                    {horses.map(h => activeHorses.includes(h.name) ? (
                      <Area key={h.name} type="monotone" dataKey={h.name} stroke={h.color} strokeWidth={h.position === 1 ? 2.5 : 1.5}
                        fill={`url(#gs-${h.name.replace(/[^a-zA-Z0-9]/g, '')})`}
                        dot={false} activeDot={{ r: 3, fill: h.color, stroke: '#0D110A', strokeWidth: 2 }} />
                    ) : null)}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 28, marginBottom: 28 }}>
              {/* Ground Loss */}
              <div className="card-flat" style={{ padding: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div className="label" style={{ marginBottom: 10, fontSize: 13 }}>GPS Exclusive</div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC' }}>Ground Loss</h3>
                  </div>
                  <span style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#5A5550' }}>Meters</span>
                </div>
                <p style={{ fontSize: 17, color: '#8A847E', marginBottom: 24, lineHeight: 1.7 }}>
                  Extra distance traveled vs. rail path.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[...horses].sort((a, b) => (b.groundLoss || 0) - (a.groundLoss || 0)).map((h, i) => {
                    const maxLoss = Math.max(...horses.map(x => x.groundLoss || 0), 1);
                    return (
                      <div key={h.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.color }} />
                            <span style={{ fontSize: 18, color: h.position === 1 ? '#C59757' : '#D6D1CC' }}>{h.name}</span>
                            {h.position === 1 && <Trophy style={{ width: 13, height: 13, color: '#C59757' }} />}
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 19, color: h.groundLoss > 15 ? '#C59757' : '#5A5550' }}>+{h.groundLoss || 0}m</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: '#1C2418', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${((h.groundLoss || 0) / maxLoss) * 100}%`, borderRadius: 2, background: h.color, transition: 'width 600ms ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stride chart */}
              {strideData.length > 0 && (
                <div className="card-flat" style={{ padding: 36 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                      <div className="label" style={{ marginBottom: 10, fontSize: 13 }}>Biomechanics</div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC' }}>Stride Analysis</h3>
                    </div>
                    <span style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#5A5550' }}>Meters</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={strideData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <defs>
                        {horses.map(h => (
                          <linearGradient key={h.name} id={`gst-${h.name.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={h.color} stopOpacity={0.06} />
                            <stop offset="100%" stopColor={h.color} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid stroke="rgba(197,151,87,0.03)" strokeDasharray="3 3" />
                      <XAxis dataKey="gate" tick={{ fontSize: 10, fill: '#5A5550', fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'rgba(197,151,87,0.06)' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#5A5550', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} domain={['dataMin - 0.5', 'dataMax + 0.3']} />
                      <Tooltip content={<CustomTip />} />
                      {horses.map(h => activeHorses.includes(h.name) ? (
                        <Area key={h.name} type="monotone" dataKey={h.name} stroke={h.color} strokeWidth={h.position === 1 ? 2.5 : 1.5}
                          fill={`url(#gst-${h.name.replace(/[^a-zA-Z0-9]/g, '')})`}
                          dot={false} activeDot={{ r: 3, fill: h.color, stroke: '#0D110A', strokeWidth: 2 }} />
                      ) : null)}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Effort-adjusted rankings */}
            <div className="card-flat" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '28px 36px', borderBottom: '1px solid rgba(197,151,87,0.06)' }}>
                <div className="label" style={{ color: '#C59757', marginBottom: 10, fontSize: 13 }}>GPS Exclusive</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC' }}>Effort-Adjusted Rankings</h3>
                <p style={{ fontSize: 17, color: '#8A847E', marginTop: 6 }}>Rankings recalculated for ground loss and average speed</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(197,151,87,0.06)' }}>
                    {['Adj.', 'Horse', 'Official', 'Ground Loss', 'Closing', 'Verdict'].map(h => (
                      <th key={h} className="label" style={{ textAlign: 'left', padding: '18px 36px', fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {effortRanking.map((h, i) => {
                    const improved = h.adjustedRank < (h.position || 99);
                    const isWinner = h.position === 1;
                    return (
                      <tr key={h.name} style={{
                        borderBottom: i < effortRanking.length - 1 ? '1px solid rgba(197,151,87,0.04)' : 'none',
                        background: isWinner ? 'rgba(197,151,87,0.03)' : 'transparent',
                      }}>
                        <td style={{ padding: '18px 36px', fontFamily: 'var(--font-serif)', fontSize: 20, color: '#C59757' }}>#{h.adjustedRank}</td>
                        <td style={{ padding: '18px 36px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 5, overflow: 'hidden', border: `1px solid ${h.color}40`, flexShrink: 0 }}>
                              <img src={getPortrait(h.name)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <span style={{ fontSize: 19, color: isWinner ? '#C59757' : '#D6D1CC', fontWeight: isWinner ? 600 : 400 }}>{h.name}</span>
                            {isWinner && <Trophy style={{ width: 15, height: 15, color: '#C59757' }} />}
                          </div>
                        </td>
                        <td style={{ padding: '18px 36px', fontFamily: 'var(--font-mono)', fontSize: 18, color: '#5A5550' }}>{h.position || '–'}</td>
                        <td style={{ padding: '18px 36px', fontFamily: 'var(--font-mono)', fontSize: 18, color: (h.groundLoss || 0) > 15 ? '#C59757' : '#5A5550' }}>+{h.groundLoss || 0}m</td>
                        <td style={{ padding: '18px 36px', fontFamily: 'var(--font-mono)', fontSize: 18, color: '#8A847E' }}>{h.closingMPH || '–'} mph</td>
                        <td style={{ padding: '18px 36px', fontSize: 17, color: improved ? '#C59757' : '#5A5550' }}>{improved ? 'Undervalued' : 'Fair'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* Browse top races */
          <motion.div key="browse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="label" style={{ marginBottom: 20, fontSize: 15 }}>Recent GPS Races</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
              {topRaces.map((r, idx) => {
                return (
                  <button key={r.id} onClick={() => selectRace(r)} className="card"
                    style={{ padding: 0, textAlign: 'left', cursor: 'pointer', background: '#141A10', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                      <img src={RACE_PHOTOS[idx % RACE_PHOTOS.length]} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(0.4) saturate(0.5)' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(20,26,16,0.95) 100%)' }} />
                      <div style={{ position: 'absolute', bottom: 18, left: 20, right: 20 }}>
                        <div style={{ fontSize: 21, fontWeight: 600, color: '#D6D1CC', marginBottom: 6 }}>
                          {r.trackName || TRACK_NAMES[r.track] || r.track} R{r.raceNum}
                        </div>
                        <div style={{ fontSize: 16, color: '#8A847E' }}>
                          {r.date} · {r.distance} {r.surface} · {r.horseCount || r.horses?.length} horses
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {r.winnerName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Trophy style={{ width: 15, height: 15, color: '#C59757' }} />
                          <span style={{ fontSize: 18, color: '#C59757' }}>{r.winnerName}</span>
                        </div>
                      )}
                      <span style={{ fontSize: 15, color: '#5A5550' }}>
                        {r.type} · ${r.purse?.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
