export function internalPluginOverrides (overrides = {}) {
  const output = {}

  for (const [name, enabled] of Object.entries(overrides || {})) {
    if (typeof name !== 'string' || !name) continue
    output[name] = Boolean(enabled)
  }

  return output
}
