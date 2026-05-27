const secret = /accessToken|token|cookie|session|secret|password|authorization/i

export function sanitize (value) {
  if (typeof value === 'string') return value.length > 128 ? `${value.slice(0, 64)}…` : value
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value

  const output = {}

  for (const [key, item] of Object.entries(value)) {
    output[key] = secret.test(key) ? '[redacted]' : sanitize(item)
  }

  return output
}

export function safeName (value) {
  return String(value || 'unknown').replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 48) || 'unknown'
}
