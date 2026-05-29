import { randomInt } from '../utils/time.js'

export function attachDonut (bot, config, logger, scope) {
  const donut = config.donut
  if (!donut.enabled) return

  const spawnCommands = donut.sendAfkCommand ? donut.spawnCommands : []
  const periodicCommands = donut.periodicCommands

  const onSpawn = () => {
    runSpawnCommands(bot, config, logger, scope, spawnCommands)
      .catch(error => logger.warn('spawn_commands_failed', { message: error.message }))
  }

  bot.on('spawn', onSpawn)
  scope.add(() => bot.off('spawn', onSpawn))

  if (periodicCommands.length > 0) {
    scope.interval(() => scheduleCommands(bot, logger, scope, donut, periodicCommands, 0), donut.periodicCommandIntervalMs)
  }
}

export function selectCommands (donut, commands, rng = Math.random) {
  if (!Array.isArray(commands) || commands.length === 0) return []
  if (donut.commandMode !== 'randomOne') return [...commands]

  const index = Math.min(commands.length - 1, Math.floor(rng() * commands.length))
  return [commands[index]]
}

async function runSpawnCommands (bot, config, logger, scope, commands) {
  await runPreCommandMovement(bot, config, logger)
  scheduleCommands(bot, logger, scope, config.donut, commands, config.donut.commandDelayMs)
}

async function runPreCommandMovement (bot, config, logger) {
  const pre = config.donut.preCommandMovement
  if (!pre.enabled || pre.seconds <= 0) return
  if (!bot.humanMovement?.runBurst) return

  await logger.info('pre_command_movement', { seconds: pre.seconds })
  await bot.humanMovement.runBurst(pre.seconds * 1000, 'pre_command')
}

function scheduleCommands (bot, logger, scope, donut, commands, baseDelay) {
  selectCommands(donut, commands).forEach((command, index) => {
    const jitter = donut.commandJitterMs > 0 ? randomInt(0, donut.commandJitterMs) : 0
    scope.timeout(() => sendCommand(bot, logger, command), baseDelay + jitter + index * 1200)
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
