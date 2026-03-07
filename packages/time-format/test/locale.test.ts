import { describe, expect, it } from 'bun:test'
import { timeFormatLocale } from '../src/index.ts'
import type { TimeLocaleDefinition } from '../src/index.ts'

const localeData: Record<string, TimeLocaleDefinition> = {
  'en-US': {
    dateTime: '%x, %X',
    date: '%-m/%-d/%Y',
    time: '%-I:%M:%S %p',
    periods: ['AM', 'PM'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
}

describe('locale', () => {
  it('locale data is valid', () => {
    for (const [, locale] of Object.entries(localeData)) {
      expect(Object.keys(locale).sort()).toEqual(['date', 'dateTime', 'days', 'months', 'periods', 'shortDays', 'shortMonths', 'time'])
      timeFormatLocale(locale)
    }
  })
})
