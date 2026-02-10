// ============================================
// MAIN APP COMPONENT
// ============================================

import { useState, useEffect, useMemo } from 'react';
import './styles/App.css';
import { CONFIG } from './config.js';
import { initSheetsAPI, getAuthorizedUsers, getAllLocations, getAdminEmails } from './utils/googleSheets.js';
import { isAdmin, isAdminWithSheet } from './utils/googleAuth.js';
import Login from './components/Login.jsx';
import AdminSetup from './components/AdminSetup.jsx';
import SimpleMap from './components/SimpleMap.jsx';
import LocationPanel from './components/LocationPanel.jsx';
import Dashboard from './components/Dashboard.jsx';
import ListView from './components/ListView.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('map'); // 'map' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery) return visitedLocations;
    const query = searchQuery.toLowerCase();
    return visitedLocations.filter(loc =>
      loc.locationName?.toLowerCase().includes(query) ||
      loc.businessAddress?.toLowerCase().includes(query) ||
      loc.contactPerson?.toLowerCase().includes(query)
    );
  }, [visitedLocations, searchQuery]);

  const handleLogin = async (userInfo) => {
    setLoading(true);
    setUser(userInfo);

    // Initialize Sheets API with OAuth after user signs in
    try {
      await initSheetsAPI();
      console.log('Sheets API initialized successfully');

      // Get admin emails from Google Sheets
      const sheetAdmins = await getAdminEmails();
      console.log('🔐 All admin emails (env + sheet):', sheetAdmins);

      // Check if user is admin (check both .env and Google Sheets)
      if (isAdminWithSheet(userInfo.email, sheetAdmins)) {
        console.log('✅ User is admin:', userInfo.email);
        setAuthorized(true);
        await loadVisitedLocations();
        setLoading(false);
        return;
      }

      // Check if user is in authorized list
      const authorizedUsers = await getAuthorizedUsers();
      console.log('🔍 Checking authorization for:', userInfo.email);
      console.log('📋 Authorized users list:', authorizedUsers);
      console.log('✅ Is authorized?', authorizedUsers.includes(userInfo.email));

      if (authorizedUsers.includes(userInfo.email)) {
        setAuthorized(true);
        await loadVisitedLocations();
      } else {
        setError('You are not authorized to access this app. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Failed to initialize. Please try again.');
    }

    setLoading(false);
  };

  const loadVisitedLocations = async () => {
    try {
      const locations = await getAllLocations();
      console.log('Loaded locations from Google Sheet:', locations);
      // Filter out archived locations
      const activeLocations = locations.filter(loc => loc.archived !== 'YES');
      console.log('Active locations (after filtering archived):', activeLocations);
      setVisitedLocations(activeLocations);
    } catch (err) {
      console.error('Error loading visited locations:', err);
    }
  };

  const handleAdminSetupComplete = () => {
    setShowAdminSetup(false);
    loadVisitedLocations();
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleClosePanel = () => {
    setSelectedLocation(null);
  };

  const handleSaveVisit = () => {
    loadVisitedLocations();
  };

  const handleSignOut = () => {
    console.log('🚪 Signing out user...');

    // Revoke the Google token to properly sign out
    if (window.googleAccessToken) {
      // Revoke the token
      fetch(`https://oauth2.googleapis.com/revoke?token=${window.googleAccessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        console.log('✅ Token revoked successfully');
      }).catch((error) => {
        console.error('❌ Error revoking token:', error);
      });

      // Clear the token and expiration
      delete window.googleAccessToken;
      delete window.tokenExpiresAt;
    }

    // Clear Google Identity Services session
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
      console.log('✅ Google Identity Services session cleared');
    }

    // Clear local storage (but keep user names for convenience)
    // We only clear session-related data, not user preferences
    sessionStorage.clear();

    setUser(null);
    setAuthorized(false);
    setShowAdminSetup(false);
    setSelectedLocation(null);
    setVisitedLocations([]);

    console.log('✅ User signed out, reloading app...');

    // Reload to fully reset the app state
    window.location.reload();
  };

  if (loading) {
    return <div className="loading">Initializing app...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (!authorized) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Access Denied</h1>
          <p style={{ color: '#ea4335', marginBottom: '20px' }}>{error}</p>
          <button onClick={handleSignOut} className="btn btn-secondary">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (showAdminSetup) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Sales Tracker - Admin Setup</h1>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="admin-badge">ADMIN</span>
            <button onClick={() => setShowAdminSetup(false)} className="btn btn-secondary">
              Back to App
            </button>
            <button onClick={handleSignOut} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        </header>
        <AdminSetup onComplete={handleAdminSetupComplete} user={user} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sales Tracker</h1>
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          {isAdmin(user.email) && (
            <>
              <span className="admin-badge">ADMIN</span>
              <button onClick={() => setShowAdminSetup(true)} className="btn btn-secondary">
                Manage Users
              </button>
              <button
                onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/edit`, '_blank')}
                className="btn btn-secondary"
                title="Open Google Sheet"
              >
                Open Sheet
              </button>
            </>
          )}
          <button onClick={handleSignOut} className="btn btn-secondary">
            Sign Out
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Dashboard Panel */}
        {showDashboard && (
          <div className="dashboard-panel">
            <Dashboard
              visitedLocations={visitedLocations}
              onLocationSelect={handleLocationSelect}
              onViewChange={setCurrentView}
              currentView={currentView}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <button
              className="dashboard-toggle collapse"
              onClick={() => setShowDashboard(false)}
              title="Hide dashboard"
            >
              Hide
            </button>
          </div>
        )}

        {!showDashboard && (
          <button
            className="dashboard-toggle expand"
            onClick={() => setShowDashboard(true)}
            title="Show dashboard"
          >
            Dashboard
          </button>
        )}

        {/* Main View Area */}
        <div className="view-container">
          {currentView === 'map' ? (
            <div className="map-container">
              <SimpleMap
                onLocationSelect={handleLocationSelect}
                visitedLocations={filteredLocations}
                searchQuery={searchQuery}
              />
            </div>
          ) : (
            <ListView
              visitedLocations={visitedLocations}
              searchQuery={searchQuery}
              onLocationSelect={handleLocationSelect}
            />
          )}
        </div>

        {selectedLocation && (
          <LocationPanel
            location={selectedLocation}
            user={user}
            onClose={handleClosePanel}
            onSave={handleSaveVisit}
          />
        )}
      </div>
    </div>
  );
}

export default App;