import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { Euler, Group, MathUtils, Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { HELMET_CENTER_Y, sampleChoreography, type ChoreographyPose } from './scrollChoreography'
import { useReducedMotion } from './useReducedMotion'

type CinematicRigProps = { progress: MotionValue<number>; inspecting: boolean; noteOpen: boolean; children: ReactNode }
const TARGET = new Vector3(0, HELMET_CENTER_Y, 0)
const DIRECTION = new Vector3(4, 2.4, -5).normalize()
const RIGHT = new Vector3().crossVectors(DIRECTION, new Vector3(0, 1, 0)).normalize()
const UP = new Vector3().crossVectors(RIGHT, DIRECTION).normalize()

export function CinematicRig({ progress, inspecting, noteOpen, children }: CinematicRigProps) {
  const group = useRef<Group>(null)
  const { camera, size, invalidate } = useThree()
  const reduced = useReducedMotion()
  const returning = useRef(false)
  const previous = useRef({ inspecting, noteOpen })
  const goal = useRef(new Vector3())
  const positionGoal = useRef(new Vector3())
  const rotationGoal = useRef(new Quaternion())
  const rotation = useRef(new Euler())
  const cameraRotationGoal = useRef(new Quaternion())
  const lookAtMatrix = useRef(new Matrix4())
  const sampled = useRef<ChoreographyPose>({ yaw: 0, pitch: 0, roll: 0, x: 0, y: 0, scale: 1, framing: 0, distance: 1 })
  const current = useRef({ framing: 0, verticalFraming: 0 })

  useLayoutEffect(() => progress.on('change', () => { if (!inspecting) invalidate() }), [progress, inspecting, invalidate])
  useLayoutEffect(() => {
    returning.current = !inspecting && (previous.current.inspecting || previous.current.noteOpen !== noteOpen)
    if (!inspecting && previous.current.inspecting) {
      // Inspect clears the projection offset; blend back from that actual projection.
      current.current.framing = 0
      current.current.verticalFraming = 0
    }
    previous.current = { inspecting, noteOpen }
    invalidate()
  }, [inspecting, noteOpen, reduced, size.width, size.height, invalidate])

  useFrame((_, delta) => {
    if (inspecting || !group.current || !(camera instanceof PerspectiveCamera)) return
    const compact = size.width < 900
    const pose = sampled.current
    sampleChoreography(progress.get(), compact, reduced, pose)
    const halfFov = MathUtils.degToRad(camera.fov / 2)
    // Fit the helmet in its side of the desktop layout, or the full mobile scene.
    const availableAspect = size.width / size.height * (compact ? 1 : 0.52)
    // Reserve space for the fixed desktop header and camera toolbar on short screens.
    const availableHeight = compact ? 0.9 : Math.max(0.35, 1 - 240 / size.height)
    const tightFov = Math.atan(Math.tan(halfFov) * Math.min(availableHeight, availableAspect))
    const distance = (compact ? 1.22 : 1.15) / Math.sin(tightFov) * pose.distance
    goal.current.copy(TARGET).addScaledVector(DIRECTION, distance)
    positionGoal.current.copy(TARGET).addScaledVector(RIGHT, pose.x).addScaledVector(UP, pose.y)
    rotationGoal.current.setFromEuler(rotation.current.set(pose.pitch, pose.yaw, pose.roll))
    const scale = compact && noteOpen ? 0.58 : pose.scale
    const blend = returning.current && !reduced ? 1 - Math.exp(-Math.min(delta, 0.05) * 9) : 1
    camera.position.lerp(goal.current, blend)
    group.current.position.lerp(positionGoal.current, blend)
    group.current.quaternion.slerp(rotationGoal.current, blend)
    group.current.scale.setScalar(MathUtils.lerp(group.current.scale.x, scale, blend))
    current.current.framing = MathUtils.lerp(current.current.framing, pose.framing, blend)
    const verticalFraming = compact && noteOpen ? 0.25 : 0
    current.current.verticalFraming = MathUtils.lerp(current.current.verticalFraming, verticalFraming, blend)
    cameraRotationGoal.current.setFromRotationMatrix(lookAtMatrix.current.lookAt(goal.current, TARGET, camera.up))
    camera.quaternion.slerp(cameraRotationGoal.current, blend)
    camera.setViewOffset(size.width, size.height, current.current.framing * size.width, current.current.verticalFraming * size.height, size.width, size.height)
    if (returning.current) {
      const settled = camera.position.distanceToSquared(goal.current) < 0.00001
        && group.current.position.distanceToSquared(positionGoal.current) < 0.00001
        && group.current.quaternion.angleTo(rotationGoal.current) < 0.0001
        && camera.quaternion.angleTo(cameraRotationGoal.current) < 0.0001
        && Math.abs(group.current.scale.x - scale) < 0.0001
        && Math.abs(current.current.framing - pose.framing) < 0.0001
        && Math.abs(current.current.verticalFraming - verticalFraming) < 0.0001
      if (settled) returning.current = false
      else invalidate()
    }
  }, -0.5)

  return <group ref={group} name="helmet-presentation" position={[0, HELMET_CENTER_Y, 0]}>
    <group position={[0, -HELMET_CENTER_Y, 0]}>{children}</group>
  </group>
}


