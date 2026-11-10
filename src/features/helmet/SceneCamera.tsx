import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { MathUtils, PerspectiveCamera, Spherical, Vector3 } from 'three'
import { useReducedMotion } from './useReducedMotion'
import { HELMET_CENTER_Y } from './scrollChoreography'

export type CameraView = 'front' | 'side' | 'rear' | 'threeQuarter'

export type ViewerCameraHandle = {
  reset: () => void
  rotate: (direction: number) => void
  zoom: (closer: boolean) => void
  view: (view: CameraView) => void
}

const HOME_DIRECTION = new Vector3(4, 2.4, -5).normalize()
const DISPLAY_RADIUS = 1.35
const VIEW_DIRECTIONS = {
  front: new Vector3(0, 1.4, -6).normalize(),
  side: new Vector3(6, 1.5, 0).normalize(),
  rear: new Vector3(0, 1.8, 6).normalize(),
  threeQuarter: HOME_DIRECTION,
}

export function SceneCamera({ ref, enabled = true }: { ref: Ref<ViewerCameraHandle>; enabled?: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const reducedMotion = useReducedMotion()
  const target = useRef(new Vector3(0, HELMET_CENTER_Y, 0))
  const transition = useRef({ active: false, elapsed: 0, start: new Spherical(), goal: new Spherical(), current: new Spherical(), offset: new Vector3() })

  function cancelTransition() {
    transition.current.active = false
    if (controls.current) controls.current.enableDamping = true
  }

  function moveTo(direction: Vector3, distance: number) {
    const orbit = controls.current
    if (!orbit) return
    const motion = transition.current
    orbit.enableDamping = false
    orbit.update()
    motion.start.setFromVector3(motion.offset.copy(camera.position).sub(target.current))
    motion.goal.setFromVector3(motion.offset.copy(direction).multiplyScalar(distance))
    const angleDifference = MathUtils.euclideanModulo(motion.goal.theta - motion.start.theta + Math.PI, Math.PI * 2) - Math.PI
    motion.goal.theta = motion.start.theta + angleDifference
    motion.elapsed = 0
    motion.active = !reducedMotion
    if (reducedMotion) {
      camera.position.copy(target.current).add(motion.offset.setFromSpherical(motion.goal))
      orbit.update()
      orbit.enableDamping = true
    }
    invalidate()
  }

  useFrame((_, delta) => {
    const motion = transition.current
    const orbit = controls.current
    if (!enabled || !motion.active || !orbit) return
    motion.elapsed += Math.min(delta, 0.05)
    const progress = Math.min(motion.elapsed / 0.65, 1)
    const amount = 1 - Math.pow(1 - progress, 3)
    motion.current.set(
      MathUtils.lerp(motion.start.radius, motion.goal.radius, amount),
      MathUtils.lerp(motion.start.phi, motion.goal.phi, amount),
      MathUtils.lerp(motion.start.theta, motion.goal.theta, amount),
    )
    camera.position.copy(target.current).add(motion.offset.setFromSpherical(motion.current))
    orbit.update()
    if (progress === 1) cancelTransition()
    else invalidate()
  })

  useLayoutEffect(() => {
    const orbit = controls.current
    if (!enabled || !orbit || !(camera instanceof PerspectiveCamera)) return
    transition.current.active = false
    camera.clearViewOffset()
    orbit.enableDamping = false
    const presentation = scene.getObjectByName('helmet-presentation')
    if (presentation) presentation.getWorldPosition(target.current)
    orbit.target.copy(target.current)

    // Fit a bounding sphere in the tighter axis, so every orbit stays in frame.
    const verticalHalfFov = MathUtils.degToRad(camera.fov / 2)
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * size.width / size.height)
    const minimum = DISPLAY_RADIUS * (presentation?.scale.x ?? 1) / Math.sin(Math.min(verticalHalfFov, horizontalHalfFov))
    const zoomRatio = camera.position.distanceTo(target.current) / minimum
    const direction = camera.position.clone().sub(target.current).normalize()
    orbit.minDistance = minimum
    orbit.maxDistance = minimum * 1.65
    camera.position.copy(target.current).addScaledVector(direction, minimum * MathUtils.clamp(zoomRatio, 1, 1.65))
    orbit.position0.copy(target.current).addScaledVector(HOME_DIRECTION, minimum * 1.12)
    orbit.target0.copy(target.current)
    orbit.update()
    orbit.enableDamping = true
    invalidate()
  }, [camera, scene, size.width, size.height, invalidate, enabled])

  useImperativeHandle(ref, () => ({
    reset: () => {
      const orbit = controls.current
      if (!orbit) return
      moveTo(HOME_DIRECTION, orbit.minDistance * 1.12)
    },
    rotate: (direction) => {
      const orbit = controls.current
      if (!orbit) return
      cancelTransition()
      orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + direction * Math.PI / 12)
      invalidate()
    },
    zoom: (closer) => {
      const orbit = controls.current
      if (!orbit) return
      cancelTransition()
      if (closer) orbit.dollyIn(1 / 1.12)
      else orbit.dollyOut(1 / 1.12)
      invalidate()
    },
    view: (view) => {
      const orbit = controls.current
      if (orbit) moveTo(VIEW_DIRECTIONS[view], orbit.getDistance())
    },
  }))

  return <OrbitControls ref={controls} enabled={enabled} makeDefault onStart={cancelTransition} enablePan={false} enableDamping dampingFactor={0.12} rotateSpeed={0.55} zoomSpeed={0.6} minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI / 2.25} />
}
