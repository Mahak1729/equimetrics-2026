import { motion } from 'framer-motion';
import { groundLossData, featuredRace } from '../data/raceData';

export default function GroundLossChart() {
  const maxLoss = Math.max(...groundLossData.map(d => d.groundLoss));
  const getColor = name => featuredRace.horses.find(h => h.name === name)?.color || '#C59757';

  return (
    <div className="card-flat" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>GPS Exclusive</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: '#D6D1CC' }}>Ground Loss</h3>
        </div>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#8A847E' }}>Meters</span>
      </div>
      <p style={{ fontSize: 15, color: '#8A847E', marginBottom: 24, lineHeight: 1.7 }}>
        Extra distance traveled vs. rail path. Horses running wider cover more ground, so a horse finishing 2nd with high ground loss may be the strongest runner.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {groundLossData.sort((a, b) => b.groundLoss - a.groundLoss).map((horse, i) => {
          const color = getColor(horse.name);
          return (
            <motion.div key={horse.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 15, color: '#D6D1CC' }}>{horse.name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#C59757' }}>+{horse.groundLoss}m</span>
              </div>
              <div style={{ height: 3, borderRadius: 1, background: '#1C2418', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${(horse.groundLoss / maxLoss) * 100}%` }} viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.07 }}
                  style={{ height: '100%', borderRadius: 1, background: color }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(197,151,87,0.06)' }}>
        <p style={{ fontSize: 15, color: '#8A847E', lineHeight: 1.7 }}>
          <span style={{ color: '#C59757' }}>Key insight:</span> Lady Chatterley ran 19m extra (3-wide on both turns) yet finished 2nd. Her effort-adjusted speed was actually fastest in the field.
        </p>
      </div>
    </div>
  );
}
