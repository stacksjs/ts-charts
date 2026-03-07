import { describe, expect, it } from 'bun:test'
import { rollup } from '../src/index.ts'
import { InternMap } from '@ts-charts/internmap'

const data = [
  {name: 'jim',   amount: '34.0',   date: '11/12/2015'},
  {name: 'carl',  amount: '120.11', date: '11/12/2015'},
  {name: 'stacy', amount: '12.01',  date: '01/04/2016'},
  {name: 'stacy', amount: '34.05',  date: '01/04/2016'}
]

it('rollup(data, reduce, accessor) returns the expected map', () => {
  expect(rollup(data, (v: any) => v.length, (d: any) => d.name)).toEqual(new InternMap([
    ['jim', 1],
    ['carl', 1],
    ['stacy', 2]
  ]))
})
