import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJSON } from '../hooks/useJSON';
import { SkeletonList, Skeleton, LoadError } from '../components/Loading';
import RaceReplay from '../components/RaceReplay';
import { getPortrait } from '../data/portraits';

const TRACK_NAMES = {
  AQU: 'Aqueduct', GP: 'Gulfstream Park', HOU: 'Sam Houston', LRL: 'Laurel Park',
  OP: 'Oaklawn Park', SA: 'Santa Anita', TAM: 'Tampa Bay', TP: 'Turfway Park',
  FG: 'Fair Grounds', CNL: 'Colonial Downs',
};

const COLORS = ['#C59757','#52B788','#5B8DEF','#E8B86D','#9B72CF','#C2653A','#4ECDC4','#EF5B5B','#D4A574','#74C69D','#8B4226','#5BEF8D'];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function RaceNight() {
  const { data: replayRaces, loading, error, retry } = useJSON('/data/replays.json', []);

  const dates = useMemo(() => [...new Set(replayRaces.map(r => r.date))].sort().reverse(), [replayRaces]);
  const [selDate, setSelDate] = useState(null);
  const [selTrack, setSelTrack] = useState(null);
  const [selRace, setSelRace] = useState(null);

  // Default to the first day until the reader picks one, derived rather than
  // stored so there is no extra render when the data lands.
  const activeDate = selDate ?? dates[0] ?? null;

  const dayRaces = useMemo(() => replayRaces.filter(r => r.date === activeDate), [replayRaces, activeDate]);
  const tracks = useMemo(() => [...new Set(dayRaces.map(r => r.track))].sort(), [dayRaces]);
  const activeTrack = selTrack && tracks.includes(selTrack) ? selTrack : tracks[0];
  const trackRaces = useMemo(() => dayRaces.filter(r => r.track === activeTrack).sort((a, b) => a.raceNumber - b.raceNumber), [dayRaces, activeTrack]);
  const activeRace = selRace ? replayRaces.find(r => r.id === selRace) : trackRaces[0];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px clamp(18px, 4vw, 40px) 80px' }}>
      <motion.div {...fadeUp}>
        <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 18 }}>Replay</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 54px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 14 }}>Live Replay</h1>
        <p style={{ fontSize: 19, color: '#8A847E', marginBottom: 14 }}>
          Choose a race and watch it unfold gate by gate with GPS tracking.
        </p>
        <div style={{ marginBottom: 48, minHeight: 26 }}>
          {loading ? (
            <Skeleton height={20} width={280} />
          ) : (
            <p style={{ fontSize: 18, color: '#8A847E' }}>
              {replayRaces.length} races · {new Set(replayRaces.map(r => r.track)).size} tracks · {dates.length} race days
            </p>
          )}
        </div>
      </motion.div>

      {error ? (
        <LoadError message="Could not load the replay data." onRetry={retry} />
      ) : loading ? (
        <div>
          <Skeleton height={18} width={110} style={{ marginBottom: 14 }} />
          <SkeletonList rows={4} height={92} />
        </div>
      ) : (
        <>
      {/* Date selector */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} style={{ marginBottom: 28 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Race Day</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {dates.map(d => {
            const dayName = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const active = d === activeDate;
            return (
              <button key={d} onClick={() => { setSelDate(d); setSelTrack(null); setSelRace(null); }}
                style={{ padding: '14px 24px', borderRadius: 4, cursor: 'pointer', transition: 'all 250ms',
                  background: active ? '#141A10' : 'transparent',
                  border: active ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                  color: active ? '#C59757' : '#8A847E', fontSize: 18, fontWeight: 500 }}>
                {dayName}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Track selector */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} style={{ marginBottom: 28 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Track</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {tracks.map(t => {
            const active = t === activeTrack;
            return (
              <button key={t} onClick={() => { setSelTrack(t); setSelRace(null); }}
                style={{ padding: '14px 24px', borderRadius: 4, cursor: 'pointer', transition: 'all 250ms',
                  background: active ? '#141A10' : 'transparent',
                  border: active ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                  color: active ? '#D6D1CC' : '#8A847E', fontSize: 18, fontWeight: 500 }}>
                {TRACK_NAMES[t] || t}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Race number selector */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} style={{ marginBottom: 44 }}>
        <div className="label" style={{ marginBottom: 14, fontSize: 15 }}>Race</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {trackRaces.map(r => {
            const active = activeRace?.id === r.id;
            return (
              <button key={r.id} onClick={() => setSelRace(r.id)}
                style={{ width: 72, height: 72, borderRadius: 4, cursor: 'pointer', transition: 'all 250ms',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: active ? '#141A10' : 'transparent',
                  border: active ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: active ? '#C59757' : '#8A847E' }}>{r.raceNumber}</div>
                <div style={{ fontSize: 12, color: '#8A847E', marginTop: 2 }}>{r.fieldSize}h</div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Replay */}
      {activeRace && (
        <AnimatePresence mode="wait">
          <motion.div key={activeRace.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <RaceReplay race={activeRace} />

            {/* Results table */}
            <div className="card-flat" style={{ overflow: 'hidden', marginTop: 32 }}>
              <div style={{ padding: '22px 32px', borderBottom: '1px solid rgba(197,151,87,0.06)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: '#D6D1CC' }}>Final Results</h3>
              </div>
              {[...activeRace.horses].sort((a, b) => (a.finalPos || 99) - (b.finalPos || 99)).map((horse, i) => {
                const color = COLORS[activeRace.horses.indexOf(horse) % COLORS.length];
                return (
                  <div key={horse.name} style={{
                    display: 'grid', gridTemplateColumns: '52px 52px 1fr 110px 110px',
                    alignItems: 'center', padding: '18px 32px', gap: 16,
                    borderBottom: i < activeRace.horses.length - 1 ? '1px solid rgba(197,151,87,0.03)' : 'none',
                  }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: i === 0 ? '#C59757' : '#8A847E' }}>
                      {horse.finalPos || '–'}
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 5, overflow: 'hidden', border: `1px solid ${color}40` }}>
                      <img src={getPortrait(horse.name)} loading="lazy" decoding="async" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: '#D6D1CC' }}>{horse.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#8A847E' }}>Post {horse.post}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#8A847E' }}>{horse.odds}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
        </>
      )}
    </div>
  );
}
