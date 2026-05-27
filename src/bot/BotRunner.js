import { createBotInstance } from './createBotInstance.js'
import { attachFeatures } from '../features/attachFeatures.js'
import { loadExternalPlugins } from '../plugins/loadExternalPlugins.js'
import { createLogger } from '../system/logger.js'
import { DisposableScope } from '../utils/DisposableScope.js'
import { safeName } from '../utils/sanitize.js'
import { delay } from '../utils/time.js'

export class BotRunner {
  constructor (account, config) {
    this.account = account
    this.config = config
    this.logger = null
    this.bot = null
    this.scope = null
    this.stopped = false
    this.connecting = false
    this.reconnects = 0
    this.authRejected = false
  }

  async start () {
    this.logger = await createLogger(safeName(this.account.name), this.config.logging)
    await this.connect()
  }

  async connect () {
    if (this.stopped || this.connecting) return

    this.connecting = true
    this.closeScope()
    this.scope = new DisposableScope()

    try {
      this.bot = await createBotInstance(this.account, this.config)
      await loadExternalPlugins(this.bot, this.config, this.logger)
      this.bindEvents()
      attachFeatures(this.bot, this.config, this.logger, this.scope)
      this.watchSpawn()
      await this.logger.info('connect', { source: this.account.source })
    } catch (error) {
      await this.logger.error('connect_failed', errorMeta(error))
      await this.reconnect()
    } finally {
      this.connecting = false
    }
  }

  bindEvents () {
    const bot = this.bot

    const onLogin = () => this.logger.info('login')
    const onSpawn = () => {
      this.reconnects = 0
      this.logger.info('spawn')
    }
    const onKicked = reason => this.logger.warn('kicked', { reason: stringify(reason) })
    const onError = error => {
      if (isAuthRejected(error)) this.authRejected = true
      this.logger.error('bot_error', errorMeta(error))
    }
    const onDeath = () => this.logger.warn('death')
    const onEnd = reason => this.ended(reason)

    bot.once('login', onLogin)
    bot.once('spawn', onSpawn)
    bot.on('kicked', onKicked)
    bot.on('error', onError)
    bot.on('death', onDeath)
    bot.once('end', onEnd)

    this.scope.add(() => bot.off('kicked', onKicked))
    this.scope.add(() => bot.off('error', onError))
    this.scope.add(() => bot.off('death', onDeath))
  }

  watchSpawn () {
    let spawned = false
    const onSpawn = () => { spawned = true }

    this.bot.once('spawn', onSpawn)
    this.scope.add(() => this.bot.off('spawn', onSpawn))
    this.scope.timeout(() => {
      if (spawned || this.stopped) return
      this.logger.warn('spawn_timeout')
      this.endBot('spawn_timeout')
    }, this.config.runtime.spawnTimeoutMs)
  }

  async ended (reason) {
    await this.logger.warn('end', { reason: stringify(reason) })
    this.closeScope()
    if (this.authRejected && isAuthEndReason(reason)) {
      this.stopped = true
      await this.logger.warn('auth_rejected_stop', {
        message: 'The Minecraft access token was rejected. Use a fresh Minecraft Java session file, not a Microsoft/Xbox token or an old ygg token.'
      })
      return
    }
    if (!this.stopped) await this.reconnect()
  }

  async reconnect () {
    if (this.stopped) return

    const max = this.config.runtime.maxReconnects
    if (max > 0 && this.reconnects >= max) {
      await this.logger.warn('reconnect_limit', { attempts: this.reconnects })
      return
    }

    this.reconnects += 1
    const delayMs = Math.min(
      this.config.runtime.reconnectMaxMs,
      this.config.runtime.reconnectBaseMs * this.reconnects
    )

    await this.logger.info('reconnect_wait', { attempt: this.reconnects, delayMs })
    await delay(delayMs)
    await this.connect()
  }

  async stop (reason = 'stop') {
    this.stopped = true
    this.closeScope()
    this.endBot(reason)
    await this.logger?.info('stop', { reason })
  }

  closeScope () {
    this.scope?.close()
    this.scope = null
  }

  endBot (reason) {
    try {
      this.bot?.end?.(reason)
    } catch {}
  }
}

function stringify (value) {
  if (typeof value === 'string') return value
  try { return JSON.stringify(value) } catch { return String(value) }
}

function errorMeta (error) {
  return {
    message: error?.message || String(error),
    stack: error?.stack
  }
}

function isAuthRejected (error) {
  return /ForbiddenOperationException|Invalid token|invalid token|Unauthorized|session_token_rejected|SESSION_TOKEN_REJECTED|session_refresh_failed|SESSION_REFRESH_FAILED|session_token_missing|SESSION_TOKEN_MISSING/i.test(error?.message || String(error))
}

function isAuthEndReason (reason) {
  return /encryptionLoginError|sessionAuthError/i.test(stringify(reason))
}
