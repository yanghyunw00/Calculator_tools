import { useState, useMemo } from 'react';
import { BlockMath } from 'react-katex';
import ThreeScene from '../components/graphics/ThreeScene';
import {
  modelMatrix, lookAtMatrix, perspectiveMatrix, orthographicMatrix,
  multiplyMat4, mat4ToLatex, mat4ToGLSL, mat4ToHLSL
} from '../utils/graphicsMath';

const Slider = ({ label, value, min, max, step = 0.1, onChange }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center">
      <span className="text-xs" style={{ color: '#94a3b8', fontFamily: 'Sora,sans-serif' }}>{label}</span>
      <span className="text-xs font-mono" style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono,monospace' }}>
        {Number(value).toFixed(2)}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))} className="w-full" />
  </div>
);

const MATRIX_TABS = ['Model', 'View', 'Projection', 'MVP'];

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

  const getMatrix = () => {
    switch (activeTab) {
      case 'Model': return M;
      case 'View': return V;
      case 'Projection': return P;
      case 'MVP': return MVP;
    }
  };

  const copyCode = (lang) => {
    const mat = getMatrix();
    const name = activeTab.toLowerCase();
    const code = lang === 'GLSL' ? mat4ToGLSL(mat, name) : mat4ToHLSL(mat, name);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(lang);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-1" style={{ fontFamily: 'Sora,sans-serif' }}>
          3D 그래픽스 계산기
        </h1>
        <p className="text-sm" style={{ color: '#64748b', fontFamily: 'Sora,sans-serif' }}>
          MVP 행렬 · 변환 행렬 · GLSL/HLSL 코드 복사
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Controls */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          {/* Model transforms */}
          <div className="calc-card p-4 flex flex-col gap-4">
            <span className="font-bold text-sm gradient-text" style={{ fontFamily: 'Sora,sans-serif' }}>
              Model Transform
            </span>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Translation</div>
              <Slider label="tx" value={tx} min={-5} max={5} onChange={setTx} />
              <Slider label="ty" value={ty} min={-5} max={5} onChange={setTy} />
              <Slider label="tz" value={tz} min={-5} max={5} onChange={setTz} />
              <div className="text-xs font-semibold mt-1" style={{ color: '#7c3aed' }}>Rotation (°)</div>
              <Slider label="rx" value={rx} min={-180} max={180} step={1} onChange={setRx} />
              <Slider label="ry" value={ry} min={-180} max={180} step={1} onChange={setRy} />
              <Slider label="rz" value={rz} min={-180} max={180} step={1} onChange={setRz} />
              <div className="text-xs font-semibold mt-1" style={{ color: '#7c3aed' }}>Scale</div>
              <Slider label="sx" value={sx} min={0.1} max={3} onChange={setSx} />
              <Slider label="sy" value={sy} min={0.1} max={3} onChange={setSy} />
              <Slider label="sz" value={sz} min={0.1} max={3} onChange={setSz} />
            </div>
          </div>

          {/* View */}
          <div className="calc-card p-4 flex flex-col gap-4">
            <span className="font-bold text-sm gradient-text" style={{ fontFamily: 'Sora,sans-serif' }}>
              View (Camera)
            </span>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold" style={{ color: '#00d4ff' }}>Eye Position</div>
              <Slider label="camX" value={camX} min={-10} max={10} onChange={setCamX} />
              <Slider label="camY" value={camY} min={-10} max={10} onChange={setCamY} />
              <Slider label="camZ" value={camZ} min={-10} max={10} onChange={setCamZ} />
              <div className="text-xs font-semibold mt-1" style={{ color: '#00d4ff' }}>Target</div>
              <Slider label="tarX" value={tarX} min={-5} max={5} onChange={setTarX} />
              <Slider label="tarY" value={tarY} min={-5} max={5} onChange={setTarY} />
              <Slider label="tarZ" value={tarZ} min={-5} max={5} onChange={setTarZ} />
            </div>
          </div>

          {/* Projection */}
          <div className="calc-card p-4 flex flex-col gap-4">
            <span className="font-bold text-sm gradient-text" style={{ fontFamily: 'Sora,sans-serif' }}>
              Projection
            </span>
            <div className="flex gap-2">
              {['perspective', 'orthographic'].map(t => (
                <button key={t} onClick={() => setProjType(t)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: projType === t ? 'rgba(0,212,255,0.15)' : '#1a2540',
                    border: projType === t ? '1px solid rgba(0,212,255,0.5)' : '1px solid #2d3a5e',
                    color: projType === t ? '#00d4ff' : '#94a3b8',
                    fontFamily: 'Sora,sans-serif',
                  }}>
                  {t === 'perspective' ? 'Perspective' : 'Orthographic'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {projType === 'perspective' && <Slider label="FOV (°)" value={fov} min={10} max={120} step={1} onChange={setFov} />}
              <Slider label="Near" value={near} min={0.01} max={5} step={0.01} onChange={setNear} />
              <Slider label="Far" value={far} min={10} max={500} step={1} onChange={setFar} />
            </div>
          </div>
        </div>

        {/* Right: 3D view + matrix */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Three.js canvas */}
          <div className="calc-card overflow-hidden" style={{ height: 360 }}>
            <ThreeScene modelMat={M} viewMat={V} projMat={P} />
          </div>

          {/* Matrix display */}
          <div className="calc-card p-4 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {MATRIX_TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    background: activeTab === tab ? 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(124,58,237,0.2))' : '#1a2540',
                    border: activeTab === tab ? '1px solid rgba(0,212,255,0.5)' : '1px solid #2d3a5e',
                    color: activeTab === tab ? '#00d4ff' : '#94a3b8',
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Matrix render */}
            <div className="overflow-x-auto py-2">
              <BlockMath math={mat4ToLatex(getMatrix())} />
            </div>

            {/* Copy buttons */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => copyCode('GLSL')}
                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                style={{ fontFamily: 'JetBrains Mono,monospace' }}>
                {copied === 'GLSL' ? '✓ 복사됨' : 'GLSL로 복사'}
              </button>
              <button onClick={() => copyCode('HLSL')}
                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                style={{ fontFamily: 'JetBrains Mono,monospace' }}>
                {copied === 'HLSL' ? '✓ 복사됨' : 'HLSL로 복사'}
              </button>
            </div>

            {/* Code preview */}
            <pre className="text-xs overflow-x-auto p-3 rounded-lg"
              style={{ background: '#080c18', color: '#94a3b8', fontFamily: 'JetBrains Mono,monospace', border: '1px solid #1e2d4a' }}>
              {mat4ToGLSL(getMatrix(), activeTab.toLowerCase())}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
