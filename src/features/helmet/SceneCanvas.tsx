import { Physics, type RapierRigidBody } from '@react-three/rapier'
import { ImpactWorld } from './ImpactWorld'
import type { ImpactHandle, ImpactSettings, ImpactTelemetry } from './impactSimulation'
import { Canvas, useThree } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three'
import { useEffect, useRef, type RefObject } from 'react'
import { ViewerFallback } from './ProductViewer'
import { SceneReadiness } from './SceneReadiness'
import { SceneCamera, type ViewerCameraHandle } from './SceneCamera'
import type { LightingConfiguration } from './studioLighting'
import { CinematicRig } from './CinematicRig'
import type { MotionValue } from 'motion/react'
import { StudioLighting } from './ProductStage'
import { HelmetModel } from './HelmetModel'
import type { HelmetConfiguration, HotspotId } from './helmetConfiguration'
import type { DiagnosticScanProps } from './useDiagnosticScan'

type SceneCanvasProps = Pick<DiagnosticScanProps, 'scanRequest' | 'onScanStatus' | 'impactCollisions'> & {
  onImpactFramed: (framed: boolean) => void
  impactActive: boolean
  impactSettings: ImpactSettings
  impactHandle: RefObject<ImpactHandle | null>
  onImpactTelemetry: (telemetry: ImpactTelemetry) => void
  cameraRef: RefObject<ViewerCameraHandle | null>
  inspecting: boolean
  progress: MotionValue<number>
  onReady: (ready: boolean) => void
  onUnavailable: () => void
  configuration: HelmetConfiguration
  lighting: LightingConfiguration
  showHotspots: boolean
  selectedHotspot: HotspotId | null
  onHotspot: (id: HotspotId) => void
  onCloseNote: () => void
}

function RendererLifecycle({ onUnavailable }: Pick<SceneCanvasProps, 'onUnavailable'>) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    const canvas = gl.domElement
    const handleLoss = (event: Event) => {
      event.preventDefault()
      onUnavailable()
    }
    canvas.addEventListener('webglcontextlost', handleLoss)
    return () => canvas.removeEventListener('webglcontextlost', handleLoss)
  }, [gl, onUnavailable])
  return null
}

export default function SceneCanvas({ scanRequest, onScanStatus, impactCollisions, onImpactFramed, impactActive, impactSettings, impactHandle, onImpactTelemetry, cameraRef, inspecting, progress, onReady, onUnavailable, configuration, lighting, showHotspots, selectedHotspot, onHotspot, onCloseNote }: SceneCanvasProps) {
  const body = useRef<RapierRigidBody>(null)

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
      <RendererLifecycle onUnavailable={onUnavailable} />
      <SceneCamera ref={cameraRef} enabled={inspecting} />
      <StudioLighting configuration={lighting} impactActive={impactActive} />
      <Physics paused timeStep={1 / 60} interpolate={false} gravity={[0, -9.81, 0]} colliders={false} numSolverIterations={6} maxCcdSubsteps={2}>
        <ImpactWorld active={impactActive} settings={impactSettings} bodyRef={body} handleRef={impactHandle} onTelemetry={onImpactTelemetry} />
      </Physics>
      <CinematicRig onImpactFramed={onImpactFramed} impactActive={impactActive} impactHeight={impactSettings.height} bodyRef={body} progress={progress} inspecting={inspecting} noteOpen={showHotspots && selectedHotspot !== null}>
        <HelmetModel scanRequest={scanRequest} onScanStatus={onScanStatus} impactCollisions={impactCollisions} exploreActive={showHotspots} impactActive={impactActive} configuration={configuration} showHotspots={showHotspots} selectedHotspot={selectedHotspot} onHotspot={onHotspot} onCloseNote={onCloseNote} />
      </CinematicRig>
      <SceneReadiness onReady={onReady} onUnavailable={onUnavailable} />
    </Canvas>
  )
}
