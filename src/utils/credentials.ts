/**
 * Invite password: first 3 letters of org + first 3 of first name + @ + day of month.
 */
const KEEP_LETTERS = /[^A-Za-z]/g;

function onlyLetters(value: string): string {
  return value.replace(KEEP_LETTERS, "");
}

function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Builds the first-login password for an invited user.
 * Rule: first 3 letters of the organization + first 3 letters of the
 * person's first name + "@" + today's day number.
 * Example: organization "Siyana", name "Mihir", day 16 -> "SiyMih@16".
 */
export function generateInvitePassword(name: string, organization: string): string {
  const orgPart = capitalize(onlyLetters(organization).slice(0, 3)) || "Org";
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const namePart = capitalize(onlyLetters(firstName).slice(0, 3)) || "Usr";
  const day = new Date().getDate();
  return `${orgPart}${namePart}@${day}`;
}