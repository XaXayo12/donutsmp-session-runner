import { listJsonFiles, readJson } from '../system/json.js'
import { normalizeAccounts } from './normalizeAccounts.js'
import { validateAccount } from './validateAccount.js'

export class AccountStore {
  constructor (config, logger) {
    this.config = config
    this.logger = logger
  }

  async load () {
    const fromCookies = await this.loadCookies()
    const accounts = fromCookies.length > 0 ? fromCookies : await this.loadAccountsFile()
    return this.unique(this.valid(accounts))
  }

  async loadCookies () {
    const files = await listJsonFiles(this.config.cookiesDir, {
      recursive: this.config.recursive,
      maxFiles: this.config.maxFiles
    })

    const accounts = []

    for (const file of files) {
      try {
        accounts.push(...normalizeAccounts(await readJson(file), file))
      } catch (error) {
        await this.fail('bad_cookie_file', error, { file })
      }
    }

    return accounts
  }

  async loadAccountsFile () {
    try {
      return normalizeAccounts(await readJson(this.config.accountsFile), this.config.accountsFile)
    } catch (error) {
      if (error.code === 'ENOENT') return []
      await this.fail('bad_accounts_file', error, { file: this.config.accountsFile })
      return []
    }
  }

  valid (accounts) {
    const output = []

    for (const account of accounts) {
      const error = validateAccount(account)
      if (!error) {
        output.push(account)
        continue
      }
      if (this.config.strict) throw new Error(`${error}:${account?.source || 'unknown'}`)
      this.logger.warn('skip_account', { error, source: account?.source, name: account?.name })
    }

    return output
  }

  unique (accounts) {
    const seen = new Set()
    const output = []

    for (const account of accounts) {
      const key = String(account.profileId || account.name).toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      output.push(account)
    }

    return output
  }

  async fail (code, error, meta) {
    if (this.config.strict) throw error
    await this.logger.warn(code, { ...meta, message: error.message })
  }
}
