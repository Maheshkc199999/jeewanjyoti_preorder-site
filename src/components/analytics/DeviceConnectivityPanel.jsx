import React from 'react';
import { Wifi, BatteryLow, BatteryMedium, Clock } from 'lucide-react';
import { getAnalyticsStyles } from './analyticsStyles';

export default function DeviceConnectivityPanel({
  darkMode = false,
  connectedCount = 0,
  totalCount = 0,
  connectedPct = 0,
  avgBattery = null,
  lowBatteryCount = 0,
  staleSyncCount = 0,
}) {
  const styles = getAnalyticsStyles(darkMode);

  const rows = [
    { icon: Wifi, label: 'Reporting members', value: `${connectedCount} of ${totalCount}`, color: '#10b981', bg: '#10b98115' },
    { icon: BatteryMedium, label: 'Average battery', value: avgBattery != null ? `${avgBattery}%` : '—', color: '#3b82f6', bg: '#3b82f615' },
    { icon: BatteryLow, label: 'Battery under 20%', value: lowBatteryCount, color: '#ef4444', bg: '#ef444415' },
    { icon: Clock, label: 'No sync in 2 days+', value: staleSyncCount, color: '#f59e0b', bg: '#f59e0b15' },
  ];

  return (
    <div style={styles.card}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: styles.text.color, margin: 0 }}>Device Connectivity</h3>
        <p style={{ fontSize: 11, color: styles.muted.color, margin: '2px 0 0 0' }}>{connectedPct}% of members have any vitals data on record</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
            background: darkMode ? '#33415520' : '#f8fafc', border: `1px solid ${styles.gridStyle.stroke}`
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <r.icon size={16} color={r.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: styles.text.color, lineHeight: 1.1 }}>{r.value}</div>
              <div style={{ fontSize: 10.5, color: styles.muted.color, fontWeight: 600, marginTop: 2 }}>{r.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
