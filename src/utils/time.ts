import type { CalendarModel } from '../types'

export type CalendarParts = { year: number; month: number; day: number }

// Wikibase / project numbering: -0001 is 1 BCE and year 0 is undefined.
const historicalYearToContinuous = (year: number) => year > 0 ? year : year + 1

const isLeapYear = (year: number, calendarModel: CalendarModel) => {
  const continuousYear = historicalYearToContinuous(year)
  if (calendarModel === 'julian') return continuousYear % 4 === 0
  return continuousYear % 4 === 0 && (continuousYear % 100 !== 0 || continuousYear % 400 === 0)
}

const daysInMonth = (year: number, month: number, calendarModel: CalendarModel) => {
  if (month === 2) return isLeapYear(year, calendarModel) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

/**
 * Parses a complete historical calendar date without repairing it.
 *
 * The project uses historical year numbering: `-0001` is 1 BCE and year zero
 * is invalid. This differs from JavaScript Date's astronomical year numbering,
 * so callers that need an instant should use `calendarDateToUtcDate` below.
 */
export function parseCalendarStrict(value: string, calendarModel: CalendarModel = 'gregorian'): CalendarParts {
  const match = /^(-?\d{1,6})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new RangeError(`Invalid calendar date syntax: ${value}`)

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!Number.isInteger(year) || year === 0) throw new RangeError(`Historical calendar dates cannot use year zero: ${value}`)
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`Invalid calendar month: ${value}`)
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month, calendarModel)) {
    throw new RangeError(`Invalid calendar day for ${calendarModel}: ${value}`)
  }
  return { year, month, day }
}

export function parseCalendar(value: string, calendarModel: CalendarModel = 'gregorian'): CalendarParts {
  const match = /^(-?\d{1,6})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(value)
  if (!match) return { year: 2026, month: 7, day: 9 }
  const parsedYear = Number(match[1])
  const year = parsedYear === 0 ? 1 : parsedYear
  const month = Math.min(12, Math.max(1, Number(match[2] ?? 1)))
  return {
    year,
    month,
    day: Math.min(daysInMonth(year, month, calendarModel), Math.max(1, Number(match[3] ?? 1))),
  }
}

export function toCalendarString(parts: CalendarParts) {
  const year = parts.year >= 0 ? String(parts.year).padStart(4, '0') : `-${String(Math.abs(parts.year)).padStart(4, '0')}`
  return `${year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

export const normalizeCalendarDate = (value: string, calendarModel: CalendarModel = 'gregorian') =>
  toCalendarString(parseCalendar(value, calendarModel))

// Integer Julian day number: a shared absolute-day axis for Gregorian and Julian source dates.
const absoluteDay = ({ year, month, day }: CalendarParts, calendarModel: CalendarModel) => {
  const continuousYear = historicalYearToContinuous(year)
  const offset = Math.floor((14 - month) / 12)
  const normalizedYear = continuousYear + 4800 - offset
  const normalizedMonth = month + 12 * offset - 3
  const shared = day
    + Math.floor((153 * normalizedMonth + 2) / 5)
    + 365 * normalizedYear
    + Math.floor(normalizedYear / 4)
  return calendarModel === 'julian'
    ? shared - 32083
    : shared - Math.floor(normalizedYear / 100) + Math.floor(normalizedYear / 400) - 32045
}

const UNIX_EPOCH_ABSOLUTE_DAY = absoluteDay({ year: 1970, month: 1, day: 1 }, 'gregorian')
const MILLISECONDS_PER_DAY = 86_400_000
const MAX_DATE_DAY_OFFSET = 100_000_000

/**
 * Converts a Gregorian or Julian civil date to a JavaScript UTC instant.
 *
 * The source date uses this project's historical year numbering. The returned
 * Date necessarily uses JavaScript's astronomical numbering, where year 0 is
 * 1 BCE. Conversion through the shared integer-day axis avoids Date.UTC's
 * special treatment of years 0–99 and preserves BCE dates safely.
 */
export function calendarDateToUtcDate(
  value: string,
  calendarModel: CalendarModel = 'gregorian',
  hour = 12,
  minute = 0,
) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new RangeError(`Invalid UTC hour: ${hour}`)
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new RangeError(`Invalid UTC minute: ${minute}`)

  const parts = parseCalendarStrict(value, calendarModel)
  const dayOffset = absoluteDay(parts, calendarModel) - UNIX_EPOCH_ABSOLUTE_DAY
  if (!Number.isSafeInteger(dayOffset) || Math.abs(dayOffset) > MAX_DATE_DAY_OFFSET) {
    throw new RangeError(`Calendar date is outside the JavaScript Date range: ${value}`)
  }
  const timestamp = dayOffset * MILLISECONDS_PER_DAY + hour * 3_600_000 + minute * 60_000
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) throw new RangeError(`Calendar date cannot be represented as UTC: ${value}`)
  return date
}

/**
 * Representative noon-UTC lighting for a historical cursor such as `-0475` or
 * `-0475-01-01`. Never builds the civil date with the JavaScript Date constructor.
 */
export function noonUtcForCursor(cursor: string, calendarModel: CalendarModel = 'gregorian'): Date | null {
  try {
    return calendarDateToUtcDate(normalizeCalendarDate(cursor, calendarModel), calendarModel, 12, 0)
  } catch {
    return null
  }
}
