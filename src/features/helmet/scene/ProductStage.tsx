import { LIGHTING_PRESETS, type LightingConfiguration } from './studioLighting'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'
import { memo, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { DirectionalLight } from 'three'

// Its six-face capture is static; telemetry and lighting-control renders must not recapture it.
const StudioEnvironment = memo(function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.7}>
      <Lightformer
        position={[-3, 4, -3]}
        target={[0, 1, 0]}
        scale={[3, 5, 1]}
        intensity={4}
        color="#fff5e7"
      />
      <Lightformer
        position={[4, 2, 1]}
        target={[0, 1, 0]}
        scale={[2, 4, 1]}
        intensity={3}
        color="#c7d8ef"
      />
      <Lightformer
        position={[0, 5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[4, 2, 1]}
        intensity={2}
      />
    </Environment>
  )
})

export function StudioLighting({
  configuration,
  impactActive,
}: {
  configuration: LightingConfiguration
  impactActive: boolean
}) {
  const preset = LIGHTING_PRESETS[configuration.preset]
  const key = useRef<DirectionalLight>(null)
  const invalidate = useThree((state) => state.invalidate)
  const shadowBounds = impactActive ? 7 : 3
  useLayoutEffect(() => {
    if (!key.current) return
    key.current.shadow.camera.updateProjectionMatrix()
    key.current.shadow.needsUpdate = true
    invalidate()
  }, [impactActive, invalidate])
  return (
    <>
      <StudioEnvironment />
      <hemisphereLight args={['#f1f0eb', '#34373e', preset.ambient]} />
      <directionalLight
        ref={key}
        position={[-3, 6, -4]}
        intensity={preset.key * configuration.intensity}
        color={preset.keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.015}
        shadow-radius={3}
        shadow-camera-left={-shadowBounds}
        shadow-camera-right={shadowBounds}
        shadow-camera-top={shadowBounds}
        shadow-camera-bottom={-shadowBounds}
        shadow-camera-near={0.5}
        shadow-camera-far={impactActive ? 25 : 15}
      />
      <directionalLight
        position={[4, 3, 3]}
        intensity={preset.rim}
        color={preset.rimColor}
      />
      <directionalLight
        position={[1, 2, -5]}
        intensity={preset.fill}
        color="#f1f0eb"
      />
    </>
  )
}
