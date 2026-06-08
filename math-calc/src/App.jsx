import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import MatrixCalculator from './pages/MatrixCalculator';
import CalcCalculator from './pages/CalcCalculator';
import GraphicsCalculator from './pages/GraphicsCalculator';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/matrix" element={<MatrixCalculator />} />
            <Route path="/calculus" element={<CalcCalculator />} />
            <Route path="/graphics" element={<GraphicsCalculator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
