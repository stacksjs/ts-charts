import compose from './compose.ts'
import { abs, asin, atan2, cos, degrees, pi, radians, sin, tau } from './math.ts'
import type { GeoRawProjection, GeoRotation } from './types.ts'

function rotationIdentity(lambda: number, phi: number): number[] {
  if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau
  return [lambda, phi]
}

;(rotationIdentity as GeoRawProjection).invert = rotationIdentity

export function rotateRadians(deltaLambda: number, deltaPhi: number, deltaGamma: number): GeoRawProjection {
  return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
    : rotationLambda(deltaLambda))
    : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
    : rotationIdentity as GeoRawProjection)
}

function forwardRotationLambda(deltaLambda: number): (lambda: number, phi: number) => number[] {
  return function (lambda: number, phi: number): number[] {
    lambda += deltaLambda
    if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau
    return [lambda, phi]
  }
}

function rotationLambda(deltaLambda: number): GeoRawProjection {
  const rotation = forwardRotationLambda(deltaLambda) as GeoRawProjection
  rotation.invert = forwardRotationLambda(-deltaLambda)
  return rotation
}

function rotationPhiGamma(deltaPhi: number, deltaGamma: number): GeoRawProjection {
  const cosDeltaPhi = cos(deltaPhi),
      sinDeltaPhi = sin(deltaPhi),
      cosDeltaGamma = cos(deltaGamma),
      sinDeltaGamma = sin(deltaGamma)

  function rotation(lambda: number, phi: number): number[] {
    const cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaPhi + x * sinDeltaPhi
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ]
  }

  rotation.invert = function (lambda: number, phi: number): number[] {
    const cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaGamma - y * sinDeltaGamma
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ]
  }

  return rotation as GeoRawProjection
}

export default function geoRotation(rotate: number[]): GeoRotation {
  const r: GeoRawProjection = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0)

  function forward(coordinates: number[]): number[] {
    const result = r(coordinates[0] * radians, coordinates[1] * radians)
    return result[0] *= degrees, result[1] *= degrees, result
  }

  forward.invert = function (coordinates: number[]): number[] {
    const result = r.invert!(coordinates[0] * radians, coordinates[1] * radians)
    return result[0] *= degrees, result[1] *= degrees, result
  }

  return forward
}
