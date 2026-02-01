export function getInitials(firstName, lastName) {
  const first = firstName?.trim()?.charAt(0) || ''
  const last = lastName?.trim()?.charAt(0) || ''

  return `${first}${last}`.toUpperCase() || '?'
}
