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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initSheetsAPI().then(() => {
        // After successful OAuth sign-in, get user info
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (authInstance.isSignedIn.get()) {
          const profile = authInstance.currentUser.get().getBasicProfile();
          const userEmail = profile.getEmail();
          const userName = profile.getName();

          setUser({ email: userEmail, name: userName });

          // Check authorization
          if (isAdmin(userEmail)) {
            setAuthorized(true);
            setShowAdminSetup(true);
          } else {
            // Check if user is in authorized list
            getAuthorizedUsers().then(authorizedUsers => {
              if (authorizedUsers.includes(userEmail)) {
                setAuthorized(true);
                loadVisitedLocations();
              } else {
                setError('You are not authorized to access this app. Please contact the administrator.');
              }
            }).catch(err => {
              console.error('Error checking authorization:', err);
              setError('Failed to verify authorization. Please try again.');
            });
          }
        }
        setLoading(false);
      }).catch(err => {
        console.error('Failed to initialize Sheets API:', err);
        setLoading(false);
      });
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleLogin = async (userInfo) => {
    setUser(userInfo);

    // Check if user is admin
    if (isAdmin(userInfo.email)) {
      setAuthorized(true);
      setShowAdminSetup(true);
      return;
    }

    // Check if user is in authorized list
    try {
      const authorizedUsers = await getAuthorizedUsers();
      if (authorizedUsers.includes(userInfo.email)) {
        setAuthorized(true);
        loadVisitedLocations();
      } else {
        setError('You are not authorized to access this app. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error checking authorization:', err);
      setError('Failed to verify authorization. Please try again.');
    }
  };

  const loadVisitedLocations = async () => {
    try {
      const locations = await getAllLocations();
      setVisitedLocations(locations);
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
    // Sign out from Google OAuth
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut().then(() => {
          setUser(null);
          setAuthorized(false);
          setShowAdminSetup(false);
          setSelectedLocation(null);
          setVisitedLocations([]);
          window.location.reload();
        });
      }
    } else {
      setUser(null);
      setAuthorized(false);
      setShowAdminSetup(false);
      setSelectedLocation(null);
      setVisitedLocations([]);
      window.location.reload();
    }
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