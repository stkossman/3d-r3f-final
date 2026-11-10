import assert from 'node:assert/strict'
import RAPIER from '@dimforge/rapier3d-compat'
import { Euler, Quaternion } from 'three'
import { HELMET_COLLIDERS, IMPACT_DAMPING, IMPACT_FRICTION, PLATFORM_HALF_EXTENTS, PHYSICS_STEP, RELEASE_ROTATION } from '../src/features/helmet/impactSimulation'

await RAPIER.init()
let cases = 0
let maximumExcursion = 0
for (let heightIndex = 0; heightIndex <= 14; heightIndex++) {
  for (let bounceIndex = 0; bounceIndex <= 10; bounceIndex++) {
    const height = Number((0.2 + heightIndex * 0.05).toFixed(2))
    const restitution = Number((bounceIndex * 0.05).toFixed(2))
    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })
    world.timestep = PHYSICS_STEP
    world.numSolverIterations = 6
    world.maxCcdSubsteps = 2
    const events = new RAPIER.EventQueue(true)
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setCcdEnabled(true).setLinearDamping(IMPACT_DAMPING.linear).setAngularDamping(IMPACT_DAMPING.angular))
    for (const shape of HELMET_COLLIDERS) {
      world.createCollider(RAPIER.ColliderDesc.cuboid(...shape.halfExtents).setTranslation(...shape.position).setMass(shape.mass).setFriction(IMPACT_FRICTION).setRestitution(restitution).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS), body)
    }
    const platform = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
    world.createCollider(RAPIER.ColliderDesc.cuboid(...PLATFORM_HALF_EXTENTS).setTranslation(0, -0.05, 0).setFriction(IMPACT_FRICTION).setRestitution(restitution), platform)
    for (let run = 0; run < 3; run++) {
      body.setEnabled(false)
      body.setEnabled(true)
      body.setTranslation({ x: 0, y: height, z: 0 }, false)
      body.setRotation(new Quaternion().setFromEuler(new Euler(...RELEASE_ROTATION)), false)
      body.setLinvel({ x: 0, y: 0, z: 0 }, false)
      body.setAngvel({ x: 0, y: 0, z: 0 }, false)
      body.resetForces(false)
      body.resetTorques(false)
      body.sleep()
      assert.equal(body.linvel().x ** 2 + body.linvel().y ** 2 + body.linvel().z ** 2, 0)
      assert.equal(body.angvel().x ** 2 + body.angvel().y ** 2 + body.angvel().z ** 2, 0)
      body.wakeUp()
      let collisions = 0
      let roseAfterImpact = false
      let maximumRotation = 0
      for (let i = 0; i < 1800; i++) {
        world.step(events)
        events.drainCollisionEvents((_a, _b, started) => { if (started) collisions++ })
        const p = body.translation()
        maximumExcursion = Math.max(maximumExcursion, Math.hypot(p.x, p.z))
        assert(Number.isFinite(p.y) && p.y > 0, 'Body left surface: ' + JSON.stringify({ p, height, restitution, run, i, collisions }))
        if (collisions && body.linvel().y > 0.1) roseAfterImpact = true
        maximumRotation = Math.max(maximumRotation, Math.hypot(body.angvel().x, body.angvel().y, body.angvel().z))
        if (body.isSleeping()) break
      }
      assert(collisions > 0, 'Real collision events must fire')
      assert(body.isSleeping(), 'Body must settle within 30 simulated seconds')
      assert(maximumRotation > 0.1, 'Off-center contacts must produce rotation')
      if (restitution > 0.3) assert(roseAfterImpact, 'Configured restitution must produce a bounce')
      assert(Math.abs(body.mass() - 1.5) < 0.001, 'Compound mass must sum to 1.5 kg')
    }
    events.free()
    world.free()
    cases++
  }
}
console.log(`Passed ${cases} height/bounce combinations, three runs each. Maximum horizontal excursion: ${maximumExcursion.toFixed(3)} m.`)
