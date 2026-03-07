import cross from './cross'

function lexicographicOrder(a: [number, number], b: [number, number]): number {
  return a[0] - b[0] || a[1] - b[1]
}

// Computes the upper convex hull per the monotone chain algorithm.
// Assumes points.length >= 3, is sorted by x, unique in y.
// Returns an array of indices into points in left-to-right order.
function computeUpperHullIndexes(points: [number, number][]): number[] {
  const n = points.length
  const indexes: number[] = [0, 1]
  let size = 2

  for (let i = 2; i < n; ++i) {
    while (size > 1 && cross(points[indexes[size - 2]], points[indexes[size - 1]], points[i]) <= 0) --size
    indexes[size++] = i
  }

  return indexes.slice(0, size) // remove popped points
}

export default function polygonHull(points: [number, number][]): [number, number][] | null {
  const n = points.length
  if (n < 3) return null

  const sortedPoints: [number, number, number][] = new Array(n)
  const flippedPoints: [number, number][] = new Array(n)

  for (let i = 0; i < n; ++i) sortedPoints[i] = [+points[i][0], +points[i][1], i]
  sortedPoints.sort(lexicographicOrder as unknown as (a: [number, number, number], b: [number, number, number]) => number)
  for (let i = 0; i < n; ++i) flippedPoints[i] = [sortedPoints[i][0], -sortedPoints[i][1]]

  const upperIndexes = computeUpperHullIndexes(sortedPoints as unknown as [number, number][])
  const lowerIndexes = computeUpperHullIndexes(flippedPoints)

  // Construct the hull polygon, removing possible duplicate endpoints.
  const skipLeft = lowerIndexes[0] === upperIndexes[0]
  const skipRight = lowerIndexes[lowerIndexes.length - 1] === upperIndexes[upperIndexes.length - 1]
  const hull: [number, number][] = []

  // Add upper hull in right-to-left order.
  // Then add lower hull in left-to-right order.
  for (let i = upperIndexes.length - 1; i >= 0; --i) hull.push(points[sortedPoints[upperIndexes[i]][2]])
  for (let i = +skipLeft; i < lowerIndexes.length - +skipRight; ++i) hull.push(points[sortedPoints[lowerIndexes[i]][2]])

  return hull
}
