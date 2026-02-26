// ============================================
// LIST VIEW — Light mode
// ============================================

import { useState, useMemo } from 'react';

const ListView = ({
  visitedLocations = [],
  searchQuery = '',
  onLocationSelect
}) => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterInterest, setFilterInterest] = useState('all');

  const getStatusStyle = (level) => {
    switch (level) {
      case 'Interested':
      case 'Closed Deal':
        return { bg: 'var(--color-success-light)', color: 'var(--color-success)', border: '#a7f3d0' };
      case 'Not Interested':
        return { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', border: '#fecaca' };
      case 'Follow Up':
      case 'Pending':
        return { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', border: '#fde68a' };
      default:
        return { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
    }
  };

  const filteredLocations = useMemo(() => {
    let result = [...visitedLocations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(loc =>
        loc.locationName?.toLowerCase().includes(query) ||
        loc.businessAddress?.toLowerCase().includes(query) ||
        loc.contactPerson?.toLowerCase().includes(query)
      );
    }

    if (filterInterest !== 'all') {
      result = result.filter(loc => {
        if (filterInterest === 'interested') return ['Interested', 'Closed Deal'].includes(loc.interestLevel);
        if (filterInterest === 'not-interested') return loc.interestLevel === 'Not Interested';
        if (filterInterest === 'followup') return ['Follow Up', 'Pending'].includes(loc.interestLevel);
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return (a.locationName || '').localeCompare(b.locationName || '');
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    return result;
  }, [visitedLocations, searchQuery, filterInterest, sortBy]);

  const handleExport = () => {
    const headers = ['Name', 'Address', 'Interest', 'Notes', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLocations.map(loc => [
        `"${loc.locationName || ''}"`,
        `"${loc.businessAddress || ''}"`,
        `"${loc.interestLevel || ''}"`,
        `"${(loc.visitNotes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${loc.timestamp || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_export_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const selectStyle = {
    background: 'var(--color-bg-main)',
    color: 'var(--color-text-main)',
    border: '1px solid var(--color-border)',
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-full)',
    fontSize: 'var(--font-size-sm)',
    outline: 'none'
  };

  return (
    <div className="list-view-container" style={{
      padding: 'var(--spacing-md)',
      paddingBottom: '80px',
      height: '100%',
      overflowY: 'auto',
      background: 'var(--color-bg-secondary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)'
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text-main)',
          fontWeight: '600'
        }}>
          Visits ({filteredLocations.length})
        </h2>
        <button onClick={handleExport} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)',
        overflowX: 'auto'
      }}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          <option value="recent">Recent</option>
          <option value="name">Name</option>
        </select>
        <select value={filterInterest} onChange={e => setFilterInterest(e.target.value)} style={selectStyle}>
          <option value="all">All Status</option>
          <option value="interested">Interested</option>
          <option value="followup">Follow Up</option>
          <option value="not-interested">Not Interested</option>
        </select>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {filteredLocations.map((loc, idx) => {
          const statusStyle = getStatusStyle(loc.interestLevel);
          return (
            <div
              key={idx}
              onClick={() => onLocationSelect({ ...loc, name: loc.locationName, address: loc.businessAddress })}
              style={{
                background: 'var(--color-bg-main)',
                border: '1px solid var(--color-border)',
                borderLeft: `3px solid ${statusStyle.color}`,
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--spacing-md)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
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
                  {loc.locationName}
                </h3>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: 'var(--border-radius-full)',
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {loc.interestLevel || 'N/A'}
                </span>
              </div>

              <div style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: loc.visitNotes ? '8px' : 0
              }}>
                {loc.businessAddress}
              </div>

              {loc.visitNotes && (
                <div style={{
                  background: 'var(--color-bg-secondary)',
                  padding: '6px 10px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic'
                }}>
                  {loc.visitNotes.length > 60 ? loc.visitNotes.substring(0, 60) + '...' : loc.visitNotes}
                </div>
              )}
            </div>
          );
        })}

        {filteredLocations.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            color: 'var(--color-text-muted)'
          }}>
            No visits found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
