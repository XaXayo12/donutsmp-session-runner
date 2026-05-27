import { attachAntiAfk } from './antiAfk.js'
import { attachAuto } from './auto.js'
import { attachChatLog } from './chatLog.js'
import { attachDonut } from './donut.js'

export function attachFeatures (bot, config, logger, scope) {
  attachChatLog(bot, config, logger, scope)
  attachAuto(bot, config, logger, scope)
  attachDonut(bot, config, logger, scope)
  attachAntiAfk(bot, config, logger, scope)
}
