import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { internalPluginOverrides } from '../plugins/internalPluginOverrides.js'

const require = createRequire(import.meta.url)

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
    setImmediate(async () => {
      try {
        const session = await resolveSessionForLogin(account.session, {
          cacheDir: options.profilesFolder || './profiles',
          cacheKey: account.profileId || account.name
        })

        client.session = session
        client.username = session.selectedProfile?.name || account.name
        if (session.profileKeys) client.profileKeys = session.profileKeys
        options.username = client.username
        options.haveCredentials = true
        options.accessToken = session.accessToken

        client.emit('session', session)
        options.connect(client)
      } catch (error) {
        client.emit('error', error)
        client.emit('end', 'sessionAuthError')
      }
    })
  }
}

export async function resolveSessionForLogin (session, options = {}) {
  const fetchImpl = typeof options === 'function' ? options : (options.fetchImpl || globalThis.fetch)
  const activeSession = await refreshSessionIfPossible(session, options)

  if (!activeSession.accessToken) {
    const error = new Error('session_token_missing: No Minecraft Java access token is available. Add a valid access token or a refresh token.')
    error.code = 'SESSION_TOKEN_MISSING'
    throw error
  }

  const profile = await fetchMinecraftProfile(activeSession.accessToken, fetchImpl)

  if (!profile) return activeSession

  const selectedProfile = {
    id: compactUuid(profile.id),
    name: profile.name
  }

  return {
    ...activeSession,
    selectedProfile,
    availableProfiles: [selectedProfile]
  }
}

async function refreshSessionIfPossible (session, options) {
  if (!session.refresh?.token) return session

  try {
    return await refreshMinecraftSession(session, options)
  } catch (error) {
    if (session.accessToken) return session

    const refreshError = new Error(`session_refresh_failed: ${error.message || String(error)}`)
    refreshError.code = 'SESSION_REFRESH_FAILED'
    throw refreshError
  }
}

async function refreshMinecraftSession (session, options) {
  const { Authflow, Titles } = require('prismarine-auth')
  const refresh = session.refresh
  const flow = refresh.flow || 'live'
  const authTitle = refresh.authTitle || defaultAuthTitle(flow, Titles)
  const authOptions = { flow, authTitle }

  if (flow === 'live' || flow === 'sisu') {
    authOptions.deviceType = refresh.deviceType || 'Nintendo'
  }

  const authflow = new Authflow(
    refresh.cacheKey || options.cacheKey || session.selectedProfile?.name || 'account',
    refreshCacheFactory(session, { ...refresh, flow, authTitle }, options),
    authOptions,
    () => {
      throw new Error('session_refresh_requires_refresh_token')
    }
  )

  await authflow.msa.refreshTokens()

  const result = await authflow.getMinecraftJavaToken({
    fetchProfile: true,
    fetchCertificates: true
  })

  if (!result?.token || !result?.profile?.id || !result?.profile?.name) {
    throw new Error('refresh_did_not_return_minecraft_java_profile')
  }

  const selectedProfile = {
    id: compactUuid(result.profile.id),
    name: result.profile.name
  }

  return {
    ...session,
    accessToken: result.token,
    selectedProfile,
    availableProfiles: [selectedProfile],
    refresh: {
      ...refresh,
      flow,
      authTitle
    },
    profileKeys: result.certificates?.profileKeys
  }
}

function refreshCacheFactory (session, refresh, options) {
  const baseDir = path.resolve(options.cacheDir || './profiles', 'session-refresh')
  const cacheKey = safeFileName(refresh.cacheKey || options.cacheKey || session.selectedProfile?.name || 'account')

  return ({ cacheName }) => {
    const initial = initialRefreshCache(cacheName, session, refresh)
    return new JsonCache(path.join(baseDir, `${cacheKey}-${cacheName}.json`), initial)
  }
}

function initialRefreshCache (cacheName, session, refresh) {
  if (cacheName === refresh.flow && (refresh.flow === 'live' || refresh.flow === 'sisu')) {
    return {
      token: {
        access_token: refresh.msaAccessToken || '',
        refresh_token: refresh.token,
        expires_in: 0,
        obtainedOn: 0
      }
    }
  }

  if (cacheName === 'msal' && refresh.flow === 'msal') {
    return {
      RefreshToken: {
        seed: {
          client_id: refresh.authTitle,
          secret: refresh.token
        }
      }
    }
  }

  if (cacheName === 'mca' && session.accessToken) {
    return {
      mca: {
        access_token: session.accessToken,
        expires_in: 0,
        obtainedOn: 0
      }
    }
  }

  return {}
}

function defaultAuthTitle (flow, Titles) {
  if (flow === 'live' || flow === 'sisu') return Titles.MinecraftNintendoSwitch
  throw new Error(`missing_auth_title_for_${flow}_refresh`)
}

async function fetchMinecraftProfile (accessToken, fetchImpl) {
  if (typeof fetchImpl !== 'function') return null

  let response
  try {
    response = await fetchImpl('https://api.minecraftservices.com/minecraft/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'donutsmp-session-runner'
      }
    })
  } catch {
    return null
  }

  if (response.status === 401 || response.status === 403) {
    const error = new Error('session_token_rejected: Minecraft Services rejected this access token. Use a fresh Minecraft Java session file, not a Microsoft/Xbox token or an old ygg token.')
    error.code = 'SESSION_TOKEN_REJECTED'
    throw error
  }

  if (!response.ok) return null

  const profile = await response.json().catch(() => null)
  if (!profile?.id || !profile?.name) return null

  return profile
}

function compactUuid (value) {
  return String(value || '').replace(/-/g, '').trim()
}

function safeFileName (value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 32)
}

class JsonCache {
  constructor (file, initial) {
    this.file = file
    this.initial = initial
    this.cache = null
  }

  async getCached () {
    if (this.cache) return this.cache

    try {
      this.cache = JSON.parse(await fs.readFile(this.file, 'utf8'))
    } catch {
      this.cache = this.initial
    }

    return this.cache
  }

  async setCached (cache) {
    this.cache = cache
    await this.write()
  }

  async setCachedPartial (partial) {
    this.cache = {
      ...(await this.getCached()),
      ...partial
    }
    await this.write()
  }

  async reset () {
    this.cache = {}
    await this.write()
  }

  async write () {
    await fs.mkdir(path.dirname(this.file), { recursive: true })
    await fs.writeFile(this.file, JSON.stringify(this.cache, null, 2))
  }
}
