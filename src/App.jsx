// ============================================
// MAIN APP COMPONENT
// ============================================

import { useState, useEffect } from 'react';
import './styles/App.css';
import { CONFIG } from './config.js';
import { initSheetsAPI, getAuthorizedUsers, getAllLocations } from './utils/googleSheets.js';
import { isAdmin } from './utils/googleAuth.js';
import Login from './components/Login.jsx';
import AdminSetup from './components/AdminSetup.jsx';
import SimpleMap from './components/SimpleMap.jsx';
import LocationPanel from './components/LocationPanel.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (userInfo) => {
    setLoading(true);
    setUser(userInfo);

    // Initialize Sheets API with OAuth after user signs in
    try {
      await initSheetsAPI();
      console.log('Sheets API initialized successfully');

      // Check if user is admin (admins are automatically authorized)
      if (isAdmin(userInfo.email)) {
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
    setUser(null);
    setAuthorized(false);
    setShowAdminSetup(false);
    setSelectedLocation(null);
    setVisitedLocations([]);
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
            </>
          )}
          <button onClick={handleSignOut} className="btn btn-secondary">
            Sign Out
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="map-container">
          <SimpleMap
            onLocationSelect={handleLocationSelect}
            visitedLocations={visitedLocations}
          />
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