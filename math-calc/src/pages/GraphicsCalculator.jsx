import { useState, useMemo } from 'react';
import ThreeScene from '../components/graphics/ThreeScene';
import { modelMatrix } from '../utils/graphicsMath';

const Slider = ({ label, value, min, max, step = 0.1, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: '#444444' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#2563eb', minWidth: 46, textAlign: 'right' }}>
        {Number(value).toFixed(2)}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))} style={{ width: '100%' }} />
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginTop: 8, marginBottom: 2, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {children}
  </div>
);

const ToggleBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    border: active ? '1px solid #2563eb' : '1px solid #cccccc',
    background: active ? '#eff6ff' : '#ffffff',
    color: active ? '#2563eb' : '#444444',
    fontWeight: active ? 600 : 400,
  }}>
    {children}
  </button>
);

export default function GraphicsCalculator() {
  // Model
  const [tx, setTx] = useState(0); const [ty, setTy] = useState(0); const [tz, setTz] = useState(0);
  const [rx, setRx] = useState(0); const [ry, setRy] = useState(0); const [rz, setRz] = useState(0);
  const [sx, setSx] = useState(1); const [sy, setSy] = useState(1); const [sz, setSz] = useState(1);

  // Frustum camera position in world
  const [fcX, setFcX] = useState(3);
  const [fcY, setFcY] = useState(2.5);
  const [fcZ, setFcZ] = useState(3);

  // Frustum camera properties
  const [fov, setFov] = useState(45);
  const [near, setNear] = useState(0.5);
  const [far, setFar] = useState(5);
  const [aspect, setAspect] = useState(1.78); // 16:9

  // Toggles
  const [showVertices, setShowVertices] = useState(false);
  const [showNormals, setShowNormals] = useState(false);

  const M = useMemo(
    () => modelMatrix({ tx, ty, tz, rx, ry, rz, sx, sy, sz }),
    [tx, ty, tz, rx, ry, rz, sx, sy, sz]
  );

  const frustumCam = useMemo(
    () => ({ x: fcX, y: fcY, z: fcZ, fov, near, far, aspect }),
    [fcX, fcY, fcZ, fov, near, far, aspect]
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>3D 그래픽스 계산기</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>드래그로 뷰 회전 · 스크롤로 줌</p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left panel: Model + Frustum Camera */}
        <div style={{ flex: '0 0 230px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Model Transform */}
          <div className="calc-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Model Transform</div>
            <SectionLabel>Translation</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Slider label="tx" value={tx} min={-5} max={5} onChange={setTx} />
              <Slider label="ty" value={ty} min={-5} max={5} onChange={setTy} />
              <Slider label="tz" value={tz} min={-5} max={5} onChange={setTz} />
            </div>
            <SectionLabel>Rotation (°)</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Slider label="rx" value={rx} min={-180} max={180} step={1} onChange={setRx} />
              <Slider label="ry" value={ry} min={-180} max={180} step={1} onChange={setRy} />
              <Slider label="rz" value={rz} min={-180} max={180} step={1} onChange={setRz} />
            </div>
            <SectionLabel>Scale</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Slider label="sx" value={sx} min={0.1} max={3} onChange={setSx} />
              <Slider label="sy" value={sy} min={0.1} max={3} onChange={setSy} />
              <Slider label="sz" value={sz} min={0.1} max={3} onChange={setSz} />
            </div>
          </div>

          {/* Frustum Camera */}
          <div className="calc-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Frustum Camera</div>
            <div style={{ fontSize: 11, color: '#888888', marginBottom: 8 }}>
              주황색 점 = 카메라 위치<br />선 = 절두체(frustum)
            </div>

            <SectionLabel>Camera Position</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Slider label="X" value={fcX} min={-8} max={8} onChange={setFcX} />
              <Slider label="Y" value={fcY} min={-8} max={8} onChange={setFcY} />
              <Slider label="Z" value={fcZ} min={-8} max={8} onChange={setFcZ} />
            </div>

            <SectionLabel>Projection</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Slider label="FOV (°)" value={fov} min={10} max={120} step={1} onChange={setFov} />
              <Slider label="Near" value={near} min={0.1} max={3} step={0.05} onChange={setNear} />
              <Slider label="Far" value={far} min={near + 0.5} max={15} step={0.1} onChange={setFar} />
              <Slider label="Aspect" value={aspect} min={0.5} max={3} step={0.01} onChange={setAspect} />
            </div>
          </div>
        </div>

        {/* Right: 3D View */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Toggle buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <ToggleBtn active={showVertices} onClick={() => setShowVertices(v => !v)}>
              정점 번호 {showVertices ? '켜짐' : '꺼짐'}
            </ToggleBtn>
            <ToggleBtn active={showNormals} onClick={() => setShowNormals(v => !v)}>
              노말 벡터 {showNormals ? '켜짐' : '꺼짐'}
            </ToggleBtn>
            <span style={{ fontSize: 12, color: '#aaaaaa' }}>
              X <span style={{ color: '#cc2222' }}>■</span>&nbsp;
              Y <span style={{ color: '#22aa22' }}>■</span>&nbsp;
              Z <span style={{ color: '#2255cc' }}>■</span>
            </span>
          </div>

          {/* Canvas */}
          <div className="calc-card" style={{ height: 560, overflow: 'hidden', padding: 0 }}>
            <ThreeScene
              modelMat={M}
              showVertices={showVertices}
              showNormals={showNormals}
              frustumCam={frustumCam}
            />
          </div>

          {/* Vertex table (when enabled) */}
          {showVertices && (
            <div className="calc-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>정점 좌표 (로컬 공간)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {[
                  ['0', '(-0.5, -0.5, -0.5)'],
                  ['1', '( 0.5, -0.5, -0.5)'],
                  ['2', '( 0.5,  0.5, -0.5)'],
                  ['3', '(-0.5,  0.5, -0.5)'],
                  ['4', '(-0.5, -0.5,  0.5)'],
                  ['5', '( 0.5, -0.5,  0.5)'],
                  ['6', '( 0.5,  0.5,  0.5)'],
                  ['7', '(-0.5,  0.5,  0.5)'],
                ].map(([idx, coords]) => (
                  <div key={idx} style={{
                    padding: '6px 8px', borderRadius: 5,
                    background: '#f5f5f5', border: '1px solid #e0e0e0',
                    fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#333333'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>v{idx}</span><br />
                    {coords}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Normal table (when enabled) */}
          {showNormals && (
            <div className="calc-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>면 노말 벡터</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {[
                  ['+X', '( 1, 0, 0)', '#cc2222'],
                  ['-X', '(-1, 0, 0)', '#cc2222'],
                  ['+Y', '( 0, 1, 0)', '#22aa22'],
                  ['-Y', '( 0,-1, 0)', '#22aa22'],
                  ['+Z', '( 0, 0, 1)', '#2255cc'],
                  ['-Z', '( 0, 0,-1)', '#2255cc'],
                ].map(([face, vec, color]) => (
                  <div key={face} style={{
                    padding: '6px 8px', borderRadius: 5,
                    background: '#f5f5f5', border: '1px solid #e0e0e0',
                    fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#333333'
                  }}>
                    <span style={{ color, fontWeight: 700 }}>{face}</span><br />
                    {vec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
