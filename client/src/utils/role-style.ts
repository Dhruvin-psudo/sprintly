export interface RoleBadgeStyle {
  label: string;
  className: string;
}

/**
 * Utility to get standard role badge styling and label formatting
 * adhering to system design tokens.
 */
export function getRoleBadgeStyle(roleName?: string): RoleBadgeStyle {
  const normalized = (roleName || 'Member').trim();
  const lower = normalized.toLowerCase();

  if (lower.includes('owner')) {
    return {
      label: normalized,
      className: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
    };
  }

  if (lower.includes('admin')) {
    return {
      label: normalized,
      className: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25',
    }
  }

  if (lower.includes('lead') || lower.includes('member')) {
    return {
      label: normalized,
      className: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    };
  }

  return {
    label: normalized,
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  };
}
