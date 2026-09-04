import { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { Skeleton, SkeletonCards } from './components/Loading';

// Every route except Home is split into its own chunk. Bundling them together
// meant each visit parsed the whole app (mapbox, recharts, every page) before
// anything rendered, which showed up as a long main-thread block on load.
const LiveReplay    = lazy(() => import('./pages/RaceNight'));
const DeepDive      = lazy(() => import('./pages/RaceXRay'));
const HorseProfiles = lazy(() => import('./pages/Profiles'));
const Forecast      = lazy(() => import('./pages/Preview'));
const GPSEdge       = lazy(() => import('./pages/Insights'));
const HorseLLM      = lazy(() => import('./pages/HorseLLM'));
const StableMatch   = lazy(() => import('./pages/StableMatch'));
const EquiBets      = lazy(() => import('./pages/EquiBets'));

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 60, color: '#C59757', background: '#0D110A', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, marginBottom: 20 }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 15, color: '#8A847E' }}>{this.state.error?.message}</pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 24, background: 'transparent', border: '1px solid #C59757', color: '#C59757', borderRadius: 8, padding: '10px 22px', fontSize: 15, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Shown while a route chunk downloads. Deliberately the same shape as the
// in-page skeletons, so a route change reads as one continuous transition
// rather than a blank flash followed by a second skeleton.
function RouteFallback() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px clamp(18px, 4vw, 40px) 80px' }}>
      <Skeleton height={18} width={120} style={{ marginBottom: 18 }} />
      <Skeleton height={54} width="min(420px, 80%)" style={{ marginBottom: 22 }} />
      <Skeleton height={20} width="min(560px, 90%)" style={{ marginBottom: 44 }} />
      <SkeletonCards count={6} height={140} minWidth={240} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#0D110A', color: '#D6D1CC' }}>
          <Navbar />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/live-replay" element={<LiveReplay />} />
              <Route path="/deep-dive" element={<DeepDive />} />
              <Route path="/horse-profiles" element={<HorseProfiles />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/gps-edge" element={<GPSEdge />} />
              <Route path="/horsellm" element={<HorseLLM />} />
              <Route path="/stable-match" element={<StableMatch />} />
              <Route path="/equibets" element={<EquiBets />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
