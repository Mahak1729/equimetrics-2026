import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { featuredRace, speedData, strideData } from '../data/raceData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#141A10', border: '1px solid rgba(197,151,87,0.15)', borderRadius: 3, padding: 12, minWidth: 150 }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#C59757', marginBottom: 8 }}>{label}</div>
      {payload.map(entry => (
        <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 11, padding: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: entry.color }} />
            <span style={{ color: '#8A847E', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#D6D1CC' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function SpeedChart({ type = 'speed' }) {
  const [activeHorses, setActiveHorses] = useState(featuredRace.horses.map(h => h.name));
  const data = type === 'speed' ? speedData : strideData;
  const toggle = name => setActiveHorses(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  return (
    <div className="card-flat" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>{type === 'speed' ? 'Velocity' : 'Biomechanics'}</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: '#D6D1CC' }}>
            {type === 'speed' ? 'Speed Traces' : 'Stride Analysis'}
          </h3>
        </div>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#8A847E' }}>
          {type === 'speed' ? 'MPH' : 'Feet'}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {featuredRace.horses.map(horse => {
          const on = activeHorses.includes(horse.name);
          return (
            <button key={horse.name} onClick={() => toggle(horse.name)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 3, fontSize: 11, cursor: 'pointer', background: 'transparent', color: on ? '#D6D1CC' : '#8A847E', border: 'none', transition: 'opacity 300ms', opacity: on ? 1 : 0.5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: on ? horse.color : '#8A847E' }} />
              {horse.name.length > 14 ? horse.name.substring(0, 14) + '…' : horse.name}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <defs>
            {featuredRace.horses.map(h => (
              <linearGradient key={h.name} id={`g-${type}-${h.name.replace(/[^a-zA-Z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={h.color} stopOpacity={0.06} />
                <stop offset="100%" stopColor={h.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(197,151,87,0.03)" strokeDasharray="3 3" />
          <XAxis dataKey="gate" tick={{ fontSize: 10, fill: '#8A847E', fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'rgba(197,151,87,0.06)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#8A847E', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} domain={type === 'speed' ? [30, 40] : [21, 25]} />
          <Tooltip content={<CustomTooltip />} />
          {featuredRace.horses.map(h => activeHorses.includes(h.name) ? (
            <Area key={h.name} type="monotone" dataKey={h.name} stroke={h.color} strokeWidth={1.5}
              fill={`url(#g-${type}-${h.name.replace(/[^a-zA-Z]/g, '')})`}
              dot={false} activeDot={{ r: 3, fill: h.color, stroke: '#0D110A', strokeWidth: 2 }} />
          ) : null)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
