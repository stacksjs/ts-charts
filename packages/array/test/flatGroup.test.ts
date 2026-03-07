import { describe, expect, it } from 'bun:test'
import { flatGroup } from '../src/index.ts'

const data = [
  {name: 'jim',   amount: '34.0',   date: '11/12/2015'},
  {name: 'carl',  amount: '120.11', date: '11/12/2015'},
  {name: 'stacy', amount: '12.01',  date: '01/04/2016'},
  {name: 'stacy', amount: '34.05',  date: '01/04/2016'}
]

it('flatGroup(data, accessor, accessor) returns the expected array', () => {
  expect(flatGroup(data, (d: any) => d.name, (d: any) => d.amount)).toEqual([
    ['jim', '34.0', [{name: 'jim', amount: '34.0', date: '11/12/2015'}]],
    ['carl', '120.11', [{name: 'carl', amount: '120.11', date: '11/12/2015'}]],
    ['stacy', '12.01', [{name: 'stacy', amount: '12.01', date: '01/04/2016'}]],
    ['stacy', '34.05', [{name: 'stacy', amount: '34.05', date: '01/04/2016'}]]
  ])
})
