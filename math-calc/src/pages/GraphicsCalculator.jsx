import { useState, useMemo, useEffect } from 'react';
import ThreeScene from '../components/graphics/ThreeScene';
import { modelMatrix } from '../utils/graphicsMath';
import { useLang } from '../i18n/useLang';

// Switch to a stacked layout when the viewport is too narrow for a
// 230px control column + a usable 3D view side by side.
function useNarrowLayout(breakpoint = 860) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setNarrow(e.matches);
    onChange(mq);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return narrow;
}

const Slider = ({ label, value, min, max, step = 0.1, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: '#444444' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#16a34a', minWidth: 46, textAlign: 'right' }}>
        {Number(value).toFixed(2)}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))} style={{ width: '100%' }} />
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginTop: 8, marginBottom: 2, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {children}
  </div>
);

const ToggleBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    border: active ? '1px solid #16a34a' : '1px solid #cccccc',
    background: active ? '#f0fdf4' : '#ffffff',
    color: active ? '#16a34a' : '#444444',
    fontWeight: active ? 600 : 400,
  }}>
    {children}
  </button>
);

const GroupBtn = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 0 }}>
    {options.map(({ id, label }, i) => (
      <button key={id} onClick={() => onChange(id)} style={{
        flex: 1, padding: '5px 0', fontSize: 12, cursor: 'pointer',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #cccccc',
        borderLeft: i > 0 ? 'none' : '1px solid #cccccc',
        borderRadius: i === 0 ? '5px 0 0 5px' : i === options.length - 1 ? '0 5px 5px 0' : 0,
        background: value === id ? '#f0fdf4' : '#ffffff',
        color: value === id ? '#16a34a' : '#444444',
        fontWeight: value === id ? 600 : 400,
      }}>
        {label}
      </button>
    ))}
  </div>
);

export default function GraphicsCalculator() {
  // Model
  const [tx, setTx] = useState(0); const [ty, setTy] = useState(0); const [tz, setTz] = useState(0);
  const [rx, setRx] = useState(0); const [ry, setRy] = useState(0); const [rz, setRz] = useState(0);
  const [sx, setSx] = useState(1); const [sy, setSy] = useState(1); const [sz, setSz] = useState(1);

  // Frustum camera
  const [fcX, setFcX] = useState(3); const [fcY, setFcY] = useState(2.5); const [fcZ, setFcZ] = useState(3);
  const [fov, setFov] = useState(45); const [near, setNear] = useState(0.5); const [far, setFar] = useState(5);
  const [aspect, setAspect] = useState(1.78);

  // Lighting
  const [lightType, setLightType]           = useState('directional');
  const [lightX, setLightX]                 = useState(5);
  const [lightY, setLightY]                 = useState(8);
  const [lightZ, setLightZ]                 = useState(5);
  const [lightIntensity, setLightIntensity] = useState(1.2);
  const [lightColor, setLightColor]         = useState('#ffffff');
  const [ambientInt, setAmbientInt]         = useState(0.35);
  const [shadowEnabled, setShadowEnabled]   = useState(true);
  const [shadowMapType, setShadowMapType]   = useState('pcfsoft');
  const [shadowMapSize, setShadowMapSize]   = useState(2048);
  const [showHelper, setShowHelper]         = useState(true);
  const [showShadowCam, setShowShadowCam]   = useState(false);
  const [spotAngle, setSpotAngle]           = useState(25);
  const [spotPenumbra, setSpotPenumbra]     = useState(0.25);

  // Toggles
  const [showVertices, setShowVertices] = useState(false);
  const [showNormals, setShowNormals]   = useState(false);

  const { t } = useLang();
  const narrow = useNarrowLayout();

  useEffect(() => {
    document.title = t('gfx.doc.title');
  }, [t]);

  const M = useMemo(
    () => modelMatrix({ tx, ty, tz, rx, ry, rz, sx, sy, sz }),
    [tx, ty, tz, rx, ry, rz, sx, sy, sz]
  );

  const frustumCam = useMemo(
    () => ({ x: fcX, y: fcY, z: fcZ, fov, near, far, aspect }),
    [fcX, fcY, fcZ, fov, near, far, aspect]
  );

  const lighting = useMemo(() => ({
    type: lightType,
    x: lightX, y: lightY, z: lightZ,
    intensity: lightIntensity,
    color: lightColor,
    ambientIntensity: ambientInt,
    shadowEnabled,
    shadowMapType,
    shadowMapSize,
    showHelper,
    showShadowCam,
    spotAngle,
    spotPenumbra,
  }), [lightType, lightX, lightY, lightZ, lightIntensity, lightColor, ambientInt,
       shadowEnabled, shadowMapType, shadowMapSize, showHelper, showShadowCam, spotAngle, spotPenumbra]);

  return (
<<<<<<< HEAD
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', maxWidth: 1100, margin: '0 auto', padding: '0 16px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 0 10px', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>3D 그래픽스 계산기</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>드래그로 뷰 회전 · 스크롤로 줌</p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 12, overflow: 'hidden' }}>
        {/* ── Left panel: 독립 스크롤 ──────────────────────────────────── */}
        <div style={{ flex: '0 0 230px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingBottom: 16 }}>
=======
    <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>{t('gfx.heading')}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>{t('gfx.hint')}</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#aaaaaa', lineHeight: 1.6 }}>{t('gfx.intro')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', gap: 16, alignItems: 'stretch' }}>
        {/* ── Left panel ──────────────────────────────────────────────── */}
        <div style={{
          flex: narrow ? '0 0 auto' : '0 0 230px',
          width: narrow ? '100%' : 230,
          minWidth: 0,
          display: 'flex', flexDirection: 'column', gap: 10,
          zIndex: 10,
          ...(narrow ? {} : {
            position: 'sticky', top: 56, alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 72px)',
            overflowY: 'auto', overflowX: 'hidden',
          }),
        }}>
>>>>>>> claude/adoring-dijkstra-qz8hn6

          {/* Model */}
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
            <div style={{ fontSize: 11, color: '#888888', marginBottom: 8 }}>{t('gfx.frustumHint')}</div>
            <SectionLabel>Position</SectionLabel>
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

          {/* Lighting */}
          <div className="calc-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Lighting</div>

            <SectionLabel>Light Type</SectionLabel>
            <GroupBtn
              options={[{ id: 'directional', label: 'Dir' }, { id: 'spot', label: 'Spot' }, { id: 'point', label: 'Point' }]}
              value={lightType}
              onChange={setLightType}
            />

            <SectionLabel>Position</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Slider label="X" value={lightX} min={-10} max={10} onChange={setLightX} />
              <Slider label="Y" value={lightY} min={0.5} max={15} onChange={setLightY} />
              <Slider label="Z" value={lightZ} min={-10} max={10} onChange={setLightZ} />
            </div>

            <SectionLabel>Intensity</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Slider label="Main" value={lightIntensity} min={0} max={5} step={0.05} onChange={setLightIntensity} />
              <Slider label="Ambient" value={ambientInt} min={0} max={2} step={0.05} onChange={setAmbientInt} />
            </div>

            <SectionLabel>Color</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={lightColor} onChange={e => setLightColor(e.target.value)}
                style={{ width: 36, height: 28, padding: 1, border: '1px solid #cccccc', borderRadius: 4, cursor: 'pointer', background: 'none' }} />
              <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: '#444444' }}>{lightColor}</span>
            </div>

            {lightType === 'spot' && (
              <>
                <SectionLabel>Spot Settings</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Slider label="Angle (°)" value={spotAngle} min={5} max={80} step={1} onChange={setSpotAngle} />
                  <Slider label="Penumbra" value={spotPenumbra} min={0} max={1} step={0.01} onChange={setSpotPenumbra} />
                </div>
              </>
            )}

            {/* Shadow */}
            <SectionLabel>Shadow Mapping</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ToggleBtn active={shadowEnabled} onClick={() => setShadowEnabled(v => !v)}>
                Shadow {shadowEnabled ? 'ON' : 'OFF'}
              </ToggleBtn>

              {shadowEnabled && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 11, color: '#888888' }}>Map Type</span>
                    <GroupBtn
                      options={[{ id: 'basic', label: 'Basic' }, { id: 'pcf', label: 'PCF' }, { id: 'pcfsoft', label: 'Soft' }]}
                      value={shadowMapType}
                      onChange={setShadowMapType}
                    />
                    <span style={{ fontSize: 10, color: '#aaaaaa', marginTop: 2 }}>
                      {shadowMapType === 'basic'   && t('gfx.mapTypeBasic')}
                      {shadowMapType === 'pcf'     && t('gfx.mapTypePcf')}
                      {shadowMapType === 'pcfsoft' && t('gfx.mapTypePcfSoft')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 11, color: '#888888' }}>Resolution</span>
                    <GroupBtn
                      options={[{ id: 512, label: '512' }, { id: 1024, label: '1K' }, { id: 2048, label: '2K' }]}
                      value={shadowMapSize}
                      onChange={setShadowMapSize}
                    />
                    <span style={{ fontSize: 10, color: '#aaaaaa', marginTop: 2 }}>{t('gfx.resHint')}</span>
                  </div>

                  {lightType === 'directional' && (
                    <ToggleBtn active={showShadowCam} onClick={() => setShowShadowCam(v => !v)}>
                      {t('gfx.shadowCamFrustum')} {showShadowCam ? t('common.on') : t('common.off')}
                    </ToggleBtn>
                  )}
                </>
              )}

              <ToggleBtn active={showHelper} onClick={() => setShowHelper(v => !v)}>
                {t('gfx.lightHelper')} {showHelper ? t('common.on') : t('common.off')}
              </ToggleBtn>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* ── Right: 3D view (독립 스크롤, 캔버스가 공간 꽉 채움) ──────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingBottom: 16, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
=======
        {/* ── Right: 3D view ───────────────────────────────────────────── */}
        <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
>>>>>>> claude/adoring-dijkstra-qz8hn6
            <ToggleBtn active={showVertices} onClick={() => setShowVertices(v => !v)}>
              {t('gfx.vertexNumbers')} {showVertices ? t('common.on') : t('common.off')}
            </ToggleBtn>
            <ToggleBtn active={showNormals} onClick={() => setShowNormals(v => !v)}>
              {t('gfx.normalVectors')} {showNormals ? t('common.on') : t('common.off')}
            </ToggleBtn>
            <span style={{ fontSize: 12, color: '#aaaaaa' }}>
              X <span style={{ color: '#cc2222' }}>■</span>{' '}
              Y <span style={{ color: '#22aa22' }}>■</span>{' '}
              Z <span style={{ color: '#2255cc' }}>■</span>
            </span>
          </div>

<<<<<<< HEAD
          <div className="calc-card" style={{ flex: '1 1 0', minHeight: 420, overflow: 'hidden', padding: 0 }}>
=======
          <div className="calc-card" style={{
            height: narrow ? '65vh' : 'min(580px, calc(100vh - 72px))',
            minHeight: 340,
            overflow: 'hidden', padding: 0,
            ...(narrow ? {} : { position: 'sticky', top: 56 }),
          }}>
>>>>>>> claude/adoring-dijkstra-qz8hn6
            <ThreeScene
              modelMat={M}
              showVertices={showVertices}
              showNormals={showNormals}
              frustumCam={frustumCam}
              lighting={lighting}
            />
          </div>

          {/* Shadow map info */}
          {shadowEnabled && (
            <div className="calc-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('gfx.shadowPrinciple')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                {[
                  { label: 'Basic', desc: t('gfx.basicDesc'), color: '#888888' },
                  { label: 'PCF', desc: t('gfx.pcfDesc'), color: '#16a34a' },
                  { label: 'PCF Soft', desc: t('gfx.pcfSoftDesc'), color: '#15803d' },
                ].map(({ label, desc, color }) => (
                  <div key={label} style={{ padding: '8px 10px', borderRadius: 6, background: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#555555', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: '#888888', lineHeight: 1.6 }}>
                <b>Shadow Bias</b>: {t('gfx.shadowBiasNote')}<br/>
                <b>Map Size</b>: {t('gfx.mapSizeNote')}<br/>
                {lightType === 'directional' && <><b>Shadow Camera</b>: {t('gfx.shadowCamDir')}</>}
                {lightType === 'spot' && <><b>Shadow Camera</b>: {t('gfx.shadowCamSpot')}</>}
                {lightType === 'point' && <><b>Cube Shadow Map</b>: {t('gfx.cubeShadow')}</>}
              </div>
            </div>
          )}

          {showVertices && (
            <div className="calc-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('gfx.vertexCoords')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {[['0','(-0.5,-0.5,-0.5)'],['1','(0.5,-0.5,-0.5)'],['2','(0.5,0.5,-0.5)'],['3','(-0.5,0.5,-0.5)'],
                  ['4','(-0.5,-0.5,0.5)'], ['5','(0.5,-0.5,0.5)'], ['6','(0.5,0.5,0.5)'],  ['7','(-0.5,0.5,0.5)']
                ].map(([i, c]) => (
                  <div key={i} style={{ padding: '5px 7px', borderRadius: 5, background: '#f5f5f5', border: '1px solid #e0e0e0', fontSize: 11, fontFamily: 'JetBrains Mono,monospace' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>v{i}</span><br/>{c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showNormals && (
            <div className="calc-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('gfx.faceNormals')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {[['+X','(1,0,0)','#cc2222'],['-X','(-1,0,0)','#cc2222'],
                  ['+Y','(0,1,0)','#22aa22'],['-Y','(0,-1,0)','#22aa22'],
                  ['+Z','(0,0,1)','#2255cc'],['-Z','(0,0,-1)','#2255cc']
                ].map(([f,v,c]) => (
                  <div key={f} style={{ padding: '5px 7px', borderRadius: 5, background: '#f5f5f5', border: '1px solid #e0e0e0', fontSize: 11, fontFamily: 'JetBrains Mono,monospace' }}>
                    <span style={{ color: c, fontWeight: 700 }}>{f}</span><br/>{v}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>3D 그래픽스 수학 개념</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.8 }}>
            3D 그래픽스 파이프라인에서 MVP(Model-View-Projection) 행렬은 3D 물체를 2D 화면에 투영하는 핵심 변환입니다.
            <strong> Model 행렬</strong>은 물체의 위치·회전·크기를, <strong>View 행렬</strong>은 카메라 시점을, <strong>Projection 행렬</strong>은 원근 투영을 담당합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {[
              { title: '조명 모델', desc: 'Directional(태양광), Point(전구), Spot(손전등) 세 가지 광원 타입을 실시간으로 전환하며 효과를 비교할 수 있습니다.' },
              { title: '그림자 매핑', desc: '광원에서 깊이 버퍼를 생성해 그림자를 렌더링합니다. Basic·PCF·PCF Soft 세 가지 품질을 선택할 수 있습니다.' },
              { title: 'Frustum (시야체)', desc: 'FOV, Near/Far 평면, Aspect Ratio로 정의되는 절두체입니다. 이 영역 밖의 물체는 렌더링되지 않습니다(클리핑).' },
              { title: '법선 벡터', desc: '각 면에 수직인 벡터로 조명 계산의 핵심입니다. 법선 방향과 광원 방향의 내적으로 밝기를 결정합니다.' },
            ].map(({ title, desc }) => (
              <div key={title} style={{ padding: '10px 12px', borderRadius: 6, background: '#f9f9f9', border: '1px solid #eee' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
