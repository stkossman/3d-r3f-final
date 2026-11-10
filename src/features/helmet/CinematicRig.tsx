import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { Group, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { sampleChoreography, type ChoreographyPose } from './scrollChoreography'
import { useReducedMotion } from './useReducedMotion'

type CinematicRigProps = { progress: MotionValue<number>; inspecting: boolean; noteOpen: boolean; children: ReactNode }
const TARGET = new Vector3(0, 0.8, 0)
const DIRECTION = new Vector3(4, 2.4, -5).normalize()

export function CinematicRig({ progress, inspecting, noteOpen, children }: CinematicRigProps) {
  const group = useRef<Group>(null)
  const { camera, size, invalidate } = useThree()
  const reduced = useReducedMotion()
  const returning = useRef(false)
  const previous = useRef({ inspecting, noteOpen })
  const goal = useRef(new Vector3())
  const sampled = useRef<ChoreographyPose>({ yaw: 0, scale: 1, framing: 0, distance: 1 })
  const current = useRef({ yaw: 0, scale: 1, framing: -0.23 })

  useLayoutEffect(() => progress.on('change', () => { if (!inspecting) invalidate() }), [progress, inspecting, invalidate])
  useLayoutEffect(() => {
    returning.current = !inspecting && (previous.current.inspecting || previous.current.noteOpen !== noteOpen)
    previous.current = { inspecting, noteOpen }
    invalidate()
  }, [inspecting, noteOpen, reduced, size.width, size.height, invalidate])

  useFrame((_, delta) => {
    if (inspecting || !group.current || !(camera instanceof PerspectiveCamera)) return
    const compact = size.width < 900
    const pose = sampled.current
    sampleChoreography(progress.get(), compact, reduced, pose)
    const halfFov = MathUtils.degToRad(camera.fov / 2)
    const tightFov = Math.min(halfFov, Math.atan(Math.tan(halfFov) * size.width / size.height))
    const distance = (compact ? 1.45 : 1.75) / Math.sin(tightFov) * pose.distance
    goal.current.copy(TARGET).addScaledVector(DIRECTION, distance)
    const scale = compact && noteOpen ? 0.53 : compact ? Math.min(pose.scale, 1.06) : pose.scale
    const blend = returning.current && !reduced ? 1 - Math.exp(-Math.min(delta, 0.05) * 9) : 1
    camera.position.lerp(goal.current, blend)
    current.current.yaw = MathUtils.lerp(group.current.rotation.y, pose.yaw, blend)
    current.current.scale = MathUtils.lerp(group.current.scale.x, scale, blend)
    current.current.framing = MathUtils.lerp(current.current.framing, pose.framing, blend)
    camera.lookAt(TARGET)
    camera.setViewOffset(size.width, size.height, current.current.framing * size.width, compact && noteOpen ? size.height * 0.35 : 0, size.width, size.height)
    group.current.rotation.y = current.current.yaw
    group.current.scale.setScalar(current.current.scale)
    if (returning.current) {
      const settled = camera.position.distanceToSquared(goal.current) < 0.00001
        && Math.abs(current.current.yaw - pose.yaw) < 0.0001
        && Math.abs(current.current.scale - scale) < 0.0001
        && Math.abs(current.current.framing - pose.framing) < 0.0001
      if (settled) returning.current = false
      else invalidate()
    }
  }, -0.5)

  return <group ref={group} name="helmet-presentation">{children}</group>
}


