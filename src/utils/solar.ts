import * as THREE from 'three'
import { latLngToVector3 } from './geo'
import { solarTelemetryUtc } from './solarTelemetry'

export type SolarState = {
  subsolarLat: number
  subsolarLon: number
  equationOfTimeMinutes: number
  direction: THREE.Vector3
}

export function solarStateUtc(date: Date): SolarState {
  const telemetry = solarTelemetryUtc(date)
  return {
    ...telemetry,
    direction: latLngToVector3(telemetry.subsolarLat, telemetry.subsolarLon, 1).normalize(),
  }
}
