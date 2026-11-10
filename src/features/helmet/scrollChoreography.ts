export const CHECKPOINTS = [
  { id: 'intro', label: 'Introduction', yaw: 0.08, pitch: -0.06, roll: -0.04, x: 0.08, y: 0.02, scale: 1.12, framing: -0.24, distance: 1 },
  { id: 'explore', label: 'Explore', yaw: -0.32, pitch: 0.04, roll: 0.02, x: 0.02, y: 0.14, scale: 1.18, framing: -0.22, distance: 0.98 },
  { id: 'design', label: 'Design', yaw: 0.66, pitch: -0.1, roll: -0.08, x: -0.08, y: 0.04, scale: 1.24, framing: 0.23, distance: 1 },
  { id: 'lighting', label: 'Lighting', yaw: -0.3, pitch: 0.08, roll: 0.06, x: 0.08, y: -0.08, scale: 1.22, framing: -0.24, distance: 0.99 },
  { id: 'impact', label: 'Impact Lab', yaw: -0.82, pitch: 0.22, roll: -0.14, x: 0, y: 0.1, scale: 1.16, framing: -0.22, distance: 1.04 },
] as const

export type CheckpointId = typeof CHECKPOINTS[number]['id']

// Center of the existing normalized model and its annotation coordinate space.
export const HELMET_CENTER_Y = 1.04

export type ChoreographyPose = {
  yaw: number; pitch: number; roll: number; x: number; y: number
  scale: number; framing: number; distance: number
}

function interpolate(start: number, end: number, amount: number) {
  return start + (end - start) * amount
}

export function sampleChoreography(progress: number, compact: boolean, reducedMotion: boolean, pose: ChoreographyPose) {
  const index = Math.max(0, Math.min(4, progress * 4))
  const start = CHECKPOINTS[Math.floor(index)]
  const end = CHECKPOINTS[Math.min(4, Math.floor(index) + 1)]
  const fraction = index % 1
  const amount = fraction * fraction * (3 - 2 * fraction)
  if (reducedMotion) {
    pose.yaw = 0
    pose.pitch = 0
    pose.roll = 0
    pose.x = 0
    pose.y = 0
    pose.scale = 1.12
    pose.framing = compact ? 0 : CHECKPOINTS[Math.round(index)].framing
    pose.distance = 1.02
    return
  }
  pose.yaw = interpolate(start.yaw, end.yaw, amount)
  const arc = Math.sin(fraction * Math.PI) ** 2
  const crossingStudio = Math.floor(index) === 2
  pose.pitch = interpolate(start.pitch, end.pitch, amount)
  pose.roll = interpolate(start.roll, end.roll, amount)
  pose.x = compact ? 0 : interpolate(start.x, end.x, amount)
  pose.y = (interpolate(start.y, end.y, amount) + arc * 0.22) * (compact ? 0.4 : 1)
  // Retreat while crossing the studio, then approach the lighting close-up.
  pose.scale = interpolate(start.scale, end.scale, amount) - (crossingStudio ? arc * 0.18 : 0)
  if (compact) pose.scale = Math.min(pose.scale, 1.1)
  pose.framing = compact ? 0 : interpolate(start.framing, end.framing, amount)
  pose.distance = interpolate(start.distance, end.distance, amount) + arc * (crossingStudio ? 0.22 : 0.06)
}
