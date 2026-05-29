import test from 'node:test'
import assert from 'node:assert/strict'
import { selectCommands } from '../src/features/donut.js'

test('selectCommands returns every command in all mode', () => {
  const commands = selectCommands({
    commandMode: 'all'
  }, ['/afk 30', '/warp afk'], () => 0.9)

  assert.deepEqual(commands, ['/afk 30', '/warp afk'])
})

test('selectCommands returns one deterministic command in randomOne mode', () => {
  const commands = selectCommands({
    commandMode: 'randomOne'
  }, ['/afk 30', '/warp afk', '/spawn'], () => 0.5)

  assert.deepEqual(commands, ['/warp afk'])
})
