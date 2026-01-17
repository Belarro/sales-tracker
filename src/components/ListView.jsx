// ============================================
// LIST VIEW COMPONENT
// ============================================
// Shows all locations in a scrollable list format

import { useState, useMemo } from 'react';

const ListView = ({
  visitedLocations = [],
  searchQuery = '',
  onLocationSelect,
  onExport
}) => {
  const [sortBy, setSortBy] = useState('recent'); // recent, name, interest, followup
  const [filterInterest, setFilterInterest] = useState('all');

  // Get interest level color
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

  // Get interest level background
  const getInterestBackground = (level) => {
    switch (level) {
      case 'Interested':
        return '#e8f5e9';
      case 'Closed Deal':
        return '#c8e6c9';
      case 'Not Interested':
        return '#ffebee';
      case 'Follow Up':
        return '#fff8e1';
      case 'Pending':
        return '#e1f5fe';
      default:
        return '#f5f5f5';
    }
  };

  // Parse date from DD-MM-YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  // Filter and sort locations
  const filteredLocations = useMemo(() => {
    let result = [...visitedLocations];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(loc =>
        loc.locationName?.toLowerCase().includes(query) ||
        loc.businessAddress?.toLowerCase().includes(query) ||
        loc.contactPerson?.toLowerCase().includes(query) ||
        loc.businessTypes?.toLowerCase().includes(query)
      );
    }

    // Apply interest filter
    if (filterInterest !== 'all') {
      result = result.filter(loc => {
        if (filterInterest === 'interested') {
          return loc.interestLevel === 'Interested' || loc.interestLevel === 'Closed Deal';
        }
        if (filterInterest === 'not-interested') {
          return loc.interestLevel === 'Not Interested';
        }
        if (filterInterest === 'followup') {
          return loc.interestLevel === 'Follow Up' || loc.interestLevel === 'Pending';
        }
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Parse timestamp DD-MM-YYYY HH:MM
          const parseTimestamp = (ts) => {
            if (!ts) return new Date(0);
            const [datePart, timePart] = ts.split(' ');
            const [day, month, year] = datePart.split('-');
            const [hour, minute] = (timePart || '00:00').split(':');
            return new Date(year, month - 1, day, hour || 0, minute || 0);
          };
          return parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp);

        case 'name':
          return (a.locationName || '').localeCompare(b.locationName || '');

        case 'interest':
          const interestOrder = {
            'Closed Deal': 0,
            'Interested': 1,
            'Follow Up': 2,
            'Pending': 3,
            'Not Interested': 4,
            '': 5
          };
          return (interestOrder[a.interestLevel] || 5) - (interestOrder[b.interestLevel] || 5);

        case 'followup':
          const dateA = parseDate(a.followUpDate);
          const dateB = parseDate(b.followUpDate);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateA - dateB;

        default:
          return 0;
      }
    });

    return result;
  }, [visitedLocations, searchQuery, filterInterest, sortBy]);

  const handleLocationClick = (location) => {
    onLocationSelect({
      name: location.locationName,
      address: location.businessAddress,
      phone: location.businessPhone || '',
      website: location.businessWebsite || '',
      placeId: location.directLink?.includes('ChIJ') ? location.directLink : null
    });
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Location Name',
      'Address',
      'Phone',
      'Contact Person',
      'Contact Title',
      'Business Type',
      'Interest Level',
      'Follow-up Date',
      'Sample Given',
      'Last Visit',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredLocations.map(loc => [
        `"${(loc.locationName || '').replace(/"/g, '""')}"`,
        `"${(loc.businessAddress || '').replace(/"/g, '""')}"`,
        `"${(loc.businessPhone || '').replace(/"/g, '""')}"`,
        `"${(loc.contactPerson || '').replace(/"/g, '""')}"`,
        `"${(loc.contactTitle || '').replace(/"/g, '""')}"`,
        `"${(loc.businessTypes || '').replace(/"/g, '""')}"`,
        `"${(loc.interestLevel || '').replace(/"/g, '""')}"`,
        `"${(loc.followUpDate || '').replace(/"/g, '""')}"`,
        `"${(loc.sampleGiven || '').replace(/"/g, '""')}"`,
        `"${(loc.timestamp || '').replace(/"/g, '""')}"`,
        `"${(loc.visitNotes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-tracker-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="list-view">
      {/* Controls */}
      <div className="list-controls">
        <div className="list-filters">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="list-select"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="interest">By Interest</option>
            <option value="followup">Follow-up Date</option>
          </select>

          <select
            value={filterInterest}
            onChange={(e) => setFilterInterest(e.target.value)}
            className="list-select"
          >
            <option value="all">All Status</option>
            <option value="interested">Interested</option>
            <option value="followup">Follow Up</option>
            <option value="not-interested">Not Interested</option>
          </select>
        </div>

        <button className="export-btn" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      {/* Results count */}
      <div className="list-count">
        Showing {filteredLocations.length} of {visitedLocations.length} locations
      </div>

      {/* Location List */}
      <div className="location-list">
        {filteredLocations.length === 0 ? (
          <div className="list-empty">
            {searchQuery
              ? `No locations found for "${searchQuery}"`
              : 'No locations recorded yet'}
          </div>
        ) : (
          filteredLocations.map((loc, index) => (
            <div
              key={index}
              className="list-item"
              onClick={() => handleLocationClick(loc)}
              style={{ borderLeftColor: getInterestColor(loc.interestLevel) }}
            >
              <div className="list-item-header">
                <h3 className="list-item-name">{loc.locationName}</h3>
                <span
                  className="list-item-status"
                  style={{
                    backgroundColor: getInterestBackground(loc.interestLevel),
                    color: getInterestColor(loc.interestLevel)
                  }}
                >
                  {loc.interestLevel || 'Unknown'}
                </span>
              </div>

              <p className="list-item-address">{loc.businessAddress}</p>

              <div className="list-item-info">
                {loc.contactPerson && (
                  <span className="list-item-contact">
                    {loc.contactPerson}
                    {loc.contactTitle && ` (${loc.contactTitle})`}
                  </span>
                )}
                {loc.businessTypes && (
                  <span className="list-item-type">{loc.businessTypes}</span>
                )}
              </div>

              <div className="list-item-footer">
                {loc.followUpDate && (
                  <span className="list-item-followup">
                    Follow-up: {loc.followUpDate}
                  </span>
                )}
                {loc.sampleGiven === 'YES' && (
                  <span className="list-item-sample">Sample Given</span>
                )}
                <span className="list-item-date">
                  Last visit: {loc.timestamp?.split(' ')[0] || 'Unknown'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListView;
