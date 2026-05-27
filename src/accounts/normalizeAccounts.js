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

  if (!name) return null

  const account = {
    name,
    profileId,
    source,
    auth: text(record.auth || record.session?.auth)
  }

  if (accessToken && profileId) {
    account.session = {
      accessToken,
      selectedProfile: {
        id: profileId,
        name
      },
      type: text(record.session?.type || record.type) || 'mojang'
    }
  }

  return account
}

function profileFrom (record) {
  return record.profile || record.selectedProfile || record.session?.selectedProfile || record.ygg?.selectedProfile || record.minecraftProfile || null
}

function text (value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function compactUuid (value) {
  return value ? String(value).replace(/-/g, '').trim() : null
}
