// ============================================
// TODAY'S TASKS VIEW — Light mode
// ============================================

const TaskCard = ({ location, accentColor, onSelect }) => {
  const days = location._daysUntilAction;
  let urgencyLabel = '';

  if (days < 0) {
    urgencyLabel = `${Math.abs(days)}d overdue`;
  } else if (days === 0) {
    urgencyLabel = 'Due today';
  } else {
    urgencyLabel = `In ${days}d`;
  }

  const actionLabel = location.nextActionType
    ? location.nextActionType.replace(/_/g, ' ')
    : 'follow up';

  const stageLabel = location.pipelineStage
    ? location.pipelineStage.replace(/_/g, ' ')
    : '';

  return (
    <div className="task-card" onClick={() => onSelect(location)}>
      <div className="task-card-accent" style={{ backgroundColor: accentColor }} />
      <div className="task-card-body">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '4px',
          gap: 'var(--spacing-sm)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: '600',
            color: 'var(--color-text-main)',
            margin: 0
          }}>
            {location.locationName}
          </h3>
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: 'var(--border-radius-full)',
            background: `${accentColor}15`,
            color: accentColor,
            fontWeight: '700',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {urgencyLabel}
          </span>
        </div>

        <div style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          marginBottom: '6px'
        }}>
          {location.businessAddress}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: 'var(--border-radius-full)',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}>
            {actionLabel}
          </span>

          {stageLabel && (
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-full)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-muted)',
              textTransform: 'capitalize'
            }}>
              {stageLabel}
            </span>
          )}
        </div>

        {location.timestamp && (
          <div style={{
            color: 'var(--color-text-muted)',
            fontSize: '11px',
            marginTop: '6px'
          }}>
            Last visit: {location.timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskSection = ({ title, items, accentColor, onSelect }) => {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      <div className="task-section-header" style={{ color: accentColor }}>
        {title}
        <span style={{
          fontSize: '11px',
          padding: '1px 8px',
          borderRadius: 'var(--border-radius-full)',
          background: `${accentColor}15`,
          color: accentColor,
          fontWeight: '700'
        }}>
          {items.length}
        </span>
      </div>
      {items.map((loc, idx) => (
        <TaskCard
          key={`${loc.locationName}-${loc.businessAddress}-${idx}`}
          location={loc}
          accentColor={accentColor}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

const TodaysTasks = ({
  overdueTasks = [],
  todayTasks = [],
  upcomingTasks = [],
  onLocationSelect,
  onRefresh
}) => {
  const totalTasks = overdueTasks.length + todayTasks.length + upcomingTasks.length;

  return (
    <div className="tasks-view-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)'
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text-main)',
          margin: 0,
          fontWeight: '600'
        }}>
          Tasks
        </h2>
        {totalTasks > 0 && (
          <span style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)'
          }}>
            {totalTasks} pending
          </span>
        )}
      </div>

      <TaskSection
        title="OVERDUE"
        items={overdueTasks}
        accentColor="var(--color-danger)"
        onSelect={onLocationSelect}
      />

      <TaskSection
        title="TODAY"
        items={todayTasks}
        accentColor="var(--color-warning)"
        onSelect={onLocationSelect}
      />

      <TaskSection
        title="UPCOMING"
        items={upcomingTasks}
        accentColor="var(--color-primary)"
        onSelect={onLocationSelect}
      />

      {totalTasks === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-2xl) var(--spacing-lg)',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            marginBottom: 'var(--spacing-sm)',
            fontWeight: '600',
            color: 'var(--color-text-secondary)'
          }}>
            All caught up
          </div>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            margin: 0,
            lineHeight: '1.5'
          }}>
            No follow-ups due. Visit a location and schedule a follow-up to see tasks here.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodaysTasks;
