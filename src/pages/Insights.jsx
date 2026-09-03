import { motion } from 'framer-motion';
import ComparisonTable from '../components/ComparisonTable';
import { comparisonData } from '../data/raceData';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Insights() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 40px 80px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 18 }}>The Advantage</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 54px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 56 }}>GPS Edge</h1>
      </motion.div>

      {/* Side-by-side comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 80 }}>
        {/* Traditional */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <div className="card-flat" style={{ padding: 44, height: '100%' }}>
            <div className="label" style={{ marginBottom: 24, fontSize: 14 }}>Traditional</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 72, fontWeight: 400, color: '#5A5550', marginBottom: 10 }}>
              {comparisonData.traditional.dataPoints}
            </div>
            <p style={{ fontSize: 19, color: '#8A847E', marginBottom: 28 }}>{comparisonData.traditional.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {comparisonData.traditional.metrics.map(m => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: '#5A5550' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5A5550' }} />{m}
                </div>
              ))}
            </div>
            <div style={{ padding: 20, borderRadius: 4, background: '#1C2418' }}>
              <p style={{ fontSize: 17, color: '#5A5550', fontStyle: 'italic', lineHeight: 1.6 }}>"{comparisonData.traditional.example}"</p>
            </div>
            <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#5A5550', marginTop: 16 }}>{comparisonData.traditional.precision}</p>
          </div>
        </motion.div>

        {/* GPS */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <div className="card-flat" style={{ padding: 44, height: '100%', borderColor: 'rgba(197,151,87,0.12)' }}>
            <div className="label" style={{ color: '#C59757', marginBottom: 24, fontSize: 14 }}>GPS Enhanced</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 72, fontWeight: 400, color: '#C59757', marginBottom: 10 }}>
              {comparisonData.gps.dataPoints}+
            </div>
            <p style={{ fontSize: 19, color: '#8A847E', marginBottom: 28 }}>{comparisonData.gps.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {comparisonData.gps.metrics.map(m => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: '#C59757', opacity: 0.8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C59757' }} />{m}
                </div>
              ))}
            </div>
            <div style={{ padding: 20, borderRadius: 4, background: 'rgba(197,151,87,0.06)' }}>
              <p style={{ fontSize: 17, color: '#8A847E', fontStyle: 'italic', lineHeight: 1.6 }}>"{comparisonData.gps.example}"</p>
            </div>
            <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#C59757', opacity: 0.5, marginTop: 16 }}>{comparisonData.gps.precision}</p>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }} style={{ marginBottom: 80 }}>
        <ComparisonTable />
      </motion.div>

      {/* Capabilities */}
      <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
        <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 16 }}>Capabilities</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 48 }}>
          What GPS unlocks
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {[
            { title: 'Ground Loss Detection', desc: 'Measure exact extra distance traveled by horses running wide. Reveals hidden talent that traditional data completely misses.' },
            { title: 'True Sectional Speed', desc: 'Exact speed for every horse at every gate, not just the leader. Complete velocity profiles for smarter comparisons.' },
            { title: 'Stride Biomechanics', desc: 'Stride count and length at every section. Detect fatigue onset, stamina ceilings, and fitness changes across races.' },
            { title: 'Running Style DNA', desc: 'Classify horses beyond simple labels. GPS reveals acceleration curves, energy distribution, and tactical patterns.' },
            { title: 'Closing Velocity', desc: 'How fast at the finish. A direct measure of remaining energy that predicts next-race improvement.' },
            { title: 'Hidden Trouble Flags', desc: 'Detect mid-race interference through anomalous sectional times. Project what the finish would have been.' },
          ].map((c, i) => (
            <motion.div key={c.title} {...fadeUp} transition={{ delay: i * 0.06 }}>
              <div className="card" style={{ padding: 36 }}>
                <div className="gold-line" style={{ marginBottom: 20 }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC', marginBottom: 14 }}>{c.title}</h3>
                <p style={{ fontSize: 18, color: '#8A847E', lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Extensibility */}
      <motion.div {...fadeUp} style={{ marginTop: 80 }}>
        <div className="card-flat" style={{ padding: 48, borderColor: 'rgba(197,151,87,0.1)' }}>
          <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 14 }}>Extensibility</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 500, color: '#D6D1CC', marginBottom: 20 }}>
            Non-GPS tracks
          </h3>
          <p style={{ fontSize: 18, color: '#8A847E', lineHeight: 1.8, marginBottom: 40 }}>
            Only 32 of 117 tracks currently have GPS. Equimetrics is designed to work everywhere.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 }}>
            {[
              { value: '32', label: 'GPS Tracks', sub: 'Full telemetry' },
              { value: '85%', label: 'Calibration', sub: 'Prediction from traditional data' },
              { value: '117', label: 'All Tracks', sub: 'Supported with lower confidence' },
            ].map(s => (
              <div key={s.label} style={{ padding: 28, borderRadius: 4, background: '#1C2418' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 400, color: '#C59757', marginBottom: 12 }}>{s.value}</div>
                <div style={{ fontSize: 19, fontWeight: 500, color: '#D6D1CC' }}>{s.label}</div>
                <div style={{ fontSize: 15, color: '#5A5550', marginTop: 6 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 18, color: '#8A847E', marginTop: 32, lineHeight: 1.7 }}>
            By training on races with both GPS and traditional data, we build a translation model that generates synthetic GPS-like metrics. This quantifies the business case for GPS expansion.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
