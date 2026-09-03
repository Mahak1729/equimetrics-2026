import { motion } from 'framer-motion';

const rows = [
  { metric: 'Position Tracking', trad: '5 checkpoints', gps: '13+ gates per 1/16 mile' },
  { metric: 'Speed Data', trad: 'Leader only', gps: 'Every horse, every section' },
  { metric: 'Distance Traveled', trad: 'Not measured', gps: 'Actual meters per horse' },
  { metric: 'Stride Analysis', trad: 'Not available', gps: 'Count + length per section' },
  { metric: 'Ground Loss', trad: 'Not measurable', gps: 'Rail vs. actual path' },
  { metric: 'Timing Precision', trad: 'Binoculars + notepad', gps: '10Hz RTK GPS' },
];

export default function ComparisonTable() {
  return (
    <div className="card-flat" style={{ overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(197,151,87,0.08)' }}>
            <th className="label" style={{ textAlign: 'left', padding: '16px 28px', width: '34%' }}>Metric</th>
            <th className="label" style={{ textAlign: 'left', padding: '16px 28px', width: '33%' }}>Traditional</th>
            <th className="label" style={{ textAlign: 'left', padding: '16px 28px', width: '33%', color: '#C59757' }}>GPS Enhanced</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr key={row.metric}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(197,151,87,0.04)' : 'none' }}>
              <td style={{ padding: '14px 28px', fontSize: 14, fontWeight: 500, color: '#D6D1CC' }}>{row.metric}</td>
              <td style={{ padding: '14px 28px', fontSize: 15, color: '#8A847E' }}>{row.trad}</td>
              <td style={{ padding: '14px 28px', fontSize: 14, color: '#C59757' }}>{row.gps}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
