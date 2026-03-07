// ============================================
// COLOR UTILITIES — Centralized pin color logic
// ============================================

export const PIN_COLORS = {
  GRAY:   '#9e9e9e',
  BLUE:   '#2196F3',
  ORANGE: '#FF6D00',
  GREEN:  '#4caf50',
  RED:    '#f44336',
  YELLOW: '#FFD600',
};

// Options for the manual color picker in LocationPanel
export const MANUAL_COLOR_OPTIONS = [
  { label: 'Auto',   value: '' },
  { label: 'Blue',   value: PIN_COLORS.BLUE },
  { label: 'Orange', value: PIN_COLORS.ORANGE },
  { label: 'Green',  value: PIN_COLORS.GREEN },
  { label: 'Red',    value: PIN_COLORS.RED },
  { label: 'Yellow', value: PIN_COLORS.YELLOW },
  { label: 'Gray',   value: PIN_COLORS.GRAY },
];

/**
 * Determine automatic color based on interestLevel + sampleGiven
 */
export const getAutoColor = (interestLevel, sampleGiven) => {
  switch (interestLevel) {
    case 'Interested':
      return sampleGiven === 'YES' ? PIN_COLORS.ORANGE : PIN_COLORS.BLUE;
    case 'Not Interested':
      return PIN_COLORS.RED;
    case 'Follow Up':
      return PIN_COLORS.YELLOW;
    case 'Closed Deal':
      return PIN_COLORS.GREEN;
    case 'Pending':
    default:
      return PIN_COLORS.GRAY;
  }
};

/**
 * Get resolved pin color for a location.
 * Manual override (pinColor) takes precedence over auto logic.
 */
export const getPinColor = (location) => {
  if (location.pinColor && location.pinColor.trim() !== '') {
    return location.pinColor;
  }
  return getAutoColor(location.interestLevel, location.sampleGiven);
};

/**
 * Get human-readable label for a pin color
 */
export const getColorLabel = (color) => {
  switch (color) {
    case PIN_COLORS.BLUE:   return 'Bring samples';
    case PIN_COLORS.ORANGE: return 'Hot lead';
    case PIN_COLORS.GREEN:  return 'Closed deal';
    case PIN_COLORS.RED:    return 'Not interested';
    case PIN_COLORS.YELLOW: return 'Follow up';
    case PIN_COLORS.GRAY:
    default:                return 'Pending';
  }
};

/**
 * Legend items for map legend overlay
 */
export const LEGEND_ITEMS = [
  { color: PIN_COLORS.GRAY,   label: 'Pending' },
  { color: PIN_COLORS.BLUE,   label: 'Bring samples' },
  { color: PIN_COLORS.ORANGE, label: 'Hot lead' },
  { color: PIN_COLORS.YELLOW, label: 'Follow up' },
  { color: PIN_COLORS.RED,    label: 'Not interested' },
  { color: PIN_COLORS.GREEN,  label: 'Closed deal' },
];

/**
 * Get style object for status badges (ListView, etc.)
 */
export const getStatusStyle = (location) => {
  const color = getPinColor(location);

  switch (color) {
    case PIN_COLORS.BLUE:
      return { bg: 'var(--color-info-light)', color: 'var(--color-info)', border: '#90caf9' };
    case PIN_COLORS.ORANGE:
      return { bg: 'var(--color-hot-light)', color: 'var(--color-hot)', border: '#ffcc80' };
    case PIN_COLORS.GREEN:
      return { bg: 'var(--color-success-light)', color: 'var(--color-success)', border: '#a7f3d0' };
    case PIN_COLORS.RED:
      return { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', border: '#fecaca' };
    case PIN_COLORS.YELLOW:
      return { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', border: '#fde68a' };
    case PIN_COLORS.GRAY:
    default:
      return { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
  }
};
