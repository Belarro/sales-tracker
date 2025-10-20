// ============================================
// LOGIN COMPONENT
// ============================================
// Handles Google sign-in using OAuth 2.0 Implicit Flow (redirect-based, no COOP issues)

import { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';

const Login = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserInfo, setTempUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're returning from OAuth redirect
    const handleOAuthCallback = async () => {
      // Check for access token in URL hash (Implicit Flow returns token in hash)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      if (accessToken) {
        try {
          // Store the access token for Sheets API
          window.googleAccessToken = accessToken;

          // Get user info
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          const userInfo = await userInfoResponse.json();
          setTempUserInfo(userInfo);

          // Check if user has saved name
          const savedName = localStorage.getItem(`salesTracker_userName_${userInfo.email}`);
          if (savedName) {
            setUserName(savedName);
          }

          setShowNameInput(true);

          // Clean up URL hash
          window.history.replaceState(null, document.title, window.location.pathname);
        } catch (err) {
          console.error('OAuth callback error:', err);
          setError('Failed to complete sign-in. Please try again.');
        }
      }

      setLoading(false);
    };

    handleOAuthCallback();
  }, []);

  const handleSignIn = () => {
    setError('');

    // Build OAuth URL for Implicit Flow (returns token directly, works with redirect)
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', CONFIG.GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', window.location.origin + window.location.pathname);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
    authUrl.searchParams.append('prompt', 'select_account');

    // Redirect to Google OAuth
    window.location.href = authUrl.toString();
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
