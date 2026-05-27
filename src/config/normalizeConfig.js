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
  config.donut.periodicCommandIntervalMs = int(config.donut.periodicCommandIntervalMs, 600000, 60000, 86400000)
  config.antiAfk.intervalMs = int(config.antiAfk.intervalMs, 18000, 1000, 300000)
  config.antiAfk.jitterMs = int(config.antiAfk.jitterMs, 9000, 0, 300000)
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
