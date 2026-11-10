import { Component, lazy, Suspense, useRef, useState, type ReactNode } from 'react'
import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react'
import type { ViewerCameraHandle } from './SceneCamera'

const SceneCanvas = lazy(() => import('./SceneCanvas'))

export function ViewerFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div className="grid h-full min-h-80 place-content-center gap-3 px-8 text-center" role="status">
      <p className="text-sm text-ivory">{loading ? 'Preparing the product study…' : 'The 3D study is unavailable.'}</p>
      <p className="max-w-[32ch] text-xs leading-relaxed text-steel">{loading ? 'Setting the stage.' : 'Try reloading with WebGL enabled in your browser. You can still read about the experience below.'}</p>
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
  const buttonClass = 'flex min-h-11 min-w-11 items-center justify-center border border-line px-3 text-xs text-ivory enabled:cursor-pointer enabled:hover:border-steel enabled:hover:text-signal disabled:opacity-40'

  return (
    <figure className="flex min-w-0 flex-col bg-surface p-5 min-[681px]:p-6" aria-labelledby="viewer-caption">
      <div className="flex justify-between gap-4 text-[0.6875rem] tracking-[0.08em] text-steel uppercase"><span>Product study</span><span>001 / Display</span></div>
      <div className="relative mt-3 h-[clamp(20rem,30vw,27rem)]" aria-label="Interactive circular product podium" aria-describedby="viewer-hints">
        <ViewerBoundary>
          <Suspense fallback={<ViewerFallback loading />}>
            <SceneCanvas cameraRef={camera} touchActive={touchActive} onReady={setReady} />
          </Suspense>
        </ViewerBoundary>
        <div className="pointer-events-none absolute top-3 left-0 flex items-center gap-2 text-[0.625rem] text-steel"><span className={`size-1 rounded-full ${ready ? 'bg-signal' : 'bg-steel'}`} aria-hidden="true" />{ready ? 'Scene / 01' : 'Scene offline'}</div>
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
      <figcaption id="viewer-caption" className="mt-4 flex justify-between gap-4 text-[0.6875rem] text-steel"><span>Precision starts with a foundation.</span><span className="text-right">Helmet arrives in Stage 2</span></figcaption>
    </figure>
  )
}
