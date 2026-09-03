import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonCards, Skeleton, LoadError } from '../components/Loading';
import { useJSON } from '../hooks/useJSON';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getPortrait } from '../data/portraits';
import JourneyMap from '../components/JourneyMap';

const SC = { 'Front Runner': '#52B788', Stalker: '#E8B86D', Closer: '#9B72CF' };

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#141A10', border: '1px solid rgba(197,151,87,0.15)', borderRadius: 3, padding: '8px 12px', fontSize: 16 }}>
      <div style={{ color: '#C59757', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: '#D6D1CC' }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

function PositionFlow({ positions, color, height = 48 }) {
  if (!positions?.length) return null;
  const data = positions.map((v, i) => ({ gate: i === 0 ? 'S' : i === positions.length - 1 ? 'F' : `${i}`, pos: v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <YAxis reversed domain={[1, Math.max(...positions, 6)]} tick={{ fontSize: 11, fill: '#8A847E' }} axisLine={false} tickLine={false} />
        <Line type="monotone" dataKey="pos" stroke={color} strokeWidth={2} dot={{ r: 2, fill: color, stroke: '#0D110A', strokeWidth: 1.5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RaceRow({ race, color, isExpanded, onToggle }) {
  const posColor = race.position ? (race.position <= 3 ? '#C59757' : '#8A847E') : '#8A847E';
  return (
    <div style={{ borderBottom: '1px solid rgba(197,151,87,0.04)' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'grid', gridTemplateColumns: '1fr 80px 120px 120px 44px',
        alignItems: 'center', padding: '18px 32px', gap: 16, background: 'transparent', border: 'none',
        cursor: 'pointer', textAlign: 'left', transition: 'background 200ms',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,151,87,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20, fontWeight: 500, color: '#D6D1CC' }}>{race.track} R{race.raceNum}</span>
            <span style={{ fontSize: 17, color: '#8A847E' }}>{race.distance} {race.surface}</span>
            {race.hasGPS ? (
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 3, color: '#52B788', background: 'rgba(82,183,136,0.1)' }}>GPS</span>
            ) : (
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 3, color: '#8A847E', background: 'rgba(138,132,126,0.08)' }}>Trad</span>
            )}
          </div>
          <div style={{ fontSize: 16, color: '#8A847E', marginTop: 4 }}>{race.date} · {race.raceType}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: posColor }}>
          {race.position || '–'}<span style={{ fontSize: 17, color: '#8A847E' }}>/{race.fieldSize || '?'}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, color: '#C59757' }}>
          ${race.earnings?.toLocaleString() || '0'}
        </div>
        <div>
          {race.positions?.length > 0 ? (
            <div style={{ width: 90, height: 34 }}><PositionFlow positions={race.positions} color={color} height={34} /></div>
          ) : <span style={{ fontSize: 17, color: '#8A847E' }}>–</span>}
        </div>
        <div style={{ color: '#8A847E', display: 'flex', justifyContent: 'center' }}>
          {isExpanded ? <ChevronUp style={{ width: 18, height: 18 }} /> : <ChevronDown style={{ width: 18, height: 18 }} />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 32px 26px' }}>
              {race.hasGPS && race.speeds?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, paddingTop: 20, borderTop: '1px solid rgba(197,151,87,0.04)' }}>
                  <div>
                    <div className="label" style={{ fontSize: 14, marginBottom: 12 }}>Position Flow</div>
                    <div style={{ height: 110 }}><PositionFlow positions={race.positions} color={color} height={110} /></div>
                  </div>
                  <div>
                    <div className="label" style={{ fontSize: 14, marginBottom: 12 }}>Speed (mph)</div>
                    <div style={{ height: 110 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={race.speeds.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <defs><linearGradient id="expSp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.1} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
                          <YAxis tick={{ fontSize: 13, fill: '#8A847E' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 1']} />
                          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill="url(#expSp)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <div className="label" style={{ fontSize: 14, marginBottom: 12 }}>Stride (m)</div>
                    <div style={{ height: 110 }}>
                      {race.strideLengths?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={race.strideLengths.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <YAxis tick={{ fontSize: 13, fill: '#8A847E' }} axisLine={false} tickLine={false} domain={['dataMin - 0.5', 'dataMax + 0.3']} />
                            <Bar dataKey="v" radius={[2, 2, 0, 0]}>{race.strideLengths.map((_, i) => <Cell key={i} fill={`${color}${i >= race.strideLengths.length - 2 ? '80' : '30'}`} />)}</Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <span style={{ fontSize: 17, color: '#8A847E' }}>–</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ paddingTop: 20, borderTop: '1px solid rgba(197,151,87,0.04)', fontSize: 18, color: '#8A847E' }}>
                  Traditional data only. No GPS telemetry available for this race.
                </div>
              )}
              {race.hasGPS && (
                <div style={{ display: 'flex', gap: 28, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(197,151,87,0.04)', flexWrap: 'wrap' }}>
                  {[['Peak', race.peakMPH ? `${race.peakMPH} mph` : '–'], ['Closing', race.closingMPH ? `${race.closingMPH} mph` : '–'], ['Ground Loss', race.groundLoss != null ? `+${race.groundLoss}m` : '–'], ['Purse', `$${race.purse?.toLocaleString()}`]].map(([l, v]) => (
                    <div key={l}><div style={{ fontSize: 16, color: '#8A847E', textTransform: 'uppercase', letterSpacing: '1px' }}>{l}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: '#D6D1CC', marginTop: 5 }}>{v}</div></div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Profiles() {
  const [query, setQuery] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [expandedRace, setExpandedRace] = useState(0);
  const [activeTab, setActiveTab] = useState('races');
  const [, setSelected] = useState(null);
  const [h, setH] = useState(null);

  // Fetch the static horse index once, which enables instant local search.
  const { data: horseIndex, loading, error, retry } = useJSON('/data/horse-index.json', null);

  // Everything below is derived from that one payload.
  const profileList = useMemo(
    () => (horseIndex ? Object.values(horseIndex).sort((a, b) => (b.gpsScore || 0) - (a.gpsScore || 0)) : []),
    [horseIndex],
  );
  const totalCount = profileList.length || 12919;
  const topHorsesList = useMemo(() => profileList.filter(p => p.numRaces >= 2).slice(0, 16), [profileList]);

  // Instant in-memory search (no network roundtrip). Derived, not stored:
  // results are a pure function of the query and the loaded list.
  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return profileList.filter(p => p.name.toLowerCase().includes(q)).slice(0, 15);
  }, [query, profileList]);
  const color = h?.style ? (SC[h.style] || '#C59757') : '#8A847E';
  const selectHorse = async (name) => {
    setSelected(name); setQuery(''); setShowDrop(false); setExpandedRace(0); setActiveTab('races');
    const res = await fetch(`/api/horses/${encodeURIComponent(name)}`);
    const profile = await res.json();
    setH(profile);
  };

  // Compute field-average baseline across all GPS horses (for radar comparison)
  const baseline = useMemo(() => {
    const gps = profileList.filter(p => p.hasGPS);
    if (!gps.length) return null;
    const avg = (key) => {
      const vals = gps.filter(p => p[key] != null).map(p => p[key]);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };
    const totalRaces = gps.reduce((s, p) => s + (p.numRaces || 0), 0);
    const totalWins = gps.reduce((s, p) => s + (p.wins || 0), 0);
    const totalPlaces = gps.reduce((s, p) => s + (p.places || 0), 0);
    return {
      bestPeak: avg('bestPeak'),
      avgClosing: avg('avgClosing'),
      strideFade: avg('strideFade'),
      avgGroundLoss: avg('avgGroundLoss'),
      winRate: totalWins / Math.max(1, totalRaces),
      placeRate: totalPlaces / Math.max(1, totalRaces),
    };
  }, [profileList]);

  const scoreForm = (wins, places, numRaces) => {
    if (!numRaces) return 40;
    const wr = wins / numRaces, pr = places / numRaces;
    return Math.min(100, 40 + wr * 120 + pr * 40);
  };

  const radarData = h && h.hasGPS && baseline ? [
    { t: 'Speed',      v: Math.min(100, ((h.bestPeak || 0) / 42) * 100),          baseline: Math.min(100, (baseline.bestPeak / 42) * 100) },
    { t: 'Closing',    v: Math.min(100, ((h.avgClosing || 0) / 40) * 100),        baseline: Math.min(100, (baseline.avgClosing / 40) * 100) },
    { t: 'Stamina',    v: Math.max(0, Math.min(100, 50 - (h.strideFade ?? 0) * 5)), baseline: Math.max(0, Math.min(100, 50 - baseline.strideFade * 5)) },
    { t: 'Efficiency', v: Math.max(0, 100 - (h.avgGroundLoss ?? 20) * 3),         baseline: Math.max(0, 100 - baseline.avgGroundLoss * 3) },
    { t: 'Form',       v: scoreForm(h.wins || 0, h.places || 0, h.numRaces || 0), baseline: Math.min(100, 40 + baseline.winRate * 120 + baseline.placeRate * 40) },
  ] : [];

  // For each dimension, `delta > 0` means "horse value is above the field average" in RAW terms.
  // `lowerBetter` flips the interpretation: for Ground Loss, a lower raw value is better.
  // `neutralIf` sets the threshold (in raw units) below which the metric is "average".
  // `trait` gives a plain-English interpretation (better/worse X).
  const horseWinRate = h?.numRaces ? (h.wins / h.numRaces) : 0;
  const radarDimensions = h && h.hasGPS && baseline ? [
    { label: 'Peak Speed',       value: h.bestPeak ? `${h.bestPeak.toFixed(1)} mph` : '–',      avg: `${baseline.bestPeak.toFixed(1)} mph`,       delta: (h.bestPeak || 0) - baseline.bestPeak,               neutralIf: 0.3, lowerBetter: false, trait: 'top-end speed' },
    { label: 'Closing Velocity', value: h.avgClosing ? `${h.avgClosing.toFixed(1)} mph` : '–',  avg: `${baseline.avgClosing.toFixed(1)} mph`,     delta: (h.avgClosing || 0) - baseline.avgClosing,           neutralIf: 0.3, lowerBetter: false, trait: 'late kick' },
    { label: 'Stride Fade',      value: h.strideFade != null ? `${h.strideFade.toFixed(1)}%` : '–', avg: `${baseline.strideFade.toFixed(1)}%`,    delta: (h.strideFade ?? baseline.strideFade) - baseline.strideFade, neutralIf: 0.5, lowerBetter: false, trait: 'stamina' },
    { label: 'Ground Loss',      value: h.avgGroundLoss != null ? `${h.avgGroundLoss.toFixed(1)} m` : '–', avg: `${baseline.avgGroundLoss.toFixed(1)} m`, delta: (h.avgGroundLoss ?? baseline.avgGroundLoss) - baseline.avgGroundLoss, neutralIf: 0.5, lowerBetter: true,  trait: 'path efficiency' },
    { label: 'Win Rate',         value: `${(horseWinRate * 100).toFixed(0)}% (${h.record || '–'})`, avg: `${(baseline.winRate * 100).toFixed(0)}%`, delta: horseWinRate - baseline.winRate,                      neutralIf: 0.01, lowerBetter: false, trait: 'win frequency' },
  ] : [];

  const earningsData = h?.races ? h.races.slice().reverse().map(r => ({
    label: `${r.track} ${r.date.slice(5)}`,
    earned: r.earnings || 0,
  })) : [];

  const topHorses = topHorsesList;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px clamp(18px, 4vw, 40px) 80px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 18 }}>Profiling</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 54px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 14 }}>Horse Profiles</h1>
        <p style={{ fontSize: 19, color: '#8A847E', maxWidth: 600, lineHeight: 1.7, marginBottom: 14 }}>
          Search {totalCount.toLocaleString()} horses, GPS and traditional, to see race history, earnings, and performance data.
        </p>
      </motion.div>

      {error ? (
        <LoadError message="Could not load the horse index." onRetry={retry} />
      ) : loading ? (
        <div>
          <Skeleton height={56} width="100%" radius={8} style={{ marginBottom: 32 }} />
          <Skeleton height={18} width={140} style={{ marginBottom: 18 }} />
          <SkeletonCards count={8} height={128} minWidth={240} />
        </div>
      ) : (
        <>
      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ marginBottom: 48, position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 26px', borderRadius: 4, background: '#141A10', border: '1px solid rgba(197,151,87,0.1)' }}>
          <Search style={{ width: 24, height: 24, color: '#8A847E', flexShrink: 0 }} />
          <input type="text" placeholder="Search by horse name..." value={query}
            onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
            onFocus={() => { if (query.length >= 2) setShowDrop(true); }}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 20, color: '#D6D1CC', fontFamily: 'var(--font-sans)' }} />
          {query && <button onClick={() => { setQuery(''); setShowDrop(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A847E', padding: 4 }}><X style={{ width: 20, height: 20 }} /></button>}
        </div>
        {showDrop && results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#141A10', border: '1px solid rgba(197,151,87,0.12)', borderRadius: 4, maxHeight: 480, overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
            {results.map(p => (
              <button key={p.name} onClick={() => selectHorse(p.name)}
                style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '18px 26px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(197,151,87,0.04)', cursor: 'pointer', textAlign: 'left', transition: 'background 200ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,151,87,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(197,151,87,0.1)', flexShrink: 0 }}>
                    <img src={getPortrait(p.name)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: '#D6D1CC' }}>{p.name}</div>
                    <div style={{ fontSize: 16, color: '#8A847E', marginTop: 4 }}>
                      {p.record} · {p.numRaces} races · ${p.totalEarnings?.toLocaleString()}
                      {p.hasGPS && <span style={{ color: '#52B788', marginLeft: 8 }}>GPS</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {p.style && <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 3, color: SC[p.style] || '#8A847E', background: `${(SC[p.style] || '#8A847E')}12` }}>{p.style === 'Front Runner' ? 'Speed' : p.style}</span>}
                  {p.gpsScore != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 600, color: p.gpsScore >= 85 ? '#C59757' : '#8A847E' }}>{p.gpsScore}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {h ? (
          <motion.div key={h.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            {/* Portrait banner */}
            <div className="card-flat" style={{ overflow: 'hidden', marginBottom: 28 }}>
              <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                <img src={getPortrait(h.name)} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(0.45) saturate(0.6)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,17,10,0.2) 0%, rgba(13,17,10,0.95) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 28, left: 40, right: 40, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 92, height: 92, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(197,151,87,0.3)', flexShrink: 0 }}>
                      <img src={getPortrait(h.name)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 500, color: '#D6D1CC' }}>{h.name}</h2>
                      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                        {h.style && <span style={{ fontSize: 15, padding: '5px 14px', borderRadius: 4, color: SC[h.style] || '#8A847E', background: `${(SC[h.style] || '#8A847E')}18`, backdropFilter: 'blur(4px)' }}>{h.style === 'Front Runner' ? 'Speed' : h.style}</span>}
                        <span style={{ fontSize: 15, padding: '5px 14px', borderRadius: 4, color: '#8A847E', background: 'rgba(28,36,24,0.8)' }}>{h.record}</span>
                        {h.hasGPS ? (
                          <span style={{ fontSize: 15, padding: '5px 14px', borderRadius: 4, color: '#52B788', background: 'rgba(82,183,136,0.1)' }}>GPS · {h.numGPSRaces} races</span>
                        ) : (
                          <span style={{ fontSize: 15, padding: '5px 14px', borderRadius: 4, color: '#8A847E', background: 'rgba(138,132,126,0.08)' }}>Traditional</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {h.gpsScore != null && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 600, color: '#C59757' }}>{h.gpsScore}</div>
                      <div style={{ fontSize: 15, color: '#8A847E', marginTop: 4 }}>GPS Score</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ padding: '40px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 30 }}>
                {[
                  ['Total Earnings', `$${h.totalEarnings?.toLocaleString() || '0'}`, '#C59757'],
                  ['Avg Finish', h.avgFinish || '–', '#D6D1CC'],
                  ['Avg Purse', `$${h.avgPurse?.toLocaleString() || '0'}`, '#D6D1CC'],
                  ['Avg Field', h.avgFieldSize || '–', '#D6D1CC'],
                  ['Best Speed', h.bestPeak ? `${h.bestPeak} mph` : '–', h.hasGPS ? '#D6D1CC' : '#8A847E'],
                  ['Ground Loss', h.avgGroundLoss != null ? `${h.avgGroundLoss}m` : '–', h.hasGPS ? '#D6D1CC' : '#8A847E'],
                  ['Stride Fade', h.strideFade != null ? `${h.strideFade}%` : '–', h.hasGPS ? '#D6D1CC' : '#8A847E'],
                  ['Total Starts', `${h.numRaces}`, '#D6D1CC'],
                ].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ fontSize: 16, color: '#8A847E', marginBottom: 7, letterSpacing: '1px', textTransform: 'uppercase' }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 23, fontWeight: 500, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar for GPS horses, enhanced with baseline comparison */}
            {h.hasGPS && radarData.length > 0 && (
              <div className="card-flat" style={{ padding: 28, marginBottom: 28, borderColor: 'rgba(155,114,207,0.15)' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#9B72CF', marginBottom: 8, letterSpacing: '0.5px' }}>GPS Performance Radar</div>
                  <div style={{ fontSize: 15, color: '#8A847E', lineHeight: 1.6, maxWidth: 760 }}>
                    <p style={{ margin: '0 0 4px' }}>
                      See how <span style={{ color: '#D6D1CC', fontWeight: 500 }}>{h.name}</span> stacks up against the field average.
                    </p>
                    <p style={{ margin: 0 }}>
                      Farther from center = better on every axis.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
                  {/* Radar with overlaid baseline */}
                  <div style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="82%" margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <PolarGrid stroke="rgba(155,114,207,0.1)" />
                        <PolarAngleAxis dataKey="t" tick={{ fontSize: 15, fill: '#D6D1CC', fontFamily: 'var(--font-mono)' }} />
                        {/* Field average baseline (dashed gray) */}
                        <Radar name="Field Average" dataKey="baseline" stroke="#8A847E" strokeDasharray="4 4" fill="#8A847E" fillOpacity={0.04} strokeWidth={1.5} />
                        {/* This horse */}
                        <Radar name={h.name} dataKey="v" stroke={color} fill={color} fillOpacity={0.22} strokeWidth={2.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Dimension breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {radarDimensions.map(d => {
                      const isNeutral = Math.abs(d.delta) < (d.neutralIf ?? 0.05);
                      const isBetter = d.lowerBetter ? d.delta < 0 : d.delta > 0;
                      const arrow = isNeutral ? '–' : isBetter ? '▲' : '▼';
                      const deltaColor = isNeutral ? '#8A847E' : isBetter ? '#52B788' : '#C2653A';
                      const traitLabel = isNeutral
                        ? `matches the field on ${d.trait}`
                        : `${isBetter ? 'better' : 'worse'} ${d.trait}`;
                      return (
                        <div key={d.label} style={{ padding: '9px 0', borderBottom: '1px solid rgba(197,151,87,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: '#8A847E', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500 }}>{d.label}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: deltaColor, fontWeight: 600 }}>
                              {arrow} {isNeutral ? 'avg' : isBetter ? 'above avg' : 'below avg'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
                            <span style={{ color: color, fontWeight: 600 }}>{d.value}</span>
                            <span style={{ color: '#8A847E' }}>field avg: {d.avg}</span>
                          </div>
                          <div style={{ fontSize: 14, color: deltaColor, opacity: 0.85, fontStyle: 'italic' }}>
                            {traitLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 24, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(197,151,87,0.06)', fontSize: 13, color: '#8A847E', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 18, height: 10, borderRadius: 2, background: color, opacity: 0.7 }} />
                    <span>{h.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 18, height: 2, borderTop: '2px dashed #8A847E' }} />
                    <span>Field average ({profileList.filter(p => p.hasGPS).length.toLocaleString()} GPS horses)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Journey Map */}
            {h.races?.length > 0 && (
              <JourneyMap races={h.races} horseName={h.name} />
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
              {[['races', `All Races (${h.numRaces})`], ['earnings', 'Earnings']].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} style={{
                  padding: '14px 28px', borderRadius: 4, cursor: 'pointer', fontSize: 18, fontWeight: 500, transition: 'all 250ms',
                  background: activeTab === key ? '#141A10' : 'transparent',
                  border: activeTab === key ? '1px solid rgba(197,151,87,0.15)' : '1px solid rgba(197,151,87,0.04)',
                  color: activeTab === key ? '#C59757' : '#8A847E',
                }}>{label}</button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'races' ? (
                <motion.div key="races" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="card-flat" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 120px 44px', padding: '14px 32px', borderBottom: '1px solid rgba(197,151,87,0.06)', gap: 16 }}>
                      {['Race', 'Fin', 'Earned', 'Flow', ''].map(hd => <div key={hd} className="label" style={{ fontSize: 12 }}>{hd}</div>)}
                    </div>
                    {h.races?.map((r, i) => (
                      <RaceRow key={`${r.date}-${r.raceNum}`} race={r} color={color} isExpanded={expandedRace === i} onToggle={() => setExpandedRace(expandedRace === i ? -1 : i)} />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="earnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="card-flat" style={{ padding: 44 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
                      <div>
                        <div className="label" style={{ fontSize: 14, marginBottom: 12 }}>Career Earnings</div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 54, fontWeight: 400, color: '#C59757' }}>${h.totalEarnings?.toLocaleString() || '0'}</div>
                        <div style={{ fontSize: 17, color: '#8A847E', marginTop: 6 }}>from {h.numRaces} starts</div>
                      </div>
                      <div style={{ display: 'flex', gap: 28 }}>
                        {[['Wins', h.wins, '#52B788'], ['Places', h.places, '#E8B86D'], ['Starts', h.numRaces, '#8A847E']].map(([l, v, c]) => (
                          <div key={l} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: c }}>{v}</div>
                            <div style={{ fontSize: 14, color: '#8A847E', marginTop: 4, letterSpacing: '1px', textTransform: 'uppercase' }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {earningsData.length > 1 && (
                      <div style={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={earningsData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid stroke="rgba(197,151,87,0.04)" strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8A847E' }} axisLine={{ stroke: 'rgba(197,151,87,0.06)' }} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#8A847E' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTip />} />
                            <Bar dataKey="earned" name="Earned" radius={[3, 3, 0, 0]}>
                              {earningsData.map((d, i) => <Cell key={i} fill={d.earned > 0 ? '#C59757' : '#1C2418'} fillOpacity={d.earned > 0 ? 1 : 0.3} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Browse */
          <motion.div key="browse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="label" style={{ marginBottom: 16, fontSize: 16 }}>Top-rated horses</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 16 }}>
              {topHorses.map(p => {
                const sc = SC[p.style] || '#8A847E';
                return (
                  <button key={p.name} onClick={() => selectHorse(p.name)} className="card"
                    style={{ padding: 0, textAlign: 'left', cursor: 'pointer', background: '#141A10', overflow: 'hidden' }}>
                    {/* Square portrait */}
                    <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden' }}>
                      <img src={getPortrait(p.name)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', filter: 'brightness(0.45) saturate(0.55)' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(20,26,16,0.97) 100%)' }} />
                      {p.gpsScore != null && (
                        <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 600, color: p.gpsScore >= 85 ? '#C59757' : '#8A847E', background: 'rgba(13,17,10,0.7)', padding: '6px 14px', borderRadius: 3, backdropFilter: 'blur(4px)' }}>
                          {p.gpsScore}
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 18px 16px' }}>
                        <div style={{ fontSize: 22, fontWeight: 600, color: '#D6D1CC', marginBottom: 10, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{p.name}</div>
                        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 7 }}>
                          {p.style && <span style={{ fontSize: 12, padding: '4px 9px', borderRadius: 3, color: sc, background: `${sc}15`, backdropFilter: 'blur(4px)' }}>{p.style === 'Front Runner' ? 'Speed' : p.style}</span>}
                          <span style={{ fontSize: 15, color: '#8A847E' }}>{p.record}</span>
                          <span style={{ fontSize: 15, color: '#C59757' }}>${p.totalEarnings?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 13, fontSize: 14, color: '#8A847E' }}>
                          <span>{p.numRaces} races</span>
                          {p.hasGPS && <span style={{ color: '#52B788' }}>{p.numGPSRaces} GPS</span>}
                          <span>Avg fin: {p.avgFinish || '–'}</span>
                        </div>
                      </div>
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
