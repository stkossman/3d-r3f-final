import { useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei/core/Gltf'
import { useTexture } from '@react-three/drei/core/Texture'
import { HelmetNotes } from './HelmetNotes'
import {
  Box3,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type Texture,
} from 'three'
import {
  configureRearShellTint,
  createHelmetMaterial,
  HELMET_PARTS,
} from './helmetMaterials'
import {
  SHELL_COLORS,
  VISOR_COLORS,
  type HelmetConfiguration,
  type HotspotId,
} from './helmetConfiguration'
import {
  useDiagnosticScan,
  type DiagnosticScanProps,
} from '../shaders/useDiagnosticScan'

type HelmetModelProps = DiagnosticScanProps & {
  configuration: HelmetConfiguration
  showHotspots: boolean
  selectedHotspot: HotspotId | null
  onHotspot: (id: HotspotId) => void
  onCloseNote: () => void
}

export function HelmetModel({
  configuration,
  showHotspots,
  selectedHotspot,
  onHotspot,
  onCloseNote,
  ...scan
}: HelmetModelProps) {
  const { scene } = useGLTF('/models/helmet.glb', false, true)
  const [toneMap, rearToneMap, visorToneMap] = useTexture([
    '/models/shell-tone.webp',
    '/models/rear-shell-tone.webp',
    '/models/visor-tone.webp',
  ])
  const ownedToneMaps = useRef<{
    shell: Texture
    visor: Texture
  } | null>(null)
  const rearTint = useRef<ReturnType<typeof configureRearShellTint> | null>(null)
  const invalidate = useThree((state) => state.invalidate)
  const model = useMemo(() => {
    const instance = scene.clone(true)
    instance.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(instance, true)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const scale = 1.85 / Math.max(size.x, size.y, size.z)
    const alignment = new Group()
    alignment.scale.setScalar(scale)
    alignment.position.set(
      -center.x * scale,
      0.345 - bounds.min.y * scale,
      -center.z * scale,
    )
    instance.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = object.name !== 'Helmet_glass_Helmet_glass_0'
        object.receiveShadow = true
      }
    })
    alignment.add(instance)
    return alignment
  }, [scene])

  useLayoutEffect(() => {
    const release: (() => void)[] = []
    const textures = [toneMap, rearToneMap, visorToneMap].map((source) => {
      const texture = source.clone()
      texture.colorSpace = SRGBColorSpace
      texture.flipY = false
      return texture
    })
    const [shellTexture, rearTexture, visorTexture] = textures
    ownedToneMaps.current = { shell: shellTexture, visor: visorTexture }
    model.traverse((object) => {
      if (
        !(object instanceof Mesh) ||
        !(object.material instanceof MeshStandardMaterial)
      )
        return
      const original = object.material
      const material = createHelmetMaterial(original, object.name)
      if (object.name === HELMET_PARTS.components) {
        rearTint.current = configureRearShellTint(material, rearTexture)
      }
      object.material = material
      release.push(() => {
        object.material = original
        material.dispose()
      })
    })
    invalidate()
    return () => {
      release.forEach((dispose) => dispose())
      textures.forEach((texture) => texture.dispose())
      ownedToneMaps.current = null
      rearTint.current = null
    }
  }, [model, toneMap, rearToneMap, visorToneMap, invalidate])

  useLayoutEffect(() => {
    const shell = model.getObjectByName(HELMET_PARTS.shell)
    const original = scene.getObjectByName(HELMET_PARTS.shell)
    if (
      shell instanceof Mesh &&
      shell.material instanceof MeshPhysicalMaterial &&
      original instanceof Mesh &&
      original.material instanceof MeshStandardMaterial
    ) {
      const material = shell.material
      material.map =
        configuration.shell === 'original'
          ? original.material.map
          : (ownedToneMaps.current?.shell ?? null)
      material.color.set(SHELL_COLORS[configuration.shell])
      material.roughness = configuration.finish === 'gloss' ? 0.38 : 0.9
      material.roughnessMap =
        configuration.finish === 'gloss' ? original.material.roughnessMap : null
      material.clearcoat = configuration.finish === 'gloss' ? 1 : 0.15
      material.clearcoatRoughness =
        configuration.finish === 'gloss' ? 0.16 : 0.6
      material.needsUpdate = true
    }
    if (rearTint.current) {
      rearTint.current.uRearShellEnabled.value =
        configuration.shell === 'original' ? 0 : 1
      rearTint.current.uRearShellColor.value.set(SHELL_COLORS[configuration.shell])
    }
    const visor = model.getObjectByName(HELMET_PARTS.visor)
    if (
      visor instanceof Mesh &&
      visor.material instanceof MeshStandardMaterial
    ) {
      visor.material.map = ownedToneMaps.current?.visor ?? null
      visor.material.color.set(VISOR_COLORS[configuration.visor])
      visor.material.roughness = configuration.visor === 'smoke' ? 0.19 : 0.12
      visor.material.metalness = configuration.visor === 'smoke' ? 0.65 : 0.9
      visor.material.needsUpdate = true
    }
    invalidate()
  }, [model, scene, toneMap, rearToneMap, visorToneMap, configuration, invalidate])

  useDiagnosticScan(model, scan)

  return (
    <>
      <primitive object={model} dispose={null} />
      {showHotspots && (
        <HelmetNotes
          selected={selectedHotspot}
          onSelect={onHotspot}
          onClose={onCloseNote}
        />
      )}
    </>
  )
}
