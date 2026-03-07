import { describe, expect, it } from 'bun:test'
import { groups } from '../src/index.ts'

const data = [
  {name: 'jim',   amount: '34.0',   date: '11/12/2015'},
  {name: 'carl',  amount: '120.11', date: '11/12/2015'},
  {name: 'stacy', amount: '12.01',  date: '01/04/2016'},
  {name: 'stacy', amount: '34.05',  date: '01/04/2016'}
]

it('groups(data, accessor) returns the expected array', () => {
  expect(groups(data, (d: any) => d.name)).toEqual([
    ['jim', [data[0]]],
    ['carl', [data[1]]],
    ['stacy', [data[2], data[3]]]
  ])
})

it('groups(data, accessor, accessor) returns the expected nested array', () => {
  expect(groups(data, (d: any) => d.name, (d: any) => d.amount)).toEqual([
    ['jim', [['34.0', [data[0]]]]],
    ['carl', [['120.11', [data[1]]]]],
    ['stacy', [['12.01', [data[2]]], ['34.05', [data[3]]]]]
  ])
})
