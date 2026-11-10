import { Canvas, useThree } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three'
import { useEffect, useState, type RefObject } from 'react'
import { ViewerFallback } from './ProductViewer'
import { SceneCamera, type ViewerCameraHandle } from './SceneCamera'
import type { LightingConfiguration } from './studioLighting'
import { CinematicRig } from './CinematicRig'
import type { MotionValue } from 'motion/react'
import { StudioLighting } from './ProductStage'
import { HelmetModel } from './HelmetModel'
import type { HelmetConfiguration, HotspotId } from './helmetConfiguration'

type SceneCanvasProps = {
  cameraRef: RefObject<ViewerCameraHandle | null>
  inspecting: boolean
  progress: MotionValue<number>
  onReady: (ready: boolean) => void
  configuration: HelmetConfiguration
  lighting: LightingConfiguration
  showHotspots: boolean
  selectedHotspot: HotspotId | null
  onHotspot: (id: HotspotId) => void
  onCloseNote: () => void
}

function RendererLifecycle({ onReady, onFailure }: Pick<SceneCanvasProps, 'onReady'> & { onFailure: (failed: boolean) => void }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    const canvas = gl.domElement
    const handleLoss = (event: Event) => {
      event.preventDefault()
      onFailure(true)
    }
    canvas.addEventListener('webglcontextlost', handleLoss)
    onReady(true)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLoss)
      onReady(false)
    }
  }, [gl, onReady, onFailure])
  return null
}

export default function SceneCanvas({ cameraRef, inspecting, progress, onReady, configuration, lighting, showHotspots, selectedHotspot, onHotspot, onCloseNote }: SceneCanvasProps) {
  const [failed, setFailed] = useState(false)
  if (failed) return <ViewerFallback />

  return (
    <Canvas
      className={inspecting ? 'pointer-events-auto!' : 'pointer-events-none!'}
      frameloop="demand"
      dpr={[1, 1.5]}
      shadows={{ type: PCFShadowMap }}
      camera={{ position: [4, 3, -5], fov: 35, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
      fallback={<ViewerFallback />}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <color attach="background" args={['#181b21']} />
      <RendererLifecycle onReady={onReady} onFailure={setFailed} />
      <SceneCamera ref={cameraRef} enabled={inspecting} />
      <StudioLighting configuration={lighting} />
      <CinematicRig progress={progress} inspecting={inspecting} noteOpen={showHotspots && selectedHotspot !== null}>
        <HelmetModel configuration={configuration} showHotspots={showHotspots} selectedHotspot={selectedHotspot} onHotspot={onHotspot} onCloseNote={onCloseNote} />
      </CinematicRig>
    </Canvas>
  )
}
