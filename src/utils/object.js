export function deepMerge (base, patch) {
  if (!plain(base)) return clone(patch)

  const output = clone(base)

  if (!plain(patch)) return output

  for (const [key, value] of Object.entries(patch)) {
    output[key] = plain(value) && plain(output[key])
      ? deepMerge(output[key], value)
      : clone(value)
  }

  return output
}

function plain (value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function clone (value) {
  if (value === undefined) return undefined
  return JSON.parse(JSON.stringify(value))
}
