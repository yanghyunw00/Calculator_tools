import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/matrix', label: '행렬 계산기' },
  { to: '/calculus', label: '미적분 계산기' },
  { to: '/graphics', label: '3D 그래픽스' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: '#080c18', borderBottom: '1px solid #1e2d4a' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">∑</span>
          <span className="font-bold text-lg gradient-text" style={{ fontFamily: 'Sora,sans-serif' }}>
            MathCalc
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="no-underline px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                fontFamily: 'Sora,sans-serif',
                color: pathname === to ? '#00d4ff' : '#94a3b8',
                background: pathname === to ? 'rgba(0,212,255,0.08)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ background: '#1a2540', color: '#94a3b8' }}
          onClick={() => setOpen(o => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1" style={{ background: '#080c18' }}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="no-underline px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                fontFamily: 'Sora,sans-serif',
                color: pathname === to ? '#00d4ff' : '#94a3b8',
                background: pathname === to ? 'rgba(0,212,255,0.08)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
