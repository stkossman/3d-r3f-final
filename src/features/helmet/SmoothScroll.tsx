import { useEffect, useRef, type ReactNode } from 'react'
import { ReactLenis, type LenisRef } from 'lenis/react'
import { cancelFrame, frame, type FrameData } from 'motion/react'
import type { LenisOptions } from 'lenis'

const options: LenisOptions = {
  autoRaf: false,
  lerp: 0.14,
  smoothWheel: true,
  syncTouch: false,
  respectReducedMotion: true,
  allowNestedScroll: true,
  // ProductViewer handles local links so hashes, history and skip-link focus survive.
  anchors: false,
  stopInertiaOnNavigate: true,
  prevent: (node) => node.matches('input, textarea, select, [contenteditable="true"]'),
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<LenisRef>(null)

  useEffect(() => {
    function update({ timestamp }: FrameData) {
      lenis.current?.lenis?.raf(timestamp)
    }
    function syncHistoryScroll() {
      // Hash navigation and browser restoration own the native position here.
      lenis.current?.lenis?.scrollTo(window.scrollY, { immediate: true })
    }

    frame.setup(update, true)
    window.addEventListener('hashchange', syncHistoryScroll)
    return () => {
      cancelFrame(update)
      window.removeEventListener('hashchange', syncHistoryScroll)
    }
  }, [])

  return <ReactLenis root ref={lenis} options={options}>{children}</ReactLenis>
}
