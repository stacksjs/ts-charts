import { cubehelix } from '@ts-charts/color'
import { interpolateCubehelixLong } from '@ts-charts/interpolate'

const cubehelixDefault: (t: number) => string = interpolateCubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0))

export default cubehelixDefault
