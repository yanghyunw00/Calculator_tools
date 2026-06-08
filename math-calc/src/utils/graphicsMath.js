import * as math from 'mathjs';

export function translationMatrix(tx, ty, tz) {
  return [
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0,  1],
  ];
}

export function rotationMatrixX(deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return [
    [1, 0,  0, 0],
    [0, c, -s, 0],
    [0, s,  c, 0],
    [0, 0,  0, 1],
  ];
}

export function rotationMatrixY(deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return [
    [ c, 0, s, 0],
    [ 0, 1, 0, 0],
    [-s, 0, c, 0],
    [ 0, 0, 0, 1],
  ];
}

export function rotationMatrixZ(deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return [
    [c, -s, 0, 0],
    [s,  c, 0, 0],
    [0,  0, 1, 0],
    [0,  0, 0, 1],
  ];
}

export function scaleMatrix(sx, sy, sz) {
  return [
    [sx,  0,  0, 0],
    [ 0, sy,  0, 0],
    [ 0,  0, sz, 0],
    [ 0,  0,  0, 1],
  ];
}

export function modelMatrix({ tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 }) {
  const T = math.matrix(translationMatrix(tx, ty, tz));
  const Rx = math.matrix(rotationMatrixX(rx));
  const Ry = math.matrix(rotationMatrixY(ry));
  const Rz = math.matrix(rotationMatrixZ(rz));
  const S = math.matrix(scaleMatrix(sx, sy, sz));
  return math.multiply(T, math.multiply(Rx, math.multiply(Ry, math.multiply(Rz, S))))._data;
}

export function lookAtMatrix(eye, center, up) {
  const [ex, ey, ez] = eye;
  const [cx, cy, cz] = center;
  const [ux, uy, uz] = up;

  let fwd = normalize([cx - ex, cy - ey, cz - ez]);
  let right = normalize(cross(fwd, [ux, uy, uz]));
  let upNew = cross(right, fwd);

  return [
    [right[0],  right[1],  right[2],  -dot(right, [ex, ey, ez])],
    [upNew[0],  upNew[1],  upNew[2],  -dot(upNew, [ex, ey, ez])],
    [-fwd[0],  -fwd[1],  -fwd[2],    dot(fwd, [ex, ey, ez])],
    [0, 0, 0, 1],
  ];
}

export function perspectiveMatrix(fovDeg, aspect, near, far) {
  const f = 1.0 / Math.tan((fovDeg * Math.PI) / 180 / 2);
  return [
    [f / aspect, 0,  0,  0],
    [0, f,  0,  0],
    [0, 0,  (far + near) / (near - far),  (2 * far * near) / (near - far)],
    [0, 0, -1,  0],
  ];
}

export function orthographicMatrix(left, right, bottom, top, near, far) {
  return [
    [2 / (right - left), 0, 0, -(right + left) / (right - left)],
    [0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom)],
    [0, 0, -2 / (far - near), -(far + near) / (far - near)],
    [0, 0, 0, 1],
  ];
}

export function multiplyMat4(a, b) {
  return math.multiply(math.matrix(a), math.matrix(b))._data;
}

export function mat4ToLatex(m, decimals = 3) {
  const rows = m.map(row =>
    row.map(v => {
      const n = Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
      return String(n);
    }).join(' & ')
  );
  return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
}

export function mat4ToGLSL(m, name = 'matrix') {
  const cols = [0, 1, 2, 3].map(col =>
    m.map(row => row[col].toFixed(4) + 'f').join(', ')
  );
  return `mat4 ${name} = mat4(\n  ${cols.join(',\n  ')}\n);`;
}

export function mat4ToHLSL(m, name = 'matrix') {
  const rows = m.map(row => row.map(v => v.toFixed(4) + 'f').join(', '));
  return `float4x4 ${name} = float4x4(\n  ${rows.join(',\n  ')}\n);`;
}

function normalize(v) {
  const len = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return len > 0 ? v.map(x => x / len) : v;
}
function cross([ax, ay, az], [bx, by, bz]) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}
function dot(a, b) {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}
