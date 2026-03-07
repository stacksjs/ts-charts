import { describe, expect, it } from 'bun:test'
import { group } from '../src/index.ts'
import { InternMap } from '@ts-charts/internmap'

const data = [
  {name: 'jim',   amount: '34.0',   date: '11/12/2015'},
  {name: 'carl',  amount: '120.11', date: '11/12/2015'},
  {name: 'stacy', amount: '12.01',  date: '01/04/2016'},
  {name: 'stacy', amount: '34.05',  date: '01/04/2016'}
]

it('group(data, accessor) returns the expected map', () => {
  expect(group(data, (d: any) => d.name)).toEqual(new InternMap([
    ['jim', [data[0]]],
    ['carl', [data[1]]],
    ['stacy', [data[2], data[3]]]
  ]))
})

it('group(data, accessor) returns a map', () => {
  expect(group(data, (d: any) => d.name) instanceof Map).toBe(true)
})

it('group(data, accessor, accessor) returns the expected nested map', () => {
  expect(group(data, (d: any) => d.name, (d: any) => d.amount)).toEqual(new InternMap([
    ['jim', new InternMap([['34.0', [data[0]]]])],
    ['carl', new InternMap([['120.11', [data[1]]]])],
    ['stacy', new InternMap([['12.01', [data[2]]], ['34.05', [data[3]]]])]
  ]))
})
