import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLang } from '../i18n/useLang';


const CARDS = [
  { to: '/matrix',   titleKey: 'home.card.matrix.title',   descKey: 'home.card.matrix.desc',   tags: ['det', 'inv', 'LU', 'SVD', 'Eigenvalues'] },
  { to: '/calculus', titleKey: 'home.card.calculus.title', descKey: 'home.card.calculus.desc', tags: ["f'(x)", '∫', 'lim', '∂', 'Taylor'] },
  { to: '/graphics', titleKey: 'home.card.graphics.title', descKey: 'home.card.graphics.desc', tags: ['MVP', 'LookAt', 'Perspective', 'GLSL'] },
  { to: '/vector',   titleKey: 'home.card.vector.title',   descKey: 'home.card.vector.desc',   tags: ['dot', 'cross', 'A×B', '3D'] },
];

export default function Home() {
  const { t } = useLang();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    document.title = t('home.doc.title');
  }, [t]);

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem('recentCalcs') || '[]'));
  }, []);

  const handleNav = (to) => {
    const prev = JSON.parse(localStorage.getItem('recentCalcs') || '[]');
    const next = [{ to }, ...prev.filter(x => x.to !== to)].slice(0, 3);
    localStorage.setItem('recentCalcs', JSON.stringify(next));
  };

  const cardTitle = (to) => {
    const c = CARDS.find(x => x.to === to);
    return c ? t(c.titleKey) : to;
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 16px', display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 700, color: '#111111' }}>
          {t('home.heading')}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: '#666666', lineHeight: 1.6 }}>
          {t('home.subtitle')}
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {CARDS.map(card => (
          <Link key={card.to} to={card.to} onClick={() => handleNav(card.to)}
            style={{ textDecoration: 'none' }}>
            <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111111' }}>{t(card.titleKey)}</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{t(card.descKey)}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
                {card.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 4,
                    background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{tag}</span>
                ))}
              </div>
              <span style={{ fontSize: 13, color: '#16a34a', marginTop: 6 }}>{t('home.open')}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#888888' }}>{t('home.recent')}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recent.map(r => (
              <Link key={r.to} to={r.to} style={{ textDecoration: 'none' }}>
                <span className="btn-secondary" style={{ display: 'inline-block', fontSize: 13 }}>{cardTitle(r.to)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
