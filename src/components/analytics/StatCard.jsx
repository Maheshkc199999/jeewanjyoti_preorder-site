import React from 'react';
import { Users, Activity, Heart, ShieldAlert, Moon, Zap, Wind, AlertTriangle, Bluetooth, Smartphone, Wifi, WifiOff, BatteryLow } from 'lucide-react';
import { getAnalyticsStyles } from './analyticsStyles';

const ICONS = { Users, Activity, Heart, ShieldAlert, Moon, Zap, Wind, AlertTriangle, Bluetooth, Smartphone, Wifi, WifiOff, BatteryLow };

export default function StatCard({ label, value, note, icon, color, bg, darkMode = false }) {
  const styles = getAnalyticsStyles(darkMode);
  const Icon = ICONS[icon] || Activity;

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
          background: darkMode ? '#33415550' : '#f1f5f9', color: styles.muted.color
        }}>
          {note}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 13, color: styles.muted.color, fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: styles.text.color, letterSpacing: '-0.5px' }}>{value}</div>
      </div>
    </div>
  );
}
