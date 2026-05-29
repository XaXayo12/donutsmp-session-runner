import test from 'node:test'
import assert from 'node:assert/strict'
import { createMovementStep, normalizeHumanMovementOptions, yawToward } from '../src/features/humanMovement.js'

test('normalizeHumanMovementOptions keeps movement values inside safe bounds', () => {
  const options = normalizeHumanMovementOptions({
    radiusBlocks: -5,
    stepMinMs: 9999,
    stepMaxMs: 200,
    sprintChance: 2,
    jumpChance: -1,
    maxPitch: 5
  })

  assert.equal(options.radiusBlocks, 1)
  assert.equal(options.stepMinMs, 9999)
  assert.equal(options.stepMaxMs, 9999)
  assert.equal(options.sprintChance, 1)
  assert.equal(options.jumpChance, 0)
  assert.equal(options.maxPitch, 1.2)
})

test('createMovementStep creates a non-linear forward movement step', () => {
  const options = normalizeHumanMovementOptions({
    stepMinMs: 1000,
    stepMaxMs: 2000,
    idleChance: 0,
    sprintChance: 1,
    strafeChance: 1,
    jumpChance: 1,
    sneakChance: 0,
    turnMinRadians: 0.3,
    turnMaxRadians: 0.6,
    pitchJitterRadians: 0.2,
    maxPitch: 0.7
  })
  const rng = sequence([0.5, 0.25, 0.75, 0.9, 0.1, 0.4, 0.2, 0.8])

  const step = createMovementStep(options, {
    yaw: 1,
    pitch: 0,
    outsideRadius: false
  }, rng)

  assert.equal(step.type, 'move')
  assert.equal(step.controls.forward, true)
  assert.equal(step.controls.sprint, true)
  assert.equal(step.controls.jump, true)
  assert.equal(step.controls.left || step.controls.right, true)
  assert.ok(step.durationMs >= 1000)
  assert.ok(step.durationMs <= 2000)
  assert.notEqual(step.yaw, 1)
  assert.ok(step.pitch >= -0.7)
  assert.ok(step.pitch <= 0.7)
})

test('createMovementStep turns toward home when the bot is outside the radius', () => {
  const options = normalizeHumanMovementOptions({
    stepMinMs: 500,
    stepMaxMs: 500,
    idleChance: 0
  })

  const step = createMovementStep(options, {
    yaw: 0,
    pitch: 0,
    outsideRadius: true,
    position: { x: 4, z: 0 },
    home: { x: 0, z: 0 }
  }, () => 0.5)

  assert.equal(step.type, 'move')
  assert.equal(step.yaw, yawToward({ x: 4, z: 0 }, { x: 0, z: 0 }))
})

function sequence (values) {
  let index = 0
  return () => values[index++ % values.length]
}
