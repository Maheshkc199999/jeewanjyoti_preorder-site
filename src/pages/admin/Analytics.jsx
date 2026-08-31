// src/pages/admin/Analytics.jsx
//
// Device Analytics view for the admin console. Computes connectivity,
// battery health, and sync-recency stats directly off `allUsers`, which
// AdminDashboard.jsx fetches from `/api/users/` and enriches with
// `/api/latest_data_user/?user_id=` per user (see fetchAllUsers in
// AdminDashboard.jsx). That's the same `allUsers` the Alerts and Members
// tabs already use, so this page shows real data as soon as any of those
// tabs would.
//
// ============================================================================
// DATA SHAPE — this is the actual `latest_data_user` payload shape (see
// AdminMembers.jsx's userHasFlaggedVital/latestVitalTimestamp for the same
// field paths used elsewhere in the app). Update the ACCESSORS block below
// if the backend response ever changes shape.
// ============================================================================
//
// allUsers = [
//   {
//     id, first_name, last_name, email, profile_image, status,
//     vitals: {
//       heartrate:     { once_heart_value, date } | undefined,
//       spo2:          { Blood_oxygen, date } | undefined,
//       bloodpressure: { sbp, dbp, date } | undefined,
//       sleep:         { duration, date } | undefined,
//       hrv_iso:       { hrv, date } | undefined,
//       battery:       { percentage, timestamp } | undefined,
//     }
//   },
//   ...
// ]
//
// There's no single "last sync" field on the user record — "last sync" here
// is derived as the most recent timestamp across all of a member's vitals
// readings, same as AdminMembers.jsx's latestVitalTimestamp(). It's the
// closest proxy this payload has to "device last checked in."
//
// There's also no per-device metadata (model, firmware, MAC) in the bulk
// payload — only battery percentage/timestamp. If that ever gets added,
// wire it into the ACCESSORS block and the Device Inventory table.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FilterToolbar from '../../components/analytics/FilterToolbar';
import StatCard from '../../components/analytics/StatCard';
import SyncActivityChart from '../../components/analytics/SyncActivityChart';
import DeviceStatusDonut from '../../components/analytics/DeviceStatusDonut';
import BatteryDistributionChart from '../../components/analytics/BatteryDistributionChart';
import DeviceTable from '../../components/analytics/DeviceTable';
import DeviceConnectivityPanel from '../../components/analytics/DeviceConnectivityPanel';
import { getAnalyticsStyles } from '../../components/analytics/analyticsStyles';
import { authenticatedFetch } from '../../lib/tokenManager';

// ---------------------------------------------------------------------------
// ACCESSORS — the only place that should know about the real field layout
// ---------------------------------------------------------------------------
const getName = (u) => `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.email || 'Unknown User';
const getBattery = (u) => u?.vitals?.battery?.percentage ?? null;
const isDeviceConnected = (u) => !!(u?.vitals && Object.keys(u.vitals).length > 0);

// Most recent reading timestamp across all vitals streams — stands in for
// "last sync" since the bulk user payload doesn't carry one directly.
const getLastSync = (u) => {
  const dates = [
    u?.vitals?.heartrate?.date,
    u?.vitals?.spo2?.date,
    u?.vitals?.bloodpressure?.date,
    u?.vitals?.sleep?.date,
    u?.vitals?.hrv_iso?.date,
    u?.vitals?.battery?.timestamp,
  ]
    .map((d) => (d ? new Date(d) : null))
    .filter((d) => d && !Number.isNaN(d.getTime()));
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
};

// ---------------------------------------------------------------------------
// small stats helpers
// ---------------------------------------------------------------------------
const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

// Maps FilterToolbar's TIME_RANGE_OPTIONS values to a day count; 'all' (or
// anything unrecognized) means no recency filter.
const TIME_RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

/**
 * A device is 'online' if it's synced within the last 24h, 'stale' if it
 * has synced before but not that recently, and 'never' if no reading has
 * ever come in for that member.
 */
function deriveDeviceStatus(u) {
  const last = getLastSync(u);
  if (!last) return 'never';
  const ageDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays < 1 ? 'online' : 'stale';
}

/**
 * Filter members by device status ('all' | 'online' | 'stale' | 'never')
 * and by a recency window in days. timeRangeDays === null means "no filter".
 */
function applyFilters(allUsers, segment, timeRangeDays) {
  const now = Date.now();
  return allUsers.filter((u) => {
    if (segment !== 'all' && deriveDeviceStatus(u) !== segment) return false;
    if (timeRangeDays != null) {
      const last = getLastSync(u);
      if (!last) return false;
      const ageDays = (now - last.getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays > timeRangeDays) return false;
    }
    return true;
  });
}

function computeStats(users, macByEmail) {
  const total = users.length;
  const online = users.filter((u) => deriveDeviceStatus(u) === 'online').length;
  const batteryVals = users.map(getBattery).filter((v) => v != null);
  const lowBattery = batteryVals.filter((v) => v < 20).length;
  const neverSynced = users.filter((u) => deriveDeviceStatus(u) === 'never').length;
  const pairedCount = users.filter((u) => u?.email && macByEmail.get(u.email.toLowerCase())).length;

  return [
    { key: 'total_devices', label: 'Total Devices', value: pairedCount, note: `with MAC address · ${total} total members`, icon: 'Smartphone', color: '#3b82f6', bg: '#3b82f615' },
    { key: 'online_now', label: 'Online Now', value: online, note: total ? `${round1((online / total) * 100)}% of fleet` : 'no devices', icon: 'Wifi', color: '#10b981', bg: '#10b98115' },
    { key: 'low_battery', label: 'Low Battery', value: lowBattery, note: 'under 20%', icon: 'BatteryLow', color: '#ef4444', bg: '#ef444415' },
    { key: 'never_synced', label: 'Never Synced', value: neverSynced, note: 'no data received', icon: 'WifiOff', color: '#64748b', bg: '#64748b15' },
  ];
}

/**
 * Devices bucketed by how recently they last synced, with average battery
 * per bucket. Devices that have never sent a reading get their own trailing
 * "Never" bucket rather than being silently dropped.
 */
function computeSyncActivity(users) {
  const buckets = [
    { label: 'Today', min: 0, max: 1 },
    { label: '1-3d ago', min: 1, max: 3 },
    { label: '4-7d ago', min: 3, max: 7 },
    { label: '8-14d ago', min: 7, max: 14 },
    { label: '15d+ ago', min: 14, max: Infinity },
  ];
  const now = Date.now();
  const synced = users.filter((u) => getLastSync(u));
  const neverCount = users.length - synced.length;

  const rows = buckets.map((b) => {
    const inBucket = synced.filter((u) => {
      const ageDays = (now - getLastSync(u).getTime()) / (1000 * 60 * 60 * 24);
      return ageDays >= b.min && ageDays < b.max;
    });
    return {
      name: b.label,
      count: inBucket.length,
      avgBattery: round1(avg(inBucket.map(getBattery).filter((v) => v != null))) ?? 0,
    };
  });

  if (neverCount > 0) {
    rows.push({ name: 'Never', count: neverCount, avgBattery: 0 });
  }
  return rows;
}

function computeDeviceStatusBreakdown(users) {
  const counts = { online: 0, stale: 0, never: 0 };
  users.forEach((u) => { counts[deriveDeviceStatus(u)] += 1; });
  return [
    { name: 'Online', value: counts.online, color: '#10b981' },
    { name: 'Stale', value: counts.stale, color: '#f59e0b' },
    { name: 'Never Synced', value: counts.never, color: '#94a3b8' },
  ].filter((r) => r.value > 0);
}

function computeBatteryDistribution(users) {
  const buckets = [
    { bucket: '81-100%', min: 81, max: 101 },
    { bucket: '51-80%', min: 51, max: 81 },
    { bucket: '21-50%', min: 21, max: 51 },
    { bucket: '0-20%', min: 0, max: 21 },
  ];
  const batteryVals = users.map(getBattery);
  const noData = batteryVals.filter((v) => v == null).length;
  const rows = buckets.map((b) => ({
    bucket: b.bucket,
    count: batteryVals.filter((v) => v != null && v >= b.min && v < b.max).length,
  }));
  rows.push({ bucket: 'No Data', count: noData });
  return rows;
}

// Paired devices (a non-null MAC address) are surfaced above unpaired ones
// in the inventory table, since those are the ones an admin actually needs
// to keep an eye on; ties preserve the incoming order.
function computeDeviceRows(users, macByEmail) {
  const rows = users.map((u) => {
    const lastSync = getLastSync(u);
    return {
      id: u.id,
      name: getName(u),
      status: deriveDeviceStatus(u),
      battery: getBattery(u),
      lastSync: lastSync ? lastSync.toISOString() : null,
      macAddress: (u?.email && macByEmail.get(u.email.toLowerCase())) || null,
    };
  });
  return rows.sort((a, b) => (b.macAddress ? 1 : 0) - (a.macAddress ? 1 : 0));
}

function computeConnectivity(users) {
  const total = users.length || 1;
  const connected = users.filter(isDeviceConnected).length;
  const batteryVals = users.map(getBattery).filter((v) => v != null);
  const lowBattery = batteryVals.filter((v) => v < 20).length;

  const now = Date.now();
  const staleSync = users.filter((u) => {
    const last = getLastSync(u);
    if (!last) return true;
    return (now - last.getTime()) / (1000 * 60 * 60 * 24) > 2;
  }).length;

  return {
    connectedCount: connected,
    totalCount: users.length,
    connectedPct: Math.round((connected / total) * 100),
    avgBattery: batteryVals.length ? Math.round(avg(batteryVals)) : null,
    lowBatteryCount: lowBattery,
    staleSyncCount: staleSync,
  };
}

// ---------------------------------------------------------------------------
// component
// ---------------------------------------------------------------------------

export default function AdminAnalytics({ darkMode = false, allUsers = [], onViewMember }) {
  const styles = getAnalyticsStyles(darkMode);

  // Filter state driven by FilterToolbar
  const [segment, setSegment] = useState('all'); // 'all' | 'online' | 'stale' | 'never'
  const [timeRangeDays, setTimeRangeDays] = useState(null); // null = no recency filter

  // Device-to-MAC pairing, keyed by email (lowercased) since that's the only
  // field this endpoint shares with the `/api/users/` payload.
  const [macByEmail, setMacByEmail] = useState(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authenticatedFetch('https://jeewanjyoti-backend.smart.org.np/api/admin/devices/');
        if (!res.ok) throw new Error('Failed to fetch devices');
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json.data || json.results || []);
        const map = new Map();
        list.forEach((d) => {
          if (d?.email && d?.mac_address) map.set(d.email.toLowerCase(), d.mac_address);
        });
        if (!cancelled) setMacByEmail(map);
      } catch (e) {
        console.error('Device MAC address load error:', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredUsers = useMemo(
    () => applyFilters(Array.isArray(allUsers) ? allUsers : [], segment, timeRangeDays),
    [allUsers, segment, timeRangeDays]
  );

  const stats = useMemo(() => computeStats(filteredUsers, macByEmail), [filteredUsers, macByEmail]);
  const syncActivity = useMemo(() => computeSyncActivity(filteredUsers), [filteredUsers]);
  const statusBreakdown = useMemo(() => computeDeviceStatusBreakdown(filteredUsers), [filteredUsers]);
  const batteryDistribution = useMemo(() => computeBatteryDistribution(filteredUsers), [filteredUsers]);
  const deviceRows = useMemo(() => computeDeviceRows(filteredUsers, macByEmail), [filteredUsers, macByEmail]);
  const connectivity = useMemo(() => computeConnectivity(filteredUsers), [filteredUsers]);
  const totalDevices = filteredUsers.length;

  const handleSegmentChange = useCallback((seg) => setSegment(seg ?? 'all'), []);

  // Since only latest-snapshot vitals exist (no historical time series yet),
  // "time range" honestly means "only include devices whose last reading
  // falls within N days" — see computeSyncActivity()'s comment above.
  // FilterToolbar hands back the raw option value ('7d' | '30d' | '90d' | 'all').
  const handleTimeRangeChange = useCallback((value) => {
    setTimeRangeDays(TIME_RANGE_DAYS[value] ?? null);
  }, []);

  const handleDeviceRowClick = useCallback((row) => {
    if (onViewMember) onViewMember(row.id);
  }, [onViewMember]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}>

      {/* Header + filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: styles.muted.color, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Device Analytics</h2>
          <p style={{ fontSize: 12, color: styles.textMuted.color, margin: '2px 0 0 0' }}>Monitor connectivity, battery health, and sync status across the device fleet</p>
        </div>
        <FilterToolbar
          darkMode={darkMode}
          onSegmentChange={handleSegmentChange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {stats.map(({ key, ...s }) => (
          <StatCard key={key} {...s} darkMode={darkMode} />
        ))}
      </div>

      {/* Sync activity + status breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <SyncActivityChart data={syncActivity} darkMode={darkMode} />
        <DeviceStatusDonut data={statusBreakdown} darkMode={darkMode} />
      </div>

      {/* Battery distribution + device inventory */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
        <BatteryDistributionChart data={batteryDistribution} totalDevices={totalDevices} darkMode={darkMode} />
        <DeviceTable rows={deviceRows} darkMode={darkMode} onRowClick={handleDeviceRowClick} />
      </div>

      {/* Connectivity summary */}
      <DeviceConnectivityPanel darkMode={darkMode} {...connectivity} />

    </div>
  );
}
