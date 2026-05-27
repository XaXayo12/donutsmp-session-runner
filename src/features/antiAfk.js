import { randomInt, randomDelay } from '../utils/time.js'

export function attachAntiAfk (bot, config, logger, scope) {
  const antiAfk = config.antiAfk
  if (!antiAfk.enabled) return

  const loop = () => {
    tick(bot, antiAfk, logger, scope)
    scope.timeout(loop, randomDelay(antiAfk.intervalMs, antiAfk.jitterMs))
  }

  scope.timeout(loop, randomDelay(antiAfk.intervalMs, antiAfk.jitterMs))
  scope.add(() => clearControls(bot))
}

function tick (bot, antiAfk, logger, scope) {
  if (!active(bot)) return

  if (antiAfk.look) look(bot, logger)
  if (antiAfk.jump) pulse(bot, scope, 'jump', randomInt(180, 320))
  if (antiAfk.sneak && Math.random() > 0.55) pulse(bot, scope, 'sneak', randomInt(250, 700))
  if (antiAfk.walk && Math.random() > 0.7) pulse(bot, scope, 'forward', randomInt(300, 800))
}

function look (bot, logger) {
  const yaw = bot.entity.yaw + randomInt(-25, 25) / 100
  const pitch = clamp(bot.entity.pitch + randomInt(-18, 18) / 100, -0.7, 0.7)
  bot.look(yaw, pitch, true).catch(error => logger.warn('look_failed', { message: error.message }))
}

function pulse (bot, scope, state, ms) {
  bot.setControlState(state, true)
  scope.timeout(() => {
    try { bot.setControlState(state, false) } catch {}
  }, ms)
}

function clearControls (bot) {
  try { bot.clearControlStates() } catch {}
}

function active (bot) {
  return Boolean(bot.entity && bot._client?.socket?.writable)
}

function clamp (value, min, max) {
  return Math.max(min, Math.min(max, value))
}
