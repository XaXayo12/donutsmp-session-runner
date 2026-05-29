export function attachStatusLog (bot, config, logger, scope) {
  if (!config.features.statusLog) return

  const writeStatus = () => {
    if (!active(bot)) return
    logger.info('status', createStatusSnapshot(bot))
  }

  const onSpawn = writeStatus
  bot.on('spawn', onSpawn)
  scope.add(() => bot.off('spawn', onSpawn))
  scope.interval(writeStatus, config.statusLog.intervalMs)
}

export function createStatusSnapshot (bot) {
  return {
    health: bot.health,
    food: bot.food,
    gameMode: bot.game?.gameMode,
    dimension: bot.game?.dimension,
    position: positionSnapshot(bot.entity?.position)
  }
}

function positionSnapshot (position) {
  if (!position) return null
  return {
    x: round(position.x),
    y: round(position.y),
    z: round(position.z)
  }
}

function round (value) {
  return Math.round(Number(value) * 100) / 100
}

function active (bot) {
  return Boolean(bot.entity && bot._client?.socket?.writable)
}
