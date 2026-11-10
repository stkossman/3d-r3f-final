import { useCallback, useEffect, useImperativeHandle, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CuboidCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier'
import { Euler, Quaternion, type MeshStandardMaterial } from 'three'
import { DISPLAY_UNITS_PER_METER, HELMET_COLLIDERS, IMPACT_DAMPING, IMPACT_FRICTION, PLATFORM_HALF_EXTENTS, RELEASE_ROTATION, PHYSICS_STEP, type ImpactHandle, type ImpactSettings, type ImpactStatus, type ImpactTelemetry } from './impactSimulation'
import { useReducedMotion } from './useReducedMotion'

type ImpactWorldProps = {
  active: boolean
  settings: ImpactSettings
  bodyRef: RefObject<RapierRigidBody | null>
  handleRef: RefObject<ImpactHandle | null>
  onTelemetry: (telemetry: ImpactTelemetry) => void
}

export function ImpactWorld({ active, settings, bodyRef, handleRef, onTelemetry }: ImpactWorldProps) {
  const { step } = useRapier()
  const invalidate = useThree((state) => state.invalidate)
  const status = useRef<ImpactStatus>('ready')
  const collisions = useRef(0)
  const contacts = useRef(new Set<number>())
  const lastImpact = useRef(-1)
  const elapsed = useRef(0)
  const accumulator = useRef(0)
  const pulse = useRef(0)
  const indicator = useRef<MeshStandardMaterial>(null)
  const reduced = useReducedMotion()

  const publish = useCallback((next: ImpactStatus) => {
    status.current = next
    onTelemetry({ status: next, collisions: collisions.current })
    invalidate()
  }, [onTelemetry, invalidate])

  const reset = useCallback(() => {
    const body = bodyRef.current
    if (!body) return
    status.current = 'ready'
    accumulator.current = 0
    elapsed.current = 0
    lastImpact.current = -1
    collisions.current = 0
    contacts.current.clear()
    pulse.current = 0
    body.setEnabled(active)
    body.setTranslation({ x: 0, y: settings.height, z: 0 }, false)
    body.setRotation(new Quaternion().setFromEuler(new Euler(...RELEASE_ROTATION)), false)
    body.setLinvel({ x: 0, y: 0, z: 0 }, false)
    body.setAngvel({ x: 0, y: 0, z: 0 }, false)
    body.resetForces(false)
    body.resetTorques(false)
    body.sleep()
    publish('ready')
  }, [active, bodyRef, settings.height, publish])

  useImperativeHandle(handleRef, () => ({ command(action) {
    const body = bodyRef.current
    if (!active || !body || document.hidden) return
    if (action === 'reset') { reset(); return }
    if (action === 'replay') reset()
    if ((action === 'start' || action === 'replay') && status.current === 'ready') {
      body.wakeUp()
      publish('running')
    } else if (action === 'pause' && status.current === 'running') {
      accumulator.current = 0
      publish('paused')
    } else if (action === 'resume' && status.current === 'paused') {
      accumulator.current = 0
      body.wakeUp()
      publish('running')
    }
  } }))

  // Lifecycle changes reset once; active simulation never receives presentation transforms.
  // The settings can only be edited while the experiment is ready.
  useEffect(() => {
    reset()
  }, [reset, settings.restitution])

  useEffect(() => {
    function visibilityChanged() {
      accumulator.current = 0
      if (document.hidden && status.current === 'running') {
        status.current = 'paused'
        onTelemetry({ status: 'paused', collisions: collisions.current })
      }
      invalidate()
    }
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => document.removeEventListener('visibilitychange', visibilityChanged)
  }, [invalidate, onTelemetry])

  useFrame((_, delta) => {
    if (!active) return
    if (status.current === 'running' && !document.hidden) {
      // At most four fixed steps per frame. Discard excess wall time after a stall.
      accumulator.current = Math.min(accumulator.current + Math.min(delta, 4 * PHYSICS_STEP), 4 * PHYSICS_STEP)
      while (accumulator.current >= PHYSICS_STEP && status.current === 'running') {
        elapsed.current += PHYSICS_STEP
        step(PHYSICS_STEP)
        accumulator.current -= PHYSICS_STEP
      }
      if (bodyRef.current?.isSleeping()) publish('settled')
      else invalidate()
    }
    if (indicator.current) {
      pulse.current = Math.max(0, pulse.current - Math.min(delta, 0.05) * 2.5)
      indicator.current.color.set(pulse.current > 0 ? '#f36b32' : '#4b515a')
      indicator.current.emissive.set('#f36b32')
      indicator.current.emissiveIntensity = reduced ? 0 : pulse.current * 0.45
      if (pulse.current > 0) invalidate()
    }
  }, -1)

  return <>
    <RigidBody ref={bodyRef} colliders={false} ccd canSleep linearDamping={IMPACT_DAMPING.linear} angularDamping={IMPACT_DAMPING.angular}
      onCollisionEnter={({ target }) => {
        if (status.current !== 'running') return
        const wasTouching = contacts.current.size > 0
        contacts.current.add(target.collider.handle)
        if (wasTouching || elapsed.current - lastImpact.current < 0.1) return
        lastImpact.current = elapsed.current
        collisions.current++
        pulse.current = 1
        publish('running')
      }}
      onCollisionExit={({ target }) => { contacts.current.delete(target.collider.handle) }}>
      {HELMET_COLLIDERS.map(({ halfExtents, position, mass }, index) => <CuboidCollider key={index} args={halfExtents} position={position} mass={mass} friction={IMPACT_FRICTION} restitution={settings.restitution} />)}
    </RigidBody>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={PLATFORM_HALF_EXTENTS} position={[0, -0.05, 0]} friction={IMPACT_FRICTION} restitution={settings.restitution} />
    </RigidBody>
    <group visible={active} scale={DISPLAY_UNITS_PER_METER}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[PLATFORM_HALF_EXTENTS[0] * 2, PLATFORM_HALF_EXTENTS[1] * 2, PLATFORM_HALF_EXTENTS[2] * 2]} />
        <meshStandardMaterial color="#242830" roughness={0.85} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.246, 64]} />
        <meshStandardMaterial ref={indicator} color="#4b515a" roughness={0.8} />
      </mesh>
    </group>
  </>
}
