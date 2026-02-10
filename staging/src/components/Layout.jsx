// ============================================
// LAYOUT COMPONENT (PRO VERSION)
// ============================================

import React from 'react';
import '../styles/variables.css';
import { CONFIG } from '../config.js';

const Layout = ({
    children,
    user,
    authorized,
    isAdmin,
    onSignOut,
    onManageUsers,
    isDashboardOpen,
    toggleDashboard,
    currentView,     // 'map' or 'list'
    onViewChange     // function to change view
}) => {
    return (
        <div className="app-container" style={{ backgroundColor: 'var(--color-bg-main)' }}>
            {/* HEADER */}
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <h1>Sales Tracker</h1>
                </div>

                {user && (
                    <div className="user-info">
                        {isAdmin && (
                            <>
                                <span className="admin-badge desktop-only">ADMIN</span>
                                <button onClick={onManageUsers} className="btn btn-secondary" title="Manage Users">
                                    Users 👥
                                </button>
                                <button
                                    onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/edit`, '_blank')}
                                    className="btn btn-secondary"
                                    title="Open Google Sheet"
                                >
                                    Sheet 📄
                                </button>
                            </>
                        )}
                        <button onClick={onSignOut} className="btn btn-secondary" title="Sign Out">
                            🚪
                        </button>
                    </div>
                )}
            </header>

            {/* MAIN CONTENT */}
            <div className="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
                {children}
            </div>

            {/* BOTTOM NAVIGATION (Mobile Only) */}
            <nav className="bottom-nav">
                <button
                    className={`nav-item ${isDashboardOpen ? 'active' : ''}`}
                    onClick={() => {
                        if (!isDashboardOpen) toggleDashboard();
                    }}
                >
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Stats</span>
                </button>

                <button
                    className={`nav-item ${!isDashboardOpen && currentView === 'map' ? 'active' : ''}`}
                    onClick={() => {
                        if (isDashboardOpen) toggleDashboard();
                        onViewChange('map');
                    }}
                >
                    <span className="nav-icon">🗺️</span>
                    <span className="nav-label">Map</span>
                </button>

                <button
                    className={`nav-item ${!isDashboardOpen && currentView === 'list' ? 'active' : ''}`}
                    onClick={() => {
                        if (isDashboardOpen) toggleDashboard();
                        onViewChange('list');
                    }}
                >
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">List</span>
                </button>
            </nav>

            {/* OVERLAY */}
            {isDashboardOpen && (
                <div
                    className="dashboard-overlay"
                    onClick={toggleDashboard}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 400,
                        display: 'none'
                    }}
                />
            )}
        </div>
    );
};

export default Layout;
