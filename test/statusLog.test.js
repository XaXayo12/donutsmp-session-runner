import test from 'node:test'
import assert from 'node:assert/strict'
import { createStatusSnapshot } from '../src/features/statusLog.js'

test('createStatusSnapshot returns compact bot state for logs', () => {
  const snapshot = createStatusSnapshot({
    health: 18,
    food: 16,
    game: {
      gameMode: 'survival',
      dimension: 'minecraft:overworld'
    },
    entity: {
      position: {
        x: 10.49,
        y: 64,
        z: -3.51
      }
    }
  })

  assert.deepEqual(snapshot, {
    health: 18,
    food: 16,
    gameMode: 'survival',
    dimension: 'minecraft:overworld',
    position: {
      x: 10.49,
      y: 64,
      z: -3.51
    }
  })
})
