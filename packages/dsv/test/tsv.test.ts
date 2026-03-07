import { readFileSync } from 'fs'
import { join } from 'path'

const dataDir = join(import.meta.dir, 'data')
import { describe, expect, it } from 'bun:test'
import { tsvFormat, tsvFormatRow, tsvFormatRows, tsvParse, tsvParseRows } from '../src/index.ts'
import { table } from './table.ts'

describe('tsvParse', () => {
  it('tsvParse(string) returns the expected objects', () => {
    expect(tsvParse('a\tb\tc\n1\t2\t3\n')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
    expect(tsvParse(readFileSync(join(dataDir, 'sample.tsv'), 'utf-8'))).toEqual(table([{ Hello: '42', World: '"fish"' }], ['Hello', 'World']))
  })

  it('tsvParse(string) does not strip whitespace', () => {
    expect(tsvParse('a\tb\tc\n 1\t 2\t3\n')).toEqual(table([{ a: ' 1', b: ' 2', c: '3' }], ['a', 'b', 'c']))
  })

  it('tsvParse(string) parses quoted values', () => {
    expect(tsvParse('a\tb\tc\n"1"\t2\t3')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
    expect(tsvParse('a\tb\tc\n"1"\t2\t3\n')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
  })

  it('tsvParse(string) parses quoted values with quotes', () => {
    expect(tsvParse('a\n"""hello"""')).toEqual(table([{ a: '"hello"' }], ['a']))
  })

  it('tsvParse(string) parses quoted values with newlines', () => {
    expect(tsvParse('a\n"new\nline"')).toEqual(table([{ a: 'new\nline' }], ['a']))
    expect(tsvParse('a\n"new\rline"')).toEqual(table([{ a: 'new\rline' }], ['a']))
    expect(tsvParse('a\n"new\r\nline"')).toEqual(table([{ a: 'new\r\nline' }], ['a']))
  })

  it('tsvParse(string) observes Unix, Mac and DOS newlines', () => {
    expect(tsvParse('a\tb\tc\n1\t2\t3\n4\t5\t"6"\n7\t8\t9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
    expect(tsvParse('a\tb\tc\r1\t2\t3\r4\t5\t"6"\r7\t8\t9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
    expect(tsvParse('a\tb\tc\r\n1\t2\t3\r\n4\t5\t"6"\r\n7\t8\t9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
  })

  it('tsvParse(string, row) returns the expected converted objects', () => {
    function row(d: any) { d.Hello = -d.Hello; return d }
    expect(tsvParse(readFileSync(join(dataDir, 'sample.tsv'), 'utf-8'), row)).toEqual(table([{ Hello: -42, World: '"fish"' }], ['Hello', 'World']))
    expect(tsvParse('a\tb\tc\n1\t2\t3\n', function (d: any) { return d })).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
  })

  it('tsvParse(string, row) skips rows if row returns null or undefined', () => {
    function row(d: any, i: number) { return [d, null, undefined, false][i] }
    expect(tsvParse('field\n42\n\n\n\n', row as any)).toEqual(table([{ field: '42' }, false] as any, ['field']))
    expect(tsvParse('a\tb\tc\n1\t2\t3\n2\t3\t4', function (d: any) { return (d.a as any) & 1 ? null : d })).toEqual(table([{ a: '2', b: '3', c: '4' }], ['a', 'b', 'c']))
    expect(tsvParse('a\tb\tc\n1\t2\t3\n2\t3\t4', function (d: any) { return (d.a as any) & 1 ? undefined : d })).toEqual(table([{ a: '2', b: '3', c: '4' }], ['a', 'b', 'c']))
  })

  it('tsvParse(string, row) invokes row(d, i) for each row d, in order', () => {
    const rows: any[] = []
    tsvParse('a\n1\n2\n3\n4', function (d: any, i: number) { rows.push({ d: d, i: i }) })
    expect(rows).toEqual([{ d: { a: '1' }, i: 0 }, { d: { a: '2' }, i: 1 }, { d: { a: '3' }, i: 2 }, { d: { a: '4' }, i: 3 }])
  })

  it('tsvParse(string) accepts numbers as names', () => {
    expect(tsvParse('11\t22\t33\n"a"\tb\t0')).toEqual(table([{ 11: 'a', 22: 'b', 33: '0' }], ['11', '22', '33']))
  })
})

describe('tsvParseRows', () => {
  it('tsvParseRows(string) returns the expected array of array of string', () => {
    expect(tsvParseRows('a\tb\tc\n')).toEqual([['a', 'b', 'c']])
  })

  it('tsvParseRows(string) parses quoted values', () => {
    expect(tsvParseRows('"1"\t2\t3\n')).toEqual([['1', '2', '3']])
    expect(tsvParseRows('"hello"')).toEqual([['hello']])
  })

  it('tsvParseRows(string) parses quoted values with quotes', () => {
    expect(tsvParseRows('"""hello"""')).toEqual([['"hello"']])
  })

  it('tsvParseRows(string) parses quoted values with newlines', () => {
    expect(tsvParseRows('"new\nline"')).toEqual([['new\nline']])
    expect(tsvParseRows('"new\rline"')).toEqual([['new\rline']])
    expect(tsvParseRows('"new\r\nline"')).toEqual([['new\r\nline']])
  })

  it('tsvParseRows(string) parses Unix, Mac and DOS newlines', () => {
    expect(tsvParseRows('a\tb\tc\n1\t2\t3\n4\t5\t"6"\n7\t8\t9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
    expect(tsvParseRows('a\tb\tc\r1\t2\t3\r4\t5\t"6"\r7\t8\t9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
    expect(tsvParseRows('a\tb\tc\r\n1\t2\t3\r\n4\t5\t"6"\r\n7\t8\t9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
  })

  it('tsvParseRows(string, row) returns the expected converted array of array of string', () => {
    function row(d: any, i: number) { if (i) d[0] = -d[0]; return d }
    expect(tsvParseRows(readFileSync(join(dataDir, 'sample.tsv'), 'utf-8'), row)).toEqual([['Hello', 'World'], [-42, '"fish"']])
    expect(tsvParseRows('a\tb\tc\n1\t2\t3\n', function (d: any) { return d })).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('tsvParseRows(string, row) skips rows if row returns null or undefined', () => {
    function row(d: any, i: number) { return [d, null, undefined, false][i] }
    expect(tsvParseRows('field\n42\n\n\n', row as any)).toEqual([['field'], false] as any)
    expect(tsvParseRows('a\tb\tc\n1\t2\t3\n2\t3\t4', function (_d: any, i: number) { return i & 1 ? null : _d })).toEqual([['a', 'b', 'c'], ['2', '3', '4']])
    expect(tsvParseRows('a\tb\tc\n1\t2\t3\n2\t3\t4', function (_d: any, i: number) { return i & 1 ? undefined : _d })).toEqual([['a', 'b', 'c'], ['2', '3', '4']])
  })

  it('tsvParseRows(string, row) invokes row(d, i) for each row d, in order', () => {
    const rows: any[] = []
    tsvParseRows('a\n1\n2\n3\n4', function (d: any, i: number) { rows.push({ d: d, i: i }) })
    expect(rows).toEqual([{ d: ['a'], i: 0 }, { d: ['1'], i: 1 }, { d: ['2'], i: 2 }, { d: ['3'], i: 3 }, { d: ['4'], i: 4 }])
  })
})

describe('tsvFormat', () => {
  it('tsvFormat(array) takes an array of objects as input', () => {
    expect(tsvFormat([{ a: 1, b: 2, c: 3 }])).toBe('a\tb\tc\n1\t2\t3')
  })

  it('tsvFormat(array) escapes field names and values containing delimiters', () => {
    expect(tsvFormat([{ 'foo\tbar': true }])).toBe('"foo\tbar"\ntrue')
    expect(tsvFormat([{ field: 'foo\tbar' }])).toBe('field\n"foo\tbar"')
  })

  it('tsvFormat(array) computes the union of all fields', () => {
    expect(tsvFormat([{ a: 1 }, { a: 1, b: 2 }, { a: 1, b: 2, c: 3 }, { b: 1, c: 2 }, { c: 1 }])).toBe('a\tb\tc\n1\t\t\n1\t2\t\n1\t2\t3\n\t1\t2\n\t\t1')
  })

  it('tsvFormat(array) orders fields by first-seen', () => {
    expect(tsvFormat([{ a: 1, b: 2 }, { c: 3, b: 4 }, { c: 5, a: 1, b: 2 }])).toBe('a\tb\tc\n1\t2\t\n\t4\t3\n1\t2\t5')
  })

  it('tsvFormat(array, columns) observes the specified array of column names', () => {
    expect(tsvFormat([{ a: 1, b: 2, c: 3 }], ['c', 'b', 'a'])).toBe('c\tb\ta\n3\t2\t1')
    expect(tsvFormat([{ a: 1, b: 2, c: 3 }], ['c', 'a'])).toBe('c\ta\n3\t1')
    expect(tsvFormat([{ a: 1, b: 2, c: 3 }], [])).toBe('\n')
    expect(tsvFormat([{ a: 1, b: 2, c: 3 }], ['d'])).toBe('d\n')
  })
})

describe('tsvFormatRows', () => {
  it('tsvFormatRows(array) takes an array of array of string as input', () => {
    expect(tsvFormatRows([['a', 'b', 'c'], ['1', '2', '3']])).toBe('a\tb\tc\n1\t2\t3')
  })

  it('tsvFormatRows(array) separates lines using Unix newline', () => {
    expect(tsvFormatRows([[], []])).toBe('\n')
  })

  it('tsvFormatRows(array) does not strip whitespace', () => {
    expect(tsvFormatRows([['a ', ' b', 'c'], ['1', '2', '3 ']])).toBe('a \t b\tc\n1\t2\t3 ')
  })

  it('tsvFormatRows(array) does not quote simple values', () => {
    expect(tsvFormatRows([['a'], [1]])).toBe('a\n1')
  })

  it('tsvFormatRows(array) escapes double quotes', () => {
    expect(tsvFormatRows([['"fish"']])).toBe('"""fish"""')
  })

  it('tsvFormatRows(array) escapes Unix newlines', () => {
    expect(tsvFormatRows([['new\nline']])).toBe('"new\nline"')
  })

  it('tsvFormatRows(array) escapes Windows newlines', () => {
    expect(tsvFormatRows([['new\rline']])).toBe('"new\rline"')
  })

  it('tsvFormatRows(array) escapes values containing delimiters', () => {
    expect(tsvFormatRows([['oxford\ttab']])).toBe('"oxford\ttab"')
  })
})

describe('tsvFormatRow', () => {
  it('tsvFormatRow(array) takes a single array of string as input', () => {
    expect(tsvFormatRow(['a', 'b', 'c'])).toBe('a\tb\tc')
  })
})
