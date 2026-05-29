import { deepMerge } from '../utils/object.js'

export function effectiveConfig (config, account) {
  return deepMerge(config, account?.overrides || {})
}
