import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styleColors, scenarioColors } from '../data/forecastConstants';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useJSON } from '../hooks/useJSON';
import { SkeletonList, SkeletonCards, Skeleton, LoadError } from '../components/Loading';
import { getPortrait } from '../data/portraits';

// Track full names
const TRACK_NAMES = {
  AQU: 'Aqueduct', GP: 'Gulfstream Park', 'GP ': 'Gulfstream Park', HOU: 'Sam Houston',
  LRL: 'Laurel Park', 'OP ': 'Oaklawn Park', OP: 'Oaklawn Park', SA: 'Santa Anita',
  'SA ': 'Santa Anita', TAM: 'Tampa Bay Downs', TP: 'Turfway Park', 'TP ': 'Turfway Park',
  CT: 'Charles Town', 'CT ': 'Charles Town', PEN: 'Penn National', PRX: 'Parx',
  MVR: 'Mahoning Valley', FON: 'Fonner Park', TUP: 'Turf Paradise', SUN: 'Sunland Park',
  CMR: 'Camarero', WRD: 'Will Rogers', CAM: 'Camarero', CHE: 'Cherokee',
};

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

// Find the matching deep-analysis race from forecastData
function findFeaturedRace(track, raceNumber, date, forecastRaces) {
  return (forecastRaces || []).find(r =>
    r.track === track.trim() && r.raceNumber === raceNumber && r.date === date
  );
}

function MiniSparkline({ data, color, width = 72, height = 24 }) {
  if (!data?.length) return null;
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 1, right: 0, left: 0, bottom: 1 }}>
          <defs>
            <linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1}
            fill={`url(#sp-${color.replace('#', '')})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Preview() {
  const races = useJSON('/data/races.json', []);
  const forecast = useJSON('/data/forecast.json', []);
  const allRacesRaw = races.data;
  const forecastRaces = forecast.data;
  const loading = races.loading || forecast.loading;
  const error = races.error || forecast.error;
  const retry = () => { races.retry(); forecast.retry(); };

  // Get unique dates and tracks
  const dates = useMemo(() => [...new Set(allRacesRaw.map(r => r.date))].sort(), [allRacesRaw]);
  const [selDate, setSelDate] = useState(null);
  const [selTrack, setSelTrack] = useState(null);
  const [selRaceNum, setSelRaceNum] = useState(null);

  // Default to the third race day (the first with a full card) until the
  // reader picks one. Derived rather than stored, so no extra render pass.
  const activeDate = selDate ?? dates[2] ?? dates[0] ?? null;

  // Filter races for selected date
  const dayRaces = useMemo(() => allRacesRaw.filter(r => r.date === activeDate), [allRacesRaw, activeDate]);
  const tracks = useMemo(() => {
    const t = [...new Set(dayRaces.map(r => r.track))].sort((a, b) => {
      // Sort GPS-heavy tracks first
      const aGps = dayRaces.filter(r => r.track === a).reduce((s, r) => s + r.gpsPct, 0);
      const bGps = dayRaces.filter(r => r.track === b).reduce((s, r) => s + r.gpsPct, 0);
      return bGps - aGps;
    });
    return t;
  }, [dayRaces]);

  // Auto-select first track when date changes
  const activeTrack = selTrack && tracks.includes(selTrack) ? selTrack : tracks[0];
  const trackRaces = useMemo(() => dayRaces.filter(r => r.track === activeTrack).sort((a, b) => a.raceNumber - b.raceNumber), [dayRaces, activeTrack]);
  const activeRaceNum = selRaceNum && trackRaces.some(r => r.raceNumber === selRaceNum) ? selRaceNum : trackRaces[0]?.raceNumber;
  const activeRace = trackRaces.find(r => r.raceNumber === activeRaceNum);

  // Check if this race has a featured deep analysis
  const featured = activeRace ? findFeaturedRace(activeRace.track, activeRace.raceNumber, activeRace.date, forecastRaces) : null;

  const trackName = TRACK_NAMES[activeTrack] || TRACK_NAMES[activeTrack?.trim()] || activeTrack;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px clamp(18px, 4vw, 40px) 80px' }}>

      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 18 }}>Upcoming Races</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 54px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 14 }}>
          Forecast
        </h1>
        <p style={{ fontSize: 19, color: '#8A847E', maxWidth: 720, lineHeight: 1.7, marginBottom: 20 }}>
          Pick a date, track, and race to see every horse in the field with GPS insights the odds don't reflect.
        </p>
        <div className="card-flat" style={{ padding: '20px 24px', marginBottom: 24, borderColor: 'rgba(155,114,207,0.15)', maxWidth: 820 }}>
          <div style={{ fontSize: 13, color: '#9B72CF', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Forecast methodology</div>
          <p style={{ fontSize: 16, color: '#8A847E', lineHeight: 1.7, margin: 0, textAlign: 'justify' }}>
            Forecasts combine each horse's GPS career history with the full field's profiles and the race's specific conditions. We model how the entrants' running styles will shape the pace, accounting for distance, surface, jockey and trainer history, and how each horse's strengths translate to that exact setup. Picks are horses whose modeled probability of winning is higher than what the morning-line odds imply.
          </p>
        </div>
        <p style={{ fontSize: 17, color: '#8A847E', marginBottom: 56 }}>
          {allRacesRaw.length} races · {dates.length} race days · {new Set(allRacesRaw.map(r => r.track)).size} tracks
        </p>
      </motion.div>

      {error ? (
        <LoadError message="Could not load the race card." onRetry={retry} />
      ) : loading ? (
        <div>
          <Skeleton height={18} width={110} style={{ marginBottom: 14 }} />
          <Skeleton height={52} width="100%" style={{ marginBottom: 28 }} />
          <SkeletonList rows={4} height={96} />
        </div>
      ) : (
        <>
      {/* ── DATE SELECTOR ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} style={{ marginBottom: 32 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Race Day</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {dates.map(d => {
            const dayName = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const count = allRacesRaw.filter(r => r.date === d).length;
            const isActive = d === activeDate;
            return (
              <button key={d} onClick={() => { setSelDate(d); setSelTrack(null); setSelRaceNum(null); }}
                style={{
                  padding: '14px 22px', borderRadius: 4, cursor: 'pointer', transition: 'all 250ms',
                  background: isActive ? '#141A10' : 'transparent',
                  border: isActive ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                  color: isActive ? '#C59757' : '#8A847E',
                }}>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{dayName}</div>
                <div style={{ fontSize: 14, color: '#8A847E', marginTop: 4 }}>{count} races</div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── TRACK SELECTOR ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} style={{ marginBottom: 32 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Track</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {tracks.map(t => {
            const tRaces = dayRaces.filter(r => r.track === t);
            const tAvgGps = Math.round(tRaces.reduce((s, r) => s + r.gpsPct, 0) / tRaces.length);
            const isActive = t === activeTrack;
            const name = TRACK_NAMES[t] || TRACK_NAMES[t?.trim()] || t;
            return (
              <button key={t} onClick={() => { setSelTrack(t); setSelRaceNum(null); }}
                style={{
                  padding: '14px 22px', borderRadius: 4, cursor: 'pointer', transition: 'all 250ms',
                  background: isActive ? '#141A10' : 'transparent',
                  border: isActive ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                  color: isActive ? '#D6D1CC' : '#8A847E',
                }}>
                <div style={{ fontSize: 18, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {name}
                  {tAvgGps >= 70 && (
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: 'rgba(82,183,136,0.1)', color: '#52B788' }}>
                      GPS
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: '#8A847E', marginTop: 4 }}>{tRaces.length} races · {tAvgGps}% GPS</div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── RACE NUMBER SELECTOR ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} style={{ marginBottom: 48 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Race</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {trackRaces.map(r => {
            const isActive = r.raceNumber === activeRaceNum;
            return (
              <button key={r.raceNumber} onClick={() => setSelRaceNum(r.raceNumber)}
                style={{
                  width: 68, height: 68, borderRadius: 4, cursor: 'pointer', transition: 'all 250ms',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? '#141A10' : 'transparent',
                  border: isActive ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: isActive ? '#C59757' : '#8A847E' }}>
                  {r.raceNumber}
                </div>
                <div style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2,
                  color: r.gpsPct >= 80 ? '#52B788' : r.gpsPct >= 40 ? '#E8B86D' : '#8A847E',
                }}>
                  {r.gpsPct}%
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── SELECTED RACE ── */}
      {activeRace && (
        <AnimatePresence mode="wait">
          <motion.div key={`${activeRace.date}-${activeRace.track}-${activeRace.raceNumber}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>

            {/* Race header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36, gap: 14 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 500, color: '#D6D1CC' }}>
                {trackName} Race {activeRace.raceNumber}
              </h2>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 17, fontFamily: 'var(--font-mono)', color: '#8A847E' }}>
                  {activeRace.fieldSize} horses
                </span>
                <span style={{
                  fontSize: 15, fontFamily: 'var(--font-mono)', padding: '5px 12px', borderRadius: 4,
                  background: activeRace.gpsPct >= 80 ? 'rgba(82,183,136,0.1)' : activeRace.gpsPct >= 40 ? 'rgba(232,184,109,0.1)' : 'rgba(90,85,80,0.1)',
                  color: activeRace.gpsPct >= 80 ? '#52B788' : activeRace.gpsPct >= 40 ? '#E8B86D' : '#8A847E',
                }}>
                  {activeRace.gpsPct}% GPS Coverage
                </span>
              </div>
            </div>

            {/* ── FEATURED RACE: PACE + PICKS ── */}
            {featured && (
              <>
                {/* Pace scenario */}
                <div className="card-flat" style={{ padding: 36, marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div className="label" style={{ color: scenarioColors[featured.paceAnalysis.scenario], marginBottom: 10, fontSize: 13 }}>Pace Scenario</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC' }}>{featured.paceAnalysis.label}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 20 }}>
                      {[['Speed', featured.paceAnalysis.frontRunners, styleColors['Front Runner']], ['Stalk', featured.paceAnalysis.stalkers, styleColors['Stalker']], ['Close', featured.paceAnalysis.closers, styleColors['Closer']]].map(([l, c, col]) => (
                        <div key={l} style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: col }}>{c}</div>
                          <div style={{ fontSize: 13, color: '#8A847E', marginTop: 2 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                    {[['Front Runner', featured.paceAnalysis.frontRunners], ['Stalker', featured.paceAnalysis.stalkers], ['Closer', featured.paceAnalysis.closers]].map(([style, count]) => (
                      <div key={style} style={{ flex: count, background: styleColors[style], transition: 'flex 500ms ease' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 18, color: '#8A847E', lineHeight: 1.7 }}>{featured.paceAnalysis.detail}</p>
                </div>

                {/* GPS Edge picks */}
                <div style={{ marginBottom: 40 }}>
                  <div className="label" style={{ color: '#C59757', marginBottom: 18, fontSize: 14 }}>GPS Edge Picks</div>
                  {featured.gpsEdgePicks.map((pick) => (
                    <div key={pick.name} style={{ borderLeft: '4px solid #C59757', paddingLeft: 26, marginBottom: 30 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: '#C59757' }}>{pick.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#8A847E' }}>{pick.odds}</span>
                      </div>
                      <div style={{ fontSize: 19, fontWeight: 500, color: '#D6D1CC', marginBottom: 8 }}>{pick.headline}</div>
                      <p style={{ fontSize: 17, color: '#8A847E', lineHeight: 1.7 }}>{pick.analysis}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── RACE CARD ── */}
            <div className="card-flat" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '22px 32px', borderBottom: '1px solid rgba(197,151,87,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: '#D6D1CC' }}>
                  Race Card
                </h3>
                {!featured && activeRace.gpsPct < 50 && (
                  <span style={{ fontSize: 16, color: '#8A847E', fontStyle: 'italic' }}>Limited GPS data for this race</span>
                )}
              </div>

              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '52px 52px 1fr 90px 100px', padding: '12px 32px', borderBottom: '1px solid rgba(197,151,87,0.06)', gap: 14 }}>
                {['#', '', 'Horse', 'Odds', 'Data'].map(h => (
                  <div key={h} className="label" style={{ fontSize: 12 }}>{h}</div>
                ))}
              </div>

              {/* Horse rows */}
              {(featured ? [...featured.horses].sort((a, b) => a.post - b.post) : activeRace.horses.sort((a, b) => a.post - b.post)).map(horse => {
                const hasGPS = featured ? horse.hasGPS : horse.hasGPS;
                const color = featured && horse.style ? styleColors[horse.style] : '#8A847E';

                return (
                  <div key={horse.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '52px 52px 1fr 90px 100px',
                      alignItems: 'center',
                      padding: '18px 32px',
                      gap: 14,
                      borderBottom: '1px solid rgba(197,151,87,0.03)',
                      transition: 'background 250ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,151,87,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#8A847E' }}>{horse.post}</div>

                    {/* Portrait thumbnail */}
                    <div style={{ width: 44, height: 44, borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(197,151,87,0.1)' }}>
                      <img src={getPortrait(horse.name)} loading="lazy" decoding="async" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 19, fontWeight: 500, color: '#D6D1CC' }}>{horse.name}</span>
                        {featured && horse.style && (
                          <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 3, color, background: `${color}12`, border: `1px solid ${color}20` }}>
                            {horse.style === 'Front Runner' ? 'Speed' : horse.style}
                          </span>
                        )}
                        {!hasGPS && (
                          <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 3, color: '#8A847E', background: 'rgba(138,132,126,0.08)', border: '1px solid rgba(138,132,126,0.15)' }}>
                            Traditional
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 15, color: '#8A847E' }}>
                        J: {horse.jockey} · T: {horse.trainer}
                      </div>
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#8A847E' }}>{horse.odds}</div>

                    <div>
                      {featured && horse.gpsScore != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: horse.gpsScore >= 85 ? '#C59757' : horse.gpsScore >= 70 ? '#D6D1CC' : '#8A847E' }}>
                            {horse.gpsScore}
                          </span>
                          {horse.speeds?.length > 0 && <MiniSparkline data={horse.speeds} color={color} />}
                        </div>
                      ) : hasGPS ? (
                        <span style={{ fontSize: 16, color: '#52B788' }}>GPS</span>
                      ) : (
                        <span style={{ fontSize: 16, color: '#8A847E' }}>Trad.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key metrics for featured races */}
            {featured && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 32 }}>
                {[
                  { label: 'Fastest Closer', val: featured.horses.filter(h => h.closingMPH).sort((a, b) => b.closingMPH - a.closingMPH)[0], m: h => `${h.closingMPH} mph` },
                  { label: 'Best Efficiency', val: featured.horses.filter(h => h.efficiency).sort((a, b) => b.efficiency - a.efficiency)[0], m: h => `${h.efficiency}%` },
                  { label: 'Peak Speed', val: featured.horses.filter(h => h.peakMPH).sort((a, b) => b.peakMPH - a.peakMPH)[0], m: h => `${h.peakMPH} mph` },
                  { label: 'Best Stamina', val: featured.horses.filter(h => h.strideFade != null).sort((a, b) => b.strideFade - a.strideFade)[0], m: h => `${h.strideFade}%` },
                ].map(item => (
                  <div key={item.label} className="card-flat" style={{ padding: 26 }}>
                    <div className="label" style={{ marginBottom: 10, fontSize: 12 }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#C59757', marginBottom: 4 }}>{item.val?.name || '–'}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#8A847E' }}>{item.val ? item.m(item.val) : '–'}</div>
                  </div>
                ))}
              </div>
            )}


          </motion.div>
        </AnimatePresence>
      )}
        </>
      )}
    </div>
  );
}
