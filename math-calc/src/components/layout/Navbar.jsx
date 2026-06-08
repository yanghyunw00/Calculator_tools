import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/matrix', label: '행렬' },
  { to: '/calculus', label: '미적분' },
  { to: '/graphics', label: '3D 그래픽스' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 700, fontSize: 16, color: '#111111' }}>
          MathCalc
        </Link>

        <div className="hidden md:flex" style={{ gap: 4 }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              textDecoration: 'none',
              padding: '5px 12px',
              borderRadius: 5,
              fontSize: 14,
              color: pathname === to ? '#2563eb' : '#444444',
              background: pathname === to ? '#eff6ff' : 'transparent',
              fontWeight: pathname === to ? 600 : 400,
            }}>
              {label}
            </Link>
          ))}
        </div>

        <button className="md:hidden btn-secondary" style={{ padding: '4px 10px' }}
          onClick={() => setOpen(o => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #e0e0e0', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} style={{
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 5,
              fontSize: 14,
              color: pathname === to ? '#2563eb' : '#444444',
              background: pathname === to ? '#eff6ff' : 'transparent',
            }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
