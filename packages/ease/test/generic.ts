export function out(easeIn: (t: number) => number): (t: number) => number {
  return (t: number): number => 1 - easeIn(1 - t)
}

export function inOut(easeIn: (t: number) => number): (t: number) => number {
  return (t: number): number => (t < 0.5 ? easeIn(t * 2) : (2 - easeIn((1 - t) * 2))) / 2
}
