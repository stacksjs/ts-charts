import { describe, it, expect } from 'bun:test'
import { easePolyIn } from '@ts-charts/ease'
import { select } from '@ts-charts/selection'
import '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.easeVarying(factory) accepts an easing function factory', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const t = select(document).selectAll('h1').data([{ exponent: 3 }, { exponent: 4 }]).transition()
  t.easeVarying((d: any) => easePolyIn.exponent(d.exponent))
  expect(t.ease()(0.5)).toBe(easePolyIn.exponent(3)(0.5))
})

jsdomit('transition.easeVarying(factory) passes factory datum, index, group with the node as this', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const t = select(document).selectAll('h1').data([{ exponent: 3 }, { exponent: 4 }]).transition()
  const results: any[] = []
  t.easeVarying(function (this: any, d: any, i: number, e: any[]) { results.push([d, i, e, this]); return (t: number) => t })
  expect(results).toEqual([
    [{ exponent: 3 }, 0, [...t], document.querySelector('#one')],
    [{ exponent: 4 }, 1, [...t], document.querySelector('#two')],
  ])
})

jsdomit('transition.easeVarying() throws an error if the argument is not a function', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const t = select(document).selectAll('h1').data([{ exponent: 3 }, { exponent: 4 }]).transition()
  expect(() => { (t as any).easeVarying() }).toThrow()
  expect(() => { t.easeVarying('a' as any) }).toThrow()
})
