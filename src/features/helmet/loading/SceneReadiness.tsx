import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'

type SceneReadinessProps = {
  onReady: (ready: boolean) => void
  onUnavailable: () => void
}

// Mounts only after the model, textures and Rapier have resolved Suspense.
export function SceneReadiness({
  onReady,
  onUnavailable,
}: SceneReadinessProps) {
  const get = useThree((state) => state.get)
  useLayoutEffect(() => {
    const { gl, scene, camera, invalidate } = get()
    let cancelled = false
    let prepared = false
    let reported = false
    let recoveringScan = false
    let fatal = false
    let firstFrame = 0
    let secondFrame = 0
    const originalAfterRender = scene.onAfterRender
    const originalShaderError = gl.debug.onShaderError

    const handleShaderError: NonNullable<typeof gl.debug.onShaderError> = (
      context,
      program,
      vertex,
      fragment,
    ) => {
      if (context.getShaderSource(fragment)?.includes('APEX_DIAGNOSTIC_SCAN'))
        recoveringScan = true
      else {
        fatal = true
        queueMicrotask(() => {
          if (!cancelled) onUnavailable()
        })
      }
      originalShaderError?.(context, program, vertex, fragment)
    }
    gl.debug.onShaderError = handleShaderError
    scene.onAfterRender = (...args) => {
      originalAfterRender.apply(scene, args)
      if (cancelled || fatal || !prepared || reported || firstFrame) return
      if (recoveringScan) {
        // The optional scan handler restored PBR. Wait for its replacement render.
        recoveringScan = false
        invalidate()
        return
      }
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (cancelled || fatal) return
          if (recoveringScan) {
            firstFrame = 0
            invalidate()
            return
          }
          reported = true
          onReady(true)
        })
      })
    }

    Promise.all([gl.compileAsync(scene, camera), document.fonts.ready])
      .then(() => {
        if (cancelled || fatal) return
        prepared = true
        invalidate()
      })
      .catch(() => {
        if (!cancelled) onUnavailable()
      })

    return () => {
      cancelled = true
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      scene.onAfterRender = originalAfterRender
      if (gl.debug.onShaderError === handleShaderError)
        gl.debug.onShaderError = originalShaderError
      onReady(false)
    }
  }, [get, onReady, onUnavailable])
  return null
}
