import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'

export type ViewerCameraHandle = {
  reset: () => void
  rotate: (direction: number) => void
  zoom: (closer: boolean) => void
}

const TARGET = new Vector3(0, 0.25, 0)
const HOME_DIRECTION = new Vector3(4, 3, 5).normalize()
const DISPLAY_RADIUS = 1.7

export function SceneCamera({ ref }: { ref: Ref<ViewerCameraHandle> }) {
  const controls = useRef<OrbitControlsImpl>(null)
  const previousMinimum = useRef(0)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useLayoutEffect(() => {
    const orbit = controls.current
    if (!orbit || !(camera instanceof PerspectiveCamera)) return

    // Fit a bounding sphere in the tighter axis, so every orbit stays in frame.
    const verticalHalfFov = MathUtils.degToRad(camera.fov / 2)
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * size.width / size.height)
    const minimum = DISPLAY_RADIUS / Math.sin(Math.min(verticalHalfFov, horizontalHalfFov))
    const zoomRatio = previousMinimum.current ? orbit.getDistance() / previousMinimum.current : 1.12
    const direction = previousMinimum.current ? camera.position.clone().sub(TARGET).normalize() : HOME_DIRECTION
    orbit.minDistance = minimum
    orbit.maxDistance = minimum * 1.65
    orbit.target.copy(TARGET)
    camera.position.copy(TARGET).addScaledVector(direction, minimum * MathUtils.clamp(zoomRatio, 1, 1.65))
    orbit.position0.copy(TARGET).addScaledVector(HOME_DIRECTION, minimum * 1.12)
    orbit.target0.copy(TARGET)
    orbit.update()
    previousMinimum.current = minimum
    invalidate()
  }, [camera, size.width, size.height, invalidate])

  useImperativeHandle(ref, () => ({
    reset: () => {
      const orbit = controls.current
      if (!orbit) return
      // Flush any residual drag damping before restoring the saved view.
      orbit.enableDamping = false
      orbit.update()
      orbit.reset()
      orbit.enableDamping = true
      invalidate()
    },
    rotate: (direction) => {
      const orbit = controls.current
      if (!orbit) return
      orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + direction * Math.PI / 12)
      invalidate()
    },
    zoom: (closer) => {
      const orbit = controls.current
      if (!orbit) return
      if (closer) orbit.dollyIn(1 / 1.12)
      else orbit.dollyOut(1 / 1.12)
      invalidate()
    },
  }), [invalidate])

  return <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping dampingFactor={0.12} rotateSpeed={0.55} zoomSpeed={0.6} minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI / 2.5} />
}
