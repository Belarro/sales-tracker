// ============================================
// LOGIN COMPONENT
// ============================================
// Handles Google sign-in using Google Identity Services with Token Model

import { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';

const Login = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserInfo, setTempUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Google Identity Services Token Client
    const initTokenClient = () => {
      if (!window.google?.accounts?.oauth2) {
        setTimeout(initTokenClient, 100);
        return;
      }

      window.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response) => {
          if (response.error) {
            console.error('Token error:', response);
            setError('Failed to complete sign-in. Please try again.');
            setLoading(false);
            return;
          }

          try {
            console.log('✅ OAuth token received for new login');

            // Clear any existing token first to avoid conflicts
            if (window.googleAccessToken) {
              console.log('⚠️ Clearing previous token');
              delete window.googleAccessToken;
            }

            // Store the new access token for Sheets API
            window.googleAccessToken = response.access_token;

            // Store token expiration time (tokens expire after 1 hour)
            const expiresIn = response.expires_in || 3600; // Default 1 hour
            window.tokenExpiresAt = Date.now() + (expiresIn * 1000);
            console.log(`🔑 Token will expire in ${expiresIn} seconds`);

            // Get user info
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });

            if (!userInfoResponse.ok) {
              throw new Error('Failed to get user info');
            }

            const userInfo = await userInfoResponse.json();
            console.log('👤 User info retrieved:', userInfo.email);
            setTempUserInfo(userInfo);

            // Check if user has saved name
            const savedName = localStorage.getItem(`salesTracker_userName_${userInfo.email}`);
            if (savedName) {
              setUserName(savedName);
            }

            setShowNameInput(true);
            setLoading(false);
          } catch (err) {
            console.error('Error getting user info:', err);
            setError('Failed to get user information. Please try again.');
            setLoading(false);
          }
        },
      });

      setLoading(false);
    };

    initTokenClient();
  }, []);

  const handleSignIn = () => {
    setError('');

    if (window.tokenClient) {
      // Request access token with forced account selection
      // This ensures users can always choose which account to use
      window.tokenClient.requestAccessToken({
        prompt: 'select_account'  // Always show account picker
      });
    } else {
      setError('Google Sign-In not ready. Please refresh the page.');
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim() && tempUserInfo) {
      // Save name to localStorage for future logins
      localStorage.setItem(`salesTracker_userName_${tempUserInfo.email}`, userName.trim());

      onLogin({
        email: tempUserInfo.email,
        name: userName.trim()
      });
    } else {
      setError('Please enter your name');
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Sales Tracker</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Sales Tracker</h1>
        {!showNameInput ? (
          <>
            <p>Sign in with your Google account to continue</p>
            {error && <p style={{ color: '#ea4335', marginBottom: '15px' }}>{error}</p>}
            <button
              onClick={handleSignIn}
              className="btn btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '16px'
              }}
            >
              Sign in with Google
            </button>
          </>
        ) : (
          <form onSubmit={handleNameSubmit}>
            <p>Welcome! {userName ? 'Confirm your name:' : 'Please enter your name:'}</p>
            {error && <p style={{ color: '#ea4335', marginBottom: '15px' }}>{error}</p>}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                marginBottom: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              autoFocus
              required
            />
            {userName && (
              <small style={{
                display: 'block',
                marginBottom: '12px',
                color: '#666',
                fontSize: '13px'
              }}>
                ✓ Name saved - you can edit it if needed
              </small>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                width: '100%'
              }}
            >
              Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
