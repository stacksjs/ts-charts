import { csvParse, dsvFormat, tsvParse } from '@ts-charts/dsv'
import type { DSVParsedArray, DSVRowString } from '@ts-charts/dsv'
import text from './text'

type RowConverter<T> = (rawRow: DSVRowString, index: number, columns: string[]) => T | undefined | null

// eslint-disable-next-line ts/no-explicit-any -- generic fetch wrappers pass through caller-determined row types
type DsvFetchFn = (input: RequestInfo | URL, init?: RequestInit | RowConverter<unknown>, row?: RowConverter<unknown>) => Promise<DSVParsedArray<unknown>>

function dsvParse(parse: (text: string, row?: RowConverter<unknown>) => DSVParsedArray<unknown>): DsvFetchFn {
  return function (input: RequestInfo | URL, init?: RequestInit | RowConverter<unknown>, row?: RowConverter<unknown>): Promise<DSVParsedArray<unknown>> {
    if (arguments.length === 2 && typeof init === 'function') { row = init as RowConverter<unknown>; init = undefined }
    return text(input, init as RequestInit | undefined).then(function (response: string): DSVParsedArray<unknown> {
      return parse(response, row)
    })
  }
}

export default function dsv(delimiter: string, input: RequestInfo | URL, init?: RequestInit | RowConverter<unknown>, row?: RowConverter<unknown>): Promise<DSVParsedArray<unknown>> {
  if (arguments.length === 3 && typeof init === 'function') { row = init as RowConverter<unknown>; init = undefined }
  const format = dsvFormat(delimiter)
  return text(input, init as RequestInit | undefined).then(function (response: string): DSVParsedArray<unknown> {
    return format.parse(response, row as RowConverter<unknown>) as DSVParsedArray<unknown>
  })
}

export const csv: DsvFetchFn = dsvParse(csvParse as (text: string, row?: RowConverter<unknown>) => DSVParsedArray<unknown>)
export const tsv: DsvFetchFn = dsvParse(tsvParse as (text: string, row?: RowConverter<unknown>) => DSVParsedArray<unknown>)
