import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { paceProjection, upcomingRaces } from '../data/raceData';

const COLORS = { 'Floge': '#52B788', 'Luna Moth': '#E8B86D', 'Foxy Cara': '#9B72CF', 'Hauntress': '#5B8DEF', 'Troubled Luck': '#C2653A' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => a.value - b.value);
  return (
    <div style={{ background: '#141A10', border: '1px solid rgba(197,151,87,0.15)', borderRadius: 3, padding: 12, minWidth: 130 }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#C59757', marginBottom: 8 }}>{label}</div>
      {sorted.map(e => (
        <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 11, padding: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.color }} />
            <span style={{ color: '#8A847E' }}>{e.name}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: '#D6D1CC' }}>P{e.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function PaceProjection() {
  const race = upcomingRaces[0];
  return (
    <div className="card-flat" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(197,151,87,0.06)' }}>
        <div className="label" style={{ color: '#C59757', marginBottom: 8 }}>AI Projection</div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: '#D6D1CC' }}>
          Pace Scenario: {race.trackName} R{race.raceNumber}
        </h3>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#8A847E', marginTop: 4 }}>
          {race.date} · {race.distance} {race.surface} · {race.purse}
        </p>
      </div>

      <div style={{ padding: '12px 28px 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {race.horses.map(h => (
          <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS[h.name] }} />
            <span style={{ color: '#D6D1CC' }}>{h.name}</span>
            <span style={{ fontSize: 10, color: '#8A847E' }}>{h.style}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={paceProjection} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="rgba(197,151,87,0.03)" strokeDasharray="3 3" />
            <XAxis dataKey="section" tick={{ fontSize: 10, fill: '#8A847E', fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'rgba(197,151,87,0.06)' }} tickLine={false} />
            <YAxis reversed domain={[1, 5]} tick={{ fontSize: 10, fill: '#8A847E', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} tickFormatter={v => `P${v}`} />
            <Tooltip content={<CustomTooltip />} />
            {race.horses.map(h => (
              <Line key={h.name} type="monotone" dataKey={h.name} stroke={COLORS[h.name]} strokeWidth={1.5}
                dot={{ r: 3, fill: COLORS[h.name], stroke: '#0D110A', strokeWidth: 2 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ padding: '0 28px 24px' }}>
        <div style={{ borderLeft: '3px solid #C59757', paddingLeft: 16 }}>
          <p style={{ fontSize: 15, color: '#8A847E', lineHeight: 1.7 }}>
            Floge sets the pace. Luna Moth stalks and strikes in the stretch. <span style={{ color: '#C59757' }}>Value pick: Foxy Cara (4/1)</span>. The pace setup strongly favors closers.
          </p>
        </div>
      </div>
    </div>
  );
}
