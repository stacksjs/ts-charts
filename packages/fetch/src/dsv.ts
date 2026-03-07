import { csvParse, dsvFormat, tsvParse } from '@ts-charts/dsv'
import type { DSVParsedArray, DSVRowString } from '@ts-charts/dsv'
import text from './text'

type RowConverter<T> = (rawRow: DSVRowString, index: number, columns: string[]) => T | undefined | null

type DsvFetchFn = (input: RequestInfo | URL, init?: RequestInit | RowConverter<any>, row?: RowConverter<any>) => Promise<DSVParsedArray<any>>

function dsvParse(parse: (text: string, row?: RowConverter<any>) => DSVParsedArray<any>): DsvFetchFn {
  return function (input: RequestInfo | URL, init?: RequestInit | RowConverter<any>, row?: RowConverter<any>): Promise<DSVParsedArray<any>> {
    if (arguments.length === 2 && typeof init === 'function') { row = init as RowConverter<any>; init = undefined }
    return text(input, init as RequestInit | undefined).then(function (response: string): DSVParsedArray<any> {
      return parse(response, row)
    })
  }
}

export default function dsv(delimiter: string, input: RequestInfo | URL, init?: RequestInit | RowConverter<any>, row?: RowConverter<any>): Promise<DSVParsedArray<any>> {
  if (arguments.length === 3 && typeof init === 'function') { row = init as RowConverter<any>; init = undefined }
  const format = dsvFormat(delimiter)
  return text(input, init as RequestInit | undefined).then(function (response: string): DSVParsedArray<any> {
    return format.parse(response, row as any) as unknown as DSVParsedArray<any>
  })
}

export const csv: DsvFetchFn = dsvParse(csvParse as any)
export const tsv: DsvFetchFn = dsvParse(tsvParse as any)
