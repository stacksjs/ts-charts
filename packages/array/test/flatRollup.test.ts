import { describe, expect, it } from 'bun:test'
import { flatRollup } from '../src/index.ts'

const data = [
  {name: 'jim',   amount: '34.0',   date: '11/12/2015'},
  {name: 'carl',  amount: '120.11', date: '11/12/2015'},
  {name: 'stacy', amount: '12.01',  date: '01/04/2016'},
  {name: 'stacy', amount: '34.05',  date: '01/04/2016'}
]

it('flatRollup(data, reduce, accessor) returns the expected array', () => {
  expect(flatRollup(data, (v: any) => v.length, (d: any) => d.name)).toEqual([
    ['jim', 1],
    ['carl', 1],
    ['stacy', 2]
  ])
})

it('flatRollup(data, reduce, accessor, accessor) returns the expected array', () => {
  expect(flatRollup(data, (v: any) => v.length, (d: any) => d.name, (d: any) => d.amount)).toEqual([
    ['jim', '34.0', 1],
    ['carl', '120.11', 1],
    ['stacy', '12.01', 1],
    ['stacy', '34.05', 1]
  ])
})
