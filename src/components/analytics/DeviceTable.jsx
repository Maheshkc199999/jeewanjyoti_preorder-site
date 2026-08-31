import React from 'react';
import { getAnalyticsStyles } from './analyticsStyles';

const STATUS_STYLES = {
  online: { label: 'Online', bg: '#10b98115', color: '#10b981' },
  stale: { label: 'Stale', bg: '#f59e0b15', color: '#f59e0b' },
  never: { label: 'Never Synced', bg: '#64748b15', color: '#64748b' },
};

function formatLastSync(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function batteryColor(pct) {
  if (pct == null) return '#94a3b8';
  if (pct < 20) return '#ef4444';
  if (pct < 50) return '#f59e0b';
  return '#10b981';
}

// Per-device rows (not per-status aggregates) so a row can link straight
// through to that member's Vitals dashboard via onRowClick.
export default function DeviceTable({ rows = [], darkMode = false, onRowClick }) {
  const styles = getAnalyticsStyles(darkMode);

  return (
    <div style={styles.card}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: styles.text.color, margin: 0 }}>Device Inventory</h3>
        <p style={{ fontSize: 11, color: styles.muted.color, margin: '2px 0 0 0' }}>Per-device status snapshot — click a row to open their dashboard</p>
      </div>
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 340 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${styles.gridStyle.stroke}` }}>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: styles.muted.color, textTransform: 'uppercase' }}>Member</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: styles.muted.color, textTransform: 'uppercase' }}>MAC Address</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: styles.muted.color, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: styles.muted.color, textTransform: 'uppercase' }}>Battery</th>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: styles.muted.color, textTransform: 'uppercase' }}>Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '24px 12px', textAlign: 'center', fontSize: 13, color: styles.muted.color }}>No devices match the current filters</td></tr>
            ) : rows.map((r) => {
              const st = STATUS_STYLES[r.status] || STATUS_STYLES.never;
              const clickable = typeof onRowClick === 'function';
              return (
                <tr
                  key={r.id}
                  onClick={clickable ? () => onRowClick(r) : undefined}
                  style={{ borderBottom: `1px solid ${styles.gridStyle.stroke}`, cursor: clickable ? 'pointer' : 'default' }}
                  onMouseEnter={clickable ? (e) => { e.currentTarget.style.background = darkMode ? '#33415530' : '#f8fafc'; } : undefined}
                  onMouseLeave={clickable ? (e) => { e.currentTarget.style.background = 'transparent'; } : undefined}
                >
                  <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: styles.text.color }}>{r.name || 'Unknown'}</td>
                  <td style={{ padding: '12px', fontSize: 12, fontFamily: 'monospace', color: r.macAddress ? styles.text.color : styles.muted.color }}>{r.macAddress || 'Not paired'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: st.bg, color: st.color, textTransform: 'uppercase' }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: 13, color: batteryColor(r.battery), fontWeight: 700 }}>{r.battery != null ? `${r.battery}%` : '—'}</td>
                  <td style={{ padding: '12px', fontSize: 12, color: styles.muted.color }}>{formatLastSync(r.lastSync)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
