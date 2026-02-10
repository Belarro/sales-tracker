// ============================================
// DASHBOARD COMPONENT
// ============================================
// Shows today's follow-ups, quick stats, and search

import { useState, useMemo } from 'react';

const Dashboard = ({
  visitedLocations = [],
  onLocationSelect,
  onViewChange,
  currentView,
  searchQuery,
  onSearchChange
}) => {
  const [showFollowUps, setShowFollowUps] = useState(false);

  // Parse date from DD-MM-YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    // DD-MM-YYYY format
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  // Get today's date (start of day)
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalLocations = visitedLocations.length;

    // Count by interest level
    const interested = visitedLocations.filter(l =>
      l.interestLevel === 'Interested' || l.interestLevel === 'Closed Deal'
    ).length;

    const notInterested = visitedLocations.filter(l =>
      l.interestLevel === 'Not Interested'
    ).length;

    const followUp = visitedLocations.filter(l =>
      l.interestLevel === 'Follow Up' || l.interestLevel === 'Pending'
    ).length;

    const closedDeals = visitedLocations.filter(l =>
      l.interestLevel === 'Closed Deal'
    ).length;

    const samplesGiven = visitedLocations.filter(l =>
      l.sampleGiven === 'YES'
    ).length;

    return {
      totalLocations,
      interested,
      notInterested,
      followUp,
      closedDeals,
      samplesGiven
    };
  }, [visitedLocations]);

  // Get follow-ups due today or overdue
  const followUps = useMemo(() => {
    return visitedLocations
      .filter(loc => {
        if (!loc.followUpDate) return false;
        const followUpDate = parseDate(loc.followUpDate);
        if (!followUpDate) return false;
        // Include if follow-up is today or overdue
        return followUpDate <= today;
      })
      .map(loc => {
        const followUpDate = parseDate(loc.followUpDate);
        const isOverdue = followUpDate < today;
        const daysOverdue = isOverdue
          ? Math.floor((today - followUpDate) / (1000 * 60 * 60 * 24))
          : 0;
        return { ...loc, isOverdue, daysOverdue };
      })
      .sort((a, b) => {
        // Sort by: overdue first (most overdue at top), then by date
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return b.daysOverdue - a.daysOverdue;
      });
  }, [visitedLocations, today]);

  // Get upcoming follow-ups (next 7 days)
  const upcomingFollowUps = useMemo(() => {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return visitedLocations
      .filter(loc => {
        if (!loc.followUpDate) return false;
        const followUpDate = parseDate(loc.followUpDate);
        if (!followUpDate) return false;
        return followUpDate > today && followUpDate <= nextWeek;
      })
      .sort((a, b) => {
        const dateA = parseDate(a.followUpDate);
        const dateB = parseDate(b.followUpDate);
        return dateA - dateB;
      });
  }, [visitedLocations, today]);

  const handleLocationClick = (location) => {
    // Create a location object compatible with the map click handler
    onLocationSelect({
      name: location.locationName,
      address: location.businessAddress,
      phone: location.businessPhone || '',
      website: location.businessWebsite || '',
      placeId: location.directLink?.includes('ChIJ') ? location.directLink : null
    });
  };

  const getInterestColor = (level) => {
    switch (level) {
      case 'Interested':
      case 'Closed Deal':
        return '#4caf50';
      case 'Not Interested':
        return '#f44336';
      case 'Follow Up':
      case 'Pending':
        return '#ffc107';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div className="dashboard">
      {/* Search Bar */}
      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
          >
            x
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`view-btn ${currentView === 'map' ? 'active' : ''}`}
          onClick={() => onViewChange('map')}
        >
          Map View
        </button>
        <button
          className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => onViewChange('list')}
        >
          List View
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <span className="stat-number">{stats.totalLocations}</span>
          <span className="stat-label">Total Visits</span>
        </div>
        <div className="stat-card stat-interested">
          <span className="stat-number">{stats.interested}</span>
          <span className="stat-label">Interested</span>
        </div>
        <div className="stat-card stat-deals">
          <span className="stat-number">{stats.closedDeals}</span>
          <span className="stat-label">Closed Deals</span>
        </div>
        <div className="stat-card stat-samples">
          <span className="stat-number">{stats.samplesGiven}</span>
          <span className="stat-label">Samples Given</span>
        </div>
      </div>

      {/* Follow-ups Section */}
      {followUps.length > 0 && (
        <div className="followup-section">
          <button
            className="followup-header"
            onClick={() => setShowFollowUps(!showFollowUps)}
          >
            <span className="followup-title">
              <span className="followup-badge">{followUps.length}</span>
              Follow-ups Due Today
              {followUps.some(f => f.isOverdue) && (
                <span className="overdue-warning"> (includes overdue)</span>
              )}
            </span>
            <span className={`followup-arrow ${showFollowUps ? 'open' : ''}`}>
              ▼
            </span>
          </button>

          {showFollowUps && (
            <div className="followup-list">
              {followUps.map((loc, index) => (
                <div
                  key={index}
                  className={`followup-item ${loc.isOverdue ? 'overdue' : ''}`}
                  onClick={() => handleLocationClick(loc)}
                >
                  <div className="followup-item-header">
                    <span
                      className="followup-dot"
                      style={{ backgroundColor: getInterestColor(loc.interestLevel) }}
                    />
                    <span className="followup-name">{loc.locationName}</span>
                    {loc.isOverdue && (
                      <span className="overdue-badge">
                        {loc.daysOverdue}d overdue
                      </span>
                    )}
                  </div>
                  <div className="followup-details">
                    <span className="followup-address">{loc.businessAddress}</span>
                    {loc.contactPerson && (
                      <span className="followup-contact">Contact: {loc.contactPerson}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Follow-ups */}
      {upcomingFollowUps.length > 0 && !showFollowUps && (
        <div className="upcoming-hint">
          {upcomingFollowUps.length} follow-ups coming this week
        </div>
      )}
    </div>
  );
};

export default Dashboard;
