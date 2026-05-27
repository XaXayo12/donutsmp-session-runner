import fs from 'node:fs/promises'
import path from 'node:path'
import { sanitize, safeName } from '../utils/sanitize.js'

export async function createLogger (name, config) {
  const dir = config.dir || './logs'
  await fs.mkdir(dir, { recursive: true })
  return new Logger(name, path.join(dir, `${safeName(name)}.log`), config.console !== false)
}

class Logger {
  constructor (name, file, consoleEnabled) {
    this.name = safeName(name)
    this.file = file
    this.consoleEnabled = consoleEnabled
    this.queue = Promise.resolve()
  }

  info (event, meta) {
    return this.write('INFO', event, meta)
  }

  warn (event, meta) {
    return this.write('WARN', event, meta)
  }

  error (event, meta) {
    return this.write('ERROR', event, meta)
  }

  write (level, event, meta) {
    const line = `${new Date().toISOString()} ${level} ${this.name} ${format(event, meta)}\n`

    if (this.consoleEnabled) process.stdout.write(line)

    this.queue = this.queue
      .then(() => fs.appendFile(this.file, line))
      .catch(() => {})

    return this.queue
  }
}

function format (event, meta) {
  if (meta === undefined) return event
  return `${event} ${JSON.stringify(sanitize(meta))}`
}
