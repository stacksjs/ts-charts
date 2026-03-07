import { describe, expect, it } from 'bun:test'
import { timeFormat, timeFormatDefaultLocale, timeParse, utcFormat, utcParse } from '../src/index.ts'
import type { TimeLocaleDefinition } from '../src/index.ts'

const enUs: TimeLocaleDefinition = {
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const frFr: TimeLocaleDefinition = {
  dateTime: '%A %e %B %Y à %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
}

describe('defaultLocale', () => {
  it('timeFormat(specifier) defaults to en-US', () => {
    expect(timeFormat('%c')(new Date(2000, 0, 1))).toBe('1/1/2000, 12:00:00 AM')
  })

  it('timeParse(specifier) defaults to en-US', () => {
    expect(+timeParse('%c')('1/1/2000, 12:00:00 AM')!).toBe(+new Date(2000, 0, 1))
  })

  it('utcFormat(specifier) defaults to en-US', () => {
    expect(utcFormat('%c')(new Date(Date.UTC(2000, 0, 1)))).toBe('1/1/2000, 12:00:00 AM')
  })

  it('utcParse(specifier) defaults to en-US', () => {
    expect(+utcParse('%c')('1/1/2000, 12:00:00 AM')!).toBe(+new Date(Date.UTC(2000, 0, 1)))
  })

  it('timeFormatDefaultLocale(definition) returns the new default locale', () => {
    const locale = timeFormatDefaultLocale(frFr)
    try {
      expect(locale.format('%c')(new Date(2000, 0, 1))).toBe('samedi  1 janvier 2000 à 00:00:00')
    } finally {
      timeFormatDefaultLocale(enUs)
    }
  })

  it('timeFormatDefaultLocale(definition) affects timeFormat', () => {
    const locale = timeFormatDefaultLocale(frFr)
    try {
      expect(timeFormat).toBe(locale.format)
      expect(timeFormat('%c')(new Date(2000, 0, 1))).toBe('samedi  1 janvier 2000 à 00:00:00')
    } finally {
      timeFormatDefaultLocale(enUs)
    }
  })

  it('timeFormatDefaultLocale(definition) affects timeParse', () => {
    const locale = timeFormatDefaultLocale(frFr)
    try {
      expect(timeParse).toBe(locale.parse)
      expect(+timeParse('%c')('samedi  1 janvier 2000 à 00:00:00')!).toBe(+new Date(2000, 0, 1))
    } finally {
      timeFormatDefaultLocale(enUs)
    }
  })

  it('timeFormatDefaultLocale(definition) affects utcFormat', () => {
    const locale = timeFormatDefaultLocale(frFr)
    try {
      expect(utcFormat).toBe(locale.utcFormat)
      expect(utcFormat('%c')(new Date(Date.UTC(2000, 0, 1)))).toBe('samedi  1 janvier 2000 à 00:00:00')
    } finally {
      timeFormatDefaultLocale(enUs)
    }
  })

  it('timeFormatDefaultLocale(definition) affects utcParse', () => {
    const locale = timeFormatDefaultLocale(frFr)
    try {
      expect(utcParse).toBe(locale.utcParse)
      expect(+utcParse('%c')('samedi  1 janvier 2000 à 00:00:00')!).toBe(+new Date(Date.UTC(2000, 0, 1)))
    } finally {
      timeFormatDefaultLocale(enUs)
    }
  })
})
