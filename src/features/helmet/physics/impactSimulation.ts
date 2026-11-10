import { useCallback, useRef, useState } from 'react'

export const PHYSICS_STEP = 1 / 60
export const IMPACT_DAMPING = { linear: 0.5, angular: 0.8 }
export const IMPACT_FRICTION = 0.65
export const PLATFORM_HALF_EXTENTS: [number, number, number] = [1.2, 0.05, 1.2]
export const DISPLAY_UNITS_PER_METER = 5
export const HELMET_METERS_PER_UNIT = 0.34 / 1.85
export const RELEASE_ROTATION: [number, number, number] = [0.16, -0.5, 0.12]
type HelmetCollider = {
  halfExtents: [number, number, number]
  position: [number, number, number]
  mass: number
}
// Meter-space approximations of the crown/rear shell and projecting chin section.
export const HELMET_COLLIDERS: HelmetCollider[] = [
  { halfExtents: [0.115, 0.105, 0.12], position: [0, 0.015, 0.035], mass: 1.2 },
  { halfExtents: [0.105, 0.055, 0.07], position: [0, -0.065, -0.1], mass: 0.3 },
]
export type ImpactSettings = { height: number; restitution: number }
export type ImpactStatus = 'ready' | 'running' | 'paused' | 'settled'
export type ImpactTelemetry = { status: ImpactStatus; collisions: number }
export type ImpactAction = 'start' | 'pause' | 'resume' | 'reset' | 'replay'
export type ImpactHandle = { command: (action: ImpactAction) => void }
export const DEFAULT_IMPACT: ImpactSettings = { height: 0.5, restitution: 0.3 }

export function useImpactLab() {
  const [settings, setSettings] = useState(DEFAULT_IMPACT)
  const [telemetry, setTelemetry] = useState<ImpactTelemetry>({
    status: 'ready',
    collisions: 0,
  })
  const handle = useRef<ImpactHandle>(null)
  const command = useCallback(
    (action: ImpactAction) => handle.current?.command(action),
    [],
  )
  return { settings, setSettings, telemetry, setTelemetry, handle, command }
}
