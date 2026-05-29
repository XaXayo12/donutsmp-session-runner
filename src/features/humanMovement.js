import { delay, randomDelay, randomInt } from '../utils/time.js'

const controls = ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']

export function attachHumanMovement (bot, config, logger, scope) {
  const options = normalizeHumanMovementOptions(config.humanMovement)
  const controller = createHumanMovementController(bot, options, logger, scope)
  bot.humanMovement = controller

  if (!options.enabled) return

  const onSpawn = () => {
    controller.setHome()
    controller.scheduleLoop()
  }

  bot.on('spawn', onSpawn)
  scope.add(() => bot.off('spawn', onSpawn))
  scope.add(() => controller.stop())
}

export function createHumanMovementController (bot, options, logger, scope) {
  let home = null
  let busy = false
  let stopped = false

  const controller = {
    setHome () {
      if (bot.entity?.position) home = clonePosition(bot.entity.position)
    },

    scheduleLoop () {
      if (stopped || !options.enabled) return
      scope.timeout(async () => {
        if (!busy && active(bot)) {
          await controller.runBurst(randomInt(options.burstMinMs, options.burstMaxMs), 'loop')
        }
        controller.scheduleLoop()
      }, randomDelay(options.intervalMs, options.jitterMs))
    },

    async runBurst (durationMs, reason = 'manual') {
      if (busy || stopped || !active(bot)) return false

      busy = true
      const started = Date.now()

      try {
        while (!stopped && active(bot) && Date.now() - started < durationMs) {
          await runStep(bot, options, logger, scope, movementContext(bot, home, options), reason)
          await delay(randomInt(options.stepPauseMinMs, options.stepPauseMaxMs))
        }
      } finally {
        clearMovementControls(bot)
        busy = false
      }

      return true
    },

    stop () {
      stopped = true
      clearMovementControls(bot)
    }
  }

  return controller
}

export function normalizeHumanMovementOptions (input = {}) {
  const stepMinMs = int(input.stepMinMs, 450, 100, 10000)
  const stepMaxMs = Math.max(stepMinMs, int(input.stepMaxMs, 1800, 100, 10000))

  return {
    enabled: input.enabled !== false,
    look: input.look !== false,
    move: input.move !== false,
    sprint: input.sprint !== false,
    jump: input.jump !== false,
    sneak: input.sneak !== false,
    radiusBlocks: int(input.radiusBlocks, 4, 1, 32),
    intervalMs: int(input.intervalMs, 1200, 250, 300000),
    jitterMs: int(input.jitterMs, 1200, 0, 300000),
    burstMinMs: int(input.burstMinMs, 2500, 250, 120000),
    burstMaxMs: Math.max(int(input.burstMinMs, 2500, 250, 120000), int(input.burstMaxMs, 8000, 250, 120000)),
    stepMinMs,
    stepMaxMs,
    stepPauseMinMs: int(input.stepPauseMinMs, 120, 0, 5000),
    stepPauseMaxMs: Math.max(int(input.stepPauseMinMs, 120, 0, 5000), int(input.stepPauseMaxMs, 700, 0, 5000)),
    idleChance: chance(input.idleChance, 0.14),
    sprintChance: chance(input.sprintChance, 0.38),
    strafeChance: chance(input.strafeChance, 0.42),
    jumpChance: chance(input.jumpChance, 0.12),
    sneakChance: chance(input.sneakChance, 0.06),
    turnMinRadians: number(input.turnMinRadians, 0.2, 0, Math.PI),
    turnMaxRadians: number(input.turnMaxRadians, 1.15, 0, Math.PI),
    pitchJitterRadians: number(input.pitchJitterRadians, 0.16, 0, 1),
    maxPitch: number(input.maxPitch, 0.75, 0, 1.2)
  }
}

export function createMovementStep (options, context, rng = Math.random) {
  const durationMs = rangeInt(options.stepMinMs, options.stepMaxMs, rng)

  if (rng() < options.idleChance) {
    return {
      type: 'idle',
      durationMs,
      yaw: context.yaw,
      pitch: clamp(context.pitch + signed(options.pitchJitterRadians, rng), -options.maxPitch, options.maxPitch),
      controls: {}
    }
  }

  const yaw = context.outsideRadius && context.home && context.position
    ? yawToward(context.position, context.home)
    : context.yaw + signed(range(options.turnMinRadians, options.turnMaxRadians, rng), rng)

  const controls = { forward: true }

  if (options.sprint && rng() < options.sprintChance) controls.sprint = true
  if (options.strafeChance > 0 && rng() < options.strafeChance) {
    controls[rng() < 0.5 ? 'left' : 'right'] = true
  }
  if (options.jump && rng() < options.jumpChance) controls.jump = true
  if (options.sneak && !controls.sprint && rng() < options.sneakChance) controls.sneak = true

  return {
    type: 'move',
    durationMs,
    yaw,
    pitch: clamp(context.pitch + signed(options.pitchJitterRadians, rng), -options.maxPitch, options.maxPitch),
    controls
  }
}

export function yawToward (from, to) {
  return Math.atan2(-(to.x - from.x), -(to.z - from.z))
}

async function runStep (bot, options, logger, scope, context, reason) {
  const step = createMovementStep(options, context)

  if (options.look) {
    bot.look(step.yaw, step.pitch, false)
      .catch(error => logger.warn('human_movement_look_failed', { reason, message: error.message }))
  }

  if (step.type === 'move' && options.move) {
    applyControls(bot, step.controls)
  }

  scope.timeout(() => clearMovementControls(bot), step.durationMs)
  await delay(step.durationMs)
}

function movementContext (bot, home, options) {
  const position = bot.entity?.position
  const distance = home && position ? horizontalDistance(position, home) : 0

  return {
    yaw: bot.entity?.yaw || 0,
    pitch: bot.entity?.pitch || 0,
    home,
    position,
    outsideRadius: distance > options.radiusBlocks
  }
}

function applyControls (bot, states) {
  clearMovementControls(bot)
  for (const [control, enabled] of Object.entries(states)) {
    if (enabled) bot.setControlState(control, true)
  }
}

function clearMovementControls (bot) {
  for (const control of controls) {
    try { bot.setControlState(control, false) } catch {}
  }
}

function active (bot) {
  return Boolean(bot.entity && bot._client?.socket?.writable)
}

function clonePosition (position) {
  return { x: position.x, y: position.y, z: position.z }
}

function horizontalDistance (a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

function signed (value, rng) {
  return (rng() < 0.5 ? -1 : 1) * value
}

function range (min, max, rng) {
  return min + rng() * (max - min)
}

function rangeInt (min, max, rng) {
  return Math.round(range(min, max, rng))
}

function int (value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isInteger(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function number (value, fallback, min, max) {
  const output = Number(value)
  if (!Number.isFinite(output)) return fallback
  return Math.min(max, Math.max(min, output))
}

function chance (value, fallback) {
  return number(value, fallback, 0, 1)
}

function clamp (value, min, max) {
  return Math.max(min, Math.min(max, value))
}
