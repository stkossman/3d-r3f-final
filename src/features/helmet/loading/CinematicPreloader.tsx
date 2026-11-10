import { useEffect, useLayoutEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useProgress } from '@react-three/drei/core/Progress'
import { useReducedMotion } from '../animation/useReducedMotion'
import type { SceneLoadState } from './sceneLoading'

type CinematicPreloaderProps = {
  state: SceneLoadState
  onUnavailable: () => void
  onReveal: () => void
}

export function CinematicPreloader({ state, onUnavailable, onReveal }: CinematicPreloaderProps) {
  const overlay = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const active = useProgress((progress) => progress.active)
  const loaded = useProgress((progress) => progress.loaded)
  const total = useProgress((progress) => progress.total)
  const errors = useProgress((progress) => progress.errors)
  const finished = state !== 'loading'
  const label = state === 'ready' ? 'STUDIO READY' : state === 'unavailable' ? 'CONTINUING WITHOUT 3D' : active ? 'LOADING ASSETS' : total > 0 ? 'PREPARING FIRST FRAME' : 'INITIALIZING STUDIO'

  useLayoutEffect(() => {
    // Replace the static document shell only after the equivalent React overlay commits.
    document.getElementById('apex-boot')?.remove()
    document.getElementById('apex-boot-style')?.remove()
    overlay.current?.focus({ preventScroll: true })
    const element = overlay.current
    const preventScroll = (event: Event) => event.preventDefault()
    element?.addEventListener('wheel', preventScroll, { passive: false })
    element?.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      element?.removeEventListener('wheel', preventScroll)
      element?.removeEventListener('touchmove', preventScroll)
    }
  }, [])

  useEffect(() => {
    if (errors.length > 0) onUnavailable()
  }, [errors, onUnavailable])

  useEffect(() => {
    if (finished) return
    // Fail open to the semantic experience if decoding/driver initialization stalls.
    const timeout = window.setTimeout(onUnavailable, 45_000)
    return () => window.clearTimeout(timeout)
  }, [finished, onUnavailable])

  return <motion.section ref={overlay} tabIndex={-1} data-lenis-prevent aria-label="Preparing the APEX experience" aria-busy={!finished}
    className="fixed inset-0 z-[100] flex min-h-svh flex-col justify-between overflow-hidden bg-graphite px-page py-8 text-ivory outline-none! min-[900px]:py-12"
    initial={false}
    animate={{ clipPath: finished ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)' }}
    transition={{ duration: reduced ? 0 : 0.62, delay: finished && !reduced ? 0.12 : 0, ease: [0.76, 0, 0.24, 1] }}
    onAnimationComplete={() => { if (finished) onReveal() }}
    onKeyDown={(event) => { if (['Tab', ' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) event.preventDefault() }}>
    <div className="flex items-center justify-between border-t border-line pt-4 text-[0.625rem] tracking-[0.14em] text-steel" aria-hidden="true">
      <span>MOTORSPORT / PRODUCT STUDY</span><span>01 / STUDIO</span>
    </div>
    <div className="pb-8">
      <motion.p aria-hidden="true" className="whitespace-nowrap font-display text-[clamp(4.5rem,19vw,18rem)] leading-[0.85] font-semibold tracking-[-0.035em]"
        animate={{ y: finished && !reduced ? -8 : 0 }} transition={{ duration: reduced ? 0 : 0.3 }}>
        APEX <span className="text-signal">/</span> <span className="text-steel">01</span>
      </motion.p>
      <p className="mt-8 text-xs tracking-[0.14em] min-[900px]:text-sm">ENGINEERED FOR THE EDGE.</p>
    </div>
    <div>
      <div className="relative h-px overflow-hidden bg-line" aria-hidden="true">
        {finished ? <motion.div className="absolute inset-0 origin-left bg-signal" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : 0.12 }} />
          : <motion.div className="absolute inset-y-0 left-0 w-1/4 bg-signal" animate={reduced ? { x: 0 } : { x: ['-100%', '400%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.625rem] tracking-[0.12em] text-steel">
        <p role="status" aria-live="polite" className={finished ? 'text-ivory' : ''}>{label}</p>
        <span className="tabular-nums">{state === 'ready' ? 'EXPERIENCE PREPARED' : state === 'unavailable' ? 'THE STUDY REMAINS AVAILABLE' : total > 0 ? `${loaded} / ${total} RESOURCES COMPLETE` : 'PREPARING THE PRODUCT STUDY'}</span>
      </div>
    </div>
  </motion.section>
}
