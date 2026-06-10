import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as math from 'mathjs';

export default function CalcGraph3D({ expr, varX = 'x', varY = 'y' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth || 500, h = mount.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xfafafa);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    scene.add(new THREE.GridHelper(12, 12, 0xdddddd, 0xeeeeee));
    scene.add(new THREE.AxesHelper(4));

    // Build surface
    const segs = 60;
    const range = 4;
    const geometry = new THREE.BufferGeometry();
    const positions = [], colors = [], indices = [];
    const zVals = [];

    for (let iy = 0; iy <= segs; iy++) {
      for (let ix = 0; ix <= segs; ix++) {
        const xv = -range + (ix / segs) * range * 2;
        const yv = -range + (iy / segs) * range * 2;
        let zv = 0;
        try {
          const r = math.evaluate(expr, { [varX]: xv, [varY]: yv, pi: Math.PI, e: Math.E });
          zv = typeof r === 'number' && isFinite(r) ? Math.max(-6, Math.min(6, r)) : 0;
        } catch { zv = 0; }
        positions.push(xv, zv, yv);
        zVals.push(zv);
      }
    }

    // Color by height
    const zMin = Math.min(...zVals), zMax = Math.max(...zVals);
    const zRange = Math.max(zMax - zMin, 0.01);
    zVals.forEach(z => {
      const t = (z - zMin) / zRange;
      const r = Math.max(0, Math.min(1, 2 * t - 0.5));
      const g = Math.max(0, Math.min(1, 1 - Math.abs(2 * t - 0.8) * 2));
      const b = Math.max(0, Math.min(1, 1.5 - 2 * t));
      colors.push(r, g, b);
    });

    for (let iy = 0; iy < segs; iy++) {
      for (let ix = 0; ix < segs; ix++) {
        const a = iy * (segs + 1) + ix;
        const b2 = a + 1, c = a + segs + 1, d = c + 1;
        indices.push(a, b2, c, b2, d, c);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
      vertexColors: true, side: THREE.DoubleSide, shininess: 40,
    }));
    scene.add(mesh);

    // Wireframe overlay
    const wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0x000000, wireframe: true, transparent: true, opacity: 0.08,
    }));
    scene.add(wire);

    // Orbit
    let theta = 0.6, phi = 1.0;
    const R = 14;
    let isDragging = false, prev = { x: 0, y: 0 };
    const updateCam = () => {
      camera.position.set(R * Math.sin(phi) * Math.cos(theta), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(theta));
      camera.lookAt(0, (zMin + zMax) / 2, 0);
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

    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);

    let animId;
    const animate = () => { animId = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
    };
  }, [expr, varX, varY]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: 360, borderRadius: 8, overflow: 'hidden', cursor: 'grab', background: '#fafafa' }} />
  );
}
