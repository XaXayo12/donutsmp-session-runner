export function attachDonut (bot, config, logger, scope) {
  const donut = config.donut
  if (!donut.enabled) return

  const spawnCommands = donut.sendAfkCommand ? donut.spawnCommands : []
  const periodicCommands = donut.periodicCommands

  const onSpawn = () => scheduleCommands(bot, logger, scope, spawnCommands, donut.commandDelayMs)
  bot.on('spawn', onSpawn)
  scope.add(() => bot.off('spawn', onSpawn))

  if (periodicCommands.length > 0) {
    scope.interval(() => scheduleCommands(bot, logger, scope, periodicCommands, 0), donut.periodicCommandIntervalMs)
  }
}

function scheduleCommands (bot, logger, scope, commands, baseDelay) {
  commands.forEach((command, index) => {
    scope.timeout(() => sendCommand(bot, logger, command), baseDelay + index * 1200)
  })
}

function sendCommand (bot, logger, command) {
  if (!bot._client?.socket?.writable) return

  try {
    bot.chat(command)
    logger.info('command', { command })
  } catch (error) {
    logger.warn('command_failed', { command, message: error.message })
  }
}
