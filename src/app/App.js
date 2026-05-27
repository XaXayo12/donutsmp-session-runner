import { AccountStore } from '../accounts/AccountStore.js'
import { BotSupervisor } from '../bot/BotSupervisor.js'
import { loadConfig } from '../config/loadConfig.js'
import { createLogger } from '../system/logger.js'
import { installProcessHandlers } from '../system/processHandlers.js'
import { ensureDependencies } from '../dependencies/ensureDependencies.js'

export class App {
  static async create (context) {
    const flags = new Set(context.argv)
    const config = await loadConfig('./config.json')
    const logger = await createLogger('main', config.logging)
    const accounts = await new AccountStore(config.accounts, logger).load()
    const supervisor = new BotSupervisor(accounts, config, logger)
    return new App(flags, config, accounts, supervisor, logger)
  }

  constructor (flags, config, accounts, supervisor, logger) {
    this.flags = flags
    this.config = config
    this.accounts = accounts
    this.supervisor = supervisor
    this.logger = logger
  }

  async run () {
    installProcessHandlers(this.supervisor, this.logger)

    if (this.flags.has('--dry')) {
      await this.logger.info('dry', {
        accounts: this.accounts.map(account => ({
          name: account.name,
          source: account.source,
          session: Boolean(account.session)
        }))
      })
      return
    }

    if (this.accounts.length > 0) {
      await ensureDependencies(this.config, this.logger)
    }

    await this.supervisor.start()
  }
}
