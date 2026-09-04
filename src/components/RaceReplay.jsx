import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { getPortrait } from '../data/portraits';

const COLORS = ['#C59757','#52B788','#5B8DEF','#E8B86D','#9B72CF','#C2653A','#4ECDC4','#EF5B5B','#D4A574','#74C69D','#8B4226','#5BEF8D','#E07A5F','#95D5B2'];

export default function RaceReplay({ race }) {
  const [currentGate, setCurrentGate] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);

  const gateData = race.gateData;
  const totalGates = gateData.length;
  const progress = (currentGate / (totalGates - 1)) * 100;
  const currentData = gateData[currentGate];

  // Reset when the race changes. Adjusting during render is the documented
  // alternative to resetting inside an effect, and avoids a wasted pass.
  const [renderedRaceId, setRenderedRaceId] = useState(race.id);
  if (renderedRaceId !== race.id) {
    setRenderedRaceId(race.id);
    setCurrentGate(0);
    setIsPlaying(false);
  }

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentGate(prev => { if (prev >= totalGates - 1) { setIsPlaying(false); return prev; } return prev + 1; });
      }, 700 / speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, totalGates]);

  const reset = () => { setIsPlaying(false); setCurrentGate(0); };

  // Assign colors to horses
  const horses = race.horses.map((h, i) => ({ ...h, color: COLORS[i % COLORS.length] }));

  // Keep horses in their original post/entry order so users can track a single horse
  const sortedHorses = horses;

  return (
    <div className="card-flat" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '26px 36px', borderBottom: '1px solid rgba(197,151,87,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC' }}>
            {race.track} Race {race.raceNumber}
          </h3>
          <p style={{ fontSize: 15, color: '#8A847E', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
            {race.distance} {race.surface} · {race.type} · {race.purse} · {race.fieldSize} runners
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, color: '#C59757' }}>{currentData.label}</div>
          <div style={{ fontSize: 15, color: '#8A847E' }}>
            {currentGate === totalGates - 1 ? 'Final' : `Gate ${currentData.gate}`}
          </div>
        </div>
      </div>

      {/* Horses */}
      <div style={{ padding: '28px 36px' }}>
        {sortedHorses.map(horse => {
          const position = currentData.positions[horse.name] || race.fieldSize;
          const raceProgress = currentGate / Math.max(1, totalGates - 1); // 0 at start, 1 at finish
          const isFinal = currentGate === totalGates - 1;
          // Primary: distance covered (always advances forward across gates)
          const baseProgress = raceProgress * 85 + 5; // all horses span 5% to 90% across the race
          // Secondary: spread grows mid-race so rank differences are visible, collapses at finish
          const spreadCurve = isFinal ? 0 : 7 * raceProgress * (1 - raceProgress) * 4; // bell curve, peaks at ~7% mid-race
          const rankSpread = ((position - 1) / Math.max(1, race.fieldSize - 1)) * spreadCurve;
          const barWidth = Math.max(5, baseProgress - rankSpread);
          const isLeader = position === 1;

          return (
            <div key={horse.name} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
              {/* Position */}
              <div style={{ width: 32, fontFamily: 'var(--font-serif)', fontSize: 22, color: isLeader ? '#C59757' : '#8A847E', textAlign: 'center', flexShrink: 0 }}>
                {position}
              </div>

              {/* Name */}
              <div style={{ width: 180, fontSize: 17, fontWeight: 500, color: isLeader ? '#D6D1CC' : '#8A847E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {horse.name}
              </div>

              {/* Bar + portrait at the end */}
              <div style={{ flex: 1, height: 40, borderRadius: 3, background: '#1C2418', overflow: 'visible', position: 'relative' }}>
                <motion.div
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${horse.color}08, ${horse.color}25)`, borderRight: `3px solid ${horse.color}` }}
                />
                {/* Portrait at the tip */}
                <motion.div
                  animate={{ left: `calc(${barWidth}% - 20px)` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 3 }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 5, overflow: 'hidden',
                    border: `2px solid ${horse.color}`,
                    boxShadow: `0 0 10px ${horse.color}40`,
                  }}>
                    <img src={getPortrait(horse.name)} loading="lazy" decoding="async" alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ padding: '22px 36px', borderTop: '1px solid rgba(197,151,87,0.06)', display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={() => setIsPlaying(!isPlaying)} className="btn-primary" style={{ padding: '12px 16px', fontSize: 0, lineHeight: 0 }}>
          {isPlaying ? <Pause style={{ width: 18, height: 18 }} /> : <Play style={{ width: 18, height: 18, marginLeft: 1 }} />}
        </button>
        <button onClick={reset} style={{ width: 44, height: 44, borderRadius: 4, border: '1px solid rgba(197,151,87,0.06)', background: 'transparent', color: '#8A847E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RotateCcw style={{ width: 17, height: 17 }} />
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{ padding: '8px 14px', borderRadius: 3, fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 500, cursor: 'pointer', background: speed === s ? 'rgba(197,151,87,0.1)' : 'transparent', color: speed === s ? '#C59757' : '#8A847E', border: speed === s ? '1px solid rgba(197,151,87,0.15)' : '1px solid transparent' }}>
              {s}x
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <input type="range" min={0} max={totalGates - 1} value={currentGate}
            onChange={e => { setCurrentGate(parseInt(e.target.value)); setIsPlaying(false); }}
            style={{ width: '100%', height: 3, appearance: 'none', cursor: 'pointer', background: `linear-gradient(to right, #C59757 ${progress}%, #1C2418 ${progress}%)`, borderRadius: 2, accentColor: '#C59757' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 19, color: '#C59757', fontVariantNumeric: 'tabular-nums' }}>
          {currentGate + 1}/{totalGates}
        </span>
      </div>
    </div>
  );
}
