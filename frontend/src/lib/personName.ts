export function formatPersonName(name?: string | null) {
  const raw = String(name ?? '').trim();
  if (!raw) return '';

  return raw
    .split(/\s+/)
    .map((word) =>
      word
        .split(/([-'`])/)
        .map((part) => {
          if (part === '-' || part === "'" || part === '`') return part;
          if (!part) return '';
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join(''),
    )
    .join(' ');
}

export function initialsFromPersonName(name?: string | null) {
  const formatted = formatPersonName(name);
  if (!formatted) return 'U';
  const parts = formatted.split(/\s+/).slice(0, 2);
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
