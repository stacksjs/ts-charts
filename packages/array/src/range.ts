export default function range(start: number, stop?: number, step?: number): number[] {
  start = +start
  const argc = arguments.length
  if (argc < 2) {
    stop = start
    start = 0
    step = 1
  } else {
    stop = +stop!
    step = argc < 3 ? 1 : +step!
  }

  let i = -1
  const n = Math.max(0, Math.ceil((stop - start) / step)) | 0
  const result = new Array(n)

  while (++i < n) {
    result[i] = start + i * step
  }

  return result
}
