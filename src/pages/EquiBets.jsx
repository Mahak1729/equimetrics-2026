import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, TrendingUp, ChevronRight, Check, Crown, Flame, Target, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getPortrait } from '../data/portraits';
import { useJSON } from '../hooks/useJSON';
import { SkeletonList, SkeletonCards, Skeleton, LoadError } from '../components/Loading';

// ── Hay currency icon ──
const Hay = ({ size = 16, style = {} }) => (
  <img src="/hay.jpg" alt="hay" style={{ width: size, height: size, borderRadius: 3, objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

// ── Demo leaderboard data ──
const DEMO_USERS = [
  { name: 'Oussema', avatar: '🏇', haysticks: 1420, betsWon: 8, betsLost: 3, streak: 4, rank: 1 },
  { name: 'Mahak', avatar: '🎯', haysticks: 1310, betsWon: 7, betsLost: 4, streak: 2, rank: 2 },
  { name: 'Faryal', avatar: '⚡', haysticks: 1180, betsWon: 6, betsLost: 3, streak: 3, rank: 3 },
  { name: 'Kaylani', avatar: '🔥', haysticks: 1050, betsWon: 5, betsLost: 5, streak: 1, rank: 4 },
  { name: 'Sammundra', avatar: '🌟', haysticks: 940, betsWon: 4, betsLost: 6, streak: 0, rank: 5 },
  { name: 'Volker', avatar: '🎲', haysticks: 870, betsWon: 3, betsLost: 5, streak: 0, rank: 6 },
];

const GROUP = { name: 'The Thoroughbreds', members: DEMO_USERS.length, totalBets: 52, created: 'Mar 2026' };

// ── Build betting markets from real race data ──
function buildMarkets(forecastRaces) {
  const markets = [];
  (forecastRaces || []).forEach(race => {
    const topHorses = [...race.horses].sort((a, b) => (b.gpsScore || 0) - (a.gpsScore || 0));
    const topSpeed = [...race.horses].sort((a, b) => (b.peakMPH || 0) - (a.peakMPH || 0));

    // Winner market
    markets.push({
      id: `${race.id}-winner`,
      type: 'winner',
      category: 'RACE WINNER',
      title: `${race.trackName} R${race.raceNumber}: Who wins?`,
      subtitle: `${race.date} · ${race.distance} ${race.surface} · ${race.purse}`,
      icon: '🏆',
      volume: Math.floor(Math.random() * 40000 + 15000),
      isLive: race.date === '2026-03-28',
      options: topHorses.slice(0, 4).map(h => ({
        name: h.name, odds: h.odds, pct: Math.round((h.gpsScore || 50) / 1.1),
        portrait: getPortrait(h.name),
      })),
    });

    // Gate leader market (GPS-specific)
    markets.push({
      id: `${race.id}-gate`,
      type: 'gate',
      category: 'GPS GATE',
      title: `Who leads at the halfway gate?`,
      subtitle: `${race.trackName} R${race.raceNumber} · ${race.distance} ${race.surface}`,
      icon: '📍',
      volume: Math.floor(Math.random() * 20000 + 8000),
      isLive: false,
      options: topHorses.filter(h => h.style === 'Front Runner' || h.style === 'Stalker').slice(0, 3).map(h => ({
        name: h.name, odds: h.odds, pct: h.style === 'Front Runner' ? Math.round(Math.random() * 20 + 30) : Math.round(Math.random() * 15 + 15),
        portrait: getPortrait(h.name),
      })),
    });

    // Stride efficiency market
    markets.push({
      id: `${race.id}-stride`,
      type: 'stride',
      category: 'GPS INSIGHT',
      title: `Highest stride efficiency?`,
      subtitle: `${race.trackName} R${race.raceNumber} · Measured by GPS telemetry`,
      icon: '🦿',
      volume: Math.floor(Math.random() * 12000 + 5000),
      isLive: false,
      options: topHorses.filter(h => h.efficiency).slice(0, 3).map(h => ({
        name: h.name, odds: h.odds, pct: h.efficiency ? Math.round(h.efficiency * 0.9) : 50,
        portrait: getPortrait(h.name),
      })),
    });

    // Peak speed market
    markets.push({
      id: `${race.id}-speed`,
      type: 'speed',
      category: 'GPS INSIGHT',
      title: `Who hits the highest top speed?`,
      subtitle: `${race.trackName} R${race.raceNumber} · Peak MPH tracked by GPS`,
      icon: '⚡',
      volume: Math.floor(Math.random() * 18000 + 7000),
      isLive: false,
      options: topSpeed.slice(0, 3).map(h => ({
        name: h.name, odds: h.odds, pct: Math.round((h.peakMPH || 36) * 2.3),
        portrait: getPortrait(h.name),
      })),
    });
  });

  // Attendance market
  markets.push({
    id: 'attendance-tam',
    type: 'attendance',
    category: 'EVENT',
    title: `Tampa Bay Downs attendance over 8,000?`,
    subtitle: `March 28, 2026 · Saturday card`,
    icon: '🎟️',
    volume: 6200,
    isLive: false,
    options: [
      { name: 'Yes', pct: 62, portrait: null },
      { name: 'No', pct: 38, portrait: null },
    ],
  });

  return markets;
}

const CATEGORIES = ['All', 'Race Winner', 'GPS Gate', 'GPS Insight', 'Event'];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function MarketCard({ market, onBet }) {
  // Stable pseudo-count derived from the market id: a placeholder figure that
  // must not change between renders.
  const bettorCount = useMemo(() => {
    const key = String(market.id ?? market.title ?? '');
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
    return (hash % 30) + 10;
  }, [market.id, market.title]);

  const catColor = market.category === 'RACE WINNER' ? '#C59757' : market.category === 'GPS GATE' ? '#52B788' : market.category === 'GPS INSIGHT' ? '#5B8DEF' : '#E8B86D';

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid rgba(197,151,87,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '1.5px', color: catColor, textTransform: 'uppercase' }}>
              {market.category}
            </span>
            {market.isLive && (
              <span style={{ fontSize: 17, padding: '3px 10px', borderRadius: 3, background: 'rgba(239,91,91,0.12)', color: '#EF5B5B', fontWeight: 600, letterSpacing: '0.5px' }}>
                LIVE
              </span>
            )}
          </div>
          <span style={{ fontSize: 24 }}>{market.icon}</span>
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 600, color: '#D6D1CC', lineHeight: 1.4, marginBottom: 6 }}>
          {market.title}
        </h3>
        <p style={{ fontSize: 16, color: '#8A847E' }}>{market.subtitle}</p>
      </div>

      {/* Options */}
      <div style={{ padding: '12px 28px 18px' }}>
        {market.options.map((opt) => (
          <div key={opt.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(197,151,87,0.03)' }}>
            {opt.portrait && (
              <div style={{ width: 40, height: 40, borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(197,151,87,0.1)', flexShrink: 0 }}>
                <img src={opt.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#D6D1CC' }}>{opt.name}</div>
              {opt.odds && <div style={{ fontSize: 17, color: '#8A847E', fontFamily: 'var(--font-mono)' }}>{opt.odds}</div>}
            </div>

            {/* Progress bar */}
            <div style={{ width: 90, height: 5, borderRadius: 2, background: '#1C2418', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ height: '100%', width: `${Math.min(opt.pct, 100)}%`, borderRadius: 2, background: catColor, transition: 'width 400ms ease' }} />
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: opt.pct >= 70 ? '#C59757' : '#D6D1CC', minWidth: 48, textAlign: 'right' }}>
              {opt.pct}%
            </span>

            <button onClick={() => onBet(market, opt)}
              style={{
                padding: '8px 18px', borderRadius: 3, cursor: 'pointer', fontSize: 17, fontWeight: 600,
                background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.25)',
                color: '#52B788', transition: 'all 200ms', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(82,183,136,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(82,183,136,0.1)'; }}
            >
              Bet
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 28px', borderTop: '1px solid rgba(197,151,87,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, color: '#8A847E' }}>
          <Hay size={16} /> <span style={{ fontFamily: 'var(--font-mono)' }}>{market.volume.toLocaleString()}</span> vol.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 16, color: '#8A847E' }}>
          <Users style={{ width: 14, height: 14 }} /> {bettorCount} bettors
        </div>
      </div>
    </div>
  );
}

function BetModal({ market, option, onClose, onConfirm }) {
  const [amount, setAmount] = useState(50);
  const payout = Math.round(amount * (100 / option.pct));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ width: 400, background: '#141A10', border: '1px solid rgba(197,151,87,0.15)', borderRadius: 8, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{market.icon}</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: '#D6D1CC', marginBottom: 6 }}>
            Place Your Bet
          </h3>
          <p style={{ fontSize: 16, color: '#8A847E' }}>{market.title}</p>
        </div>

        <div style={{ padding: 16, borderRadius: 4, background: 'rgba(197,151,87,0.04)', border: '1px solid rgba(197,151,87,0.08)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {option.portrait && (
              <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(197,151,87,0.15)' }}>
                <img src={option.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#C59757' }}>{option.name}</div>
              <div style={{ fontSize: 17, color: '#8A847E' }}>{option.pct}% chance</div>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, color: '#8A847E', marginBottom: 10, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Wager Amount
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[25, 50, 100, 250].map(a => (
              <button key={a} onClick={() => setAmount(a)} style={{
                flex: 1, padding: '10px 0', borderRadius: 3, cursor: 'pointer', fontSize: 16, fontWeight: 600,
                fontFamily: 'var(--font-mono)', transition: 'all 200ms',
                background: amount === a ? 'rgba(197,151,87,0.12)' : 'transparent',
                border: amount === a ? '1px solid rgba(197,151,87,0.25)' : '1px solid rgba(197,151,87,0.06)',
                color: amount === a ? '#C59757' : '#8A847E',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                {a} <Hay size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Payout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 4, background: '#1C2418', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 17, color: '#8A847E', marginBottom: 4 }}>You risk</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: '#D6D1CC', display: 'flex', alignItems: 'center', gap: 6 }}>
              {amount} <Hay size={16} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 17, color: '#8A847E', marginBottom: 4 }}>Potential payout</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: '#52B788', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              +{payout} <Hay size={16} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px', borderRadius: 4, cursor: 'pointer', fontSize: 16, fontWeight: 500,
            background: 'transparent', border: '1px solid rgba(197,151,87,0.1)', color: '#8A847E',
          }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(amount)} style={{
            flex: 2, padding: '14px', borderRadius: 4, cursor: 'pointer', fontSize: 16, fontWeight: 600,
            background: 'rgba(82,183,136,0.15)', border: '1px solid rgba(82,183,136,0.3)', color: '#52B788',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 200ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(82,183,136,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(82,183,136,0.15)'; }}
          >
            <Check style={{ width: 16, height: 16 }} /> Confirm Bet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EquiBets() {
  const [activeTab, setActiveTab] = useState('markets'); // markets | leaderboard | group
  const [category, setCategory] = useState('All');
  const [betModal, setBetModal] = useState(null);
  const [toast, setToast] = useState(null);
  const { data: forecastRaces, loading, error, retry } = useJSON('/data/forecast.json', []);

  const allMarkets = useMemo(() => buildMarkets(forecastRaces), [forecastRaces]);

  const filtered = useMemo(() => {
    if (category === 'All') return allMarkets;
    const catMap = { 'Race Winner': 'RACE WINNER', 'GPS Gate': 'GPS GATE', 'GPS Insight': 'GPS INSIGHT', 'Event': 'EVENT' };
    return allMarkets.filter(m => m.category === catMap[category]);
  }, [category, allMarkets]);

  const handleBet = (market, option) => setBetModal({ market, option });

  const confirmBet = (amount) => {
    setBetModal(null);
    setToast(`Bet placed! ${amount} haysticks on ${betModal.option.name}`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px clamp(18px, 4vw, 32px) 80px' }}>

      {/* Header */}
      <motion.div {...fadeUp}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 16 }}>
          <img src="/horse.gif" alt="" style={{ width: 128, height: 128, borderRadius: 10 }} />
          <div>
            <div className="label" style={{ color: '#C59757', marginBottom: 8, fontSize: 18 }}>Prediction Markets</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5.5vw, 54px)', fontWeight: 500, color: '#D6D1CC' }}>
              Equi<span style={{ color: '#C59757' }}>Bets</span>
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 18, color: '#8A847E', maxWidth: 680, lineHeight: 1.7, marginBottom: 14 }}>
          Bet on races, GPS outcomes, and live events with haysticks. Compete with friends, climb the leaderboard, and earn tickets to real races.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: '#8A847E', marginBottom: 42 }}>
          <Hay size={20} /> <span style={{ fontFamily: 'var(--font-mono)', color: '#C59757', fontWeight: 600 }}>1,000</span> haysticks to start · Earn more by winning bets
        </div>
      </motion.div>

      {error ? (
        <LoadError message="Could not load the prediction markets." onRetry={retry} />
      ) : loading ? (
        <div>
          <Skeleton height={44} width={340} radius={6} style={{ marginBottom: 36 }} />
          <SkeletonList rows={5} height={110} />
        </div>
      ) : (
        <>
      {/* Tabs */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 36 }}>
        {[
          { key: 'markets', label: 'Markets', icon: TrendingUp },
          { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { key: 'group', label: 'My Group', icon: Users },
        ].map(tab => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 4,
              cursor: 'pointer', fontSize: 18, fontWeight: 500, transition: 'all 250ms',
              background: active ? '#141A10' : 'transparent',
              border: active ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
              color: active ? '#C59757' : '#8A847E',
            }}>
              <tab.icon style={{ width: 18, height: 18 }} /> {tab.label}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ═══ MARKETS TAB ═══ */}
        {activeTab === 'markets' && (
          <motion.div key="markets" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => {
                const active = category === c;
                return (
                  <button key={c} onClick={() => setCategory(c)} style={{
                    padding: '10px 22px', borderRadius: 4, cursor: 'pointer', fontSize: 17, fontWeight: 500,
                    transition: 'all 250ms',
                    background: active ? '#141A10' : 'transparent',
                    border: active ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
                    color: active ? '#D6D1CC' : '#8A847E',
                  }}>
                    {c}
                  </button>
                );
              })}
              <div style={{ marginLeft: 'auto', fontSize: 17, color: '#8A847E', display: 'flex', alignItems: 'center', gap: 6 }}>
                {filtered.length} market{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Market grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 20 }}>
              {filtered.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <MarketCard market={m} onBet={handleBet} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ LEADERBOARD TAB ═══ */}
        {activeTab === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

            {/* Top 3 podium */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 40, alignItems: 'flex-end' }}>
              {[DEMO_USERS[1], DEMO_USERS[0], DEMO_USERS[2]].map((u, i) => {
                const isFirst = i === 1;
                const podiumHeight = isFirst ? 180 : i === 0 ? 150 : 130;
                const podiumColor = isFirst ? '#C59757' : i === 0 ? '#8A847E' : '#A44A24';
                const rankLabel = isFirst ? '1st' : i === 0 ? '2nd' : '3rd';
                return (
                  <div key={u.name} style={{ textAlign: 'center', width: isFirst ? 160 : 130 }}>
                    <div style={{ fontSize: isFirst ? 48 : 36, marginBottom: 8 }}>{u.avatar}</div>
                    <div style={{ fontSize: isFirst ? 18 : 15, fontWeight: 600, color: '#D6D1CC', marginBottom: 4 }}>{u.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                      <Hay size={16} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: isFirst ? 20 : 16, fontWeight: 700, color: '#C59757' }}>{u.haysticks.toLocaleString()}</span>
                    </div>
                    <div style={{
                      height: podiumHeight, borderRadius: '8px 8px 0 0',
                      background: `linear-gradient(180deg, ${podiumColor}25, ${podiumColor}08)`,
                      border: `1px solid ${podiumColor}30`, borderBottom: 'none',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      {isFirst && <Crown style={{ width: 28, height: 28, color: '#C59757' }} />}
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: isFirst ? 32 : 24, fontWeight: 500, color: podiumColor }}>{rankLabel}</span>
                      <span style={{ fontSize: 17, color: '#8A847E' }}>{u.betsWon}W - {u.betsLost}L</span>
                      {u.streak > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 17, color: '#E8B86D' }}>
                          <Flame style={{ width: 12, height: 12 }} /> {u.streak} streak
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full rankings */}
            <div className="card-flat" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(197,151,87,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: '#D6D1CC' }}>Full Rankings</h3>
                <span style={{ fontSize: 16, color: '#8A847E' }}>Group: {GROUP.name}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 100px 80px 80px', padding: '10px 24px', borderBottom: '1px solid rgba(197,151,87,0.06)' }}>
                {['#', 'Player', 'Haysticks', 'Record', 'Streak', 'Change'].map(h => (
                  <div key={h} className="label" style={{ fontSize: 10 }}>{h}</div>
                ))}
              </div>

              {DEMO_USERS.map((u, i) => {
                const change = u.haysticks - 1000;
                return (
                  <div key={u.name} style={{
                    display: 'grid', gridTemplateColumns: '50px 1fr 100px 100px 80px 80px',
                    alignItems: 'center', padding: '16px 24px',
                    borderBottom: i < DEMO_USERS.length - 1 ? '1px solid rgba(197,151,87,0.03)' : 'none',
                    background: i === 0 ? 'rgba(197,151,87,0.03)' : 'transparent',
                  }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: i < 3 ? '#C59757' : '#8A847E' }}>
                      {i + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{u.avatar}</span>
                      <span style={{ fontSize: 17, fontWeight: i === 0 ? 600 : 500, color: '#D6D1CC' }}>{u.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Hay size={14} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, color: '#C59757' }}>{u.haysticks.toLocaleString()}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#8A847E' }}>
                      {u.betsWon}W - {u.betsLost}L
                    </div>
                    <div>
                      {u.streak > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 17, color: '#E8B86D' }}>
                          <Flame style={{ width: 14, height: 14 }} /> {u.streak}
                        </div>
                      ) : <span style={{ fontSize: 17, color: '#8A847E' }}>–</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 17, fontFamily: 'var(--font-mono)' }}>
                      {change > 0 ? (
                        <><ArrowUpRight style={{ width: 14, height: 14, color: '#52B788' }} /><span style={{ color: '#52B788' }}>+{change}</span></>
                      ) : (
                        <><ArrowDownRight style={{ width: 14, height: 14, color: '#C2653A' }} /><span style={{ color: '#C2653A' }}>{change}</span></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rewards info */}
            <div className="card-flat" style={{ padding: 28, marginTop: 24, borderColor: 'rgba(197,151,87,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img src="/horse.gif" alt="" style={{ width: 100, height: 100, borderRadius: 10, flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: '#D6D1CC', marginBottom: 6 }}>
                    Redeem Haysticks for Real Tickets
                  </h3>
                  <p style={{ fontSize: 16, color: '#8A847E', lineHeight: 1.7 }}>
                    Top performers can convert haysticks into tickets for live horse racing events at tracks near you.
                    5,000 <Hay size={13} style={{ margin: '0 2px' }} /> = 1 general admission ticket.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ GROUP TAB ═══ */}
        {activeTab === 'group' && (
          <motion.div key="group" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            {/* Group card */}
            <div className="card-flat" style={{ padding: 28, marginBottom: 28, borderColor: 'rgba(197,151,87,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div className="label" style={{ fontSize: 17, color: '#C59757', marginBottom: 10 }}>Your Group</div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: '#D6D1CC', marginBottom: 8 }}>
                    {GROUP.name}
                  </h2>
                  <p style={{ fontSize: 16, color: '#8A847E' }}>
                    Created {GROUP.created} · {GROUP.totalBets} total bets placed
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[
                    { value: GROUP.members, label: 'Members' },
                    { value: GROUP.totalBets, label: 'Total Bets' },
                    { value: DEMO_USERS.reduce((s, u) => s + u.haysticks, 0).toLocaleString(), label: 'Group Hay' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: '#C59757' }}>{s.value}</div>
                      <div style={{ fontSize: 17, color: '#8A847E', fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Members grid */}
            <div className="label" style={{ marginBottom: 16, fontSize: 16 }}>Members</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 16, marginBottom: 32 }}>
              {DEMO_USERS.map((u, i) => {
                const change = u.haysticks - 1000;
                return (
                  <div key={u.name} className="card-flat" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ fontSize: 36 }}>{u.avatar}</span>
                      <div style={{
                        position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '50%',
                        background: i < 3 ? '#C59757' : '#1C2418', border: '2px solid #141A10',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: i < 3 ? '#0D110A' : '#8A847E',
                      }}>
                        {i + 1}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#D6D1CC', marginBottom: 4 }}>{u.name}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 16, color: '#8A847E' }}>
                        <span>{u.betsWon + u.betsLost} bets</span>
                        <span style={{ color: '#52B788' }}>{u.betsWon}W</span>
                        <span style={{ color: '#C2653A' }}>{u.betsLost}L</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <Hay size={16} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: '#C59757' }}>{u.haysticks.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', color: change > 0 ? '#52B788' : '#C2653A', marginTop: 2 }}>
                        {change > 0 ? '+' : ''}{change}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Join / Create buttons */}
            <div style={{ display: 'flex', gap: 16 }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '16px 28px' }}>
                <Users style={{ width: 16, height: 16 }} /> Invite Friends
              </button>
              <button style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px 28px', borderRadius: 4, cursor: 'pointer', fontSize: 16, fontWeight: 500,
                background: 'transparent', border: '1px solid rgba(197,151,87,0.1)', color: '#8A847E',
                letterSpacing: '1px', textTransform: 'uppercase',
              }}>
                Create New Group <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet modal */}
      <AnimatePresence>
        {betModal && (
          <BetModal market={betModal.market} option={betModal.option} onClose={() => setBetModal(null)} onConfirm={confirmBet} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              padding: '14px 28px', borderRadius: 6, background: '#141A10',
              border: '1px solid rgba(82,183,136,0.3)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', gap: 10, zIndex: 200,
            }}>
            <Check style={{ width: 18, height: 18, color: '#52B788' }} />
            <span style={{ fontSize: 17, color: '#D6D1CC', fontWeight: 500 }}>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
