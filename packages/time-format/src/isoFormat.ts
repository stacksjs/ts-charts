import { utcFormat } from './defaultLocale.ts'

export const isoSpecifier: string = '%Y-%m-%dT%H:%M:%S.%LZ'

function formatIsoNative(date: Date): string {
  return date.toISOString()
}

const formatIso: (date: Date) => string = typeof Date.prototype.toISOString === 'function'
    ? formatIsoNative
    : utcFormat(isoSpecifier) as unknown as (date: Date) => string

export default formatIso
