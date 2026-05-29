export function normalizeConfig (config) {
  config.connection.port = int(config.connection.port, 25565, 1, 65535)
  config.connection.checkTimeoutInterval = int(config.connection.checkTimeoutInterval, 30000, 5000, 300000)
  config.accounts.maxFiles = int(config.accounts.maxFiles, 256, 1, 5000)
  config.runtime.joinDelayMs = int(config.runtime.joinDelayMs, 3500, 0, 300000)
  config.runtime.spawnTimeoutMs = int(config.runtime.spawnTimeoutMs, 45000, 5000, 300000)
  config.runtime.maxReconnects = int(config.runtime.maxReconnects, 0, 0, 1000000)
  config.runtime.reconnectBaseMs = int(config.runtime.reconnectBaseMs, 5000, 1000, 300000)
  config.runtime.reconnectMaxMs = int(config.runtime.reconnectMaxMs, 60000, 1000, 600000)
  config.runtime.autoInstall = config.runtime.autoInstall !== false
  config.donut.commandDelayMs = int(config.donut.commandDelayMs, 2500, 0, 120000)
  config.donut.commandJitterMs = int(config.donut.commandJitterMs, 1500, 0, 120000)
  config.donut.commandMode = ['all', 'randomOne'].includes(config.donut.commandMode) ? config.donut.commandMode : 'all'
  config.donut.preCommandMovement ||= {}
  config.donut.preCommandMovement.enabled = config.donut.preCommandMovement.enabled !== false
  config.donut.preCommandMovement.seconds = int(config.donut.preCommandMovement.seconds, 5, 0, 60)
  config.donut.periodicCommandIntervalMs = int(config.donut.periodicCommandIntervalMs, 600000, 60000, 86400000)
  config.antiAfk.intervalMs = int(config.antiAfk.intervalMs, 18000, 1000, 300000)
  config.antiAfk.jitterMs = int(config.antiAfk.jitterMs, 9000, 0, 300000)
  config.humanMovement ||= {}
  config.humanMovement.radiusBlocks = int(config.humanMovement.radiusBlocks, 4, 1, 32)
  config.humanMovement.intervalMs = int(config.humanMovement.intervalMs, 1200, 250, 300000)
  config.humanMovement.jitterMs = int(config.humanMovement.jitterMs, 1200, 0, 300000)
  config.humanMovement.burstMinMs = int(config.humanMovement.burstMinMs, 2500, 250, 120000)
  config.humanMovement.burstMaxMs = Math.max(config.humanMovement.burstMinMs, int(config.humanMovement.burstMaxMs, 8000, 250, 120000))
  config.humanMovement.stepMinMs = int(config.humanMovement.stepMinMs, 450, 100, 10000)
  config.humanMovement.stepMaxMs = Math.max(config.humanMovement.stepMinMs, int(config.humanMovement.stepMaxMs, 1800, 100, 10000))
  config.humanMovement.stepPauseMinMs = int(config.humanMovement.stepPauseMinMs, 120, 0, 5000)
  config.humanMovement.stepPauseMaxMs = Math.max(config.humanMovement.stepPauseMinMs, int(config.humanMovement.stepPauseMaxMs, 700, 0, 5000))
  config.humanMovement.idleChance = chance(config.humanMovement.idleChance, 0.14)
  config.humanMovement.sprintChance = chance(config.humanMovement.sprintChance, 0.38)
  config.humanMovement.strafeChance = chance(config.humanMovement.strafeChance, 0.42)
  config.humanMovement.jumpChance = chance(config.humanMovement.jumpChance, 0.12)
  config.humanMovement.sneakChance = chance(config.humanMovement.sneakChance, 0.06)
  config.humanMovement.turnMinRadians = number(config.humanMovement.turnMinRadians, 0.2, 0, Math.PI)
  config.humanMovement.turnMaxRadians = Math.max(config.humanMovement.turnMinRadians, number(config.humanMovement.turnMaxRadians, 1.15, 0, Math.PI))
  config.humanMovement.pitchJitterRadians = number(config.humanMovement.pitchJitterRadians, 0.16, 0, 1)
  config.humanMovement.maxPitch = number(config.humanMovement.maxPitch, 0.75, 0, 1.2)
  config.statusLog ||= {}
  config.statusLog.intervalMs = int(config.statusLog.intervalMs, 60000, 5000, 600000)
  config.donut.spawnCommands = commands(config.donut.spawnCommands)
  config.donut.periodicCommands = commands(config.donut.periodicCommands)
  return config
}

function int (value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isInteger(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function commands (value) {
  if (!Array.isArray(value)) return []
  return value.filter(item => typeof item === 'string' && item.startsWith('/'))
}

function number (value, fallback, min, max) {
  const output = Number(value)
  if (!Number.isFinite(output)) return fallback
  return Math.min(max, Math.max(min, output))
}

function chance (value, fallback) {
  return number(value, fallback, 0, 1)
}
