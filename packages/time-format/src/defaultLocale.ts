import formatLocale from './locale.ts'
import type { TimeLocaleDefinition, TimeLocaleObject } from './locale.ts'

let locale: TimeLocaleObject
export let timeFormat: (specifier: string) => (date: Date | number) => string
export let timeParse: (specifier: string) => (string: string) => Date | null
export let utcFormat: (specifier: string) => (date: Date | number) => string
export let utcParse: (specifier: string) => (string: string) => Date | null

defaultLocale({
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
})

export default function defaultLocale(definition: TimeLocaleDefinition): TimeLocaleObject {
  locale = formatLocale(definition)
  timeFormat = locale.format
  timeParse = locale.parse
  utcFormat = locale.utcFormat
  utcParse = locale.utcParse
  return locale
}
