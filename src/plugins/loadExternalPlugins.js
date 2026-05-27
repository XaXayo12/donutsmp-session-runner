const plugins = {
  pathfinder: {
    packageName: 'mineflayer-pathfinder',
    resolve: mod => mod.pathfinder || mod.default?.pathfinder || mod.default || mod
  },
  autoEat: {
    packageName: 'mineflayer-auto-eat',
    resolve: mod => mod.plugin || mod.default?.plugin || mod.default || mod
  },
  armorManager: {
    packageName: 'mineflayer-armor-manager',
    resolve: mod => mod.armorManager || mod.plugin || mod.default || mod
  },
  tool: {
    packageName: 'mineflayer-tool',
    resolve: mod => mod.plugin || mod.default?.plugin || mod.default || mod
  }
}

export async function loadExternalPlugins (bot, config, logger) {
  for (const [name, enabled] of Object.entries(config.plugins.external || {})) {
    if (!enabled) continue
    await loadExternalPlugin(bot, logger, name)
  }
}

async function loadExternalPlugin (bot, logger, name) {
  const spec = plugins[name]
  if (!spec) return logger.warn('plugin_unknown', { name })

  try {
    const mod = await import(spec.packageName)
    const plugin = spec.resolve(mod)

    if (typeof plugin !== 'function') {
      await logger.warn('plugin_invalid', { name })
      return
    }

    bot.loadPlugin(plugin)
    await logger.info('plugin_loaded', { name })
  } catch (error) {
    await logger.warn('plugin_failed', { name, message: error.message })
  }
}
