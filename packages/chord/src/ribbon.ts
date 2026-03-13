import { path } from '@ts-charts/path'
import { slice } from './array.ts'
import constant from './constant.ts'
import { abs, cos, epsilon, halfPi, sin } from './math.ts'

interface RibbonDatum {
  source?: unknown
  target?: unknown
  radius?: number
  startAngle?: number
  endAngle?: number
}

function defaultSource(d: RibbonDatum): unknown {
  return d.source
}

function defaultTarget(d: RibbonDatum): unknown {
  return d.target
}

function defaultRadius(d: RibbonDatum): number {
  return d.radius!
}

function defaultStartAngle(d: RibbonDatum): number {
  return d.startAngle!
}

function defaultEndAngle(d: RibbonDatum): number {
  return d.endAngle!
}

function defaultPadAngle(): number {
  return 0
}

function defaultArrowheadRadius(): number {
  return 10
}

export interface RibbonGenerator {
  (...args: any[]): string | null
  radius(): (...args: any[]) => number
  // eslint-disable-next-line pickier/no-unused-vars
  radius(radius: number | ((...args: any[]) => number)): RibbonGenerator
  sourceRadius(): (...args: any[]) => number
  // eslint-disable-next-line pickier/no-unused-vars
  sourceRadius(radius: number | ((...args: any[]) => number)): RibbonGenerator
  targetRadius(): (...args: any[]) => number
  // eslint-disable-next-line pickier/no-unused-vars
  targetRadius(radius: number | ((...args: any[]) => number)): RibbonGenerator
  startAngle(): (...args: any[]) => number
  // eslint-disable-next-line pickier/no-unused-vars
  startAngle(angle: number | ((...args: any[]) => number)): RibbonGenerator
  endAngle(): (...args: any[]) => number
  // eslint-disable-next-line pickier/no-unused-vars
  endAngle(angle: number | ((...args: any[]) => number)): RibbonGenerator
  padAngle(): (...args: any[]) => number
  // eslint-disable-next-line pickier/no-unused-vars
  padAngle(angle: number | ((...args: any[]) => number)): RibbonGenerator
  source(): (...args: any[]) => any
  source(source: (...args: any[]) => any): RibbonGenerator
  target(): (...args: any[]) => any
  target(target: (...args: any[]) => any): RibbonGenerator
  context(): any
  context(context: any): RibbonGenerator
  headRadius?: {
    (): (...args: any[]) => number
    // eslint-disable-next-line pickier/no-unused-vars
    (radius: number | ((...args: any[]) => number)): RibbonGenerator
  }
}

function ribbon(headRadius?: ((...args: any[]) => number) | null): RibbonGenerator {
  let source: (...args: any[]) => any = defaultSource
  let target: (...args: any[]) => any = defaultTarget
  let sourceRadius: (...args: any[]) => number = defaultRadius
  let targetRadius: (...args: any[]) => number = defaultRadius
  let startAngle: (...args: any[]) => number = defaultStartAngle
  let endAngle: (...args: any[]) => number = defaultEndAngle
  let padAngle: (...args: any[]) => number = defaultPadAngle
  let context: ReturnType<typeof path> | null = null

  function ribbon(this: unknown, ...args: any[]): string | null {
    let buffer: ReturnType<typeof path> | undefined
    const s = source.apply(this, args)
    const t = target.apply(this, args)
    const ap = padAngle.apply(this, args) / 2
    const argv = slice.call(args)
    argv[0] = s
    const sr = +sourceRadius.apply(this, argv)
    let sa0 = startAngle.apply(this, argv) - halfPi
    let sa1 = endAngle.apply(this, argv) - halfPi
    argv[0] = t
    const tr = +targetRadius.apply(this, argv)
    let ta0 = startAngle.apply(this, argv) - halfPi
    let ta1 = endAngle.apply(this, argv) - halfPi

    if (!context) context = buffer = path()

    if (ap > epsilon) {
      if (abs(sa1 - sa0) > ap * 2 + epsilon) sa1 > sa0 ? (sa0 += ap, sa1 -= ap) : (sa0 -= ap, sa1 += ap)
      else sa0 = sa1 = (sa0 + sa1) / 2
      if (abs(ta1 - ta0) > ap * 2 + epsilon) ta1 > ta0 ? (ta0 += ap, ta1 -= ap) : (ta0 -= ap, ta1 += ap)
      else ta0 = ta1 = (ta0 + ta1) / 2
    }

    context.moveTo(sr * cos(sa0), sr * sin(sa0))
    context.arc(0, 0, sr, sa0, sa1)
    if (sa0 !== ta0 || sa1 !== ta1) {
      if (headRadius) {
        const hr = +headRadius.apply(this, args)
        const tr2 = tr - hr
        const ta2 = (ta0 + ta1) / 2
        context.quadraticCurveTo(0, 0, tr2 * cos(ta0), tr2 * sin(ta0))
        context.lineTo(tr * cos(ta2), tr * sin(ta2))
        context.lineTo(tr2 * cos(ta1), tr2 * sin(ta1))
      }
      else {
        context.quadraticCurveTo(0, 0, tr * cos(ta0), tr * sin(ta0))
        context.arc(0, 0, tr, ta0, ta1)
      }
    }
    context.quadraticCurveTo(0, 0, sr * cos(sa0), sr * sin(sa0))
    context.closePath()

    // eslint-disable-next-line pickier/no-unused-vars
    if (buffer) return context = null, `${buffer}` || null
    return null
  }

  if (headRadius) (ribbon as any).headRadius = function (_?: number | ((...args: any[]) => number)): any {
    // eslint-disable-next-line pickier/no-unused-vars
    return _ !== undefined ? (headRadius = typeof _ === 'function' ? _ as (...args: any[]) => number : constant(+_), ribbon) : headRadius
  }

  ribbon.radius = function (_?: number | ((...args: any[]) => number)): any {
    // eslint-disable-next-line pickier/no-unused-vars
    return _ !== undefined ? (sourceRadius = targetRadius = typeof _ === 'function' ? _ as (...args: any[]) => number : constant(+_), ribbon) : sourceRadius
  }

  ribbon.sourceRadius = function (_?: number | ((...args: any[]) => number)): any {
    // eslint-disable-next-line pickier/no-unused-vars
    return _ !== undefined ? (sourceRadius = typeof _ === 'function' ? _ as (...args: any[]) => number : constant(+_), ribbon) : sourceRadius
  }

  ribbon.targetRadius = function (_?: number | ((...args: any[]) => number)): any {
    // eslint-disable-next-line pickier/no-unused-vars
    return _ !== undefined ? (targetRadius = typeof _ === 'function' ? _ as (...args: any[]) => number : constant(+_), ribbon) : targetRadius
  }

  ribbon.startAngle = function (_?: number | ((...args: any[]) => number)): any {
    // eslint-disable-next-line pickier/no-unused-vars
    return _ !== undefined ? (startAngle = typeof _ === 'function' ? _ as (...args: any[]) => number : constant(+_), ribbon) : startAngle
  }

  ribbon.endAngle = function (_?: number | ((...args: any[]) => number)): any {
    // eslint-disable-next-line pickier/no-unused-vars
    return _ !== undefined ? (endAngle = typeof _ === 'function' ? _ as (...args: any[]) => number : constant(+_), ribbon) : endAngle
  }

  ribbon.padAngle = function (_?: number | ((...args: any[]) => number)): any {
    // eslint-disable-next-line pickier/no-unused-vars
    return _ !== undefined ? (padAngle = typeof _ === 'function' ? _ as (...args: any[]) => number : constant(+_), ribbon) : padAngle
  }

  ribbon.source = function (_?: (...args: any[]) => any): any {
    return _ !== undefined ? (source = _, ribbon) : source
  }

  ribbon.target = function (_?: (...args: any[]) => any): any {
    return _ !== undefined ? (target = _, ribbon) : target
  }

  ribbon.context = function (_?: any): any {
    return _ !== undefined ? ((context = _ == null ? null : _), ribbon) : context
  }

  return ribbon as unknown as RibbonGenerator
}

export default function ribbonDefault(): RibbonGenerator {
  return ribbon()
}

export function ribbonArrow(): RibbonGenerator {
  return ribbon(defaultArrowheadRadius)
}
