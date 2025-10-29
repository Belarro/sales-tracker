// ============================================
// LOGIN COMPONENT
// ============================================
// Handles Google sign-in using OAuth 2.0 Authorization Code Flow with PKCE

import { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';

const Login = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserInfo, setTempUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate code verifier and challenge for PKCE
  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
  };

  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  useEffect(() => {
    // Check if we're returning from OAuth redirect
    const handleOAuthCallback = async () => {
      // Check for authorization code in URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          // Retrieve the code verifier from sessionStorage
          const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
          if (!codeVerifier) {
            throw new Error('Code verifier not found. Please try signing in again.');
          }

          // Exchange authorization code for access token
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              code: code,
              client_id: CONFIG.GOOGLE_CLIENT_ID,
              redirect_uri: window.location.origin,
              grant_type: 'authorization_code',
              code_verifier: codeVerifier,
            }),
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error('Token exchange error:', errorData);
            throw new Error('Failed to exchange authorization code for token');
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          // Store the access token for Sheets API
          window.googleAccessToken = accessToken;

          // Clean up code verifier
          sessionStorage.removeItem('pkce_code_verifier');

          // Get user info
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (!userInfoResponse.ok) {
            throw new Error('Failed to get user info');
          }

          const userInfo = await userInfoResponse.json();
          setTempUserInfo(userInfo);

          // Check if user has saved name
          const savedName = localStorage.getItem(`salesTracker_userName_${userInfo.email}`);
          if (savedName) {
            setUserName(savedName);
          }

          setShowNameInput(true);

          // Clean up URL
          window.history.replaceState(null, document.title, window.location.pathname);
        } catch (err) {
          console.error('OAuth callback error:', err);
          setError('Failed to complete sign-in. Please try again.');
          sessionStorage.removeItem('pkce_code_verifier');
        }
      }

      setLoading(false);
    };

    handleOAuthCallback();
  }, []);

  const handleSignIn = async () => {
    setError('');

    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store code verifier for later use
      sessionStorage.setItem('pkce_code_verifier', codeVerifier);

      // Build OAuth URL for Authorization Code Flow with PKCE
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', CONFIG.GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', window.location.origin);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
      authUrl.searchParams.append('prompt', 'select_account');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');

      // Redirect to Google OAuth
      window.location.href = authUrl.toString();
    } catch (err) {
      console.error('Error initiating sign-in:', err);
      setError('Failed to start sign-in process. Please try again.');
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
