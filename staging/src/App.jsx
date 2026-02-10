// ============================================
// MAIN APP COMPONENT
// ============================================

import { useState, useEffect } from 'react';
import './styles/App.css';
import { CONFIG } from './config.js';
import { getAdminEmails } from './utils/googleSheets.js';
import { isAdmin, isAdminWithSheet } from './utils/googleAuth.js';
import Login from './components/Login.jsx';
import AdminSetup from './components/AdminSetup.jsx';
import SimpleMap from './components/SimpleMap.jsx';
import LocationPanel from './components/LocationPanel.jsx';
import Dashboard from './components/Dashboard.jsx';
import ListView from './components/ListView.jsx';
import Layout from './components/Layout.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

// Hooks
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useLocations } from './hooks/useLocations';

function App() {
  // Use Custom Hooks
  const { user, authorized, loading, error, handleLogin, handleSignOut } = useGoogleAuth();
  const {
    visitedLocations,
    filteredLocations,
    selectedLocation,
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    refreshLocations,
    handleLocationSelect,
    clearSelection
  } = useLocations();

  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Load locations when authorized
  useEffect(() => {
    if (authorized) {
      refreshLocations();
    }
  }, [authorized, refreshLocations]);

  const handleAdminSetupComplete = () => {
    setShowAdminSetup(false);
    refreshLocations();
  };

  const handleSaveVisit = () => {
    refreshLocations();
  };

  if (loading) {
    return <LoadingScreen message="Initializing app..." />;
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
      <Layout
        user={user}
        authorized={authorized}
        isAdmin={true}
        onSignOut={handleSignOut}
        onManageUsers={() => setShowAdminSetup(true)}
      >
        <div className="admin-setup-container" style={{ padding: '20px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Admin Setup</h2>
            <button onClick={() => setShowAdminSetup(false)} className="btn btn-secondary">
              Back to App
            </button>
          </header>
          <AdminSetup onComplete={handleAdminSetupComplete} user={user} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      user={user}
      authorized={authorized}
      isAdmin={isAdmin(user.email)}
      onSignOut={handleSignOut}
      onManageUsers={() => setShowAdminSetup(true)}
      isDashboardOpen={showDashboard}
      toggleDashboard={() => setShowDashboard(!showDashboard)}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {/* Dashboard Panel */}
      {showDashboard && (
        <div className="dashboard-panel">
          <Dashboard
            visitedLocations={visitedLocations} // Pass raw list for stats
            onLocationSelect={handleLocationSelect}
            onViewChange={(view) => {
              setCurrentView(view);
              setShowDashboard(false);
            }}
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

      {/* Main View Area (Map or List) */}
      <div className="view-container" style={{ height: '100%', width: '100%' }}>
        {currentView === 'map' ? (
          <div className="map-container">
            <SimpleMap
              onLocationSelect={handleLocationSelect}
              visitedLocations={filteredLocations} // Pass filtered list for display
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
          onClose={clearSelection}
          onSave={handleSaveVisit}
        />
      )}
    </Layout>
  );
}

export default App;