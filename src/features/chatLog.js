export function attachChatLog (bot, config, logger, scope) {
  if (!config.features.chatLog) return

  const onMessage = message => logger.info('message', { text: message.toString() })
  const onWhisper = (username, message) => logger.info('whisper', { username, message })

  bot.on('message', onMessage)
  bot.on('whisper', onWhisper)

  scope.add(() => bot.off('message', onMessage))
  scope.add(() => bot.off('whisper', onWhisper))
}
