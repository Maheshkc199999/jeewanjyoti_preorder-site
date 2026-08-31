import React from 'react';
import { Info } from 'lucide-react';

export default function SampleDataNotice({ darkMode = false, message }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
      background: darkMode ? '#f59e0b15' : '#fffbeb', border: `1px solid ${darkMode ? '#f59e0b30' : '#fef3c7'}`
    }}>
      <Info size={16} color="#d97706" style={{ flexShrink: 0 }} />
      <p style={{ fontSize: 12, color: darkMode ? '#fcd34d' : '#92400e', margin: 0 }}>
        {message || "Showing sample data. This view isn't wired to live data yet."}
      </p>
    </div>
  );
}
