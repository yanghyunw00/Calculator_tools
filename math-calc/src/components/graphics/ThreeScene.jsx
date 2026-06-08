import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CUBE_VERTS = [
  [-0.5, -0.5, -0.5], // 0
  [ 0.5, -0.5, -0.5], // 1
  [ 0.5,  0.5, -0.5], // 2
  [-0.5,  0.5, -0.5], // 3
  [-0.5, -0.5,  0.5], // 4
  [ 0.5, -0.5,  0.5], // 5
  [ 0.5,  0.5,  0.5], // 6
  [-0.5,  0.5,  0.5], // 7
];

const FACE_DATA = [
  { c: [ 0.5, 0, 0], n: [ 1, 0, 0], color: 0xcc2222 },
  { c: [-0.5, 0, 0], n: [-1, 0, 0], color: 0xcc2222 },
  { c: [0,  0.5, 0], n: [0,  1, 0], color: 0x22aa22 },
  { c: [0, -0.5, 0], n: [0, -1, 0], color: 0x22aa22 },
  { c: [0, 0,  0.5], n: [0, 0,  1], color: 0x2255cc },
  { c: [0, 0, -0.5], n: [0, 0, -1], color: 0x2255cc },
];

function makeNumberSprite(n) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(32, 32, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(0.28, 0.28, 1);
  return sp;
}

export default function ThreeScene({ modelMat, showVertices, showNormals, frustumCam }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth || 700, h = el.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xfafafa, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Grid
    const grid = new THREE.GridHelper(12, 24, 0xcccccc, 0xe5e5e5);
    scene.add(grid);

    // World axes (X=red, Y=green, Z=blue)
    const axGeo = new THREE.BufferGeometry();
    axGeo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([0,0,0,4,0,0, 0,0,0,0,4,0, 0,0,0,0,0,4]), 3));
    axGeo.setAttribute('color', new THREE.BufferAttribute(
      new Float32Array([0.8,0,0,0.8,0,0, 0,0.65,0,0,0.65,0, 0,0,0.8,0,0,0.8]), 3));
    scene.add(new THREE.LineSegments(axGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

    // Cube wireframe
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeGeo),
      new THREE.LineBasicMaterial({ color: 0x222222 })
    );
    cube.matrixAutoUpdate = false;
    scene.add(cube);

    // Cube fill (semi-transparent)
    const solid = new THREE.Mesh(
      cubeGeo.clone(),
      new THREE.MeshBasicMaterial({ color: 0x16a34a, transparent: true, opacity: 0.07, side: THREE.DoubleSide })
    );
    solid.matrixAutoUpdate = false;
    scene.add(solid);

    // Vertex labels
    const vertGroup = new THREE.Group();
    vertGroup.matrixAutoUpdate = false;
    vertGroup.visible = false;
    CUBE_VERTS.forEach((pos, i) => {
      const sp = makeNumberSprite(i);
      sp.position.set(pos[0] * 1.35, pos[1] * 1.35, pos[2] * 1.35);
      vertGroup.add(sp);
    });
    scene.add(vertGroup);

    // Normal arrows
    const normGroup = new THREE.Group();
    normGroup.matrixAutoUpdate = false;
    normGroup.visible = false;
    FACE_DATA.forEach(({ c, n, color }) => {
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(...n).normalize(),
        new THREE.Vector3(...c),
        0.5, color, 0.13, 0.07
      );
      normGroup.add(arrow);
    });
    scene.add(normGroup);

    // Frustum camera (PerspectiveCamera for visualization)
    const fCam = new THREE.PerspectiveCamera(45, 16 / 9, 0.5, 5);
    fCam.position.set(3, 2.5, 3);
    fCam.lookAt(0, 0, 0);
    fCam.updateProjectionMatrix();

    const camHelper = new THREE.CameraHelper(fCam);
    scene.add(camHelper);

    // Orange dot at frustum camera position
    const camDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff6600 })
    );
    camDot.position.copy(fCam.position);
    scene.add(camDot);

    // Main orbit camera (the viewer)
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    let theta = 0.65, phi = 0.42, radius = 11;
    const updateOrbit = () => {
      camera.position.set(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(0, 0, 0);
    };
    updateOrbit();

    let drag = false, px = 0, py = 0;
    const onDown = e => { drag = true; px = e.clientX; py = e.clientY; };
    const onMove = e => {
      if (!drag) return;
      theta -= (e.clientX - px) * 0.008;
      phi = Math.max(-1.4, Math.min(1.4, phi + (e.clientY - py) * 0.008));
      px = e.clientX; py = e.clientY;
      updateOrbit();
    };
    const onUp = () => { drag = false; };
    const onWheel = e => { radius = Math.max(2, Math.min(30, radius + e.deltaY * 0.015)); updateOrbit(); };
    const onTStart = e => { drag = true; px = e.touches[0].clientX; py = e.touches[0].clientY; };
    const onTMove = e => {
      if (!drag) return;
      theta -= (e.touches[0].clientX - px) * 0.008;
      phi = Math.max(-1.4, Math.min(1.4, phi + (e.touches[0].clientY - py) * 0.008));
      px = e.touches[0].clientX; py = e.touches[0].clientY;
      updateOrbit();
    };

    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    renderer.domElement.addEventListener('touchstart', onTStart, { passive: true });
    window.addEventListener('touchmove', onTMove);
    window.addEventListener('touchend', onUp);

    stateRef.current = { cube, solid, vertGroup, normGroup, fCam, camHelper, camDot, renderer, camera, scene };

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth, nh = el.clientHeight;
      if (nw > 0 && nh > 0) {
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTStart);
      window.removeEventListener('touchmove', onTMove);
      window.removeEventListener('touchend', onUp);
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // Model matrix
  useEffect(() => {
    const { cube, solid, vertGroup, normGroup } = stateRef.current;
    if (!cube || !modelMat) return;
    const m = modelMat;
    const mat = new THREE.Matrix4().set(
      m[0][0], m[0][1], m[0][2], m[0][3],
      m[1][0], m[1][1], m[1][2], m[1][3],
      m[2][0], m[2][1], m[2][2], m[2][3],
      m[3][0], m[3][1], m[3][2], m[3][3],
    );
    cube.matrix.copy(mat);
    solid.matrix.copy(mat);
    vertGroup.matrix.copy(mat);
    normGroup.matrix.copy(mat);
  }, [modelMat]);

  useEffect(() => {
    const { vertGroup } = stateRef.current;
    if (vertGroup) vertGroup.visible = !!showVertices;
  }, [showVertices]);

  useEffect(() => {
    const { normGroup } = stateRef.current;
    if (normGroup) normGroup.visible = !!showNormals;
  }, [showNormals]);

  // Frustum camera update
  useEffect(() => {
    const { fCam, camHelper, camDot } = stateRef.current;
    if (!fCam || !frustumCam) return;
    fCam.fov = frustumCam.fov;
    fCam.near = frustumCam.near;
    fCam.far = frustumCam.far;
    fCam.aspect = frustumCam.aspect ?? 16 / 9;
    fCam.position.set(frustumCam.x, frustumCam.y, frustumCam.z);
    fCam.lookAt(0, 0, 0);
    fCam.updateProjectionMatrix();
    camHelper.update();
    if (camDot) camDot.position.set(frustumCam.x, frustumCam.y, frustumCam.z);
  }, [frustumCam]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
  );
}
