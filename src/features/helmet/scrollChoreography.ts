export const CHECKPOINTS = [
  { id: 'intro', label: 'Introduction', yaw: 0, scale: 1, framing: -0.23, distance: 1.06 },
  { id: 'explore', label: 'Explore', yaw: -0.35, scale: 1.08, framing: -0.2, distance: 1 },
  { id: 'design', label: 'Design', yaw: 0.75, scale: 1.15, framing: 0.23, distance: 1 },
  { id: 'lighting', label: 'Lighting', yaw: -0.15, scale: 1.1, framing: -0.23, distance: 1 },
  { id: 'impact', label: 'Impact Lab', yaw: -0.65, scale: 1, framing: -0.2, distance: 1.12 },
] as const

export type CheckpointId = typeof CHECKPOINTS[number]['id']

export type ChoreographyPose = { yaw: number; scale: number; framing: number; distance: number }

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
    pose.scale = 1
    pose.framing = compact ? 0 : CHECKPOINTS[Math.round(index)].framing
    pose.distance = 1.08
    return
  }
  pose.yaw = interpolate(start.yaw, end.yaw, amount)
  // Design to Lighting briefly pulls back before the opposite composition resolves.
  pose.scale = interpolate(start.scale, end.scale, amount) - (Math.floor(index) === 2 ? Math.sin(fraction * Math.PI) * 0.25 : 0)
  pose.framing = compact ? 0 : interpolate(start.framing, end.framing, amount)
  pose.distance = interpolate(start.distance, end.distance, amount)
}
