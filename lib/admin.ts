// Admin whitelist — add more phone numbers here to grant access.
const ADMIN_PHONES: Set<string> = new Set(["16628767165"]);

export function isAdmin(phone: string | undefined | null): boolean {
  if (!phone) return false;
  return ADMIN_PHONES.has(phone);
}
