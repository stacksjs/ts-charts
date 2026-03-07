// Inlined from robust-predicates@3.0.2
// Adaptive precision geometric predicates

export const epsilon: number = 1.1102230246251565e-16
export const splitter: number = 134217729
export const resulterrbound: number = (3 + 8 * epsilon) * epsilon

export function sum(elen: number, e: Float64Array, flen: number, f: Float64Array, h: Float64Array): number {
  let Q: number, Qnew: number, hh: number, bvirt: number
  let enow = e[0]
  let fnow = f[0]
  let eindex = 0
  let findex = 0
  if ((fnow > enow) === (fnow > -enow)) {
    Q = enow
    enow = e[++eindex]
  }
  else {
    Q = fnow
    fnow = f[++findex]
  }
  let hindex = 0
  if (eindex < elen && findex < flen) {
    if ((fnow > enow) === (fnow > -enow)) {
      Qnew = enow + Q
      hh = Q - (Qnew - enow)
      enow = e[++eindex]
    }
    else {
      Qnew = fnow + Q
      hh = Q - (Qnew - fnow)
      fnow = f[++findex]
    }
    Q = Qnew
    if (hh !== 0) {
      h[hindex++] = hh
    }
    while (eindex < elen && findex < flen) {
      if ((fnow > enow) === (fnow > -enow)) {
        Qnew = Q + enow
        bvirt = Qnew - Q
        hh = Q - (Qnew - bvirt) + (enow - bvirt)
        enow = e[++eindex]
      }
      else {
        Qnew = Q + fnow
        bvirt = Qnew - Q
        hh = Q - (Qnew - bvirt) + (fnow - bvirt)
        fnow = f[++findex]
      }
      Q = Qnew
      if (hh !== 0) {
        h[hindex++] = hh
      }
    }
  }
  while (eindex < elen) {
    Qnew = Q + enow
    bvirt = Qnew - Q
    hh = Q - (Qnew - bvirt) + (enow - bvirt)
    enow = e[++eindex]
    Q = Qnew
    if (hh !== 0) {
      h[hindex++] = hh
    }
  }
  while (findex < flen) {
    Qnew = Q + fnow
    bvirt = Qnew - Q
    hh = Q - (Qnew - bvirt) + (fnow - bvirt)
    fnow = f[++findex]
    Q = Qnew
    if (hh !== 0) {
      h[hindex++] = hh
    }
  }
  if (Q !== 0 || hindex === 0) {
    h[hindex++] = Q
  }
  return hindex
}

export function estimate(elen: number, e: Float64Array): number {
  let Q = e[0]
  for (let i = 1; i < elen; i++) Q += e[i]
  return Q
}

export function vec(n: number): Float64Array {
  return new Float64Array(n)
}

const ccwerrboundA: number = (3 + 16 * epsilon) * epsilon
const ccwerrboundB: number = (2 + 12 * epsilon) * epsilon
const ccwerrboundC: number = (9 + 64 * epsilon) * epsilon * epsilon

const B = vec(4)
const C1 = vec(8)
const C2 = vec(12)
const D = vec(16)
const u = vec(4)

function orient2dadapt(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, detsum: number): number {
  let acxtail: number, acytail: number, bcxtail: number, bcytail: number
  let bvirt: number, c: number, ahi: number, alo: number, bhi: number, blo: number
  let _i: number, _j: number, _0: number, s1: number, s0: number, t1: number, t0: number, u3: number

  const acx = ax - cx
  const bcx = bx - cx
  const acy = ay - cy
  const bcy = by - cy

  s1 = acx * bcy
  c = splitter * acx
  ahi = c - (c - acx)
  alo = acx - ahi
  c = splitter * bcy
  bhi = c - (c - bcy)
  blo = bcy - bhi
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo)
  t1 = acy * bcx
  c = splitter * acy
  ahi = c - (c - acy)
  alo = acy - ahi
  c = splitter * bcx
  bhi = c - (c - bcx)
  blo = bcx - bhi
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo)
  _i = s0 - t0
  bvirt = s0 - _i
  B[0] = s0 - (_i + bvirt) + (bvirt - t0)
  _j = s1 + _i
  bvirt = _j - s1
  _0 = s1 - (_j - bvirt) + (_i - bvirt)
  _i = _0 - t1
  bvirt = _0 - _i
  B[1] = _0 - (_i + bvirt) + (bvirt - t1)
  u3 = _j + _i
  bvirt = u3 - _j
  B[2] = _j - (u3 - bvirt) + (_i - bvirt)
  B[3] = u3

  let det = estimate(4, B)
  let errbound = ccwerrboundB * detsum
  if (det >= errbound || -det >= errbound) {
    return det
  }

  bvirt = ax - acx
  acxtail = ax - (acx + bvirt) + (bvirt - cx)
  bvirt = bx - bcx
  bcxtail = bx - (bcx + bvirt) + (bvirt - cx)
  bvirt = ay - acy
  acytail = ay - (acy + bvirt) + (bvirt - cy)
  bvirt = by - bcy
  bcytail = by - (bcy + bvirt) + (bvirt - cy)

  if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
    return det
  }

  errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det)
  det += (acx * bcytail + bcy * acxtail) - (acy * bcxtail + bcx * acytail)
  if (det >= errbound || -det >= errbound) return det

  s1 = acxtail * bcy
  c = splitter * acxtail
  ahi = c - (c - acxtail)
  alo = acxtail - ahi
  c = splitter * bcy
  bhi = c - (c - bcy)
  blo = bcy - bhi
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo)
  t1 = acytail * bcx
  c = splitter * acytail
  ahi = c - (c - acytail)
  alo = acytail - ahi
  c = splitter * bcx
  bhi = c - (c - bcx)
  blo = bcx - bhi
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo)
  _i = s0 - t0
  bvirt = s0 - _i
  u[0] = s0 - (_i + bvirt) + (bvirt - t0)
  _j = s1 + _i
  bvirt = _j - s1
  _0 = s1 - (_j - bvirt) + (_i - bvirt)
  _i = _0 - t1
  bvirt = _0 - _i
  u[1] = _0 - (_i + bvirt) + (bvirt - t1)
  u3 = _j + _i
  bvirt = u3 - _j
  u[2] = _j - (u3 - bvirt) + (_i - bvirt)
  u[3] = u3
  const C1len = sum(4, B, 4, u, C1)

  s1 = acx * bcytail
  c = splitter * acx
  ahi = c - (c - acx)
  alo = acx - ahi
  c = splitter * bcytail
  bhi = c - (c - bcytail)
  blo = bcytail - bhi
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo)
  t1 = acy * bcxtail
  c = splitter * acy
  ahi = c - (c - acy)
  alo = acy - ahi
  c = splitter * bcxtail
  bhi = c - (c - bcxtail)
  blo = bcxtail - bhi
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo)
  _i = s0 - t0
  bvirt = s0 - _i
  u[0] = s0 - (_i + bvirt) + (bvirt - t0)
  _j = s1 + _i
  bvirt = _j - s1
  _0 = s1 - (_j - bvirt) + (_i - bvirt)
  _i = _0 - t1
  bvirt = _0 - _i
  u[1] = _0 - (_i + bvirt) + (bvirt - t1)
  u3 = _j + _i
  bvirt = u3 - _j
  u[2] = _j - (u3 - bvirt) + (_i - bvirt)
  u[3] = u3
  const C2len = sum(C1len, C1, 4, u, C2)

  s1 = acxtail * bcytail
  c = splitter * acxtail
  ahi = c - (c - acxtail)
  alo = acxtail - ahi
  c = splitter * bcytail
  bhi = c - (c - bcytail)
  blo = bcytail - bhi
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo)
  t1 = acytail * bcxtail
  c = splitter * acytail
  ahi = c - (c - acytail)
  alo = acytail - ahi
  c = splitter * bcxtail
  bhi = c - (c - bcxtail)
  blo = bcxtail - bhi
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo)
  _i = s0 - t0
  bvirt = s0 - _i
  u[0] = s0 - (_i + bvirt) + (bvirt - t0)
  _j = s1 + _i
  bvirt = _j - s1
  _0 = s1 - (_j - bvirt) + (_i - bvirt)
  _i = _0 - t1
  bvirt = _0 - _i
  u[1] = _0 - (_i + bvirt) + (bvirt - t1)
  u3 = _j + _i
  bvirt = u3 - _j
  u[2] = _j - (u3 - bvirt) + (_i - bvirt)
  u[3] = u3
  const Dlen = sum(C2len, C2, 4, u, D)

  return D[Dlen - 1]
}

export function orient2d(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  const detleft = (ay - cy) * (bx - cx)
  const detright = (ax - cx) * (by - cy)
  const det = detleft - detright

  const detsum = Math.abs(detleft + detright)
  if (Math.abs(det) >= ccwerrboundA * detsum) return det

  return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum)
}
