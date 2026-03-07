import length from './length.ts'

const coordinates: any[] = [null, null]
const object: any = { type: 'LineString', coordinates: coordinates }

export default function geoDistance(a: number[], b: number[]): number {
  coordinates[0] = a
  coordinates[1] = b
  return length(object)
}
