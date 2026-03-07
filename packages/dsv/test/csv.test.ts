import { readFileSync } from 'fs'
import { join } from 'path'

const dataDir = join(import.meta.dir, 'data')
import { describe, expect, it } from 'bun:test'
import { csvFormat, csvFormatBody, csvFormatRow, csvFormatRows, csvParse, csvParseRows } from '../src/index.ts'
import { table } from './table.ts'

describe('csvParse', () => {
  it('csvParse(string) returns the expected objects', () => {
    expect(csvParse('a,b,c\n1,2,3\n')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
    expect(csvParse(readFileSync(join(dataDir, 'sample.csv'), 'utf-8'))).toEqual(table([{ Hello: '42', World: '"fish"' }], ['Hello', 'World']))
  })

  it('csvParse(string) does not strip whitespace', () => {
    expect(csvParse('a,b,c\n 1, 2 ,3 ')).toEqual(table([{ a: ' 1', b: ' 2 ', c: '3 ' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) treats empty fields as the empty string', () => {
    expect(csvParse('a,b,c\n1,,3')).toEqual(table([{ a: '1', b: '', c: '3' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) treats a trailing empty field as the empty string', () => {
    expect(csvParse('a,b,c\n1,2,\n1,2,\n')).toEqual(table([{ a: '1', b: '2', c: '' }, { a: '1', b: '2', c: '' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) treats a trailing empty field on the last line as the empty string', () => {
    expect(csvParse('a,b,c\n1,2,\n1,2,')).toEqual(table([{ a: '1', b: '2', c: '' }, { a: '1', b: '2', c: '' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) treats quoted empty strings as the empty string', () => {
    expect(csvParse('a,b,c\n1,"",3')).toEqual(table([{ a: '1', b: '', c: '3' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) allows the last field to have unterminated quotes', () => {
    expect(csvParse('a,b,c\n1,2,"3')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
    expect(csvParse('a,b,c\n1,2,"')).toEqual(table([{ a: '1', b: '2', c: '' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) ignores a blank last line', () => {
    expect(csvParse('a,b,c\n1,2,3\n')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) treats a blank non-last line as a single-column empty string', () => {
    expect(csvParse('a,b,c\n1,2,3\n\n')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '', b: '', c: '' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) returns empty strings for missing columns', () => {
    expect(csvParse('a,b,c\n1\n1,2')).toEqual(table([{ a: '1', b: '', c: '' }, { a: '1', b: '2', c: '' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) does not ignore a whitespace-only last line', () => {
    expect(csvParse('a,b,c\n1,2,3\n ')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: ' ', b: '', c: '' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) parses quoted values', () => {
    expect(csvParse('a,b,c\n"1",2,3')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
    expect(csvParse('a,b,c\n"1",2,3\n')).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) parses quoted values with quotes', () => {
    expect(csvParse('a\n"""hello"""')).toEqual(table([{ a: '"hello"' }], ['a']))
  })

  it('csvParse(string) parses quoted values with newlines', () => {
    expect(csvParse('a\n"new\nline"')).toEqual(table([{ a: 'new\nline' }], ['a']))
    expect(csvParse('a\n"new\rline"')).toEqual(table([{ a: 'new\rline' }], ['a']))
    expect(csvParse('a\n"new\r\nline"')).toEqual(table([{ a: 'new\r\nline' }], ['a']))
  })

  it('csvParse(string) observes Unix, Mac and DOS newlines', () => {
    expect(csvParse('a,b,c\n1,2,3\n4,5,"6"\n7,8,9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
    expect(csvParse('a,b,c\r1,2,3\r4,5,"6"\r7,8,9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
    expect(csvParse('a,b,c\r\n1,2,3\r\n4,5,"6"\r\n7,8,9')).toEqual(table([{ a: '1', b: '2', c: '3' }, { a: '4', b: '5', c: '6' }, { a: '7', b: '8', c: '9' }], ['a', 'b', 'c']))
  })

  it('csvParse(string) returns columns in the input order', () => {
    expect(csvParse('a,b,c\n').columns).toEqual(['a', 'b', 'c'])
    expect(csvParse('a,c,b\n').columns).toEqual(['a', 'c', 'b'])
    expect(csvParse('a,0,1\n').columns).toEqual(['a', '0', '1'])
    expect(csvParse('1,0,a\n').columns).toEqual(['1', '0', 'a'])
  })

  it('csvParse(string, row) returns the expected converted objects', () => {
    function row(d: any) { d.Hello = -d.Hello; return d }
    expect(csvParse(readFileSync(join(dataDir, 'sample.csv'), 'utf-8'), row)).toEqual(table([{ Hello: -42, World: '"fish"' }], ['Hello', 'World']))
    expect(csvParse('a,b,c\n1,2,3\n', function (d: any) { return d })).toEqual(table([{ a: '1', b: '2', c: '3' }], ['a', 'b', 'c']))
  })

  it('csvParse(string, row) skips rows if row returns null or undefined', () => {
    function row(d: any, i: number) { return [d, null, undefined, false][i] }
    expect(csvParse('field\n42\n\n\n\n', row as any)).toEqual(table([{ field: '42' }, false] as any, ['field']))
    expect(csvParse('a,b,c\n1,2,3\n2,3,4', function (d: any) { return (d.a as any) & 1 ? null : d })).toEqual(table([{ a: '2', b: '3', c: '4' }], ['a', 'b', 'c']))
    expect(csvParse('a,b,c\n1,2,3\n2,3,4', function (d: any) { return (d.a as any) & 1 ? undefined : d })).toEqual(table([{ a: '2', b: '3', c: '4' }], ['a', 'b', 'c']))
  })

  it('csvParse(string, row) calls row(d, i) for each row d, in order', () => {
    const rows: any[] = []
    csvParse('a\n1\n2\n3\n4', function (d: any, i: number) { rows.push({ d: d, i: i }) })
    expect(rows).toEqual([{ d: { a: '1' }, i: 0 }, { d: { a: '2' }, i: 1 }, { d: { a: '3' }, i: 2 }, { d: { a: '4' }, i: 3 }])
  })
})

describe('csvParseRows', () => {
  it('csvParseRows(string) returns the expected array of array of string', () => {
    expect(csvParseRows('a,b,c')).toEqual([['a', 'b', 'c']])
    expect(csvParseRows('a,b,c\n1,2,3')).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('csvParseRows(string) does not strip whitespace', () => {
    expect(csvParseRows(' 1, 2 ,3 ')).toEqual([[' 1', ' 2 ', '3 ']])
  })

  it('csvParseRows(string) treats empty fields as the empty string', () => {
    expect(csvParseRows('1,,3')).toEqual([['1', '', '3']])
  })

  it('csvParseRows(string) treats a trailing empty field as the empty string', () => {
    expect(csvParseRows('1,2,\n1,2,3')).toEqual([['1', '2', ''], ['1', '2', '3']])
  })

  it('csvParseRows(string) treats a trailing empty field on the last line as the empty string', () => {
    expect(csvParseRows('1,2,\n')).toEqual([['1', '2', '']])
    expect(csvParseRows('1,2,')).toEqual([['1', '2', '']])
  })

  it('csvParseRows(string) treats quoted empty strings as the empty string', () => {
    expect(csvParseRows('"",2,3')).toEqual([['', '2', '3']])
    expect(csvParseRows('1,"",3')).toEqual([['1', '', '3']])
    expect(csvParseRows('1,2,""')).toEqual([['1', '2', '']])
  })

  it('csvParseRows(string) allows the last field to have unterminated quotes', () => {
    expect(csvParseRows('1,2,"3')).toEqual([['1', '2', '3']])
    expect(csvParseRows('1,2,"')).toEqual([['1', '2', '']])
  })

  it('csvParseRows(string) ignores a blank last line', () => {
    expect(csvParseRows('1,2,3\n')).toEqual([['1', '2', '3']])
  })

  it('csvParseRows(string) treats a blank non-last line as a single-column empty string', () => {
    expect(csvParseRows('1,2,3\n\n')).toEqual([['1', '2', '3'], ['']])
    expect(csvParseRows('1,2,3\n""\n')).toEqual([['1', '2', '3'], ['']])
  })

  it('csvParseRows(string) can return rows of varying length', () => {
    expect(csvParseRows('1\n1,2\n1,2,3')).toEqual([['1'], ['1', '2'], ['1', '2', '3']])
  })

  it('csvParseRows(string) does not ignore a whitespace-only last line', () => {
    expect(csvParseRows('1,2,3\n ')).toEqual([['1', '2', '3'], [' ']])
  })

  it('csvParseRows(string) parses quoted values', () => {
    expect(csvParseRows('"1",2,3\n')).toEqual([['1', '2', '3']])
    expect(csvParseRows('"hello"')).toEqual([['hello']])
  })

  it('csvParseRows(string) parses quoted values with quotes', () => {
    expect(csvParseRows('"""hello"""')).toEqual([['"hello"']])
  })

  it('csvParseRows(string) parses quoted values with newlines', () => {
    expect(csvParseRows('"new\nline"')).toEqual([['new\nline']])
    expect(csvParseRows('"new\rline"')).toEqual([['new\rline']])
    expect(csvParseRows('"new\r\nline"')).toEqual([['new\r\nline']])
  })

  it('csvParseRows(string) parses Unix, Mac and DOS newlines', () => {
    expect(csvParseRows('a,b,c\n1,2,3\n4,5,"6"\n7,8,9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
    expect(csvParseRows('a,b,c\r1,2,3\r4,5,"6"\r7,8,9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
    expect(csvParseRows('a,b,c\r\n1,2,3\r\n4,5,"6"\r\n7,8,9')).toEqual([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']])
  })

  it('csvParseRows("") returns the empty array', () => {
    expect(csvParseRows('')).toEqual([])
  })

  it('csvParseRows("\\n") returns an array of one empty string', () => {
    expect(csvParseRows('\n')).toEqual([['']])
    expect(csvParseRows('\r')).toEqual([['']])
    expect(csvParseRows('\r\n')).toEqual([['']])
  })

  it('csvParseRows("\\n\\n") returns an array of two empty strings', () => {
    expect(csvParseRows('\n\n')).toEqual([[''], ['']])
  })

  it('csvParseRows(string, row) returns the expected converted array of array of string', () => {
    function row(d: any, i: number) { if (i) d[0] = -d[0]; return d }
    expect(csvParseRows(readFileSync(join(dataDir, 'sample.csv'), 'utf-8'), row)).toEqual([['Hello', 'World'], [-42, '"fish"']])
    expect(csvParseRows('a,b,c\n1,2,3\n', function (d: any) { return d })).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('csvParseRows(string, row) skips rows if row returns null or undefined', () => {
    function row(d: any, i: number) { return [d, null, undefined, false][i] }
    expect(csvParseRows('field\n42\n\n\n', row as any)).toEqual([['field'], false] as any)
    expect(csvParseRows('a,b,c\n1,2,3\n2,3,4', function (_d: any, i: number) { return i & 1 ? null : _d })).toEqual([['a', 'b', 'c'], ['2', '3', '4']])
    expect(csvParseRows('a,b,c\n1,2,3\n2,3,4', function (_d: any, i: number) { return i & 1 ? undefined : _d })).toEqual([['a', 'b', 'c'], ['2', '3', '4']])
  })

  it('csvParseRows(string, row) invokes row(d, i) for each row d, in order', () => {
    const rows: any[] = []
    csvParseRows('a\n1\n2\n3\n4', function (d: any, i: number) { rows.push({ d: d, i: i }) })
    expect(rows).toEqual([{ d: ['a'], i: 0 }, { d: ['1'], i: 1 }, { d: ['2'], i: 2 }, { d: ['3'], i: 3 }, { d: ['4'], i: 4 }])
  })
})

describe('csvFormat', () => {
  it('csvFormat(array) takes an array of objects as input', () => {
    expect(csvFormat([{ a: 1, b: 2, c: 3 }])).toBe('a,b,c\n1,2,3')
  })

  it('csvFormat(array) converts dates to ISO 8601', () => {
    expect(csvFormat([{ date: new Date(Date.UTC(2018, 0, 1)) }])).toBe('date\n2018-01-01')
    const local = new Date(2018, 0, 1)
    const h = local.getUTCHours()
    const m = local.getUTCMinutes()
    const expected = h || m ? `date\n2018-01-01T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}Z` : 'date\n2018-01-01'
    expect(csvFormat([{ date: local }])).toBe(expected)
  })

  it('csvFormat(array) escapes field names and values containing delimiters', () => {
    expect(csvFormat([{ 'foo,bar': true }])).toBe('"foo,bar"\ntrue')
    expect(csvFormat([{ field: 'foo,bar' }])).toBe('field\n"foo,bar"')
  })

  it('csvFormat(array) computes the union of all fields', () => {
    expect(csvFormat([{ a: 1 }, { a: 1, b: 2 }, { a: 1, b: 2, c: 3 }, { b: 1, c: 2 }, { c: 1 }])).toBe('a,b,c\n1,,\n1,2,\n1,2,3\n,1,2\n,,1')
  })

  it('csvFormat(array) orders fields by first-seen', () => {
    expect(csvFormat([{ a: 1, b: 2 }, { c: 3, b: 4 }, { c: 5, a: 1, b: 2 }])).toBe('a,b,c\n1,2,\n,4,3\n1,2,5')
  })

  it('csvFormat(array, columns) observes the specified array of column names', () => {
    expect(csvFormat([{ a: 1, b: 2, c: 3 }], ['c', 'b', 'a'])).toBe('c,b,a\n3,2,1')
    expect(csvFormat([{ a: 1, b: 2, c: 3 }], ['c', 'a'])).toBe('c,a\n3,1')
    expect(csvFormat([{ a: 1, b: 2, c: 3 }], [])).toBe('\n')
    expect(csvFormat([{ a: 1, b: 2, c: 3 }], ['d'])).toBe('d\n')
  })

  it('csvFormat(array, columns) coerces column names to strings', () => {
    expect(csvFormat([{ a: 1, b: 2, '"fish"': 3 }], [{ toString: function () { return '"fish"' } } as any])).toBe('"""fish"""\n3')
    expect(csvFormat([{ a: 1, b: 2, c: 3 }], ['a', null as any, 'b', undefined as any, 'c'])).toBe('a,,b,,c\n1,,2,,3')
  })

  it('csvFormat(array, columns) coerces field values to strings', () => {
    expect(csvFormat([{ a: { toString: function () { return '"fish"' } } }])).toBe('a\n"""fish"""')
    expect(csvFormat([{ a: null, b: undefined, c: 3 }])).toBe('a,b,c\n,,3')
  })
})

describe('csvFormatBody', () => {
  it('csvFormatBody(array) omits the header row', () => {
    expect(csvFormatBody([{ a: 1, b: 2 }, { c: 3, b: 4 }, { c: 5, a: 1, b: 2 }])).toBe('1,2,\n,4,3\n1,2,5')
  })

  it('csvFormatBody(array, columns) omits the header row', () => {
    expect(csvFormatBody([{ a: 1, b: 2 }, { c: 3, b: 4 }, { c: 5, a: 1, b: 2 }], ['a', 'b'])).toBe('1,2\n,4\n1,2')
  })
})

describe('csvFormatRows', () => {
  it('csvFormatRows(array) takes an array of array of string as input', () => {
    expect(csvFormatRows([['a', 'b', 'c'], ['1', '2', '3']])).toBe('a,b,c\n1,2,3')
  })

  it('csvFormatRows(array) separates lines using Unix newline', () => {
    expect(csvFormatRows([[], []])).toBe('\n')
  })

  it('csvFormatRows(array) converts dates to ISO 8601', () => {
    expect(csvFormatRows([[new Date(Date.UTC(2018, 0, 1))]])).toBe('2018-01-01')
    const local = new Date(2018, 0, 1)
    const h = local.getUTCHours()
    const m = local.getUTCMinutes()
    const expected = h || m ? `2018-01-01T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}Z` : '2018-01-01'
    expect(csvFormatRows([[local]])).toBe(expected)
  })

  it('csvFormatRows(array) does not strip whitespace', () => {
    expect(csvFormatRows([['a ', ' b', 'c'], ['1', '2', '3 ']])).toBe('a , b,c\n1,2,3 ')
  })

  it('csvFormatRows(array) does not quote simple values', () => {
    expect(csvFormatRows([['a'], [1]])).toBe('a\n1')
  })

  it('csvFormatRows(array) escapes double quotes', () => {
    expect(csvFormatRows([['"fish"']])).toBe('"""fish"""')
  })

  it('csvFormatRows(array) escapes Unix newlines', () => {
    expect(csvFormatRows([['new\nline']])).toBe('"new\nline"')
  })

  it('csvFormatRows(array) escapes Windows newlines', () => {
    expect(csvFormatRows([['new\rline']])).toBe('"new\rline"')
  })

  it('csvFormatRows(array) escapes values containing delimiters', () => {
    expect(csvFormatRows([['oxford,comma']])).toBe('"oxford,comma"')
  })
})

describe('csvFormatRow', () => {
  it('csvFormatRow(array) takes a single array of string as input', () => {
    expect(csvFormatRow(['a', 'b', 'c'])).toBe('a,b,c')
  })
})
