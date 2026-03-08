import { max, tau } from './math.ts'

export interface ChordGroup {
  index: number
  startAngle: number
  endAngle: number
  value: number
}

export interface ChordSubgroup {
  index: number
  startAngle: number
  endAngle: number
  value: number
}

export interface Chord {
  source: ChordSubgroup | null
  target: ChordSubgroup | null
}

export type Comparator = (a: number, b: number) => number

export interface ChordLayout {
  (matrix: number[][]): Chords
  padAngle(): number
  padAngle(angle: number): ChordLayout
  sortGroups(): Comparator | null
  sortGroups(compare: Comparator | null): ChordLayout
  sortSubgroups(): Comparator | null
  sortSubgroups(compare: Comparator | null): ChordLayout
  sortChords(): Comparator | null
  sortChords(compare: Comparator | null): ChordLayout
}

export interface Chords extends Array<Chord> {
  groups: ChordGroup[]
}

function range(i: number, j: number): number[] {
  return Array.from({ length: j - i }, (_, k) => i + k)
}

function compareValue(compare: Comparator): ((a: Chord, b: Chord) => number) & { _: Comparator } {
  const fn = function (a: Chord, b: Chord): number {
    return compare(
      (a.source?.value ?? 0) + (a.target?.value ?? 0),
      (b.source?.value ?? 0) + (b.target?.value ?? 0),
    )
  } as ((a: Chord, b: Chord) => number) & { _: Comparator }
  fn._ = compare
  return fn
}

export default function chordDefault(): ChordLayout {
  return chord(false, false)
}

export function chordTranspose(): ChordLayout {
  return chord(false, true)
}

export function chordDirected(): ChordLayout {
  return chord(true, false)
}

function chord(directed: boolean, transpose: boolean): ChordLayout {
  let padAngle = 0
  let sortGroups: Comparator | null = null
  let sortSubgroups: Comparator | null = null
  let sortChords: (((a: Chord, b: Chord) => number) & { _: Comparator }) | null = null

  function chord(matrix: number[][]): Chords {
    const n = matrix.length
    const groupSums = new Array<number>(n)
    const groupIndex = range(0, n)
    let chords: any = new Array<Chord>(n * n)
    const groups = new Array<ChordGroup>(n)
    let k = 0
    let dx: number

    const flatMatrix = Float64Array.from({ length: n * n }, transpose
      ? (_, i) => matrix[i % n][(i / n) | 0]
      : (_, i) => matrix[(i / n) | 0][i % n])

    // Compute the scaling factor from value to angle in [0, 2pi].
    for (let i = 0; i < n; ++i) {
      let x = 0
      for (let j = 0; j < n; ++j) x += flatMatrix[i * n + j] + (directed ? 1 : 0) * flatMatrix[j * n + i]
      k += groupSums[i] = x
    }
    k = max(0, tau - padAngle * n) / k
    dx = k ? padAngle : tau / n

    // Compute the angles for each group and constituent chord.
    {
      let x = 0
      if (sortGroups) groupIndex.sort((a, b) => sortGroups!(groupSums[a], groupSums[b]))
      for (const i of groupIndex) {
        const x0 = x
        if (directed) {
          const subgroupIndex = range(~n + 1, n).filter(j => j < 0 ? flatMatrix[~j * n + i] : flatMatrix[i * n + j])
          if (sortSubgroups) subgroupIndex.sort((a, b) => sortSubgroups!(a < 0 ? -flatMatrix[~a * n + i] : flatMatrix[i * n + a], b < 0 ? -flatMatrix[~b * n + i] : flatMatrix[i * n + b]))
          for (const j of subgroupIndex) {
            if (j < 0) {
              const c = chords[~j * n + i] || (chords[~j * n + i] = { source: null, target: null })
              c.target = { index: i, startAngle: x, endAngle: x += flatMatrix[~j * n + i] * k, value: flatMatrix[~j * n + i] }
            }
            else {
              const c = chords[i * n + j] || (chords[i * n + j] = { source: null, target: null })
              c.source = { index: i, startAngle: x, endAngle: x += flatMatrix[i * n + j] * k, value: flatMatrix[i * n + j] }
            }
          }
          groups[i] = { index: i, startAngle: x0, endAngle: x, value: groupSums[i] }
        }
        else {
          const subgroupIndex = range(0, n).filter(j => flatMatrix[i * n + j] || flatMatrix[j * n + i])
          if (sortSubgroups) subgroupIndex.sort((a, b) => sortSubgroups!(flatMatrix[i * n + a], flatMatrix[i * n + b]))
          for (const j of subgroupIndex) {
            let c: Chord
            if (i < j) {
              c = chords[i * n + j] || (chords[i * n + j] = { source: null, target: null })
              c.source = { index: i, startAngle: x, endAngle: x += flatMatrix[i * n + j] * k, value: flatMatrix[i * n + j] }
            }
            else {
              c = chords[j * n + i] || (chords[j * n + i] = { source: null, target: null })
              c.target = { index: i, startAngle: x, endAngle: x += flatMatrix[i * n + j] * k, value: flatMatrix[i * n + j] }
              if (i === j) c.source = c.target
            }
            if (c.source && c.target && c.source.value < c.target.value) {
              const source = c.source
              c.source = c.target
              c.target = source
            }
          }
          groups[i] = { index: i, startAngle: x0, endAngle: x, value: groupSums[i] }
        }
        x += dx
      }
    }

    // Remove empty chords.
    chords = Object.values(chords) as Chord[]
    ;(chords as Chords).groups = groups
    return sortChords ? chords.sort(sortChords) : chords
  }

  chord.padAngle = function (_?: number): number | typeof chord {
    return _ !== undefined ? (padAngle = max(0, _), chord) : padAngle
  }

  chord.sortGroups = function (_?: Comparator | null): Comparator | null | typeof chord {
    return _ !== undefined ? (sortGroups = _, chord) : sortGroups
  }

  chord.sortSubgroups = function (_?: Comparator | null): Comparator | null | typeof chord {
    return _ !== undefined ? (sortSubgroups = _, chord) : sortSubgroups
  }

  chord.sortChords = function (_?: Comparator | null): Comparator | null | typeof chord {
    return _ !== undefined ? (_ == null ? sortChords = null : (sortChords = compareValue(_))._ = _, chord) : sortChords && sortChords._
  }

  return chord as unknown as ChordLayout
}
