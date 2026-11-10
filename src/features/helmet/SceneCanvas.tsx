import { Canvas, useThree } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three'
import { useEffect, useState, type RefObject } from 'react'
import { ViewerFallback } from './ProductViewer'
import { SceneCamera, type ViewerCameraHandle } from './SceneCamera'
import { ProductStage } from './ProductStage'
import { HelmetModel } from './HelmetModel'
import type { HelmetConfiguration, HotspotId } from './helmetConfiguration'

type SceneCanvasProps = {
  cameraRef: RefObject<ViewerCameraHandle | null>
  touchActive: boolean
  onReady: (ready: boolean) => void
  configuration: HelmetConfiguration
  showHotspots: boolean
  selectedHotspot: HotspotId | null
  onHotspot: (id: HotspotId) => void
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

export default function SceneCanvas({ cameraRef, touchActive, onReady, configuration, showHotspots, selectedHotspot, onHotspot }: SceneCanvasProps) {
  const [failed, setFailed] = useState(false)
  if (failed) return <ViewerFallback />

  return (
    <Canvas
      className={touchActive ? 'pointer-events-auto!' : 'pointer-events-none! [@media(pointer:fine)]:pointer-events-auto!'}
      frameloop="demand"
      dpr={[1, 1.5]}
      shadows={{ type: PCFShadowMap }}
      camera={{ position: [4, 3, 5], fov: 35, near: 0.1, far: 40 }}
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
      <fog attach="fog" args={['#181b21', 9, 18]} />
      <RendererLifecycle onReady={onReady} onFailure={setFailed} />
      <SceneCamera ref={cameraRef} />
      <ProductStage />
      <HelmetModel configuration={configuration} showHotspots={showHotspots} selectedHotspot={selectedHotspot} onHotspot={onHotspot} />
    </Canvas>
  )
}
