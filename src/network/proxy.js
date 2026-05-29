import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export function resolveProxyConfig (account, config) {
  const proxyRef = account?.proxy ?? config.network?.proxy
  if (!proxyRef) return null

  if (typeof proxyRef === 'string') {
    const named = config.network?.proxies?.[proxyRef]
    return parseProxyConfig(named || proxyRef)
  }

  return parseProxyConfig(proxyRef)
}

export function parseProxyConfig (value) {
  if (!value) return null
  if (typeof value === 'string') return parseProxyUrl(value)
  if (typeof value !== 'object') throw new Error('proxy_invalid')

  const type = proxyType(value.type ?? value.protocol ?? value.scheme ?? 'socks5')
  const host = text(value.host || value.hostname || value.ip)
  const port = int(value.port, 1, 65535)

  if (!host || !port) throw new Error('proxy_missing_host_or_port')

  const proxy = { type, host, port }
  const userId = text(value.userId || value.username || value.user)
  const password = text(value.password || value.pass)

  if (userId) proxy.userId = userId
  if (password) proxy.password = password

  return proxy
}

export function createProxyConnect (proxy, destination) {
  return client => {
    let SocksClient
    try {
      SocksClient = require('socks').SocksClient
    } catch (error) {
      client.emit('error', new Error(`proxy_dependency_missing:${error.message}`))
      return
    }

    SocksClient.createConnection({
      proxy,
      command: 'connect',
      destination
    }, (error, info) => {
      if (error) {
        client.emit('error', error)
        return
      }

      client.setSocket(info.socket)
      client.emit('connect')
    })
  }
}

function parseProxyUrl (value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('proxy_url_invalid')
  }

  return parseProxyConfig({
    protocol: url.protocol.replace(/:$/, ''),
    host: url.hostname,
    port: url.port,
    username: decodeURIComponent(url.username || ''),
    password: decodeURIComponent(url.password || '')
  })
}

function proxyType (value) {
  if (value === 4 || value === '4' || value === 'socks4') return 4
  if (value === 5 || value === '5' || value === 'socks5') return 5
  throw new Error(`proxy_type_unsupported:${value}`)
}

function text (value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function int (value, min, max) {
  const number = Number(value)
  if (!Number.isInteger(number)) return null
  return Math.min(max, Math.max(min, number))
}
