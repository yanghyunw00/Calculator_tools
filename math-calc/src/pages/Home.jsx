import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const CARDS = [
  {
    to: '/matrix',
    title: '행렬 계산기',
    desc: '행렬식, 역행렬, LU분해, SVD, 고유값/벡터 등',
    tags: ['det', 'inv', 'LU', 'SVD', 'Eigenvalues'],
  },
  {
    to: '/calculus',
    title: '미적분 계산기',
    desc: '도함수, 편미분, 정·부정적분, 극한, 테일러 급수',
    tags: ["f'(x)", '∫', 'lim', '∂', 'Taylor'],
  },
  {
    to: '/graphics',
    title: '3D 그래픽스 계산기',
    desc: 'MVP 행렬, 변환 행렬, GLSL/HLSL 코드 복사',
    tags: ['MVP', 'LookAt', 'Perspective', 'GLSL'],
  },
];

export default function Home() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem('recentCalcs') || '[]'));
  }, []);

  const handleNav = (to) => {
    const label = CARDS.find(c => c.to === to)?.title || to;
    const prev = JSON.parse(localStorage.getItem('recentCalcs') || '[]');
    const next = [{ to, label }, ...prev.filter(x => x.to !== to)].slice(0, 3);
    localStorage.setItem('recentCalcs', JSON.stringify(next));
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 16px', display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 700, color: '#111111' }}>
          수학 계산기
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: '#666666', lineHeight: 1.6 }}>
          행렬 · 미적분 · 3D 그래픽스 — 단계별 풀이 제공
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {CARDS.map(card => (
          <Link key={card.to} to={card.to} onClick={() => handleNav(card.to)}
            style={{ textDecoration: 'none' }}>
            <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111111' }}>{card.title}</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{card.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
                {card.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 4,
                    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{tag}</span>
                ))}
              </div>
              <span style={{ fontSize: 13, color: '#2563eb', marginTop: 6 }}>열기 →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#888888' }}>최근 사용</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recent.map(r => (
              <Link key={r.to} to={r.to} style={{ textDecoration: 'none' }}>
                <span className="btn-secondary" style={{ display: 'inline-block', fontSize: 13 }}>{r.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
