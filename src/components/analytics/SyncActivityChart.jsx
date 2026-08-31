import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { getAnalyticsStyles } from './analyticsStyles';

const ChartTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: darkMode ? '#1e293b' : '#ffffff',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      color: darkMode ? '#ffffff' : '#0f172a'
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: darkMode ? '#94a3b8' : '#64748b' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
          <span style={{ fontWeight: 500, color: darkMode ? '#cbd5e1' : '#475569' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: darkMode ? '#ffffff' : '#0f172a' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Devices bucketed by how recently they last synced, with average battery
// per bucket overlaid — shows fleet freshness at a glance.
export default function SyncActivityChart({ data = [], darkMode = false }) {
  const styles = getAnalyticsStyles(darkMode);

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: styles.text.color, margin: 0 }}>Sync Activity</h3>
          <p style={{ fontSize: 11, color: styles.muted.color, margin: '2px 0 0 0' }}>Devices by last-sync recency, with average battery per group</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3b82f6' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6' }} /> Devices
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Avg Battery (%)
          </span>
        </div>
      </div>
      {data.length === 0 ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: styles.muted.color, fontSize: 13 }}>No device sync data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" {...styles.gridStyle} />
            <XAxis dataKey="name" tick={styles.tickStyle} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" allowDecimals={false} tick={styles.tickStyle} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={styles.tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip darkMode={darkMode} />} />
            <Bar yAxisId="left" dataKey="count" name="Devices" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="avgBattery" name="Avg Battery" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
