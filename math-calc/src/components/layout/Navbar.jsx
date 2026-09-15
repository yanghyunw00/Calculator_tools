import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useLang } from '../../i18n/useLang';

const navItems = [
  { to: '/', key: 'nav.home' },
  { to: '/matrix', key: 'nav.matrix' },
  { to: '/calculus', key: 'nav.calculus' },
  { to: '/graphics', key: 'nav.graphics' },
  { to: '/vector', key: 'nav.vector' },
];

function LangToggle({ style }) {
  const { lang, toggleLang, t } = useLang();
  return (
    <button
      onClick={toggleLang}
      title={t('nav.langLabel')}
      aria-label={t('nav.langLabel')}
      style={{
        padding: '4px 10px', borderRadius: 5, fontSize: 12, cursor: 'pointer',
        border: '1px solid #cccccc', background: '#ffffff', color: '#444444',
        fontWeight: 600, letterSpacing: '0.03em', fontFamily: 'Arial, sans-serif',
        ...style,
      }}>
      <span style={{ color: lang === 'ko' ? '#16a34a' : '#bbbbbb' }}>KO</span>
      <span style={{ margin: '0 4px', color: '#dddddd' }}>|</span>
      <span style={{ color: lang === 'en' ? '#16a34a' : '#bbbbbb' }}>EN</span>
    </button>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 700, fontSize: 16, color: '#111111' }}>
          MathCalc
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="hidden md:flex" style={{ gap: 4 }}>
            {navItems.map(({ to, key }) => (
              <Link key={to} to={to} style={{
                textDecoration: 'none',
                padding: '5px 12px',
                borderRadius: 5,
                fontSize: 14,
                color: pathname === to ? '#16a34a' : '#444444',
                background: pathname === to ? '#f0fdf4' : 'transparent',
                fontWeight: pathname === to ? 600 : 400,
              }}>
                {t(key)}
              </Link>
            ))}
          </div>

          <LangToggle />

          <button className="md:hidden btn-secondary" style={{ padding: '4px 10px' }}
            onClick={() => setOpen(o => !o)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #e0e0e0', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, key }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} style={{
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 5,
              fontSize: 14,
              color: pathname === to ? '#16a34a' : '#444444',
              background: pathname === to ? '#f0fdf4' : 'transparent',
            }}>
              {t(key)}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
