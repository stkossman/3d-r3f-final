import { Component, lazy, Suspense, useRef, useState, type ReactNode } from 'react'
import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react'
import type { ViewerCameraHandle } from './SceneCamera'
import { DesignControls } from './DesignControls'
import { FACTORY_CONFIGURATION, HELMET_HOTSPOTS, type HelmetConfiguration, type HotspotId } from './helmetConfiguration'

const SceneCanvas = lazy(() => import('./SceneCanvas'))

export function ViewerFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div className="grid h-full min-h-80 place-content-center gap-3 px-8 text-center" role="status">
      <p className="text-sm text-ivory">{loading ? 'Preparing the product study…' : 'The 3D study is unavailable.'}</p>
      <p className="max-w-[32ch] text-xs leading-relaxed text-steel">{loading ? 'Loading the helmet and studio.' : 'Reload to retry the model. If it stays unavailable, check your connection and WebGL support. You can still read about the experience below.'}</p>
    </div>
  )
}

class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <ViewerFallback /> : this.props.children
  }
}

export function ProductViewer() {
  const camera = useRef<ViewerCameraHandle>(null)
  const [touchActive, setTouchActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<'explore' | 'design'>('explore')
  const [configuration, setConfiguration] = useState<HelmetConfiguration>(FACTORY_CONFIGURATION)
  const [showHotspots, setShowHotspots] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotId | null>(null)
  const annotation = HELMET_HOTSPOTS.find((hotspot) => hotspot.id === selectedHotspot)
  const buttonClass = 'flex min-h-11 min-w-11 items-center justify-center border border-line px-3 text-xs text-ivory enabled:cursor-pointer enabled:hover:border-steel enabled:hover:text-signal disabled:opacity-40'

  function inspectHotspot(id: HotspotId) {
    setSelectedHotspot(id)
    const hotspot = HELMET_HOTSPOTS.find((item) => item.id === id)
    if (hotspot) camera.current?.view(hotspot.view)
  }

  return (
    <figure className="flex min-w-0 flex-col bg-surface p-5 min-[681px]:p-6" aria-labelledby="viewer-caption">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1" role="group" aria-label="Experience mode">
          <button type="button" aria-pressed={mode === 'explore'} className={`${buttonClass} aria-pressed:border-signal aria-pressed:text-signal`} onClick={() => setMode('explore')}>Explore</button>
          <button type="button" aria-pressed={mode === 'design'} className={`${buttonClass} aria-pressed:border-signal aria-pressed:text-signal`} onClick={() => setMode('design')}>Design</button>
        </div>
        <span className="text-[0.6875rem] text-steel">Impact Lab / Upcoming</span>
      </div>
      <div className="relative mt-3 h-[clamp(20rem,36vw,31rem)]" aria-label="Interactive F1 helmet on a circular podium" aria-describedby="viewer-hints">
        <ViewerBoundary>
          <Suspense fallback={<ViewerFallback loading />}>
            <SceneCanvas cameraRef={camera} touchActive={touchActive} onReady={setReady} configuration={configuration}
              showHotspots={mode === 'explore' && showHotspots} selectedHotspot={selectedHotspot} onHotspot={inspectHotspot} />
          </Suspense>
        </ViewerBoundary>
        <div className="pointer-events-none absolute top-3 left-0 flex items-center gap-2 text-[0.625rem] text-steel"><span className={`size-1 rounded-full ${ready ? 'bg-signal' : 'bg-steel'}`} aria-hidden="true" />{ready ? 'F1 / Zhou Guanyu 24' : 'Scene not ready'}</div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-3 border-t border-line pt-3">
        <p id="viewer-hints" className="text-[0.6875rem] text-steel"><span className="[@media(pointer:coarse)]:hidden">Drag to orbit · Scroll to zoom</span><span className="[@media(pointer:fine)]:hidden">{touchActive ? 'Drag to orbit · Pinch to zoom' : 'Enable touch to inspect the scene'}</span></p>
        <div className="flex gap-1" role="group" aria-label="Camera controls">
          <button className={buttonClass} type="button" disabled={!ready} aria-label="Rotate view left" onClick={() => camera.current?.rotate(-1)}><RotateCcw size={14} aria-hidden="true" /></button>
          <button className={buttonClass} type="button" disabled={!ready} aria-label="Rotate view right" onClick={() => camera.current?.rotate(1)}><RotateCw size={14} aria-hidden="true" /></button>
          <button className={buttonClass} type="button" disabled={!ready} aria-label="Zoom in" onClick={() => camera.current?.zoom(true)}><Plus size={14} aria-hidden="true" /></button>
          <button className={buttonClass} type="button" disabled={!ready} aria-label="Zoom out" onClick={() => camera.current?.zoom(false)}><Minus size={14} aria-hidden="true" /></button>
          <button className={buttonClass} type="button" disabled={!ready} onClick={() => camera.current?.reset()}>Reset view</button>
        </div>
        <button className={`${buttonClass} w-full [@media(pointer:fine)]:hidden`} type="button" disabled={!ready} aria-pressed={touchActive} onClick={() => setTouchActive(!touchActive)}>{touchActive ? 'Return to page scrolling' : 'Enable touch controls'}</button>
      </div>
      {mode === 'explore' ? (
        <div className="mt-4 border-t border-line pt-4" role="region" aria-label="Explore helmet">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Camera views">
            <span className="mr-1 text-xs text-steel">View</span>
            <button className={buttonClass} type="button" disabled={!ready} onClick={() => camera.current?.view('front')}>Front</button>
            <button className={buttonClass} type="button" disabled={!ready} onClick={() => camera.current?.view('side')}>Side</button>
            <button className={buttonClass} type="button" disabled={!ready} onClick={() => camera.current?.view('rear')}>Rear</button>
            <button className={buttonClass} type="button" disabled={!ready} aria-label="Three-quarter view" onClick={() => camera.current?.view('threeQuarter')}>¾</button>
          </div>
          <button className={`${buttonClass} mt-3 w-full aria-pressed:text-signal`} type="button" disabled={!ready} aria-pressed={showHotspots} onClick={() => setShowHotspots(!showHotspots)}>{showHotspots ? 'Hide component notes' : 'Show component notes'}</button>
          {showHotspots && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1" role="group" aria-label="Helmet components">
                {HELMET_HOTSPOTS.map((hotspot) => <button key={hotspot.id} type="button" disabled={!ready} aria-pressed={selectedHotspot === hotspot.id} className={`${buttonClass} aria-pressed:border-signal aria-pressed:text-signal`} onClick={() => inspectHotspot(hotspot.id)}>{hotspot.label}</button>)}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-steel" aria-live="polite">{annotation?.description ?? 'Choose a numbered marker or a component below the viewer.'}</p>
            </div>
          )}
        </div>
      ) : <DesignControls configuration={configuration} onChange={setConfiguration} ready={ready} />}
      <figcaption id="viewer-caption" className="mt-4 flex flex-wrap justify-between gap-2 text-[0.6875rem] text-steel"><span>F1 Helmet ZhouGuanyu 24 · Miopass</span><a href="/models/NOTICE.txt" target="_blank" rel="noreferrer">CC BY 4.0 / Asset credit</a></figcaption>
    </figure>
  )
}
