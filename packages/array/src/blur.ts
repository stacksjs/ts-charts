export function blur(values: number[], r: number): number[] {
  if (!((r = +r) >= 0)) throw new RangeError('invalid r')
  let length = values.length
  if (!((length = Math.floor(length)) >= 0)) throw new RangeError('invalid length')
  if (!length || !r) return values
  const blurFn = blurf(r)
  const temp = values.slice()
  blurFn(values, temp, 0, length, 1)
  blurFn(temp, values, 0, length, 1)
  blurFn(values, temp, 0, length, 1)
  return values
}

export const blur2: (data: { data: number[], width: number, height?: number }, rx: number, ry?: number) => { data: number[], width: number, height?: number } = Blur2(blurf)

export const blurImage: (data: { data: number[], width: number, height?: number }, rx: number, ry?: number) => { data: number[], width: number, height?: number } = Blur2(blurfImage)

// eslint-disable-next-line pickier/no-unused-vars
type BlurFn = (T: number[], S: number[], start: number, stop: number, step: number) => void

interface BlurData { data: number[], width: number, height?: number }

function Blur2(blurFactory: (radius: number) => BlurFn): (data: BlurData, rx: number, ry?: number) => BlurData {
  return function(data: BlurData, rx: number, ry: number = rx): BlurData {
    if (!((rx = +rx) >= 0)) throw new RangeError('invalid rx')
    if (!((ry = +ry) >= 0)) throw new RangeError('invalid ry')
    let { data: values, width, height } = data
    if (!((width = Math.floor(width)) >= 0)) throw new RangeError('invalid width')
    if (!((height = Math.floor(height !== undefined ? height : values.length / width)) >= 0)) throw new RangeError('invalid height')
    if (!width || !height || (!rx && !ry)) return data
    const blurx = rx && blurFactory(rx)
    const blury = ry && blurFactory(ry)
    const temp = values.slice()
    if (blurx && blury) {
      blurh(blurx, temp, values, width, height)
      blurh(blurx, values, temp, width, height)
      blurh(blurx, temp, values, width, height)
      blurv(blury, values, temp, width, height)
      blurv(blury, temp, values, width, height)
      blurv(blury, values, temp, width, height)
    // eslint-disable-next-line pickier/no-unused-vars
    } else if (blurx) {
      blurh(blurx, values, temp, width, height)
      blurh(blurx, temp, values, width, height)
      blurh(blurx, values, temp, width, height)
    // eslint-disable-next-line pickier/no-unused-vars
    } else if (blury) {
      blurv(blury, values, temp, width, height)
      blurv(blury, temp, values, width, height)
      blurv(blury, values, temp, width, height)
    }
    return data
  }
}

function blurh(blur: BlurFn, T: number[], S: number[], w: number, h: number): void {
  for (let y = 0, n = w * h; y < n;) {
    blur(T, S, y, y += w, 1)
  }
}

function blurv(blur: BlurFn, T: number[], S: number[], w: number, h: number): void {
  for (let x = 0, n = w * h; x < w; ++x) {
    blur(T, S, x, x + n, w)
  }
}

function blurfImage(radius: number): BlurFn {
  const blurFn = blurf(radius)
  return (T: number[], S: number[], start: number, stop: number, step: number): void => {
    start <<= 2, stop <<= 2, step <<= 2
    blurFn(T, S, start + 0, stop + 0, step)
    blurFn(T, S, start + 1, stop + 1, step)
    blurFn(T, S, start + 2, stop + 2, step)
    blurFn(T, S, start + 3, stop + 3, step)
  }
}

function blurf(radius: number): BlurFn {
  const radius0 = Math.floor(radius)
  if (radius0 === radius) return bluri(radius)
  const t = radius - radius0
  const w = 2 * radius + 1
  return (T: number[], S: number[], start: number, stop: number, step: number): void => {
    if (!((stop -= step) >= start)) return
    let sum = radius0 * S[start]
    const s0 = step * radius0
    const s1 = s0 + step
    for (let i = start, j = start + s0; i < j; i += step) {
      sum += S[Math.min(stop, i)]
    }
    for (let i = start, j = stop; i <= j; i += step) {
      sum += S[Math.min(stop, i + s0)]
      T[i] = (sum + t * (S[Math.max(start, i - s1)] + S[Math.min(stop, i + s1)])) / w
      sum -= S[Math.max(start, i - s0)]
    }
  }
}

function bluri(radius: number): BlurFn {
  const w = 2 * radius + 1
  return (T: number[], S: number[], start: number, stop: number, step: number): void => {
    if (!((stop -= step) >= start)) return
    let sum = radius * S[start]
    const s = step * radius
    for (let i = start, j = start + s; i < j; i += step) {
      sum += S[Math.min(stop, i)]
    }
    for (let i = start, j = stop; i <= j; i += step) {
      sum += S[Math.min(stop, i + s)]
      T[i] = sum / w
      sum -= S[Math.max(start, i - s)]
    }
  }
}
