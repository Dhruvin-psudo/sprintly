export function getFullName(firstName?: string | null, lastName?: string | null): string {
  if (!firstName) return "";
  return `${firstName} ${lastName ?? ""}`.trim();
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();

  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  if (first) {
    const parts = first.split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return first.slice(0, 2).toUpperCase();
  }

  return "";
}