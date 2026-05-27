import { BotRunner } from './BotRunner.js'
import { delay } from '../utils/time.js'

export class BotSupervisor {
  constructor (accounts, config, logger) {
    this.accounts = accounts
    this.config = config
    this.logger = logger
    this.runners = []
    this.stopped = false
  }

  async start () {
    if (this.accounts.length === 0) {
      await this.logger.warn('no_accounts')
      return
    }

    for (const account of this.accounts) {
      if (this.stopped) return
      const runner = new BotRunner(account, this.config)
      this.runners.push(runner)
      await runner.start()
      await delay(this.config.runtime.joinDelayMs)
    }
  }

  async stop (reason = 'stop') {
    this.stopped = true
    await Promise.allSettled(this.runners.map(runner => runner.stop(reason)))
  }
}
