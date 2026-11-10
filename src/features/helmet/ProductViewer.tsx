import { ViewerBoundary } from './loading/ViewerBoundary'
import { ViewerFallback } from './loading/ViewerFallback'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { useLenis } from 'lenis/react'
import { ArrowDown, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react'
import { motion, useMotionValue, useScroll, useTransform } from 'motion/react'
import type { ViewerCameraHandle } from './camera/SceneCamera'
import { LightingControls } from './controls/LightingControls'
import {
  DEFAULT_LIGHTING,
  type LightingConfiguration,
} from './scene/studioLighting'
import { DesignControls } from './controls/DesignControls'
import {
  FACTORY_CONFIGURATION,
  type HelmetConfiguration,
  type HotspotId,
} from './model/helmetConfiguration'
import { ImpactControls } from './controls/ImpactControls'
import { useImpactLab } from './physics/impactSimulation'
import { CinematicPreloader } from './loading/CinematicPreloader'
import type { SceneLoadState } from './loading/sceneLoading'
import type { ScanStatus } from './shaders/useDiagnosticScan'
import { CHECKPOINTS } from './animation/scrollChoreography'
import { useReducedMotion } from './animation/useReducedMotion'

const SceneCanvas = lazy(() => import('./scene/SceneCanvas'))

const buttonClass =
  'flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-line bg-graphite px-3 text-xs text-ivory hover:border-steel hover:text-signal disabled:opacity-40'
const sectionClass =
  'flex min-h-svh items-center px-page pt-[56svh] pb-40 min-[900px]:pt-24'
const headingClass =
  'font-display text-5xl leading-none uppercase min-[1200px]:text-6xl'

export function ProductViewer() {
  const camera = useRef<ViewerCameraHandle>(null)
  const narrative = useRef<HTMLElement>(null)
  const [sceneState, setSceneState] = useState<SceneLoadState>('loading')
  const [revealed, setRevealed] = useState(false)
  const ready = sceneState === 'ready'
  const handleSceneReady = useCallback((value: boolean) => {
    setSceneState((state) =>
      state === 'unavailable' ? state : value ? 'ready' : 'loading',
    )
  }, [])
  const handleUnavailable = useCallback(() => setSceneState('unavailable'), [])
  const reveal = useCallback(() => setRevealed(true), [])
  const [inspecting, setInspecting] = useState(false)
  const [active, setActive] = useState(0)
  const [configuration, setConfiguration] = useState<HelmetConfiguration>(
    FACTORY_CONFIGURATION,
  )
  const [lighting, setLighting] =
    useState<LightingConfiguration>(DEFAULT_LIGHTING)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotId | null>(null)
  const [scanRequest, setScanRequest] = useState(0)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('ready')
  const [impactFramed, setImpactFramed] = useState(false)
  const impact = useImpactLab()
  const impactActive = active === 4
  const effectiveInspecting = inspecting && !impactActive
  const annotationOpen = active === 1 && selectedHotspot !== null
  const { scrollY } = useScroll()
  const progress = useMotionValue(0)
  const reduced = useReducedMotion()
  const lenis = useLenis()
  const heroOpacity = useTransform(progress, [0, 0.18], [1, 0])

  useEffect(() => {
    if (inspecting) lenis?.scrollTo(window.scrollY, { immediate: true })
  }, [inspecting, lenis])

  useEffect(() => {
    if (revealed) return
    // Restore the requested checkpoint after initial content/controls have their final layout.
    try {
      const target = document.getElementById(
        decodeURIComponent(window.location.hash.slice(1)),
      )
      if (target) {
        if (lenis) lenis.scrollTo(target, { immediate: true })
        else target.scrollIntoView({ behavior: 'instant' })
      }
    } catch {
      /* An invalid URL fragment must not prevent access to the page. */
    }
  }, [revealed, lenis, ready])

  useEffect(() => {
    if (revealed) narrative.current?.focus({ preventScroll: true })
  }, [revealed])

  function navigateToSection(event: MouseEvent<HTMLDivElement>) {
    if (
      !lenis ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    if (!(event.target instanceof Element)) return
    const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]')
    if (
      !link ||
      link.hasAttribute('download') ||
      (link.target && link.target !== '_self')
    )
      return
    const hash = link.getAttribute('href')
    if (!hash || hash === '#') return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!target) return

    event.preventDefault()
    if (window.location.hash !== hash) window.history.pushState(null, '', hash)
    lenis.scrollTo(target, {
      onComplete: () => {
        if (target.id === 'main') target.focus({ preventScroll: true })
      },
    })
  }

  useEffect(() => {
    const root = narrative.current
    if (!root) return
    let offsets: number[] = []
    let lastActive = -1
    function update(y: number) {
      let index = 0
      while (index < offsets.length - 1 && y >= offsets[index + 1]) index++
      const span =
        (offsets[index + 1] ?? offsets[index] + window.innerHeight) -
        offsets[index]
      const position = Math.max(
        0,
        Math.min(4, index + (y - offsets[index]) / span),
      )
      progress.set(position / 4)
      const next = Math.round(position)
      if (next !== lastActive) {
        lastActive = next
        setActive(next)
        if (next === 4) setInspecting(false)
      }
    }
    function measure() {
      offsets = CHECKPOINTS.map(
        ({ id }) =>
          document.getElementById(id)!.getBoundingClientRect().top +
          window.scrollY,
      )
      update(window.scrollY)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    window.addEventListener('resize', measure)
    const unsubscribe = scrollY.on('change', update)
    return () => {
      unsubscribe()
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [scrollY, progress])

  function closeNote() {
    setSelectedHotspot(null)
    if (selectedHotspot)
      document.getElementById(`hotspot-${selectedHotspot}`)?.focus()
  }

  return (
    <>
      {!revealed && (
        <CinematicPreloader
          state={sceneState}
          onUnavailable={handleUnavailable}
          onReveal={reveal}
        />
      )}
      <div
        id="top"
        inert={!revealed}
        aria-hidden={!revealed || undefined}
        className="bg-surface"
        onClick={navigateToSection}
      >
        <a
          href="#main"
          className="fixed top-4 left-page z-[80] -translate-y-[200%] bg-ivory p-3 text-graphite focus:translate-y-0"
        >
          Skip to content
        </a>
        <header className="fixed inset-x-0 top-0 z-[60] flex min-h-20 items-center justify-between gap-3 border-b border-line bg-surface px-page max-[380px]:px-3">
          <a
            href="#intro"
            aria-label="APEX / 01 home"
            className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold tracking-[-0.035em]"
          >
            APEX <span className="text-steel">/ 01</span>
          </a>
          <span className="hidden text-xs text-steel min-[1100px]:block">
            Interactive Motorsport Helmet Experience
          </span>
          <nav
            aria-label="Page navigation"
            className="flex gap-5 max-[680px]:gap-2"
          >
            {CHECKPOINTS.slice(1).map((checkpoint, index) => (
              <a
                key={checkpoint.id}
                href={`#${checkpoint.id}`}
                aria-current={active === index + 1 ? 'location' : undefined}
                className="flex min-h-11 items-center border-b border-transparent text-xs text-steel hover:text-ivory aria-current:border-signal aria-current:text-ivory max-[380px]:text-[0.625rem]"
              >
                {checkpoint.label}
              </a>
            ))}
          </nav>
        </header>
        <div
          data-lenis-prevent={effectiveInspecting ? true : undefined}
          className={`fixed inset-x-0 top-20 z-10 h-[44svh] min-[900px]:top-0 min-[900px]:h-svh ${annotationOpen ? 'short-landscape:h-[calc(100svh_-_5rem)]' : ''}`}
          aria-label="Persistent helmet studio"
        >
          {sceneState === 'unavailable' ? (
            <ViewerFallback />
          ) : (
            <ViewerBoundary onUnavailable={handleUnavailable}>
              <Suspense fallback={<ViewerFallback loading />}>
                <SceneCanvas
                  scanRequest={scanRequest}
                  onScanStatus={setScanStatus}
                  impactCollisions={impact.telemetry.collisions}
                  onImpactFramed={setImpactFramed}
                  impactActive={impactActive}
                  impactSettings={impact.settings}
                  impactHandle={impact.handle}
                  onImpactTelemetry={impact.setTelemetry}
                  cameraRef={camera}
                  inspecting={effectiveInspecting}
                  progress={progress}
                  onReady={handleSceneReady}
                  onUnavailable={handleUnavailable}
                  configuration={configuration}
                  lighting={lighting}
                  showHotspots={active === 1}
                  selectedHotspot={selectedHotspot}
                  onHotspot={(id) =>
                    setSelectedHotspot((current) =>
                      current === id ? null : id,
                    )
                  }
                  onCloseNote={closeNote}
                />
              </Suspense>
            </ViewerBoundary>
          )}
          <p className="pointer-events-none absolute top-4 right-page text-[0.625rem] tracking-[0.12em] text-steel min-[900px]:top-24">
            {ready
              ? 'F1 / ZHOU GUANYU 24'
              : sceneState === 'unavailable'
                ? 'STUDIO UNAVAILABLE'
                : 'PREPARING STUDIO'}
          </p>
        </div>
        <main
          id="main"
          tabIndex={-1}
          className={`pointer-events-none relative z-20 ${annotationOpen ? 'short-landscape:invisible' : ''}`}
          ref={narrative}
        >
          <section
            id="intro"
            aria-labelledby="hero-title"
            className={sectionClass}
          >
            <motion.div
              style={{ opacity: reduced ? 1 : heroOpacity }}
              className="w-full min-[900px]:w-[43%]"
            >
              <h1
                id="hero-title"
                className="font-display text-[clamp(3.5rem,7.3vw,6rem)] leading-[0.95] font-semibold tracking-[-0.025em] uppercase"
              >
                Engineered
                <br />
                for the <span className="text-signal">edge.</span>
              </h1>
              <p className="mt-7 max-w-[30ch] text-base leading-relaxed text-steel">
                A closer look at the intersection of protection, precision, and
                personal expression.
              </p>
              <a
                href="#explore"
                className="pointer-events-auto mt-8 inline-flex min-h-11 items-center gap-6 border-b border-steel text-xs"
              >
                Scroll to discover <ArrowDown size={15} />
              </a>
              <p className="mt-10 text-[0.625rem] tracking-[0.16em] text-steel">
                ONE HELMET / FIVE PERSPECTIVES
              </p>
            </motion.div>
          </section>
          <section
            id="explore"
            aria-labelledby="explore-title"
            className={sectionClass}
          >
            <div className="w-full min-[900px]:w-[32%]">
              <h2 id="explore-title" className={headingClass}>
                Every angle.
                <br />
                Every detail.
              </h2>
              <p className="mt-6 max-w-[36ch] text-sm leading-relaxed text-steel">
                Explore the visible shell, visor and front intake. Choose a
                numbered marker on the helmet to read its component note.
              </p>
              <p className="mt-4 max-w-[36ch] text-xs leading-relaxed text-steel">
                A visual study of the source geometry. No certification,
                construction or impact performance is inferred.
              </p>
              <button
                type="button"
                disabled={!ready}
                onClick={() => setInspecting(true)}
                className={`${buttonClass} pointer-events-auto mt-7`}
              >
                Inspect the helmet
              </button>
              <button
                type="button"
                disabled={!ready || active !== 1 || scanStatus !== 'ready'}
                onClick={() => setScanRequest((request) => request + 1)}
                className={`${buttonClass} pointer-events-auto mt-3`}
              >
                {scanStatus === 'scanning'
                  ? 'Scanning shell...'
                  : 'Diagnostic scan'}
              </button>
              <p
                role="status"
                className="mt-3 text-xs leading-relaxed text-steel"
              >
                {scanStatus === 'unavailable'
                  ? 'Scan unavailable. The material study remains available.'
                  : scanStatus === 'scanning'
                    ? 'Surface scan in progress. Illustrative visualization.'
                    : 'Trace the shell surface with a diagnostic sweep.'}
              </p>
            </div>
          </section>
          <section
            id="design"
            aria-labelledby="design-title"
            className={`${sectionClass} min-[900px]:justify-end`}
          >
            <div className="pointer-events-auto w-full bg-surface min-[900px]:w-[34%]">
              <h2 id="design-title" className={headingClass}>
                Make your mark.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-steel">
                One form. Your material expression.
              </p>
              <DesignControls
                configuration={configuration}
                onChange={setConfiguration}
                ready={ready}
              />
            </div>
          </section>
          <section
            id="lighting"
            aria-labelledby="lighting-title"
            className={sectionClass}
          >
            <div className="pointer-events-auto w-full min-[900px]:w-[32%]">
              <h2 id="lighting-title" className={headingClass}>
                Form, revealed.
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-steel">
                Light shapes the surface. Study the balance between painted
                shell, reflective trim and shadow.
              </p>
              <LightingControls
                configuration={lighting}
                onChange={setLighting}
                ready={ready}
              />
            </div>
          </section>
          <section
            id="impact"
            aria-labelledby="impact-title"
            className={sectionClass}
          >
            <div className="pointer-events-auto w-full min-[900px]:w-[32%]">
              <h2 id="impact-title" className={headingClass}>
                From form
                <br />
                to force.
              </h2>
              <p className="mt-5 max-w-[35ch] text-sm leading-relaxed text-steel">
                Release the helmet. Observe gravity, rotation and contact on a
                rigid testing surface.
              </p>
              <ImpactControls
                settings={impact.settings}
                telemetry={impact.telemetry}
                onSettings={impact.setSettings}
                onCommand={impact.command}
                available={ready && impactActive}
                framed={impactFramed}
              />
              <p className="mt-4 text-xs leading-relaxed text-steel">
                Illustrative rigid-body experiment. Assumed length 0.34 m / mass
                1.5 kg. Simplified solid colliders; no deformation or safety
                certification.
              </p>
            </div>
          </section>
        </main>
        <div
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 bg-surface px-page py-3 ${annotationOpen ? 'short-landscape:invisible' : ''}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <p className="text-[0.625rem] text-steel">
              {String(active + 1).padStart(2, '0')} / 05{' '}
              <span className="ml-3">{CHECKPOINTS[active].label}</span>
            </p>
            <div
              className="pointer-events-auto flex flex-wrap gap-1"
              role="group"
              aria-label="Camera controls"
            >
              <button
                type="button"
                className={buttonClass}
                disabled={!ready || impactActive}
                aria-pressed={effectiveInspecting}
                onClick={() => setInspecting(!inspecting)}
              >
                {effectiveInspecting ? 'Return to cinematic' : 'Inspect'}
              </button>
              {effectiveInspecting && (
                <>
                  <button
                    type="button"
                    className={buttonClass}
                    aria-label="Rotate view left"
                    onClick={() => camera.current?.rotate(-1)}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    aria-label="Rotate view right"
                    onClick={() => camera.current?.rotate(1)}
                  >
                    <RotateCw size={14} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    aria-label="Zoom in"
                    onClick={() => camera.current?.zoom(true)}
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    aria-label="Zoom out"
                    onClick={() => camera.current?.zoom(false)}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => camera.current?.reset()}
                  >
                    Reset view
                  </button>
                  {(['front', 'side', 'rear', 'threeQuarter'] as const).map(
                    (view) => (
                      <button
                        type="button"
                        key={view}
                        className={buttonClass}
                        onClick={() => camera.current?.view(view)}
                      >
                        {view === 'threeQuarter'
                          ? '¾'
                          : view[0].toUpperCase() + view.slice(1)}
                      </button>
                    ),
                  )}
                </>
              )}
            </div>
            <p className="w-full text-[0.625rem] text-steel" aria-live="polite">
              {impactActive
                ? 'Impact Lab � Scroll away to reset and return to the cinematic study.'
                : effectiveInspecting
                  ? 'Inspect mode · Drag to orbit · Pinch or scroll to zoom · Return to cinematic to release the scene.'
                  : 'Cinematic mode · Scroll to move through the study.'}
            </p>
            <a
              href="/models/NOTICE.txt"
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto text-[0.625rem] text-steel"
            >
              F1 Helmet ZhouGuanyu 24 · Miopass · CC BY 4.0 / Asset credit
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
