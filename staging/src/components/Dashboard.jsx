// ============================================
// DASHBOARD COMPONENT (PRO VERSION)
// ============================================

import { useState, useMemo } from 'react';
import StatsCard from './StatsCard';
import '../styles/variables.css';

const Dashboard = ({
  visitedLocations = [],
  onLocationSelect,
  onViewChange,
  currentView,
  searchQuery,
  onSearchChange
}) => {
  const [showFollowUps, setShowFollowUps] = useState(false);

  // Parse date helper
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  // Stats Logic
  const stats = useMemo(() => {
    const total = visitedLocations.length;
    const interested = visitedLocations.filter(l =>
      ['Interested', 'Closed Deal'].includes(l.interestLevel)).length;
    const deals = visitedLocations.filter(l => l.interestLevel === 'Closed Deal').length;
    const followUps = visitedLocations.filter(l =>
      ['Follow Up', 'Pending'].includes(l.interestLevel)).length;

    return { total, interested, deals, followUps };
  }, [visitedLocations]);

  // Styling Objects (Inline for simpler iteration, moved to CSS later if needed)
  const containerStyle = {
    padding: 'var(--spacing-md)',
    height: '100%',
    overflowY: 'auto'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)'
  };

  const searchStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--color-border)',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-full)',
    color: 'var(--color-text-main)',
    marginBottom: 'var(--spacing-md)',
    fontSize: 'var(--font-size-sm)'
  };

  return (
    <div className="dashboard-content" style={containerStyle}>
      <h2 style={{
        color: 'var(--color-text-main)',
        marginBottom: 'var(--spacing-md)',
        fontSize: 'var(--font-size-lg)'
      }}>
        Overview
      </h2>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={searchStyle}
      />

      {/* STATS GRID */}
      <div style={gridStyle}>
        <StatsCard
          title="Total Visits"
          value={stats.total}
          icon="📍"
        />
        <StatsCard
          title="Interested"
          value={stats.interested}
          icon="🔥"
          type="primary"
        />
        <StatsCard
          title="Deals"
          value={stats.deals}
          icon="💰"
          type="success"
        />
        <StatsCard
          title="Follow Ups"
          value={stats.followUps}
          icon="⏰"
          type="warning"
        />
      </div>

      {/* ACTION LIST (Placeholder for future "Recent Activity") */}
      <div style={{
        background: 'var(--color-bg-glass)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-md)',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-sm)',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-sm)'
        }}>
          Quick Actions
        </h3>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}
          onClick={() => onViewChange('map')}
        >
          🗺️ View Map
        </button>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => onViewChange('list')}
        >
          📋 View All List
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
