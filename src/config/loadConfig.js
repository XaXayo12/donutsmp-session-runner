import { readJsonIfExists } from '../system/json.js'
import { deepMerge } from '../utils/object.js'
import { normalizeConfig } from './normalizeConfig.js'
import { defaultConfig } from './defaultConfig.js'

export async function loadConfig (file) {
  const patch = await readJsonIfExists(file)
  return normalizeConfig(deepMerge(defaultConfig, patch || {}))
}
