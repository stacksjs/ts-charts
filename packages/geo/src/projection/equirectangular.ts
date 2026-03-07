import projection from './index.ts'

export function equirectangularRaw(lambda: number, phi: number): number[] {
  return [lambda, phi]
}

(equirectangularRaw as any).invert = equirectangularRaw

export default function geoEquirectangular(): any {
  return projection(equirectangularRaw)
      .scale(152.63)
}
