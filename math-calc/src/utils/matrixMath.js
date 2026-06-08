import * as math from 'mathjs';

export function parseMatrix(grid) {
  return grid.map(row =>
    row.map(cell => {
      const val = cell.trim();
      if (!val) return 0;
      try {
        return math.evaluate(val);
      } catch {
        return 0;
      }
    })
  );
}

export function formatNum(n, decimals = 6) {
  if (typeof n !== 'number' && typeof n !== 'bigint') n = Number(n);
  const rounded = math.round(n, decimals);
  if (Number.isInteger(rounded)) return String(rounded);
  return String(parseFloat(rounded.toFixed(decimals)));
}

export function matrixToLatex(m, decimals = 6) {
  const rows = m.map(row =>
    row.map(v => formatNum(typeof v === 'object' ? math.re(v) : v, decimals)).join(' & ')
  );
  return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
}

export function vectorToLatex(v) {
  return `\\begin{pmatrix} ${v.map(x => formatNum(x)).join(' \\\\ ')} \\end{pmatrix}`;
}

export function calcDeterminant(m) {
  const mat = math.matrix(m);
  const det = math.det(mat);
  const steps = [];
  const n = m.length;
  if (n === 1) {
    steps.push({ label: 'Step 1: 1×1 행렬의 행렬식', latex: `\\det(A) = ${formatNum(m[0][0])}` });
  } else if (n === 2) {
    steps.push({
      label: 'Step 1: 2×2 공식 적용: ad - bc',
      latex: `\\det(A) = ${formatNum(m[0][0])} \\cdot ${formatNum(m[1][1])} - ${formatNum(m[0][1])} \\cdot ${formatNum(m[1][0])}`
    });
    steps.push({ label: '결과', latex: `= ${formatNum(det)}` });
  } else {
    steps.push({ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` });
    steps.push({ label: 'Step 2: LU 분해 후 대각선 곱으로 계산', latex: `\\det(A) = ${formatNum(det)}` });
  }
  return { value: det, steps, latex: `${formatNum(det)}` };
}

export function calcInverse(m) {
  const det = math.det(math.matrix(m));
  if (Math.abs(det) < 1e-10) {
    throw new Error(`역행렬이 존재하지 않습니다 (행렬식 = ${formatNum(det)})`);
  }
  const inv = math.inv(math.matrix(m))._data;
  const steps = [
    { label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` },
    { label: `Step 2: 행렬식 계산: det(A) = ${formatNum(det)}`, latex: `\\det(A) = ${formatNum(det)} \\neq 0` },
    { label: 'Step 3: 가우스-조르당 소거법으로 역행렬 계산', latex: `A^{-1} = ${matrixToLatex(inv)}` },
  ];
  return { value: inv, steps, latex: matrixToLatex(inv) };
}

export function calcTranspose(m) {
  const T = math.transpose(math.matrix(m))._data;
  const steps = [
    { label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` },
    { label: 'Step 2: 행과 열을 교환 (A[i][j] → A[j][i])', latex: `A^T = ${matrixToLatex(T)}` },
  ];
  return { value: T, steps, latex: matrixToLatex(T) };
}

export function calcRank(m) {
  const mat = math.matrix(m);
  const rows = m.length, cols = m[0].length;
  let A = m.map(r => [...r]);
  let rank = 0;
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];
  for (let col = 0; col < cols && rank < rows; col++) {
    let pivotRow = -1;
    for (let row = rank; row < rows; row++) {
      if (Math.abs(A[row][col]) > 1e-10) { pivotRow = row; break; }
    }
    if (pivotRow === -1) continue;
    [A[rank], A[pivotRow]] = [A[pivotRow], A[rank]];
    for (let row = 0; row < rows; row++) {
      if (row !== rank && Math.abs(A[row][col]) > 1e-10) {
        const factor = A[row][col] / A[rank][col];
        for (let c = 0; c < cols; c++) A[row][c] -= factor * A[rank][c];
      }
    }
    rank++;
    steps.push({ label: `Step ${steps.length + 1}: 열 ${col + 1} 소거 후`, latex: matrixToLatex(A) });
  }
  steps.push({ label: '결과', latex: `\\text{rank}(A) = ${rank}` });
  return { value: rank, steps, latex: `${rank}` };
}

export function calcPower(m, n) {
  let result = math.matrix(m);
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];
  if (n === 0) {
    const I = math.identity(m.length)._data;
    return { value: I, steps: [...steps, { label: '결과: A⁰ = I', latex: matrixToLatex(I) }], latex: matrixToLatex(I) };
  }
  if (n < 0) {
    result = math.matrix(math.inv(result)._data);
    n = -n;
  }
  let base = result._data ? result._data : result;
  let R = math.identity(m.length)._data;
  for (let i = 0; i < n; i++) {
    R = math.multiply(math.matrix(R), math.matrix(base))._data;
    if (i < 3) steps.push({ label: `Step ${i + 2}: A^${i + 1}`, latex: matrixToLatex(R) });
  }
  steps.push({ label: 'Result', latex: `A^n = ${matrixToLatex(R)}` });
  return { value: R, steps, latex: matrixToLatex(R) };
}

export function calcLU(m) {
  const n = m.length;
  let A = m.map(r => [...r]);
  let L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  let U = m.map(r => [...r]);
  const steps = [{ label: 'Step 1: 원본 행렬 A', latex: `A = ${matrixToLatex(m)}` }];
  for (let k = 0; k < n; k++) {
    for (let i = k + 1; i < n; i++) {
      const factor = U[i][k] / U[k][k];
      L[i][k] = factor;
      for (let j = k; j < n; j++) U[i][j] -= factor * U[k][j];
    }
    steps.push({ label: `Step ${k + 2}: 열 ${k + 1} 소거`, latex: `U = ${matrixToLatex(U)}` });
  }
  steps.push({ label: '결과: L (하삼각행렬)', latex: `L = ${matrixToLatex(L)}` });
  steps.push({ label: '결과: U (상삼각행렬)', latex: `U = ${matrixToLatex(U)}` });
  steps.push({ label: '검증: A = L × U', latex: `A = ${matrixToLatex(L)} \\cdot ${matrixToLatex(U)}` });
  return {
    L, U,
    steps,
    latex: `L = ${matrixToLatex(L)}, \\quad U = ${matrixToLatex(U)}`
  };
}

export function calcEigen(m) {
  const n = m.length;
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];
  try {
    const { values, vectors } = math.eigs(math.matrix(m));
    const vals = values.toArray ? values.toArray() : values;
    const vecs = vectors.toArray ? vectors.toArray() : vectors;

    let eigenLatex = vals.map((v, i) => {
      const re = math.re(v), im = math.im(v);
      const vLabel = `\\lambda_{${i+1}} = ${im !== 0 ? `${formatNum(re)} ${im >= 0 ? '+' : ''}${formatNum(im)}i` : formatNum(re)}`;
      const col = vecs.map(row => row[i]);
      return `${vLabel}, \\quad \\mathbf{v}_{${i+1}} = ${vectorToLatex(col.map(x => typeof x === 'object' ? math.re(x) : x))}`;
    }).join('\\\\ ');

    steps.push({ label: 'Step 2: 특성 다항식 det(A - λI) = 0 풀기', latex: `\\text{특성 방정식}` });
    steps.push({ label: '결과: 고유값과 고유벡터', latex: eigenLatex });
    return { values: vals, vectors: vecs, steps, latex: eigenLatex };
  } catch (e) {
    throw new Error('고유값 계산 실패: ' + e.message);
  }
}

export function calcMultiply(a, b) {
  if (a[0].length !== b.length) throw new Error(`차원 불일치: ${a.length}×${a[0].length} × ${b.length}×${b[0].length} 불가`);
  const result = math.multiply(math.matrix(a), math.matrix(b))._data;
  const steps = [
    { label: 'Step 1: 행렬 A', latex: `A = ${matrixToLatex(a)}` },
    { label: 'Step 2: 행렬 B', latex: `B = ${matrixToLatex(b)}` },
    { label: 'Step 3: C[i][j] = Σ A[i][k]·B[k][j]', latex: `A \\times B = ${matrixToLatex(result)}` },
  ];
  return { value: result, steps, latex: matrixToLatex(result) };
}

export function calcAdd(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error('행렬 크기가 같아야 합니다');
  const result = math.add(math.matrix(a), math.matrix(b))._data;
  return { value: result, steps: [{ label: '결과', latex: `A + B = ${matrixToLatex(result)}` }], latex: matrixToLatex(result) };
}

export function calcSubtract(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error('행렬 크기가 같아야 합니다');
  const result = math.subtract(math.matrix(a), math.matrix(b))._data;
  return { value: result, steps: [{ label: '결과', latex: `A - B = ${matrixToLatex(result)}` }], latex: matrixToLatex(result) };
}

export function calcSVD(m) {
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];
  try {
    const A = math.matrix(m);
    const AT = math.transpose(A);
    const ATA = math.multiply(AT, A);
    const { values, vectors: V } = math.eigs(ATA);
    const vals = (values.toArray ? values.toArray() : values).map(v => math.re(v));
    const singularValues = vals.map(v => Math.sqrt(Math.max(0, v)));
    const sortedIdx = singularValues.map((_, i) => i).sort((a, b) => singularValues[b] - singularValues[a]);
    const S_diag = sortedIdx.map(i => singularValues[i]);
    steps.push({ label: 'Step 2: AᵀA 계산', latex: `A^T A = ${matrixToLatex(ATA._data || ATA)}` });
    steps.push({ label: 'Step 3: 특이값 (σᵢ = √λᵢ)', latex: `\\Sigma = \\text{diag}(${S_diag.map(s => formatNum(s)).join(', ')})` });
    steps.push({ label: '결과: A = UΣVᵀ', latex: `\\text{특이값: } ${S_diag.map((s, i) => `\\sigma_{${i+1}} = ${formatNum(s)}`).join(', ')}` });
    return { singularValues: S_diag, steps, latex: `\\text{특이값: } ${S_diag.map(s => formatNum(s)).join(', ')}` };
  } catch (e) {
    throw new Error('SVD 계산 실패: ' + e.message);
  }
}
