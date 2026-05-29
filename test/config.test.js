import test from 'node:test'
import assert from 'node:assert/strict'
import { effectiveConfig } from '../src/bot/effectiveConfig.js'
import { defaultConfig } from '../src/config/defaultConfig.js'
import { normalizeConfig } from '../src/config/normalizeConfig.js'

test('effectiveConfig applies per-account overrides without mutating the shared config', () => {
  const base = structuredClone(defaultConfig)
  const account = {
    name: 'BotOne',
    overrides: {
      features: {
        chatLog: false,
        statusLog: true
      },
      donut: {
        spawnCommands: ['/afk 10', '/warp afk'],
        commandMode: 'randomOne',
        preCommandMovement: {
          enabled: true,
          seconds: 7
        }
      },
      humanMovement: {
        radiusBlocks: 6,
        sprintChance: 0.8
      }
    }
  }

  const config = effectiveConfig(base, account)

  assert.equal(config.features.chatLog, false)
  assert.equal(config.features.statusLog, true)
  assert.deepEqual(config.donut.spawnCommands, ['/afk 10', '/warp afk'])
  assert.equal(config.donut.commandMode, 'randomOne')
  assert.equal(config.donut.preCommandMovement.seconds, 7)
  assert.equal(config.humanMovement.radiusBlocks, 6)
  assert.equal(config.humanMovement.sprintChance, 0.8)
  assert.notEqual(config, base)
  assert.equal(base.features.chatLog, true)
  assert.deepEqual(base.donut.spawnCommands, ['/afk 30'])
})

test('normalizeConfig clamps new human movement and status settings', () => {
  const config = structuredClone(defaultConfig)
  config.features.statusLog = true
  config.statusLog.intervalMs = 200
  config.donut.commandMode = 'bad-mode'
  config.donut.preCommandMovement.seconds = 999
  config.humanMovement.radiusBlocks = 999
  config.humanMovement.stepMinMs = 1
  config.humanMovement.stepMaxMs = 999999
  config.humanMovement.sprintChance = 5
  config.humanMovement.idleChance = -2

  const normalized = normalizeConfig(config)

  assert.equal(normalized.statusLog.intervalMs, 5000)
  assert.equal(normalized.donut.commandMode, 'all')
  assert.equal(normalized.donut.preCommandMovement.seconds, 60)
  assert.equal(normalized.humanMovement.radiusBlocks, 32)
  assert.equal(normalized.humanMovement.stepMinMs, 100)
  assert.equal(normalized.humanMovement.stepMaxMs, 10000)
  assert.equal(normalized.humanMovement.sprintChance, 1)
  assert.equal(normalized.humanMovement.idleChance, 0)
})
