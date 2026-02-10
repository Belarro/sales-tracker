// ============================================
// LIST VIEW COMPONENT (PRO VERSION)
// ============================================

import { useState, useMemo } from 'react';
import '../styles/variables.css';

const ListView = ({
  visitedLocations = [],
  searchQuery = '',
  onLocationSelect,
  onExport
}) => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterInterest, setFilterInterest] = useState('all');

  // Helper for Interest Colors (using CSS variables where possible or matching theme)
  const getStatusStyle = (level) => {
    switch (level) {
      case 'Interested':
      case 'Closed Deal':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Not Interested':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Follow Up':
      case 'Pending':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  // Filter and Sort Logic (Same as before, just kept for functionality)
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
      // Default to recent (string comparison of timestamps works if ISO, but here mostly reliant on insertion order or simple date parsing if needed)
      // For now assuming existing sort logic was sufficient or valid enough for the prototype
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    return result;
  }, [visitedLocations, searchQuery, filterInterest, sortBy]);

  const handleExport = () => {
    // CSV Export logic
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

  // --- STYLES ---
  const containerStyle = {
    padding: 'var(--spacing-md)',
    paddingBottom: '80px', // Space for bottom nav
    height: '100%',
    overflowY: 'auto'
  };

  const controlBarStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: 'var(--spacing-md)',
    overflowX: 'auto',
    paddingBottom: '4px'
  };

  const selectStyle = {
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-main)',
    border: '1px solid var(--color-border)',
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-full)',
    fontSize: 'var(--font-size-sm)',
    outline: 'none'
  };

  return (
    <div className="list-view-container" style={containerStyle}>
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-main)' }}>
          Visits ({filteredLocations.length})
        </h2>
        <button onClick={handleExport} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
          ⬇ CSV
        </button>
      </div>

      <div style={controlBarStyle}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          <option value="recent">🕒 Recent</option>
          <option value="name">🔤 Name</option>
        </select>
        <select value={filterInterest} onChange={e => setFilterInterest(e.target.value)} style={selectStyle}>
          <option value="all">All Status</option>
          <option value="interested">🔥 Interested</option>
          <option value="followup">⏰ Follow Up</option>
          <option value="not-interested">❌ Not Interested</option>
        </select>
      </div>

      {/* LIST ITEMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {filteredLocations.map((loc, idx) => {
          const statusStyle = getStatusStyle(loc.interestLevel);
          return (
            <div
              key={idx}
              onClick={() => onLocationSelect({
                name: loc.locationName,
                address: loc.businessAddress,
                phone: loc.businessPhone || '',
                // Map fields to standard format for LocationPanel
                ...loc
              })}
              style={{
                background: 'var(--color-bg-glass)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border)',
                borderLeft: `4px solid ${statusStyle.color}`,
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--spacing-md)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', color: 'var(--color-text-main)' }}>
                  {loc.locationName}
                </h3>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                  textTransform: 'uppercase',
                  fontWeight: '700'
                }}>
                  {loc.interestLevel || 'N/A'}
                </span>
              </div>

              <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '8px' }}>
                {loc.businessAddress}
              </div>

              {loc.visitNotes && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic'
                }}>
                  "{loc.visitNotes.length > 60 ? loc.visitNotes.substring(0, 60) + '...' : loc.visitNotes}"
                </div>
              )}
            </div>
          );
        })}

        {filteredLocations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            No visits found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
