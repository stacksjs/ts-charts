import { describe, expect, it } from 'bun:test'
import { index } from '../src/index.ts'

const data = [
  {name: 'jim',   amount: '34.0',   date: '11/12/2015'},
  {name: 'carl',  amount: '120.11', date: '11/12/2015'},
  {name: 'stacy', amount: '12.01',  date: '01/04/2016'}
]

it('index(data, accessor) returns the expected map', () => {
  const map = index(data, (d: any) => d.name)
  expect(map.get('jim')).toBe(data[0])
  expect(map.get('carl')).toBe(data[1])
  expect(map.get('stacy')).toBe(data[2])
})

it('index(data, accessor) throws on duplicate keys', () => {
  const dupes = [...data, {name: 'jim', amount: '1', date: '1'}]
  expect(() => index(dupes, (d: any) => d.name)).toThrow('duplicate key')
})
