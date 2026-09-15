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

      {/* About section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>MathCalc 소개</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.8 }}>
          MathCalc는 수학 학습과 공학 계산을 위한 무료 온라인 계산기 모음입니다. 행렬, 미적분, 3D 그래픽스, 벡터 연산을 단계별 풀이와 함께 제공합니다. 모든 결과는 KaTeX로 수식 렌더링되어 교재와 동일한 수학 표기법으로 확인할 수 있습니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { title: '단계별 풀이', desc: '행렬식 전개, 미분 규칙 적용, 벡터 성분 계산 등 모든 과정을 단계별로 표시합니다.' },
            { title: 'LaTeX 수식 렌더링', desc: 'KaTeX로 수학 표기법을 실시간 렌더링합니다. 입력하는 즉시 수식 미리보기가 나타납니다.' },
            { title: '3D 실시간 시각화', desc: 'Three.js 기반으로 벡터, 곡면 그래프, 3D 변환 행렬을 인터랙티브하게 시각화합니다.' },
            { title: '분수 표기 지원', desc: '결과를 소수 대신 분수로 표시하는 옵션을 제공합니다. 정확한 유리수 표현이 필요할 때 유용합니다.' },
          ].map(({ title, desc }) => (
            <div key={title} style={{ padding: '10px 12px', borderRadius: 6, background: '#f9f9f9', border: '1px solid #eee' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
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
