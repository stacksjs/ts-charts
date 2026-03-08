const EOL = {}
const EOF = {}
const QUOTE = 34
const NEWLINE = 10
const RETURN = 13

export type DSVRowString = Record<string, string>

export interface DSVParsedArray<T> extends Array<T> {
  columns: string[]
}

export type DSVRowConverter<T> = (d: DSVRowString, i: number, columns: string[]) => T | null | undefined
export type DSVRowsConverter<T> = (d: string[], i: number) => T | null | undefined

export interface DSV {
  parse<T = DSVRowString>(text: string, f?: DSVRowConverter<T>): DSVParsedArray<T>
  parseRows<T = string[]>(text: string, f?: DSVRowsConverter<T>): T[]
  format(rows: Record<string, unknown>[], columns?: string[]): string
  formatBody(rows: Record<string, unknown>[], columns?: string[]): string
  formatRows(rows: unknown[][]): string
  formatRow(row: unknown[]): string
  formatValue(value: unknown): string
}

function objectConverter(columns: string[]): (d: string[]) => DSVRowString {
  return new Function('d', 'return {' + columns.map(function (name: string, i: number) {
    return JSON.stringify(name) + ': d[' + i + '] || \'\''
  }).join(',') + '}') as (d: string[]) => DSVRowString
}

function customConverter<T>(columns: string[], f: DSVRowConverter<T>): (row: string[], i: number) => T | null | undefined {
  const object = objectConverter(columns)
  return function (row: string[], i: number): T | null | undefined {
    return f(object(row), i, columns)
  }
}

// Compute unique columns in order of discovery.
function inferColumns(rows: Record<string, unknown>[]): string[] {
  const columnSet = Object.create(null) as Record<string, string>
  const columns: string[] = []

  rows.forEach(function (row) {
    for (const column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column)
      }
    }
  })

  return columns
}

function pad(value: number, width: number): string {
  let s = value + ''
  const length = s.length
  return length < width ? new Array(width - length + 1).join('0') + s : s
}

function formatYear(year: number): string {
  return year < 0 ? '-' + pad(-year, 6)
    : year > 9999 ? '+' + pad(year, 6)
    : pad(year, 4)
}

function formatDate(date: Date): string {
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  const milliseconds = date.getUTCMilliseconds()
  return isNaN(date as unknown as number) ? 'Invalid Date'
    : formatYear(date.getUTCFullYear()) + '-' + pad(date.getUTCMonth() + 1, 2) + '-' + pad(date.getUTCDate(), 2)
      + (milliseconds ? 'T' + pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3) + 'Z'
      : seconds ? 'T' + pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + 'Z'
      : minutes || hours ? 'T' + pad(hours, 2) + ':' + pad(minutes, 2) + 'Z'
      : '')
}

export default function dsvFormat(delimiter: string): DSV {
  const reFormat = new RegExp('["' + delimiter + '\n\r]')
  const DELIMITER = delimiter.charCodeAt(0)

  // eslint-disable-next-line ts/no-explicit-any -- generic parse returns caller-determined type
  function parse(text: string, f?: DSVRowConverter<any>): DSVParsedArray<any> {
    // eslint-disable-next-line ts/no-explicit-any
    let convert: ((row: string[], i: number) => any) | undefined
    let columns: string[] | undefined
    const rows = parseRows(text, function (row: string[], i: number) {
      if (convert) return convert(row, i - 1)
      columns = row
      convert = f ? customConverter(row, f) : objectConverter(row)
    // eslint-disable-next-line ts/no-explicit-any
    }) as DSVParsedArray<any>
    rows.columns = columns || []
    return rows
  }

  // eslint-disable-next-line ts/no-explicit-any -- generic parseRows returns caller-determined type
  function parseRows(text: string, f?: DSVRowsConverter<any>): any[] {
    const rows: unknown[] = [] // output rows
    const N = text.length
    let I = 0 // current character index
    let n = 0 // current line number
    let t: unknown // current token
    let eof = N <= 0 // current token followed by EOF?
    let eol = false // current token followed by EOL?

    // Strip the trailing newline.
    let end = N
    if (text.charCodeAt(end - 1) === NEWLINE) --end
    if (text.charCodeAt(end - 1) === RETURN) --end

    function token(): unknown {
      if (eof) return EOF
      if (eol) return eol = false, EOL

      // Unescape quotes.
      let i: number
      let j = I
      let c: number
      if (text.charCodeAt(j) === QUOTE) {
        while (I++ < end && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
        if ((i = I) >= end) eof = true
        else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I }
        return text.slice(j + 1, i - 1).replace(/""/g, '"')
      }

      // Find next delimiter or newline.
      while (I < end) {
        if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I }
        else if (c !== DELIMITER) continue
        return text.slice(j, i)
      }

      // Return last token before EOF.
      return eof = true, text.slice(j, end)
    }

    while ((t = token()) !== EOF) {
      const row: string[] = []
      while (t !== EOL && t !== EOF) { row.push(t as string); t = token() }
      if (f && (t = f(row, n++)) == null) continue
      rows.push(f ? t : row)
    }

    return rows
  }

  function preformatBody(rows: Record<string, unknown>[], columns: string[]): string[] {
    return rows.map(function (row) {
      return columns.map(function (column) {
        return formatValue(row[column])
      }).join(delimiter)
    })
  }

  function format(rows: Record<string, unknown>[], columns?: string[]): string {
    const cols = columns == null ? inferColumns(rows) : columns
    return [cols.map(formatValue).join(delimiter)].concat(preformatBody(rows, cols)).join('\n')
  }

  function formatBody(rows: Record<string, unknown>[], columns?: string[]): string {
    const cols = columns == null ? inferColumns(rows) : columns
    return preformatBody(rows, cols).join('\n')
  }

  function formatRows(rows: unknown[][]): string {
    return rows.map(formatRow).join('\n')
  }

  function formatRow(row: unknown[]): string {
    return row.map(formatValue).join(delimiter)
  }

  function formatValue(value: unknown): string {
    return value == null ? ''
      : value instanceof Date ? formatDate(value)
      : reFormat.test(value += '') ? '"' + (value as string).replace(/"/g, '""') + '"'
      : value as string
  }

  return {
    parse,
    parseRows,
    format,
    formatBody,
    formatRows,
    formatRow,
    formatValue,
  }
}
