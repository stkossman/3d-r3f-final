import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Color,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Uniform,
  type Group,
  type Object3D,
} from 'three'
import scanVertex from './diagnostic.vert.glsl'
import scanFragment from './diagnostic.frag.glsl'
import { HELMET_PARTS } from '../model/helmetMaterials'
import { useReducedMotion } from '../animation/useReducedMotion'

export type ScanStatus = 'ready' | 'scanning' | 'unavailable'
export type DiagnosticScanProps = {
  scanRequest: number
  exploreActive: boolean
  impactActive: boolean
  impactCollisions: number
  onScanStatus: (status: ScanStatus) => void
}

function createScanUniforms() {
  return {
    uScanTime: new Uniform(0),
    uScanProgress: new Uniform(0),
    uScanIntensity: new Uniform(0),
    uScanColor: new Uniform(new Color('#ff6547')),
    uScanToHelmet: new Uniform(new Matrix4()),
  }
}

export function useDiagnosticScan(
  model: Group,
  {
    scanRequest,
    exploreActive,
    impactActive,
    impactCollisions,
    onScanStatus,
  }: DiagnosticScanProps,
) {
  const get = useThree((state) => state.get)
  const invalidate = useThree((state) => state.invalidate)
  const reduced = useReducedMotion()
  const failed = useRef(false)
  const previous = useRef({
    request: scanRequest,
    collisions: impactCollisions,
  })
  const playback = useRef({
    active: false,
    elapsed: 0,
    duration: 2.2,
    impact: false,
  })
  const uniformsRef = useRef<ReturnType<typeof createScanUniforms> | null>(null)
  if (uniformsRef.current === null) uniformsRef.current = createScanUniforms()

  useLayoutEffect(() => {
    const { gl } = get()
    const uniforms = uniformsRef.current
    if (!uniforms) return
    if (failed.current) return
    const shell = model.getObjectByName(HELMET_PARTS.shell)
    if (
      !(shell instanceof Mesh) ||
      !(shell.material instanceof MeshStandardMaterial)
    )
      return
    const material = shell.material
    const originalCompile = material.onBeforeCompile
    const originalCacheKey = material.customProgramCacheKey
    const baseKey = originalCacheKey.call(material)
    const previousErrorHandler = gl.debug.onShaderError
    let disposed = false

    // Compose only the GLB/exporter/alignment transforms. Exclude presentation parents.
    uniforms.uScanToHelmet.value.identity()
    let node: Object3D | null = shell
    while (node) {
      if (node.matrixAutoUpdate) node.updateMatrix()
      uniforms.uScanToHelmet.value.premultiply(node.matrix)
      if (node === model) break
      node = node.parent
    }

    function restoreMaterial() {
      material.onBeforeCompile = originalCompile
      material.customProgramCacheKey = originalCacheKey
      material.needsUpdate = true
    }
    const disableScan = () => {
      if (disposed || failed.current) return
      failed.current = true
      playback.current.active = false
      uniforms.uScanIntensity.value = 0
      restoreMaterial()
      queueMicrotask(() => {
        if (!disposed) {
          onScanStatus('unavailable')
          invalidate()
        }
      })
    }

    material.onBeforeCompile = (shader, renderer) => {
      originalCompile.call(material, shader, renderer)
      if (
        !shader.vertexShader.includes('#include <begin_vertex>') ||
        !shader.fragmentShader.includes('#include <opaque_fragment>')
      ) {
        disableScan()
        return
      }
      Object.assign(shader.uniforms, uniforms)
      shader.vertexShader =
        scanVertex +
        '\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\napexScanVertex(transformed);',
        )
      shader.fragmentShader =
        scanFragment +
        '\n' +
        shader.fragmentShader.replace(
          '#include <opaque_fragment>',
          'outgoingLight += apexDiagnosticScan();\n#include <opaque_fragment>',
        )
    }
    material.customProgramCacheKey = () => `${baseKey}/apex-diagnostic-v1`
    material.needsUpdate = true

    gl.debug.onShaderError = (context, program, vertex, fragment) => {
      const diagnostic = context
        .getShaderSource(fragment)
        ?.includes('APEX_DIAGNOSTIC_SCAN')
      if (diagnostic) disableScan()
      // Preserve full compile/link diagnostics, including in the optional shader fallback.
      if (previousErrorHandler)
        previousErrorHandler(context, program, vertex, fragment)
      else
        console.error(
          'APEX shader compilation failed',
          context.getProgramInfoLog(program),
          context.getShaderInfoLog(vertex),
          context.getShaderInfoLog(fragment),
        )
    }
    invalidate()
    return () => {
      disposed = true
      gl.debug.onShaderError = previousErrorHandler
      restoreMaterial()
    }
  }, [model, get, invalidate, onScanStatus])

  useLayoutEffect(() => {
    const uniforms = uniformsRef.current
    if (!uniforms) return
    const requested = scanRequest !== previous.current.request
    const collided = impactCollisions > previous.current.collisions
    previous.current = { request: scanRequest, collisions: impactCollisions }
    if (failed.current) return
    const playScan = exploreActive && requested
    const playImpact = impactActive && collided
    if (playScan || playImpact) {
      playback.current = {
        active: true,
        elapsed: 0,
        duration: reduced ? 0.4 : playImpact ? 0.55 : 2.2,
        impact: playImpact,
      }
      onScanStatus(playScan ? 'scanning' : 'ready')
      invalidate()
    } else if (playback.current.impact ? !impactActive : !exploreActive) {
      playback.current.active = false
      uniforms.uScanIntensity.value = 0
      onScanStatus('ready')
      invalidate()
    }
  }, [
    scanRequest,
    exploreActive,
    impactActive,
    impactCollisions,
    reduced,
    invalidate,
    onScanStatus,
  ])

  useLayoutEffect(() => {
    const uniforms = uniformsRef.current
    if (!uniforms) return
    const stopOnHidden = () => {
      if (!document.hidden || failed.current) return
      playback.current.active = false
      uniforms.uScanIntensity.value = 0
      onScanStatus('ready')
      invalidate()
    }
    document.addEventListener('visibilitychange', stopOnHidden)
    return () => document.removeEventListener('visibilitychange', stopOnHidden)
  }, [onScanStatus, invalidate])

  useFrame((_, delta) => {
    const uniforms = uniformsRef.current
    if (!uniforms) return
    const run = playback.current
    if (!run.active || failed.current) return
    run.elapsed += Math.min(delta, 0.05)
    const progress = Math.min(run.elapsed / run.duration, 1)
    uniforms.uScanTime.value = reduced ? 0 : run.elapsed
    uniforms.uScanProgress.value = reduced ? 0.5 : progress
    uniforms.uScanIntensity.value =
      progress === 1
        ? 0
        : reduced
          ? 0.3
          : Math.sin(progress * Math.PI) * (run.impact ? 0.55 : 0.8)
    if (progress === 1) {
      run.active = false
      onScanStatus('ready')
    }
    // Include the final zero-intensity frame, then return to demand rendering.
    invalidate()
  })
}
