// ============================================
// LOGIN COMPONENT
// ============================================
// Handles Google sign-in using Google Identity Services (newer library)

import { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';

const Login = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserInfo, setTempUserInfo] = useState(null);

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize the Google Sign-In client
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: (response) => {
          if (response.access_token) {
            // Store the access token for Sheets API
            window.googleAccessToken = response.access_token;

            // Get user info from the token
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
              .then(res => res.json())
              .then(userInfo => {
                // Store user info and show name input
                setTempUserInfo(userInfo);
                setShowNameInput(true);
              })
              .catch(err => {
                console.error('Failed to get user info:', err);
                setError('Failed to get user information. Please try again.');
              });
          }
        },
        error_callback: (error) => {
          console.error('OAuth error:', error);
          if (error.type !== 'popup_closed') {
            setError('Failed to sign in. Please try again.');
          }
        }
      });

      window.googleTokenClient = client;
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onLogin]);

  const handleSignIn = () => {
    setError('');
    if (window.googleTokenClient) {
      window.googleTokenClient.requestAccessToken();
    } else {
      setError('Sign-in not ready. Please wait a moment and try again.');
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim() && tempUserInfo) {
      onLogin({
        email: tempUserInfo.email,
        name: userName.trim()
      });
    } else {
      setError('Please enter your name');
    }
  };

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
            <p>Welcome! Please enter your name:</p>
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
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              autoFocus
              required
            />
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