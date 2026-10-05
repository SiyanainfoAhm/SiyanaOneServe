const HIDDEN_ORGANIZATION_NAMES = new Set(["siyana info solutions"]);

export function isSelectableOrganization(name: string): boolean {
  return !HIDDEN_ORGANIZATION_NAMES.has(name.trim().toLowerCase());
}
