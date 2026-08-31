import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { getAnalyticsStyles } from './analyticsStyles';
import { TIME_RANGE_OPTIONS, SEGMENT_OPTIONS } from './analyticsFilterOptions';

// Self-contained filter controls. They hold their own state so the toolbar
// feels alive in the static build; pass `onTimeRangeChange` / `onSegmentChange`
// to lift the values up once the page filters real data by them.
export default function FilterToolbar({ darkMode = false, onTimeRangeChange, onSegmentChange }) {
  const styles = getAnalyticsStyles(darkMode);
  const [timeRange, setTimeRange] = useState('all');
  const [segment, setSegment] = useState('all');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={14} color={styles.muted.color} />
        <select
          value={timeRange}
          onChange={(e) => { setTimeRange(e.target.value); onTimeRangeChange?.(e.target.value); }}
          style={styles.input}
        >
          {TIME_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Filter size={14} color={styles.muted.color} />
        <select
          value={segment}
          onChange={(e) => { setSegment(e.target.value); onSegmentChange?.(e.target.value); }}
          style={styles.input}
        >
          {SEGMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
