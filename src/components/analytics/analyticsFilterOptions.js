// Filter option lists for the admin Device Analytics toolbar.
// Last option in each list is the toolbar's default selection.

export const TIME_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
];

export const SEGMENT_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'stale', label: 'Stale Sync' },
  { value: 'never', label: 'Never Synced' },
  { value: 'all', label: 'All Devices' },
];
