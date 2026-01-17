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
    let retryCount = 0;
    const MAX_RETRIES = 30; // 3 seconds max wait

    // Initialize Google Identity Services Token Client
    const initTokenClient = () => {
      if (!window.google?.accounts?.oauth2) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          setTimeout(initTokenClient, 100);
        } else {
          setError('Failed to load Google Sign-In. Please refresh the page.');
          setLoading(false);
        }
        return;
      }

      // Validate configuration
      if (!CONFIG.GOOGLE_CLIENT_ID) {
        setError('Configuration error: Missing Google Client ID. Please check your .env file.');
        setLoading(false);
        return;
      }

      try {
        window.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CONFIG.GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: async (response) => {
            if (response.error) {
              console.error('OAuth error:', response);

              // Provide specific error messages
              let errorMsg = 'Failed to complete sign-in.';
              if (response.error === 'access_denied') {
                errorMsg = 'Sign-in was cancelled. Please try again.';
              } else if (response.error === 'popup_closed_by_user') {
                errorMsg = 'Popup was closed. Please try again.';
              } else if (response.error === 'popup_blocked_by_browser') {
                errorMsg = 'Popup blocked. Please allow popups for this site.';
              }

              setError(errorMsg);
              setLoading(false);
              return;
            }

            try {
              console.log('✅ OAuth token received');
              setLoading(true);

              // Clear any existing token first to avoid conflicts
              if (window.googleAccessToken) {
                console.log('⚠️ Clearing previous token');
                delete window.googleAccessToken;
                delete window.tokenExpiresAt;
              }

              // Store the new access token for Sheets API
              window.googleAccessToken = response.access_token;

              // Store token expiration time (tokens expire after 1 hour)
              const expiresIn = response.expires_in || 3600; // Default 1 hour
              window.tokenExpiresAt = Date.now() + (expiresIn * 1000);
              console.log(`🔑 Token will expire in ${Math.floor(expiresIn / 60)} minutes`);

              // Get user info with retry logic
              let userInfoResponse;
              let attempts = 0;
              const maxAttempts = 3;

              while (attempts < maxAttempts) {
                try {
                  userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${response.access_token}` }
                  });

                  if (userInfoResponse.ok) {
                    break;
                  }

                  attempts++;
                  if (attempts < maxAttempts) {
                    console.log(`Retry ${attempts}/${maxAttempts} getting user info...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                } catch (fetchError) {
                  attempts++;
                  if (attempts >= maxAttempts) {
                    throw fetchError;
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }

              if (!userInfoResponse?.ok) {
                throw new Error('Failed to get user information after multiple attempts');
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
              setError(''); // Clear any previous errors
              setLoading(false);
            } catch (err) {
              console.error('Error getting user info:', err);
              setError('Failed to get user information. Please check your internet connection and try again.');
              setLoading(false);

              // Clean up failed token
              delete window.googleAccessToken;
              delete window.tokenExpiresAt;
            }
          },
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing OAuth client:', err);
        setError('Failed to initialize sign-in. Please refresh the page.');
        setLoading(false);
      }
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
