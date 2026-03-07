import dsvFormat from './dsv.ts'
import type { DSV } from './dsv.ts'

const tsv = dsvFormat('\t')

export const tsvParse: DSV['parse'] = tsv.parse
export const tsvParseRows: DSV['parseRows'] = tsv.parseRows
export const tsvFormat: DSV['format'] = tsv.format
export const tsvFormatBody: DSV['formatBody'] = tsv.formatBody
export const tsvFormatRows: DSV['formatRows'] = tsv.formatRows
export const tsvFormatRow: DSV['formatRow'] = tsv.formatRow
export const tsvFormatValue: DSV['formatValue'] = tsv.formatValue
