// ============================================
// MAIN APP COMPONENT
// ============================================

import { useState, useEffect } from 'react';
import './styles/App.css';
import { CONFIG } from './config.js';
import { getAdminEmails, ensureDataHeaders, ensureToVisitHeaders } from './utils/googleSheets.js';
import { isAdmin, isAdminWithSheet } from './utils/googleAuth.js';
import Login from './components/Login.jsx';
import AdminSetup from './components/AdminSetup.jsx';
import SimpleMap from './components/SimpleMap.jsx';
import LocationPanel from './components/LocationPanel.jsx';
import Dashboard from './components/Dashboard.jsx';
import ListView from './components/ListView.jsx';
import TodaysTasks from './components/TodaysTasks.jsx';
import Layout from './components/Layout.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

// Hooks
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useLocations } from './hooks/useLocations';
import { useBackButton } from './hooks/useBackButton';
import { useSettings } from './hooks/useSettings';

function App() {
  // Use Custom Hooks
  const { user, authorized, loading, error, handleLogin, handleSignOut } = useGoogleAuth();
  const {
    visitedLocations,
    filteredLocations,
    prospects,
    refreshProspects,
    selectedLocation,
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    refreshLocations,
    handleLocationSelect,
    clearSelection,
    // Pipeline
    overdueTasks,
    todayTasks,
    upcomingTasks
  } = useLocations();

  const [settings, updateSetting] = useSettings();
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Register service worker for PWA + notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Show morning notification — fires at the configured time (or on app open if past that time)
  useEffect(() => {
    if (!authorized || !settings.notificationsEnabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const today = new Date().toISOString().slice(0, 10);
    if (settings.lastNotifDate === today) return;

    const totalTasks = overdueTasks.length + todayTasks.length + upcomingTasks.length;
    if (totalTasks === 0) return;

    const showNotif = () => {
      const parts = [];
      if (overdueTasks.length) parts.push(`${overdueTasks.length} overdue`);
      if (todayTasks.length) parts.push(`${todayTasks.length} today`);
      if (upcomingTasks.length) parts.push(`${upcomingTasks.length} upcoming`);
      new Notification('Sales Tracker', { body: parts.join(' + '), tag: 'morning-summary' });
      updateSetting('lastNotifDate', today);
    };

    // Parse configured time (e.g. "08:00")
    const [hours, minutes] = (settings.notificationTime || '08:00').split(':').map(Number);
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    if (now >= targetTime) {
      // Already past the configured time — show immediately
      showNotif();
    } else {
      // Schedule for later today
      const delay = targetTime - now;
      const timer = setTimeout(showNotif, delay);
      return () => clearTimeout(timer);
    }
  }, [authorized, settings.notificationsEnabled, settings.notificationTime, settings.lastNotifDate, overdueTasks.length, todayTasks.length, upcomingTasks.length, updateSetting]);

  // Handle mobile back button (double-press to exit)
  useBackButton({
    selectedLocation,
    clearSelection,
    showDashboard,
    setShowDashboard,
    showAdminSetup,
    setShowAdminSetup,
    currentView,
    setCurrentView,
  });

  // Load locations when authorized
  useEffect(() => {
    if (authorized) {
      ensureDataHeaders().catch(console.error);
      ensureToVisitHeaders().catch(console.error);
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

  const handleProspectAdded = () => refreshProspects();

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
          <p style={{ color: 'var(--color-danger)', marginBottom: '20px' }}>{error}</p>
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
      overdueCount={overdueTasks.length}
      settings={settings}
      onUpdateSetting={updateSetting}
    >
      {/* Dashboard Panel */}
      {showDashboard && (
        <div className="dashboard-panel">
          <Dashboard
            visitedLocations={visitedLocations}
            overdueTasks={overdueTasks}
            todayTasks={todayTasks}
            upcomingTasks={upcomingTasks}
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

      {/* Main View Area */}
      <div className="view-container" style={{ height: '100%', width: '100%' }}>
        {currentView === 'map' ? (
          <div className="map-container">
            <SimpleMap
              onLocationSelect={handleLocationSelect}
              visitedLocations={filteredLocations}
              prospects={prospects}
              onProspectAdded={handleProspectAdded}
              searchQuery={searchQuery}
            />
          </div>
        ) : currentView === 'list' ? (
          <ListView
            visitedLocations={visitedLocations}
            searchQuery={searchQuery}
            onLocationSelect={handleLocationSelect}
          />
        ) : currentView === 'tasks' ? (
          <TodaysTasks
            overdueTasks={overdueTasks}
            todayTasks={todayTasks}
            upcomingTasks={upcomingTasks}
            onLocationSelect={handleLocationSelect}
            onRefresh={refreshLocations}
            user={user}
            settings={settings}
            onUpdateSetting={updateSetting}
          />
        ) : null}
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
