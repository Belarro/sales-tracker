// ============================================
// LAYOUT COMPONENT
// ============================================

import React from 'react';
import { CONFIG } from '../config.js';

// Simple inline SVG icons for nav
const NavIcons = {
  stats: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  ),
  map: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  tasks: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
};

const Layout = ({
  children,
  user,
  authorized,
  isAdmin,
  onSignOut,
  onManageUsers,
  isDashboardOpen,
  toggleDashboard,
  currentView,
  onViewChange,
  overdueCount = 0
}) => {
  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <h1>Sales Tracker</h1>

        {user && (
          <div className="user-info">
            {isAdmin && (
              <>
                <span className="admin-badge desktop-only">Admin</span>
                <button onClick={onManageUsers} className="btn btn-secondary">
                  Users
                </button>
                <button
                  onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/edit`, '_blank')}
                  className="btn btn-secondary"
                >
                  Sheet
                </button>
              </>
            )}
            <button onClick={onSignOut} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {children}
      </div>

      {/* BOTTOM NAVIGATION — only show when nav functions are available */}
      {toggleDashboard && onViewChange && (
        <nav className="bottom-nav">
          <button
            className={`nav-item ${isDashboardOpen ? 'active' : ''}`}
            onClick={() => { if (!isDashboardOpen) toggleDashboard(); }}
          >
            <span className="nav-icon">{NavIcons.stats}</span>
            <span className="nav-label">Stats</span>
          </button>

          <button
            className={`nav-item ${!isDashboardOpen && currentView === 'map' ? 'active' : ''}`}
            onClick={() => {
              if (isDashboardOpen) toggleDashboard();
              onViewChange('map');
            }}
          >
            <span className="nav-icon">{NavIcons.map}</span>
            <span className="nav-label">Map</span>
          </button>

          <button
            className={`nav-item ${!isDashboardOpen && currentView === 'list' ? 'active' : ''}`}
            onClick={() => {
              if (isDashboardOpen) toggleDashboard();
              onViewChange('list');
            }}
          >
            <span className="nav-icon">{NavIcons.list}</span>
            <span className="nav-label">List</span>
          </button>

          <button
            className={`nav-item ${!isDashboardOpen && currentView === 'tasks' ? 'active' : ''}`}
            onClick={() => {
              if (isDashboardOpen) toggleDashboard();
              onViewChange('tasks');
            }}
          >
            <span className="nav-icon">{NavIcons.tasks}</span>
            <span className="nav-label">Tasks</span>
            {overdueCount > 0 && (
              <span className="nav-badge">{overdueCount}</span>
            )}
          </button>
        </nav>
      )}
    </div>
  );
};

export default Layout;
