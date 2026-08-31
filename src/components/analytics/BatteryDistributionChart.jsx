import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getAnalyticsStyles } from './analyticsStyles';

const BUCKET_COLORS = {
  '81-100%': '#10b981',
  '51-80%': '#3b82f6',
  '21-50%': '#f59e0b',
  '0-20%': '#ef4444',
  'No Data': '#94a3b8',
};

const DistributionTooltip = ({ active, payload, darkMode }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{
      background: darkMode ? '#1e293b' : '#ffffff',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      borderRadius: 12,
      padding: '8px 12px',
      fontSize: 12,
      color: darkMode ? '#ffffff' : '#0f172a'
    }}>
      <strong>{p.payload.bucket}</strong>: {p.value} device{p.value !== 1 ? 's' : ''}
    </div>
  );
};

export default function BatteryDistributionChart({ data = [], totalDevices = 0, darkMode = false }) {
  const styles = getAnalyticsStyles(darkMode);

  return (
    <div style={styles.card}>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: styles.text.color, margin: 0 }}>Battery Level Distribution</h3>
        <p style={{ fontSize: 11, color: styles.muted.color, margin: '2px 0 20px 0' }}>Devices in each battery range, out of {totalDevices}</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" {...styles.gridStyle} horizontal={false} />
          <XAxis type="number" allowDecimals={false} domain={[0, totalDevices || 'auto']} tick={styles.tickStyle} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="bucket" tick={styles.tickStyle} axisLine={false} tickLine={false} width={70} />
          <Tooltip content={<DistributionTooltip darkMode={darkMode} />} />
          <Bar dataKey="count" name="Devices" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BUCKET_COLORS[entry.bucket] || '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
