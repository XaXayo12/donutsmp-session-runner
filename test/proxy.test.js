import test from 'node:test'
import assert from 'node:assert/strict'
import { parseProxyConfig, resolveProxyConfig } from '../src/network/proxy.js'

test('parseProxyConfig supports socks5 urls with authentication', () => {
  const proxy = parseProxyConfig('socks5://user:pass@127.0.0.1:1080')

  assert.deepEqual(proxy, {
    type: 5,
    host: '127.0.0.1',
    port: 1080,
    userId: 'user',
    password: 'pass'
  })
})

test('resolveProxyConfig resolves account proxy names from global proxy map', () => {
  const config = {
    network: {
      proxies: {
        afkOne: {
          protocol: 'socks4',
          host: '10.0.0.2',
          port: 9050
        }
      }
    }
  }
  const account = { name: 'BotOne', proxy: 'afkOne' }

  assert.deepEqual(resolveProxyConfig(account, config), {
    type: 4,
    host: '10.0.0.2',
    port: 9050
  })
})

test('resolveProxyConfig returns null when no proxy is configured for the bot', () => {
  assert.equal(resolveProxyConfig({ name: 'BotOne' }, { network: { proxies: {} } }), null)
})
