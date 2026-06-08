import { useState, useMemo } from 'react';
import { BlockMath } from 'react-katex';
import ThreeScene from '../components/graphics/ThreeScene';
import {
  modelMatrix, lookAtMatrix, perspectiveMatrix, orthographicMatrix,
  multiplyMat4, mat4ToLatex, mat4ToGLSL, mat4ToHLSL
} from '../utils/graphicsMath';

const Slider = ({ label, value, min, max, step = 0.1, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#444444', fontFamily: 'Arial,sans-serif' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: '#2563eb', minWidth: 48, textAlign: 'right' }}>
        {Number(value).toFixed(2)}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))} style={{ width: '100%' }} />
  </div>
);

const TABS = ['Model', 'View', 'Projection', 'MVP'];

export default function GraphicsCalculator() {
  const [tx, setTx] = useState(0); const [ty, setTy] = useState(0); const [tz, setTz] = useState(0);
  const [rx, setRx] = useState(0); const [ry, setRy] = useState(0); const [rz, setRz] = useState(0);
  const [sx, setSx] = useState(1); const [sy, setSy] = useState(1); const [sz, setSz] = useState(1);
  const [camX, setCamX] = useState(4); const [camY, setCamY] = useState(3); const [camZ, setCamZ] = useState(6);
  const [tarX, setTarX] = useState(0); const [tarY, setTarY] = useState(0); const [tarZ, setTarZ] = useState(0);
  const [fov, setFov] = useState(45); const [near, setNear] = useState(0.1); const [far, setFar] = useState(100);
  const [projType, setProjType] = useState('perspective');
  const [activeTab, setActiveTab] = useState('Model');
  const [copied, setCopied] = useState('');

  const M = useMemo(() => modelMatrix({ tx, ty, tz, rx, ry, rz, sx, sy, sz }), [tx, ty, tz, rx, ry, rz, sx, sy, sz]);
  const V = useMemo(() => lookAtMatrix([camX, camY, camZ], [tarX, tarY, tarZ], [0, 1, 0]), [camX, camY, camZ, tarX, tarY, tarZ]);
  const P = useMemo(() =>
    projType === 'perspective'
      ? perspectiveMatrix(fov, 16 / 9, near, far)
      : orthographicMatrix(-5, 5, -5, 5, near, far),
    [fov, near, far, projType]
  );
  const MVP = useMemo(() => multiplyMat4(multiplyMat4(P, V), M), [P, V, M]);

  const getMatrix = () => ({ Model: M, View: V, Projection: P, MVP })[activeTab];

  const copyCode = (lang) => {
    const code = lang === 'GLSL'
      ? mat4ToGLSL(getMatrix(), activeTab.toLowerCase())
      : mat4ToHLSL(getMatrix(), activeTab.toLowerCase());
    navigator.clipboard.writeText(code).then(() => {
      setCopied(lang);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 8, marginTop: 4 }}>{children}</div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>3D 그래픽스 계산기</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>MVP 행렬 · GLSL/HLSL 복사</p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: Controls */}
        <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Model */}
          <div className="calc-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Model Transform</span>
            <SectionTitle>Translation</SectionTitle>
            <Slider label="tx" value={tx} min={-5} max={5} onChange={setTx} />
            <Slider label="ty" value={ty} min={-5} max={5} onChange={setTy} />
            <Slider label="tz" value={tz} min={-5} max={5} onChange={setTz} />
            <SectionTitle>Rotation (°)</SectionTitle>
            <Slider label="rx" value={rx} min={-180} max={180} step={1} onChange={setRx} />
            <Slider label="ry" value={ry} min={-180} max={180} step={1} onChange={setRy} />
            <Slider label="rz" value={rz} min={-180} max={180} step={1} onChange={setRz} />
            <SectionTitle>Scale</SectionTitle>
            <Slider label="sx" value={sx} min={0.1} max={3} onChange={setSx} />
            <Slider label="sy" value={sy} min={0.1} max={3} onChange={setSy} />
            <Slider label="sz" value={sz} min={0.1} max={3} onChange={setSz} />
          </div>

          {/* View */}
          <div className="calc-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>View (Camera)</span>
            <SectionTitle>Eye Position</SectionTitle>
            <Slider label="camX" value={camX} min={-10} max={10} onChange={setCamX} />
            <Slider label="camY" value={camY} min={-10} max={10} onChange={setCamY} />
            <Slider label="camZ" value={camZ} min={-10} max={10} onChange={setCamZ} />
            <SectionTitle>Target</SectionTitle>
            <Slider label="tarX" value={tarX} min={-5} max={5} onChange={setTarX} />
            <Slider label="tarY" value={tarY} min={-5} max={5} onChange={setTarY} />
            <Slider label="tarZ" value={tarZ} min={-5} max={5} onChange={setTarZ} />
          </div>

          {/* Projection */}
          <div className="calc-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Projection</span>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              {['perspective', 'orthographic'].map(t => (
                <button key={t} onClick={() => setProjType(t)}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 5, fontSize: 12,
                    fontFamily: 'Arial,sans-serif', cursor: 'pointer',
                    border: projType === t ? '1px solid #2563eb' : '1px solid #cccccc',
                    background: projType === t ? '#eff6ff' : '#ffffff',
                    color: projType === t ? '#2563eb' : '#444444',
                    fontWeight: projType === t ? 600 : 400,
                  }}>
                  {t === 'perspective' ? 'Perspective' : 'Ortho'}
                </button>
              ))}
            </div>
            {projType === 'perspective' && <Slider label="FOV (°)" value={fov} min={10} max={120} step={1} onChange={setFov} />}
            <Slider label="Near" value={near} min={0.01} max={5} step={0.01} onChange={setNear} />
            <Slider label="Far" value={far} min={10} max={500} step={1} onChange={setFar} />
          </div>
        </div>

        {/* Right */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 3D view */}
          <div className="calc-card" style={{ height: 340, overflow: 'hidden', padding: 0 }}>
            <ThreeScene modelMat={M} viewMat={V} projMat={P} />
          </div>

          {/* Matrix display */}
          <div className="calc-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 13,
                    fontFamily: 'Arial,sans-serif', cursor: 'pointer',
                    border: activeTab === tab ? '1px solid #2563eb' : '1px solid #cccccc',
                    background: activeTab === tab ? '#eff6ff' : '#ffffff',
                    color: activeTab === tab ? '#2563eb' : '#333333',
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Matrix */}
            <div style={{ overflowX: 'auto', textAlign: 'center', background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: 6, padding: '8px 12px' }}>
              <BlockMath math={mat4ToLatex(getMatrix())} />
            </div>

            {/* Copy */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => copyCode('GLSL')} className="btn-secondary"
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12 }}>
                {copied === 'GLSL' ? '✓ 복사됨' : 'GLSL 복사'}
              </button>
              <button onClick={() => copyCode('HLSL')} className="btn-secondary"
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12 }}>
                {copied === 'HLSL' ? '✓ 복사됨' : 'HLSL 복사'}
              </button>
            </div>

            {/* Code */}
            <pre style={{
              margin: 0, fontSize: 11, overflowX: 'auto', padding: '10px 12px',
              background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6,
              fontFamily: 'JetBrains Mono,monospace', color: '#333333', lineHeight: 1.6,
            }}>
              {mat4ToGLSL(getMatrix(), activeTab.toLowerCase())}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
