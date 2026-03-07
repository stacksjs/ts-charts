import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'bun:test'
import { dsvFormat } from '../src/index.ts'
import { table } from './table.ts'

const dataDir = join(import.meta.dir, 'data')

const psv = dsvFormat('|')

describe('dsv("|").parse', () => {
  it('dsv("|").parse(string) returns the expected objects', () => {
    expect(psv.parse('a|b|c\n1|2|3\n')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
    expect(psv.parse(readFileSync(join(dataDir, 'sample.psv'), 'utf-8'))).toEqual(table([{ Hello: '42', World: '"fish"' }], ['Hello', 'World']))
  })

  it('dsv("|").parse(string) does not strip whitespace', () => {
    expect(psv.parse('a|b|c\n 1| 2|3\n')).toEqual(table([{ a: ' 1', b: ' 2', c: '3' }], ['a', 'b', 'c']))
  })

  it('dsv("|").parse(string) parses quoted values', () => {
    expect(psv.parse('a|b|c\n"1"|2|3')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
    expect(psv.parse('a|b|c\n"1"|2|3\n')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
  })

  it('dsv("|").parse(string) parses quoted values with quotes', () => {
    expect(psv.parse('a\n"""hello"""')).toEqual(table([{ a: '"hello"' }], ['a']))
  })

  it('dsv("|").parse(string) parses quoted values with newlines', () => {
    expect(psv.parse('a\n"new\nline"')).toEqual(table([{ a: 'new\nline' }], ['a']))
    expect(psv.parse('a\n"new\rline"')).toEqual(table([{ a: 'new\rline' }], ['a']))
    expect(psv.parse('a\n"new\r\nline"')).toEqual(table([{ a: 'new\r\nline' }], ['a']))
  })

  it('dsv("|").parse(string) observes Unix, Mac and DOS newlines', () => {
    expect(psv.parse('a|b|c\n1|2|3\n4|5|"6"\n7|8|9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
    expect(psv.parse('a|b|c\r1|2|3\r4|5|"6"\r7|8|9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
    expect(psv.parse('a|b|c\r\n1|2|3\r\n4|5|"6"\r\n7|8|9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
  })

  it('dsv("|").parse(string, row) returns the expected converted objects', () => {
    function row(d: any) { d.Hello = -d.Hello; return d }
    expect(psv.parse(readFileSync(join(dataDir, 'sample.psv'), 'utf-8'), row)).toEqual(table([{ Hello: -42, World: '"fish"' }], ['Hello', 'World']))
    expect(psv.parse('a|b|c\n1|2|3\n', function (d: any) { return d })).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
  })

  it('dsv("|").parse(string, row) skips rows if row returns null or undefined', () => {
    function row(d: any, i: number) { return [d, null, undefined, false][i] }
    expect(psv.parse('field\n42\n\n\n\n', row as any)).toEqual(table([{ field: '42' }, false] as any, ['field']))
    expect(psv.parse('a|b|c\n1|2|3\n2|3|4', function (d: any) { return (d.a as any) & 1 ? null : d })).toEqual(table([{ a: '2', b: '3', c: '4' }], ['a', 'b', 'c']))
    expect(psv.parse('a|b|c\n1|2|3\n2|3|4', function (d: any) { return (d.a as any) & 1 ? undefined : d })).toEqual(table([{ a: '2', b: '3', c: '4' }], ['a', 'b', 'c']))
  })

  it('dsv("|").parse(string, row) invokes row(d, i, columns) for each row d, in order', () => {
    const rows: any[] = []
    psv.parse('a\n1\n2\n3\n4', function (d: any, i: number, columns: string[]) { rows.push({ d: d, i: i, columns: columns }) })
    expect(rows).toEqual([{ d: { a: '1' }, i: 0, columns: ['a'] }, { d: { a: '2' }, i: 1, columns: ['a'] }, { d: { a: '3' }, i: 2, columns: ['a'] }, { d: { a: '4' }, i: 3, columns: ['a'] }])
  })
})

describe('dsv("|").parseRows', () => {
  it('dsv("|").parseRows(string) returns the expected array of array of string', () => {
    expect(psv.parseRows('a|b|c\n')).toEqual([['a', 'b', 'c']])
  })

  it('dsv("|").parseRows(string) parses quoted values', () => {
    expect(psv.parseRows('"1"|2|3\n')).toEqual([['1', '2', '3']])
    expect(psv.parseRows('"hello"')).toEqual([['hello']])
  })

  it('dsv("|").parseRows(string) parses quoted values with quotes', () => {
    expect(psv.parseRows('"""hello"""')).toEqual([['"hello"']])
  })

  it('dsv("|").parseRows(string) parses quoted values with newlines', () => {
    expect(psv.parseRows('"new\nline"')).toEqual([['new\nline']])
    expect(psv.parseRows('"new\rline"')).toEqual([['new\rline']])
    expect(psv.parseRows('"new\r\nline"')).toEqual([['new\r\nline']])
  })

  it('dsv("|").parseRows(string) parses Unix, Mac and DOS newlines', () => {
    expect(psv.parseRows('a|b|c\n1|2|3\n4|5|"6"\n7|8|9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
    expect(psv.parseRows('a|b|c\r1|2|3\r4|5|"6"\r7|8|9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
    expect(psv.parseRows('a|b|c\r\n1|2|3\r\n4|5|"6"\r\n7|8|9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
  })

  it('dsv("|").parseRows(string, row) returns the expected converted array of array of string', () => {
    function row(d: any, i: number) { if (i) d[0] = -d[0]; return d }
    expect(psv.parseRows(readFileSync(join(dataDir, 'sample.psv'), 'utf-8'), row)).toEqual([['Hello', 'World'], [-42, '"fish"']])
    expect(psv.parseRows('a|b|c\n1|2|3\n', function (d: any) { return d })).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('dsv("|").parseRows(string, row) skips rows if row returns null or undefined', () => {
    function row(d: any, i: number) { return [d, null, undefined, false][i] }
    expect(psv.parseRows('field\n42\n\n\n', row as any)).toEqual([['field'], false] as any)
    expect(psv.parseRows('a|b|c\n1|2|3\n2|3|4', function (_d: any, i: number) { return i & 1 ? null : _d })).toEqual([['a', 'b', 'c'], ['2', '3', '4']])
    expect(psv.parseRows('a|b|c\n1|2|3\n2|3|4', function (_d: any, i: number) { return i & 1 ? undefined : _d })).toEqual([['a', 'b', 'c'], ['2', '3', '4']])
  })

  it('dsv("|").parseRows(string, row) invokes row(d, i) for each row d, in order', () => {
    const rows: any[] = []
    psv.parseRows('a\n1\n2\n3\n4', function (d: any, i: number) { rows.push({ d: d, i: i }) })
    expect(rows).toEqual([{ d: ['a'], i: 0 }, { d: ['1'], i: 1 }, { d: ['2'], i: 2 }, { d: ['3'], i: 3 }, { d: ['4'], i: 4 }])
  })
})

describe('dsv("|").format', () => {
  it('dsv("|").format(array) takes an array of objects as input', () => {
    expect(psv.format([{ a: 1, b: 2, c: 3 }])).toBe('a|b|c\n1|2|3')
  })

  it('dsv("|").format(array) escapes field names and values containing delimiters', () => {
    expect(psv.format([{ 'foo|bar': true }])).toBe('"foo|bar"\ntrue')
    expect(psv.format([{ field: 'foo|bar' }])).toBe('field\n"foo|bar"')
  })

  it('dsv("|").format(array) computes the union of all fields', () => {
    expect(psv.format([{ a: 1 }, { a: 1, b: 2 }, { a: 1, b: 2, c: 3 }, { b: 1, c: 2 }, { c: 1 }])).toBe('a|b|c\n1||\n1|2|\n1|2|3\n|1|2\n||1')
  })

  it('dsv("|").format(array) orders fields by first-seen', () => {
    expect(psv.format([{ a: 1, b: 2 }, { c: 3, b: 4 }, { c: 5, a: 1, b: 2 }])).toBe('a|b|c\n1|2|\n|4|3\n1|2|5')
  })

  it('dsv("|").format(array, columns) observes the specified array of column names', () => {
    expect(psv.format([{ a: 1, b: 2, c: 3 }], ['c', 'b', 'a'])).toBe('c|b|a\n3|2|1')
    expect(psv.format([{ a: 1, b: 2, c: 3 }], ['c', 'a'])).toBe('c|a\n3|1')
    expect(psv.format([{ a: 1, b: 2, c: 3 }], [])).toBe('\n')
    expect(psv.format([{ a: 1, b: 2, c: 3 }], ['d'])).toBe('d\n')
  })
})

describe('dsv("|").formatRows', () => {
  it('dsv("|").formatRows(array) takes an array of array of string as input', () => {
    expect(psv.formatRows([['a', 'b', 'c'], ['1', '2', '3']])).toBe('a|b|c\n1|2|3')
  })

  it('dsv("|").formatRows(array) separates lines using Unix newline', () => {
    expect(psv.formatRows([[], []])).toBe('\n')
  })

  it('dsv("|").formatRows(array) does not strip whitespace', () => {
    expect(psv.formatRows([['a ', ' b', 'c'], ['1', '2', '3 ']])).toBe('a | b|c\n1|2|3 ')
  })

  it('dsv("|").formatRows(array) does not quote simple values', () => {
    expect(psv.formatRows([['a'], [1]])).toBe('a\n1')
  })

  it('dsv("|").formatRows(array) escapes double quotes', () => {
    expect(psv.formatRows([['"fish"']])).toBe('"""fish"""')
  })

  it('dsv("|").formatRows(array) escapes Unix newlines', () => {
    expect(psv.formatRows([['new\nline']])).toBe('"new\nline"')
  })

  it('dsv("|").formatRows(array) escapes Windows newlines', () => {
    expect(psv.formatRows([['new\rline']])).toBe('"new\rline"')
  })

  it('dsv("|").formatRows(array) escapes values containing delimiters', () => {
    expect(psv.formatRows([['oxford|tab']])).toBe('"oxford|tab"')
  })
})

describe('dsv("|").formatRow', () => {
  it('dsv("|").formatRow(array) takes a single array of string as input', () => {
    expect(psv.formatRow(['a', 'b', 'c'])).toBe('a|b|c')
  })
})
