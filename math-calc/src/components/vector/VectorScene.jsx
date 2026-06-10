import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeLabelSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(32, 32, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 33);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas), depthTest: false, transparent: true,
  }));
  sp.scale.set(0.4, 0.4, 1);
  return sp;
}

export default function VectorScene({ vecA, vecB, crossProduct }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth || 500;
    const h = mount.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xfafafa);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);

    scene.add(new THREE.GridHelper(8, 8, 0xdddddd, 0xeeeeee));
    scene.add(new THREE.AxesHelper(2));

    const vA = new THREE.Vector3(...vecA);
    const vB = new THREE.Vector3(...vecB);

    const maxLen = Math.max(vA.length(), vB.length(), 1);
    const scale = 3 / maxLen;

    const addArrow = (vec, colorHex, labelText) => {
      const scaled = vec.clone().multiplyScalar(scale);
      const len = scaled.length();
      if (len < 1e-10) return;
      const dir = scaled.clone().normalize();
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(), len, colorHex, Math.min(0.4, len * 0.2), Math.min(0.2, len * 0.1));
      scene.add(arrow);
      const label = makeLabelSprite(labelText, '#' + colorHex.toString(16).padStart(6, '0'));
      label.position.copy(scaled.clone().multiplyScalar(1.12));
      scene.add(label);
    };

    addArrow(vA, 0x16a34a, 'A');
    addArrow(vB, 0x2563eb, 'B');
    if (crossProduct) {
      const vC = new THREE.Vector3(...crossProduct);
      if (vC.length() > 1e-10) addArrow(vC, 0xdc2626, 'A×B');
    }

    // Orbit
    let theta = 0.6, phi = 1.1;
    const R = 9;
    let isDragging = false, prev = { x: 0, y: 0 };

    const updateCam = () => {
      camera.position.set(
        R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta),
      );
      camera.lookAt(0, 0, 0);
    };
    updateCam();

    const onDown = e => { isDragging = true; prev = { x: e.clientX, y: e.clientY }; };
    const onUp = () => { isDragging = false; };
    const onMove = e => {
      if (!isDragging) return;
      theta -= (e.clientX - prev.x) * 0.012;
      phi = Math.max(0.15, Math.min(Math.PI - 0.15, phi + (e.clientY - prev.y) * 0.012));
      prev = { x: e.clientX, y: e.clientY };
      updateCam();
    };
    const onWheel = e => {
      // no-op, prevent page scroll inside canvas
      e.preventDefault();
    };

    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [vecA, vecB, crossProduct]);

  return (
    <div ref={mountRef}
      style={{ width: '100%', height: 420, borderRadius: 8, overflow: 'hidden', cursor: 'grab', background: '#fafafa' }}
    />
  );
}
