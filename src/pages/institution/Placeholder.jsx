import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Placeholder({ tab, darkMode = false }) {
  return (
    <div style={{ background: darkMode ? '#1e293b' : '#fff', borderRadius: 20, padding: 60, border: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 400 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: darkMode ? '#1d4ed820' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <LayoutDashboard size={28} color="#3b82f6" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: darkMode ? '#fff' : '#0f172a', marginBottom: 8 }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
      <div style={{ fontSize: 14, color: darkMode ? '#94a3b8' : '#6b7280', maxWidth: 360 }}>This section is under development. Institutional monitoring features will be available here soon.</div>
    </div>
  );
}
