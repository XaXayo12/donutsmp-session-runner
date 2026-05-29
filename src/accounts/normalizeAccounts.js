export function normalizeAccounts (input, source) {
  return recordsFrom(input).map(record => normalizeAccount(record, source)).filter(Boolean)
}

function recordsFrom (input) {
  if (Array.isArray(input)) return input
  if (Array.isArray(input?.accounts)) return input.accounts
  if (Array.isArray(input?.cookies)) return input.cookies
  return [input]
}

function normalizeAccount (record, source) {
  if (!record || typeof record !== 'object') return null

  const profile = profileFrom(record)
  const name = text(record.username || record.name || record.profileName || profile?.name)
  const profileId = compactUuid(record.uuid || record.profileId || record.selectedProfileId || profile?.id || record.id)
  const accessToken = text(record.accessToken || record.token || record.ygg?.token || record.session?.accessToken)
  const clientToken = text(record.clientToken || record.ygg?.clientToken || record.session?.clientToken)
  const refresh = refreshFrom(record)
  const proxy = proxyFrom(record)

  if (!name) return null

  const account = {
    name,
    profileId,
    source,
    auth: text(record.auth || record.session?.auth)
  }

  if (proxy) account.proxy = proxy

  const overrides = overridesFrom(record)
  if (overrides) account.overrides = overrides

  if ((accessToken || refresh) && (profileId || refresh)) {
    const selectedProfile = {
      id: profileId || '',
      name
    }

    account.session = {
      accessToken: accessToken || '',
      selectedProfile,
      availableProfiles: [selectedProfile],
      type: text(record.session?.type || record.type) || 'mojang'
    }

    if (clientToken) account.session.clientToken = clientToken
    if (refresh) account.session.refresh = refresh
  }

  return account
}

function proxyFrom (record) {
  const proxy = record.proxy ?? record.network?.proxy ?? record.config?.network?.proxy
  if (!proxy) return null
  if (typeof proxy === 'string') return text(proxy)
  if (typeof proxy === 'object') return clone(proxy)
  return null
}

function overridesFrom (record) {
  const output = {}

  mergePlain(output, record.config)

  for (const section of ['features', 'donut', 'antiAfk', 'humanMovement', 'statusLog']) {
    if (plain(record[section])) output[section] = clone(record[section])
  }

  if (record.chatLog !== undefined) {
    output.features ||= {}
    output.features.chatLog = Boolean(record.chatLog)
  }

  if (record.disableChatLog !== undefined) {
    output.features ||= {}
    output.features.chatLog = !record.disableChatLog
  }

  if (Array.isArray(record.spawnCommands)) {
    output.donut ||= {}
    output.donut.spawnCommands = record.spawnCommands
  }

  return Object.keys(output).length > 0 ? output : null
}

function mergePlain (target, source) {
  if (!plain(source)) return target

  for (const [key, value] of Object.entries(source)) {
    if (!['features', 'donut', 'antiAfk', 'humanMovement', 'statusLog'].includes(key)) continue
    target[key] = plain(value) ? clone(value) : value
  }

  return target
}

function profileFrom (record) {
  return record.profile || record.selectedProfile || record.session?.selectedProfile || record.ygg?.selectedProfile || record.minecraftProfile || null
}

function text (value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function plain (value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function clone (value) {
  return JSON.parse(JSON.stringify(value))
}

function compactUuid (value) {
  return value ? String(value).replace(/-/g, '').trim() : null
}

function refreshFrom (record) {
  const msal = msalRefreshFrom(record)
  if (msal) return msal

  const token = text(
    record.refreshToken ||
    record.refresh_token ||
    record.session?.refreshToken ||
    record.session?.refresh_token ||
    record.ygg?.refreshToken ||
    record.ygg?.refresh_token ||
    record.msa?.refreshToken ||
    record.microsoft?.refreshToken ||
    record.live?.refreshToken ||
    record.token?.refresh_token
  )

  if (!token) return null

  return {
    token,
    flow: text(record.authFlow || record.flow || record.session?.flow || record.msa?.flow || record.microsoft?.flow || record.live?.flow) || 'live',
    authTitle: text(record.authTitle || record.clientId || record.session?.authTitle || record.session?.clientId || record.msa?.authTitle || record.msa?.clientId || record.microsoft?.authTitle || record.microsoft?.clientId || record.live?.authTitle || record.live?.clientId),
    deviceType: text(record.deviceType || record.session?.deviceType || record.live?.deviceType)
  }
}

function msalRefreshFrom (record) {
  const cache = record.msal || record.microsoft?.msal || record.session?.msal || record
  const tokens = cache?.RefreshToken
  if (!tokens || typeof tokens !== 'object') return null

  const token = Object.values(tokens).find(item => item?.secret && item?.client_id)
  if (!token) return null

  return {
    token: token.secret,
    flow: 'msal',
    authTitle: token.client_id
  }
}
