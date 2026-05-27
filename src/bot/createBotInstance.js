import { internalPluginOverrides } from '../plugins/internalPluginOverrides.js'

export async function createBotInstance (account, config) {
  const mineflayer = await loadMineflayer()
  return mineflayer.createBot(createOptions(account, config))
}

async function loadMineflayer () {
  try {
    const mod = await import('mineflayer')
    const mineflayer = mod.default || mod

    if (typeof mineflayer.createBot !== 'function') {
      throw new Error('invalid_mineflayer_package')
    }

    return mineflayer
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('mineflayer_missing:run_npm_install')
    }

    throw error
  }
}

export function createOptions (account, config) {
  const options = {
    host: config.connection.host,
    port: config.connection.port,
    username: account.name,
    auth: account.session ? sessionAuth(account) : (account.auth || config.connection.auth),
    version: config.connection.version || false,
    brand: config.connection.brand,
    profilesFolder: config.connection.profilesFolder,
    checkTimeoutInterval: config.connection.checkTimeoutInterval,
    physicsEnabled: config.connection.physicsEnabled,
    respawn: config.connection.respawn,
    hideErrors: config.connection.hideErrors,
    logErrors: config.connection.logErrors,
    loadInternalPlugins: config.plugins.loadInternal,
    plugins: internalPluginOverrides(config.plugins.internalOverrides)
  }

  if (account.session) {
    options.session = account.session
  }

  return options
}

function sessionAuth (account) {
  return (client, options) => {
    const session = account.session

    client.session = session
    client.username = session.selectedProfile?.name || account.name
    options.username = client.username
    options.haveCredentials = true
    options.accessToken = session.accessToken

    client.emit('session', session)
    options.connect(client)
  }
}
