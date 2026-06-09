import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const CUBE_VERTS = [
  [-0.5,-0.5,-0.5],[-0.5, 0.5,-0.5],
  [ 0.5,-0.5,-0.5],[ 0.5, 0.5,-0.5],
  [-0.5,-0.5, 0.5],[-0.5, 0.5, 0.5],
  [ 0.5,-0.5, 0.5],[ 0.5, 0.5, 0.5],
];
const FACE_DATA = [
  { c:[ 0.5,0,0], n:[ 1,0,0], color:0xcc2222 },
  { c:[-0.5,0,0], n:[-1,0,0], color:0xcc2222 },
  { c:[0, 0.5,0], n:[0, 1,0], color:0x22aa22 },
  { c:[0,-0.5,0], n:[0,-1,0], color:0x22aa22 },
  { c:[0,0, 0.5], n:[0,0, 1], color:0x2255cc },
  { c:[0,0,-0.5], n:[0,0,-1], color:0x2255cc },
];
const SHADOW_TYPES = {
  basic: THREE.BasicShadowMap,
  pcf: THREE.PCFShadowMap,
  pcfsoft: THREE.PCFSoftShadowMap,
};

function makeNumberSprite(n) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#15803d';
  ctx.beginPath(); ctx.arc(32,32,27,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(n), 32, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas), depthTest: false, transparent: true,
  }));
  sp.scale.set(0.28,0.28,1);
  return sp;
}

// ── thick tube between two points ───────────────────────────────────────
function makeTube(p1, p2, radius, color) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  if (len < 1e-6) return new THREE.Object3D();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, len, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  mesh.position.copy(new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
  return mesh;
}

// ── cylinder+cone arrow ──────────────────────────────────────────────────
function makeCylinderArrow(origin, dir, length, color) {
  const n = dir.clone().normalize();
  const shaftLen = length * 0.7;
  const headLen = length * 0.3;
  const group = new THREE.Group();

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, shaftLen, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  shaft.position.copy(origin.clone().addScaledVector(n, shaftLen / 2));
  shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), n);
  group.add(shaft);

  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.075, headLen, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  head.position.copy(origin.clone().addScaledVector(n, shaftLen + headLen / 2));
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), n);
  group.add(head);

  return group;
}

// ── frustum drawn as thick tubes (camera local space) ───────────────────
function buildFrustumGroup(fov, aspect, near, far) {
  const tanH = Math.tan((fov * Math.PI / 180) / 2);
  const nH = near * tanH, nW = nH * aspect;
  const fH = far  * tanH, fW = fH * aspect;
  const n = [
    new THREE.Vector3(-nW, nH,-near), new THREE.Vector3( nW, nH,-near),
    new THREE.Vector3( nW,-nH,-near), new THREE.Vector3(-nW,-nH,-near),
  ];
  const f = [
    new THREE.Vector3(-fW, fH,-far), new THREE.Vector3( fW, fH,-far),
    new THREE.Vector3( fW,-fH,-far), new THREE.Vector3(-fW,-fH,-far),
  ];
  const edges = [
    [n[0],n[1]],[n[1],n[2]],[n[2],n[3]],[n[3],n[0]],
    [f[0],f[1]],[f[1],f[2]],[f[2],f[3]],[f[3],f[0]],
    [n[0],f[0]],[n[1],f[1]],[n[2],f[2]],[n[3],f[3]],
    // origin → near center
    [new THREE.Vector3(0,0,0), n[0].clone().add(n[2]).multiplyScalar(0.5)],
  ];
  const color = 0xff9900;
  const group = new THREE.Group();
  edges.forEach(([a,b]) => group.add(makeTube(a, b, 0.028, color)));
  // camera dot
  group.add(Object.assign(
    new THREE.Mesh(new THREE.SphereGeometry(0.13,10,10), new THREE.MeshBasicMaterial({ color: 0xff5500 })),
    { position: new THREE.Vector3(0,0,0) }
  ));
  group.matrixAutoUpdate = false;
  return group;
}

function disposeGroup(g, scene) {
  if (!g) return;
  g.traverse(o => {
    o.geometry?.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
      else o.material.dispose();
    }
  });
  scene?.remove(g);
}

export default function ThreeScene({ modelMat, showVertices, showNormals, frustumCam, lighting }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth || 700, h = el.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xf8f8f8, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const grid = new THREE.GridHelper(12, 24, 0xcccccc, 0xe5e5e5);
    grid.position.y = -0.5;
    scene.add(grid);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.9, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.502;
    ground.receiveShadow = true;
    scene.add(ground);

    // World axes
    const axGeo = new THREE.BufferGeometry();
    axGeo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([0,0,0,4,0,0, 0,0,0,0,4,0, 0,0,0,0,0,4]), 3));
    axGeo.setAttribute('color', new THREE.BufferAttribute(
      new Float32Array([0.8,0,0,0.8,0,0, 0,0.65,0,0,0.65,0, 0,0,0.8,0,0,0.8]), 3));
    scene.add(new THREE.LineSegments(axGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

    // Cube
    const cubeGeo = new THREE.BoxGeometry(1,1,1);
    const cubeSolid = new THREE.Mesh(cubeGeo,
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35, metalness: 0.05 }));
    cubeSolid.castShadow = true; cubeSolid.receiveShadow = true; cubeSolid.matrixAutoUpdate = false;
    scene.add(cubeSolid);

    const cubeEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeGeo),
      new THREE.LineBasicMaterial({ color: 0x111111 }));
    cubeEdge.matrixAutoUpdate = false;
    scene.add(cubeEdge);

    // Vertex labels
    const vertGroup = new THREE.Group();
    vertGroup.matrixAutoUpdate = false; vertGroup.visible = false;
    CUBE_VERTS.forEach((pos, i) => {
      const sp = makeNumberSprite(i);
      sp.position.set(pos[0]*1.35, pos[1]*1.35, pos[2]*1.35);
      vertGroup.add(sp);
    });
    scene.add(vertGroup);

    // Normal arrows (cylinder-based, thick)
    const normGroup = new THREE.Group();
    normGroup.matrixAutoUpdate = false; normGroup.visible = false;
    FACE_DATA.forEach(({ c, n, color }) => {
      normGroup.add(makeCylinderArrow(
        new THREE.Vector3(...c),
        new THREE.Vector3(...n),
        0.55, color
      ));
    });
    scene.add(normGroup);

    // Frustum (tube-based, thick)
    let frustumGroup = buildFrustumGroup(45, 16/9, 0.5, 5);
    frustumGroup.matrix.identity();
    scene.add(frustumGroup);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5,8,5); dirLight.castShadow = true;
    dirLight.shadow.mapSize.setScalar(2048);
    dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left=-8; dirLight.shadow.camera.right=8;
    dirLight.shadow.camera.top=8; dirLight.shadow.camera.bottom=-8;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    const dirHelper = new THREE.DirectionalLightHelper(dirLight, 0.8, 0xffaa00);
    scene.add(dirHelper);
    const dirShadowHelper = new THREE.CameraHelper(dirLight.shadow.camera);
    dirShadowHelper.visible = false;
    scene.add(dirShadowHelper);

    const spotLight = new THREE.SpotLight(0xffffff, 1.8);
    spotLight.position.set(5,8,5); spotLight.target.position.set(0,0,0);
    spotLight.angle = Math.PI/7; spotLight.penumbra = 0.25; spotLight.decay = 1.5;
    spotLight.castShadow = true; spotLight.shadow.mapSize.setScalar(2048);
    spotLight.shadow.camera.near=0.5; spotLight.shadow.camera.far=40;
    spotLight.shadow.bias=-0.0005; spotLight.visible=false;
    scene.add(spotLight); scene.add(spotLight.target);
    const spotHelper = new THREE.SpotLightHelper(spotLight, 0xffaa00);
    spotHelper.visible = false; scene.add(spotHelper);

    const pointLight = new THREE.PointLight(0xffffff, 2.0, 30);
    pointLight.position.set(5,8,5); pointLight.castShadow=true;
    pointLight.shadow.mapSize.setScalar(1024); pointLight.shadow.bias=-0.002;
    pointLight.visible=false; scene.add(pointLight);
    const pointHelper = new THREE.PointLightHelper(pointLight, 0.3, 0xffaa00);
    pointHelper.visible=false; scene.add(pointHelper);

    // Orbit camera
    const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 1000);
    let theta = 0.65, phi = 0.42, radius = 11;

    const updateOrbit = () => {
      camera.position.set(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(0,0,0);
    };
    updateOrbit();

    let drag=false, px=0, py=0;
    const onDown = e => { drag=true; px=e.clientX; py=e.clientY; };
    const onMove = e => {
      if (!drag) return;
      theta -= (e.clientX-px)*0.008;
      phi = Math.max(-1.4, Math.min(1.4, phi+(e.clientY-py)*0.008));
      px=e.clientX; py=e.clientY; updateOrbit();
    };
    const onUp = () => { drag=false; };
    const onWheel = e => {
      radius = Math.max(2, Math.min(25, radius+e.deltaY*0.015));
      updateOrbit();
      setZoom(radius);
    };
    const onTS = e => { drag=true; px=e.touches[0].clientX; py=e.touches[0].clientY; };
    const onTM = e => {
      if (!drag) return;
      theta -= (e.touches[0].clientX-px)*0.008;
      phi = Math.max(-1.4, Math.min(1.4, phi+(e.touches[0].clientY-py)*0.008));
      px=e.touches[0].clientX; py=e.touches[0].clientY; updateOrbit();
    };
    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    renderer.domElement.addEventListener('touchstart', onTS, { passive: true });
    window.addEventListener('touchmove', onTM);
    window.addEventListener('touchend', onUp);

    stateRef.current = {
      renderer, scene, camera,
      cubeSolid, cubeEdge, ground,
      vertGroup, normGroup,
      frustumGroup,
      ambient, dirLight, dirHelper, dirShadowHelper,
      spotLight, spotHelper, pointLight, pointHelper,
      setRadius(r) {
        radius = Math.max(2, Math.min(25, r));
        updateOrbit();
        setZoom(radius);
      },
    };

    let animId;
    const animate = () => { animId = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

    const ro = new ResizeObserver(() => {
      const nw=el.clientWidth, nh=el.clientHeight;
      if (nw>0 && nh>0) { renderer.setSize(nw,nh); camera.aspect=nw/nh; camera.updateProjectionMatrix(); }
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTS);
      window.removeEventListener('touchmove', onTM);
      window.removeEventListener('touchend', onUp);
      ro.disconnect(); renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // Model matrix
  useEffect(() => {
    const { cubeSolid, cubeEdge, vertGroup, normGroup } = stateRef.current;
    if (!cubeSolid || !modelMat) return;
    const m = modelMat;
    const mat = new THREE.Matrix4().set(
      m[0][0],m[0][1],m[0][2],m[0][3],
      m[1][0],m[1][1],m[1][2],m[1][3],
      m[2][0],m[2][1],m[2][2],m[2][3],
      m[3][0],m[3][1],m[3][2],m[3][3],
    );
    cubeSolid.matrix.copy(mat); cubeEdge.matrix.copy(mat);
    vertGroup.matrix.copy(mat); normGroup.matrix.copy(mat);
  }, [modelMat]);

  useEffect(() => {
    const { vertGroup } = stateRef.current;
    if (vertGroup) vertGroup.visible = !!showVertices;
  }, [showVertices]);

  useEffect(() => {
    const { normGroup } = stateRef.current;
    if (normGroup) normGroup.visible = !!showNormals;
  }, [showNormals]);

  // Frustum camera — rebuild tubes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene || !frustumCam) return;

    disposeGroup(s.frustumGroup, s.scene);

    const fg = buildFrustumGroup(
      frustumCam.fov, frustumCam.aspect ?? 16/9,
      Math.max(0.05, frustumCam.near),
      Math.max(frustumCam.near + 0.1, frustumCam.far)
    );

    // Apply camera world transform
    const fCam = new THREE.PerspectiveCamera(frustumCam.fov, frustumCam.aspect ?? 16/9, frustumCam.near, frustumCam.far);
    fCam.position.set(frustumCam.x, frustumCam.y, frustumCam.z);
    fCam.lookAt(0,0,0);
    fCam.updateMatrixWorld();
    fg.matrix.copy(fCam.matrixWorld);

    s.scene.add(fg);
    s.frustumGroup = fg;
  }, [frustumCam]);

  // Lighting
  useEffect(() => {
    const s = stateRef.current;
    if (!s.dirLight || !lighting) return;
    const { type,x,y,z,intensity,color,shadowEnabled,shadowMapType,shadowMapSize,
            showHelper,showShadowCam,ambientIntensity,spotAngle,spotPenumbra } = lighting;

    s.renderer.shadowMap.type = SHADOW_TYPES[shadowMapType] ?? THREE.PCFSoftShadowMap;
    s.ambient.intensity = ambientIntensity ?? 0.35;

    s.dirLight.visible=false; s.spotLight.visible=false; s.pointLight.visible=false;
    s.dirHelper.visible=false; s.dirShadowHelper.visible=false;
    s.spotHelper.visible=false; s.pointHelper.visible=false;

    const colorVal = new THREE.Color(color ?? '#ffffff');

    if (type === 'directional') {
      const L = s.dirLight;
      L.color.copy(colorVal); L.intensity=intensity; L.position.set(x,y,z);
      L.castShadow=shadowEnabled;
      if (shadowEnabled) { L.shadow.mapSize.setScalar(shadowMapSize); L.shadow.map=null; }
      L.visible=true;
      if (showHelper) { s.dirHelper.update?.(); s.dirHelper.visible=true; }
      if (showShadowCam && shadowEnabled) { s.dirShadowHelper.update?.(); s.dirShadowHelper.visible=true; }
    } else if (type === 'spot') {
      const L = s.spotLight;
      L.color.copy(colorVal); L.intensity=intensity; L.position.set(x,y,z);
      L.angle=(spotAngle??25)*(Math.PI/180); L.penumbra=spotPenumbra??0.25;
      L.castShadow=shadowEnabled;
      if (shadowEnabled) { L.shadow.mapSize.setScalar(shadowMapSize); L.shadow.map=null; }
      L.visible=true;
      if (showHelper) { s.spotHelper.update?.(); s.spotHelper.visible=true; }
    } else {
      const L = s.pointLight;
      L.color.copy(colorVal); L.intensity=intensity; L.position.set(x,y,z);
      L.castShadow=shadowEnabled;
      if (shadowEnabled) { L.shadow.mapSize.setScalar(Math.min(shadowMapSize,1024)); L.shadow.map=null; }
      L.visible=true;
      if (showHelper) s.pointHelper.visible=true;
    }

    s.cubeSolid.castShadow=shadowEnabled; s.cubeSolid.receiveShadow=shadowEnabled;
    s.ground.receiveShadow=shadowEnabled;
  }, [lighting]);

  return (
    <div style={{ width:'100%', height:'100%', position:'relative' }}>
      <div ref={mountRef} style={{ width:'100%', height:'100%', cursor:'grab' }} />

      {/* Zoom slider overlay */}
      <div style={{
        position:'absolute', bottom:12, right:12,
        display:'flex', alignItems:'center', gap:6,
        background:'rgba(255,255,255,0.92)', borderRadius:8,
        padding:'5px 10px', border:'1px solid #e0e0e0',
        userSelect:'none',
      }}>
        <button
          onClick={() => stateRef.current.setRadius?.(zoom - 1.5)}
          style={{ width:22, height:22, border:'1px solid #cccccc', borderRadius:4, background:'#fff', cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>
          −
        </button>
        <input
          type="range" min={2} max={25} step={0.5} value={zoom}
          onChange={e => stateRef.current.setRadius?.(Number(e.target.value))}
          style={{ width:80 }}
        />
        <button
          onClick={() => stateRef.current.setRadius?.(zoom + 1.5)}
          style={{ width:22, height:22, border:'1px solid #cccccc', borderRadius:4, background:'#fff', cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>
          +
        </button>
        <span style={{ fontSize:10, color:'#888888', fontFamily:'Arial,sans-serif' }}>
          zoom
        </span>
      </div>
    </div>
  );
}
