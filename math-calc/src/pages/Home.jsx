import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const CARDS = [
  {
    to: '/matrix',
    title: '행렬 계산기',
    desc: '행렬식, 역행렬, LU분해, SVD, 고유값/벡터 등 고급 행렬 연산을 단계별 풀이와 함께',
    icon: '⊞',
    tags: ['Determinant', 'Inverse', 'Eigenvalues', 'SVD', 'LU 분해'],
    color: '#00d4ff',
    gradient: 'from-cyan-500/10 to-cyan-900/5',
  },
  {
    to: '/calculus',
    title: '미적분 계산기',
    desc: '도함수, 편미분, 적분, 극한, 테일러 급수를 수학 기호 팔레트와 함께 직관적으로',
    icon: '∫',
    tags: ['Derivative', 'Integral', 'Limit', 'Taylor Series', '편미분'],
    color: '#7c3aed',
    gradient: 'from-purple-500/10 to-purple-900/5',
  },
  {
    to: '/graphics',
    title: '3D 그래픽스 계산기',
    desc: 'MVP 행렬 생성, 변환 행렬 시각화, GLSL/HLSL 코드 바로 복사',
    icon: '◈',
    tags: ['MVP Matrix', 'LookAt', 'Perspective', 'GLSL', 'HLSL'],
    color: '#f59e0b',
    gradient: 'from-amber-500/10 to-amber-900/5',
  },
];

const FEATURES = [
  { icon: '📐', title: '단계별 풀이', desc: '모든 연산의 풀이 과정을 단계별로 확인' },
  { icon: '🎨', title: 'KaTeX 렌더링', desc: '아름다운 수식 표현으로 결과 확인' },
  { icon: '⚡', title: '실시간 계산', desc: '빠르고 정확한 계산 엔진 (math.js)' },
  { icon: '📱', title: '반응형 UI', desc: '모바일, 태블릿, 데스크탑 완벽 지원' },
  { icon: '🎮', title: '3D 시각화', desc: 'Three.js 기반 인터랙티브 3D 씬' },
  { icon: '🔓', title: '완전 무료', desc: '광고 없는 깔끔한 인터페이스' },
];

export default function Home() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const r = JSON.parse(localStorage.getItem('recentCalcs') || '[]');
    setRecent(r);
  }, []);

  const handleNav = (to) => {
    const label = CARDS.find(c => c.to === to)?.title || to;
    const prev = JSON.parse(localStorage.getItem('recentCalcs') || '[]');
    const next = [{ to, label, ts: Date.now() }, ...prev.filter(x => x.to !== to)].slice(0, 3);
    localStorage.setItem('recentCalcs', JSON.stringify(next));
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.07) 0%, transparent 70%)',
        }} />
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'Sora,sans-serif' }}>
            ✦ 공대생을 위한 수학 계산기
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em' }}>
            <span className="gradient-text">수학 계산</span>을<br />
            <span style={{ color: '#e2e8f0' }}>더 쉽고 아름답게</span>
          </h1>

          <p className="text-lg max-w-xl" style={{ color: '#94a3b8', fontFamily: 'Sora,sans-serif', lineHeight: 1.7 }}>
            행렬 · 미적분 · 3D 그래픽스 변환까지<br />
            단계별 풀이와 함께 KaTeX로 아름답게 표시됩니다
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <Link to="/matrix" onClick={() => handleNav('/matrix')}
              className="btn-primary no-underline px-7 py-3 text-base">
              시작하기 →
            </Link>
            <Link to="/graphics" onClick={() => handleNav('/graphics')}
              className="no-underline px-7 py-3 rounded-xl text-base font-semibold"
              style={{ background: '#1a2540', border: '1px solid #2d3a5e', color: '#94a3b8', fontFamily: 'Sora,sans-serif' }}>
              3D 데모 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator cards */}
      <section className="px-4 pb-16 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#e2e8f0', fontFamily: 'Sora,sans-serif' }}>
          계산기 선택
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(card => (
            <Link key={card.to} to={card.to} onClick={() => handleNav(card.to)}
              className="calc-card p-6 flex flex-col gap-4 no-underline group">
              <div className="flex items-start gap-3">
                <div className="text-4xl" style={{ lineHeight: 1 }}>{card.icon}</div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#e2e8f0', fontFamily: 'Sora,sans-serif' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#64748b', fontFamily: 'Sora,sans-serif', lineHeight: 1.6 }}>
                    {card.desc}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {card.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: `${card.color}12`,
                      border: `1px solid ${card.color}28`,
                      color: card.color,
                      fontFamily: 'JetBrains Mono,monospace',
                    }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: card.color }}>
                열기 <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-20 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#e2e8f0', fontFamily: 'Sora,sans-serif' }}>
          왜 MathCalc인가요?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="calc-card p-5 flex flex-col gap-2">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-semibold text-sm" style={{ color: '#e2e8f0', fontFamily: 'Sora,sans-serif' }}>{f.title}</h3>
              <p className="text-xs" style={{ color: '#64748b', fontFamily: 'Sora,sans-serif', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="px-4 pb-16 max-w-6xl mx-auto w-full">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#94a3b8', fontFamily: 'Sora,sans-serif' }}>
            최근 사용
          </h2>
          <div className="flex gap-3 flex-wrap">
            {recent.map(r => (
              <Link key={r.to} to={r.to}
                className="no-underline px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: '#1a2540', border: '1px solid #2d3a5e', color: '#94a3b8', fontFamily: 'Sora,sans-serif' }}>
                {r.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="text-center py-8 text-sm" style={{ color: '#374151', borderTop: '1px solid #1e2d4a', fontFamily: 'Sora,sans-serif' }}>
        MathCalc — 공대생을 위한 무료 수학 계산기
      </footer>
    </div>
  );
}
