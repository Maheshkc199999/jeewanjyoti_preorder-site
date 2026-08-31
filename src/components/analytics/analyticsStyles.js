// Shared style tokens for the admin Analytics page components.
// Kept as a plain function (not a hook) so any component can call it inline.
export function getAnalyticsStyles(darkMode) {
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const borderCol = darkMode ? '#334155' : '#f1f5f9';
  const textCol = darkMode ? '#f8fafc' : '#0f172a';
  const mutedCol = darkMode ? '#94a3b8' : '#6b7280';
  const textMuted = darkMode ? '#64748b' : '#94a3b8';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';

  return {
    card: {
      background: cardBg,
      borderRadius: 18,
      border: `1px solid ${borderCol}`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
      padding: 24,
    },
    text: { color: textCol },
    muted: { color: mutedCol },
    textMuted: { color: textMuted },
    input: {
      background: inputBg,
      border: `1px solid ${borderCol}`,
      color: textCol,
      borderRadius: 10,
      padding: '8px 12px',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      outline: 'none',
    },
    gridStyle: { stroke: darkMode ? '#334155' : '#f1f5f9' },
    tickStyle: { fontSize: 11, fill: darkMode ? '#64748b' : '#94a3b8' },
  };
}
