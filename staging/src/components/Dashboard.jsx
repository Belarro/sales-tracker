// ============================================
// DASHBOARD COMPONENT — Light mode
// ============================================

import { useMemo } from 'react';
import StatsCard from './StatsCard';
import { daysFromToday } from '../utils/dateUtils';

const Dashboard = ({
  visitedLocations = [],
  overdueTasks = [],
  todayTasks = [],
  upcomingTasks = [],
  onLocationSelect,
  onViewChange,
  currentView,
  searchQuery,
  onSearchChange
}) => {
  const stats = useMemo(() => {
    const total = visitedLocations.length;
    const deals = visitedLocations.filter(l => l.interestLevel === 'Closed Deal').length;
    const overdueCount = overdueTasks.length;
    const todayCount = todayTasks.length;

    const weekCount = visitedLocations.filter(l => {
      const days = daysFromToday(l.nextActionDate);
      return days !== null && days >= 0 && days <= 7;
    }).length;

    return { total, deals, overdueCount, todayCount, weekCount };
  }, [visitedLocations, overdueTasks, todayTasks]);

  return (
    <div className="dashboard-content" style={{
      padding: 'var(--spacing-md)',
      height: '100%',
      overflowY: 'auto'
    }}>
      <h2 style={{
        color: 'var(--color-text-main)',
        marginBottom: 'var(--spacing-md)',
        fontSize: 'var(--font-size-lg)',
        fontWeight: '600'
      }}>
        Overview
      </h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search locations..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          width: '100%',
          background: 'var(--color-bg-input)',
          border: '1px solid var(--color-border)',
          padding: '10px 14px',
          borderRadius: 'var(--border-radius-full)',
          color: 'var(--color-text-main)',
          marginBottom: 'var(--spacing-md)',
          fontSize: 'var(--font-size-sm)',
          outline: 'none'
        }}
      />

      {/* Action Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-sm)'
      }}>
        <div onClick={() => onViewChange('tasks')} style={{ cursor: 'pointer' }}>
          <StatsCard title="Overdue" value={stats.overdueCount} type="danger" />
        </div>
        <div onClick={() => onViewChange('tasks')} style={{ cursor: 'pointer' }}>
          <StatsCard title="Due Today" value={stats.todayCount} type="warning" />
        </div>
      </div>

      {/* Info Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-sm)'
      }}>
        <StatsCard title="This Week" value={stats.weekCount} type="primary" />
        <StatsCard title="Total Visits" value={stats.total} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <StatsCard title="Deals Closed" value={stats.deals} type="success" />
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-md)',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{
          fontSize: 'var(--font-size-xs)',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-sm)',
          fontWeight: '600',
          letterSpacing: '0.04em'
        }}>
          Quick Actions
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '6px' }}
          onClick={() => onViewChange('tasks')}
        >
          Today's Tasks {stats.overdueCount > 0 ? `(${stats.overdueCount} overdue)` : ''}
        </button>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '6px' }}
          onClick={() => onViewChange('map')}
        >
          View Map
        </button>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => onViewChange('list')}
        >
          View All
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
