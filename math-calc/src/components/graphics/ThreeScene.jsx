import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene({ modelMat, viewMat, projMat }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth || 480;
    const h = el.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x080c18, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x1e2d4a, 0x1e2d4a);
    scene.add(gridHelper);

    // Axes
    const axesMat = new THREE.LineBasicMaterial({ vertexColors: true });
    const axesGeo = new THREE.BufferGeometry();
    const axesPos = new Float32Array([0,0,0, 3,0,0, 0,0,0, 0,3,0, 0,0,0, 0,0,3]);
    const axesCol = new Float32Array([1,0,0, 1,0,0, 0,1,0, 0,1,0, 0,0,1, 0,0,1]);
    axesGeo.setAttribute('position', new THREE.BufferAttribute(axesPos, 3));
    axesGeo.setAttribute('color', new THREE.BufferAttribute(axesCol, 3));
    scene.add(new THREE.LineSegments(axesGeo, axesMat));

    // Cube wireframe
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x00d4ff });
    const cube = new THREE.LineSegments(edges, wireMat);
    scene.add(cube);

    // Solid cube (subtle)
    const solidMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.15 });
    const solid = new THREE.Mesh(geo.clone(), solidMat);
    scene.add(solid);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0, 0);

    // Orbit controls (manual)
    let isDragging = false, prevX = 0, prevY = 0;
    let theta = 0.6, phi = 0.5, radius = 8;

    const updateCamera = () => {
      camera.position.set(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onMouseDown = e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onMouseMove = e => {
      if (!isDragging) return;
      const dx = (e.clientX - prevX) * 0.01;
      const dy = (e.clientY - prevY) * 0.01;
      theta -= dx;
      phi = Math.max(-1.4, Math.min(1.4, phi + dy));
      prevX = e.clientX; prevY = e.clientY;
      updateCamera();
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = e => {
      radius = Math.max(2, Math.min(20, radius + e.deltaY * 0.01));
      updateCamera();
    };
    const onTouchStart = e => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; };
    const onTouchMove = e => {
      if (!isDragging) return;
      const dx = (e.touches[0].clientX - prevX) * 0.01;
      const dy = (e.touches[0].clientY - prevY) * 0.01;
      theta -= dx; phi = Math.max(-1.4, Math.min(1.4, phi + dy));
      prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
      updateCamera();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);

    stateRef.current = { cube, solid, renderer, camera, scene };

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      if (nw > 0 && nh > 0) {
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const { cube, solid } = stateRef.current;
    if (!cube || !modelMat) return;
    const m = modelMat;
    const mat = new THREE.Matrix4().set(
      m[0][0], m[0][1], m[0][2], m[0][3],
      m[1][0], m[1][1], m[1][2], m[1][3],
      m[2][0], m[2][1], m[2][2], m[2][3],
      m[3][0], m[3][1], m[3][2], m[3][3],
    );
    cube.matrixAutoUpdate = false;
    solid.matrixAutoUpdate = false;
    cube.matrix.copy(mat);
    solid.matrix.copy(mat);
  }, [modelMat]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab', borderRadius: 12 }} />
  );
}
