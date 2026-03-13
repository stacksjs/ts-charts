import projection from './index.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export function equirectangularRaw(lambda: number, phi: number): number[] {
  return [lambda, phi]
}

// eslint-disable-next-line pickier/no-unused-vars
;(equirectangularRaw as GeoRawProjection).invert = equirectangularRaw

export default function geoEquirectangular(): GeoProjection {
  return projection(equirectangularRaw as GeoRawProjection)
      .scale(152.63)
}
