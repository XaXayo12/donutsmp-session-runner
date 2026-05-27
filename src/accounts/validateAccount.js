export function validateAccount (account) {
  if (!account?.name) return 'missing_name'
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(account.name)) return 'invalid_name'
  if (account.profileId && !/^[a-fA-F0-9]{32}$/.test(account.profileId)) return 'invalid_profile_id'
  if (account.session && !account.session.accessToken && !account.session.refresh?.token) return 'invalid_session'
  if (account.session && !account.session.selectedProfile?.id && !account.session.refresh?.token) return 'invalid_profile'
  return null
}
