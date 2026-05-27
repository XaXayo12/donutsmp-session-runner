export function installProcessHandlers (supervisor, logger) {
  process.once('SIGINT', () => shutdown(supervisor, logger, 'SIGINT'))
  process.once('SIGTERM', () => shutdown(supervisor, logger, 'SIGTERM'))
  process.on('unhandledRejection', error => logger.error('unhandled_rejection', meta(error)))
  process.on('uncaughtException', error => logger.error('uncaught_exception', meta(error)).finally(() => process.exit(1)))
}

async function shutdown (supervisor, logger, reason) {
  await logger.warn('shutdown', { reason })
  await supervisor.stop(reason)
  process.exit(0)
}

function meta (error) {
  return {
    message: error?.message || String(error),
    stack: error?.stack
  }
}
