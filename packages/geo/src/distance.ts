import length from './length.ts'
import type { GeoObject } from './types.ts'

const coordinates: (number[] | null)[] = [null, null]
const object: GeoObject = { type: 'LineString', coordinates: coordinates as unknown as number[][] }

export default function geoDistance(a: number[], b: number[]): number {
  coordinates[0] = a
  coordinates[1] = b
  return length(object)
}
