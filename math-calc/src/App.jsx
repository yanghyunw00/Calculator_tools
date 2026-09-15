<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
=======
import { HashRouter, Routes, Route } from 'react-router-dom';
>>>>>>> claude/adoring-dijkstra-qz8hn6
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

// Route-level code splitting: heavy deps (three.js, mathjs, katex) load
// only when the route that needs them is visited.
const MatrixCalculator   = lazy(() => import('./pages/MatrixCalculator'));
const CalcCalculator     = lazy(() => import('./pages/CalcCalculator'));
const GraphicsCalculator = lazy(() => import('./pages/GraphicsCalculator'));
const VectorCalculator   = lazy(() => import('./pages/VectorCalculator'));
const PrivacyPolicy      = lazy(() => import('./pages/PrivacyPolicy'));

const RouteFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '80px 16px', color: '#888888', fontSize: 13 }}>
    <span className="spinner" /> 불러오는 중...
  </div>
);

export default function App() {
  return (
    <HashRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/matrix" element={<MatrixCalculator />} />
              <Route path="/calculus" element={<CalcCalculator />} />
              <Route path="/graphics" element={<GraphicsCalculator />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/vector" element={<VectorCalculator />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}
