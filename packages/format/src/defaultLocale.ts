import formatLocale from './locale.ts'
import type { LocaleDefinition, LocaleObject } from './locale.ts'

let locale: LocaleObject
export let format: (specifier: string) => (value: number | string | { valueOf(): number } | undefined) => string
export let formatPrefix: (specifier: string, value: number) => (value: number) => string

defaultLocale({
  thousands: ',',
  grouping: [3],
  currency: ['$', ''],
})

export default function defaultLocale(definition: LocaleDefinition): LocaleObject {
  locale = formatLocale(definition)
  format = locale.format
  formatPrefix = locale.formatPrefix
  return locale
}
