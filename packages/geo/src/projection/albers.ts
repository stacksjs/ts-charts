import geoConicEqualArea from './conicEqualArea.ts'

export default function geoAlbers(): any {
  return geoConicEqualArea()
      .parallels([29.5, 45.5])
      .scale(1070)
      .translate([480, 250])
      .rotate([96, 0])
      .center([-0.6, 38.7])
}
