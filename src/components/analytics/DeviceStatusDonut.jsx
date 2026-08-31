import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getAnalyticsStyles } from './analyticsStyles';

export default function DeviceStatusDonut({ data = [], darkMode = false }) {
  const styles = getAnalyticsStyles(darkMode);
  const total = data.reduce((sum, r) => sum + r.value, 0);

  return (
    <div style={styles.card}>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: styles.text.color, margin: 0 }}>Device Status</h3>
        <p style={{ fontSize: 11, color: styles.muted.color, margin: '2px 0 20px 0' }}>Connectivity breakdown across the fleet</p>
      </div>
      {data.length === 0 ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: styles.muted.color, fontSize: 13 }}>No devices to classify</div>
      ) : (
        <>
          <div style={{ position: 'relative', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" isAnimationActive={false}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Devices']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: styles.text.color, lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 10, color: styles.muted.color, fontWeight: 600, marginTop: 2 }}>Devices</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginTop: 20 }}>
            {data.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: styles.text.color }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flexShrink: 0 }} />
                <span>{r.name} ({total ? Math.round((r.value / total) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
