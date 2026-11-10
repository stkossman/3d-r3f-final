import { LIGHTING_PRESETS, type LightingConfiguration } from './studioLighting'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'

export function StudioLighting({ configuration }: { configuration: LightingConfiguration }) {
  const preset = LIGHTING_PRESETS[configuration.preset]
  return (
    <>
      <Environment resolution={256} frames={1} environmentIntensity={0.7}>
        <Lightformer position={[-3, 4, -3]} target={[0, 1, 0]} scale={[3, 5, 1]} intensity={4} color="#fff5e7" />
        <Lightformer position={[4, 2, 1]} target={[0, 1, 0]} scale={[2, 4, 1]} intensity={3} color="#c7d8ef" />
        <Lightformer position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[4, 2, 1]} intensity={2} />
      </Environment>
      <hemisphereLight args={['#f1f0eb', '#34373e', preset.ambient]} />
      <directionalLight
        position={[-3, 6, -4]} intensity={preset.key * configuration.intensity} color={preset.keyColor} castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} shadow-normalBias={0.015} shadow-radius={3}
        shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-camera-near={0.5} shadow-camera-far={15}
      />
      <directionalLight position={[4, 3, 3]} intensity={preset.rim} color={preset.rimColor} />
      <directionalLight position={[1, 2, -5]} intensity={preset.fill} color="#f1f0eb" />
    </>
  )
}
