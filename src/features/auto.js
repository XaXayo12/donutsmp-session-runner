export function attachAuto (bot, config, logger, scope) {
  const onSpawn = () => {
    configureAutoEat(bot, config, logger)
    equipArmor(bot, config, logger)
  }

  bot.on('spawn', onSpawn)
  scope.add(() => bot.off('spawn', onSpawn))
}

function configureAutoEat (bot, config, logger) {
  if (!config.features.autoEat || !bot.autoEat) return

  try {
    bot.autoEat.setOpts?.({ minHunger: 15, minHealth: 14, priority: 'foodPoints' })
    bot.autoEat.enableAuto?.()
  } catch (error) {
    logger.warn('auto_eat_failed', { message: error.message })
  }
}

function equipArmor (bot, config, logger) {
  if (!config.features.autoArmor || !bot.armorManager) return

  Promise.resolve(bot.armorManager.equipAll?.())
    .catch(error => logger.warn('auto_armor_failed', { message: error.message }))
}
