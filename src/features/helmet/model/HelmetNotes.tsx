import { useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei/web/Html'
import { Group, Vector3 } from 'three'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../animation/useReducedMotion'
import { HELMET_HOTSPOTS, type HotspotId } from './helmetConfiguration'

type HelmetNotesProps = {
  selected: HotspotId | null
  onSelect: (id: HotspotId) => void
  onClose: () => void
}

function HotspotMarker({
  hotspot,
  index,
  selected,
  onSelect,
}: {
  hotspot: (typeof HELMET_HOTSPOTS)[number]
  index: number
  selected: boolean
  onSelect: (id: HotspotId) => void
}) {
  const [occluded, setOccluded] = useState(false)
  return (
    <Html
      position={[...hotspot.position]}
      center
      occlude
      onOcclude={setOccluded}
      zIndexRange={[50, 40]}
    >
      <button
        id={`hotspot-${hotspot.id}`}
        type="button"
        aria-label={`Inspect ${hotspot.label.toLowerCase()}`}
        aria-expanded={selected}
        aria-controls={selected ? 'helmet-note' : undefined}
        title={
          occluded ? `${hotspot.label} · Anchor on the far side` : hotspot.label
        }
        className={`pointer-events-auto ${index === 1 ? '-translate-y-3' : index === 2 ? 'translate-y-3' : ''} ${occluded && !selected ? 'border-dashed opacity-65' : ''} flex size-11 cursor-pointer items-center justify-center rounded-full border border-ivory bg-graphite text-xs text-ivory hover:border-signal aria-expanded:border-signal aria-expanded:text-signal`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onSelect(hotspot.id)}
      >
        {String(index + 1).padStart(2, '0')}
      </button>
    </Html>
  )
}

export function HelmetNotes({ selected, onSelect, onClose }: HelmetNotesProps) {
  const reduced = useReducedMotion()
  const anchor = useRef<Group>(null)
  const panel = useRef<HTMLDivElement>(null)
  const point = useRef(new Vector3())
  const { size, camera, invalidate } = useThree()
  const attachPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panel.current = node
      if (node) invalidate()
    },
    [invalidate],
  )
  const note = HELMET_HOTSPOTS.find((item) => item.id === selected)

  useEffect(() => {
    if (!selected) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    invalidate()
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected, onClose, invalidate])

  useFrame(() => {
    if (!note || !anchor.current || !panel.current) return
    const projected = point.current.set(
      note.position[0],
      note.position[1],
      note.position[2],
    )
    anchor.current.localToWorld(projected).project(camera)
    const width = panel.current.offsetWidth
    const height = panel.current.offsetHeight
    const x = ((projected.x + 1) * size.width) / 2
    const y = ((1 - projected.y) * size.height) / 2
    const left =
      size.width < 900
        ? 12
        : Math.max(12, Math.min(size.width - width - 12, x - width - 32))
    const top =
      size.width < 900
        ? Math.max(8, size.height - height - 16)
        : Math.max(64, Math.min(size.height - height - 16, y + 24))
    // Screen-space projection is imperative so camera motion never renders React per frame.
    panel.current.style.transform = `translate3d(${left}px, ${top}px, 0)`
  })

  return (
    <group ref={anchor}>
      {HELMET_HOTSPOTS.map((hotspot, index) => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          index={index}
          selected={selected === hotspot.id}
          onSelect={onSelect}
        />
      ))}
      <Html
        fullscreen
        calculatePosition={(_object, _camera, viewport) => [
          viewport.width / 2,
          viewport.height / 2,
        ]}
        zIndexRange={[30, 30]}
        className="pointer-events-none"
      >
        <AnimatePresence mode="wait">
          {note && (
            <motion.div
              key={note.id}
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.16 }}
              ref={attachPanel}
              id="helmet-note"
              role="region"
              aria-label={`${note.label} note`}
              aria-live="polite"
              className="pointer-events-auto absolute top-0 left-0 w-72 max-w-[calc(100%_-_24px)] max-[899px]:w-[calc(100%_-_24px)] max-[599px]:max-w-90 border border-line bg-graphite p-4"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[0.625rem] tracking-[0.16em] text-signal">
                  NOTE /{' '}
                  {String(HELMET_HOTSPOTS.indexOf(note) + 1).padStart(2, '0')}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close component note"
                  className="-m-2 flex size-11 cursor-pointer items-center justify-center text-steel hover:text-ivory"
                >
                  <X size={16} />
                </button>
              </div>
              <h3 className="mt-2 text-lg">{note.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-steel">
                {note.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  )
}
