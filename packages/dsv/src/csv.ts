import dsvFormat from './dsv.ts'
import type { DSV } from './dsv.ts'

const csv = dsvFormat(',')

export const csvParse: DSV['parse'] = csv.parse
export const csvParseRows: DSV['parseRows'] = csv.parseRows
export const csvFormat: DSV['format'] = csv.format
export const csvFormatBody: DSV['formatBody'] = csv.formatBody
export const csvFormatRows: DSV['formatRows'] = csv.formatRows
export const csvFormatRow: DSV['formatRow'] = csv.formatRow
export const csvFormatValue: DSV['formatValue'] = csv.formatValue
