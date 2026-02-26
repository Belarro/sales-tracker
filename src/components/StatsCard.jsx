// ============================================
// STATS CARD — Light mode
// ============================================

const StatsCard = ({ title, value, icon, type = 'default' }) => {
  const styles = {
    default: { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' },
    primary: { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
    success: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
    warning: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
    danger:  { bg: 'var(--color-danger-light)', color: 'var(--color-danger)' }
  };

  const s = styles[type] || styles.default;

  return (
    <div style={{
      background: s.bg,
      borderRadius: 'var(--border-radius-lg)',
      padding: 'var(--spacing-md)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '88px'
    }}>
      <div style={{
        fontSize: 'var(--font-size-2xl)',
        fontWeight: '700',
        color: 'var(--color-text-main)',
        lineHeight: '1.2'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 'var(--font-size-xs)',
        color: s.color,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: '600',
        marginTop: '4px'
      }}>
        {title}
      </div>
    </div>
  );
};

export default StatsCard;
