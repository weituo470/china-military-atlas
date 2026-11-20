export type SolarTelemetry = {
  subsolarLat: number
  subsolarLon: number
  equationOfTimeMinutes: number
}

const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)

/**
 * Approximate subsolar point from a UTC instant.
 * Uses a NOAA-style Fourier series on the day of year — lean enough
 * for globe lighting, not a historical ephemeris of record.
 */
export function solarTelemetryUtc(date: Date): SolarTelemetry {
  const year = date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const dayOfYear = Math.floor((Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - start) / 86_400_000) + 1
  const daysInYear = isLeapYear(year) ? 366 : 365
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const gamma = (2 * Math.PI / daysInYear) * (dayOfYear - 1 + (utcHours - 12) / 24)
  const equationOfTimeMinutes = 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  )
  const declination = 0.006918
    - 0.399912 * Math.cos(gamma)
    + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma)
    + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma)
    + 0.00148 * Math.sin(3 * gamma)
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60
  const rawLongitude = (720 - utcMinutes - equationOfTimeMinutes) / 4
  const subsolarLon = ((rawLongitude + 180) % 360 + 360) % 360 - 180

  return {
    subsolarLat: declination * 180 / Math.PI,
    subsolarLon,
    equationOfTimeMinutes,
  }
}
