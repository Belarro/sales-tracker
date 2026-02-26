// ============================================
// LOGIN COMPONENT
// ============================================

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
    const MAX_RETRIES = 30;

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

      if (!CONFIG.GOOGLE_CLIENT_ID) {
        setError('Configuration error: Missing Google Client ID.');
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
              let errorMsg = 'Failed to complete sign-in.';
              if (response.error === 'access_denied') errorMsg = 'Sign-in was cancelled. Please try again.';
              else if (response.error === 'popup_closed_by_user') errorMsg = 'Popup was closed. Please try again.';
              else if (response.error === 'popup_blocked_by_browser') errorMsg = 'Popup blocked. Please allow popups for this site.';
              setError(errorMsg);
              setLoading(false);
              return;
            }

            try {
              setLoading(true);

              if (window.googleAccessToken) {
                delete window.googleAccessToken;
                delete window.tokenExpiresAt;
              }

              window.googleAccessToken = response.access_token;
              const expiresIn = response.expires_in || 3600;
              window.tokenExpiresAt = Date.now() + (expiresIn * 1000);

              let userInfoResponse;
              let attempts = 0;
              const maxAttempts = 3;

              while (attempts < maxAttempts) {
                try {
                  userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${response.access_token}` }
                  });
                  if (userInfoResponse.ok) break;
                  attempts++;
                  if (attempts < maxAttempts) await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (fetchError) {
                  attempts++;
                  if (attempts >= maxAttempts) throw fetchError;
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }

              if (!userInfoResponse?.ok) {
                throw new Error('Failed to get user information');
              }

              const userInfo = await userInfoResponse.json();
              setTempUserInfo(userInfo);

              const savedName = localStorage.getItem(`salesTracker_userName_${userInfo.email}`);
              if (savedName) setUserName(savedName);

              setShowNameInput(true);
              setError('');
              setLoading(false);
            } catch (err) {
              console.error('Error getting user info:', err);
              setError('Failed to get user information. Please try again.');
              setLoading(false);
              delete window.googleAccessToken;
              delete window.tokenExpiresAt;
            }
          },
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing OAuth client:', err);
        setError('Failed to initialize sign-in. Please refresh.');
        setLoading(false);
      }
    };

    initTokenClient();
  }, []);

  const handleSignIn = () => {
    setError('');
    if (window.tokenClient) {
      window.tokenClient.requestAccessToken({ prompt: 'select_account' });
    } else {
      setError('Google Sign-In not ready. Please refresh the page.');
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim() && tempUserInfo) {
      localStorage.setItem(`salesTracker_userName_${tempUserInfo.email}`, userName.trim());
      onLogin({ email: tempUserInfo.email, name: userName.trim() });
    } else {
      setError('Please enter your name');
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Sales Tracker</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
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
            {error && (
              <p style={{
                color: 'var(--color-danger)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--spacing-md)',
                background: 'var(--color-danger-light)',
                padding: '10px',
                borderRadius: 'var(--border-radius-md)'
              }}>
                {error}
              </p>
            )}
            <button
              onClick={handleSignIn}
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: 'var(--font-size-md)' }}
            >
              Sign in with Google
            </button>
          </>
        ) : (
          <form onSubmit={handleNameSubmit}>
            <p>{userName ? 'Confirm your name:' : 'Please enter your name:'}</p>
            {error && (
              <p style={{
                color: 'var(--color-danger)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--spacing-md)'
              }}>
                {error}
              </p>
            )}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your full name"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 'var(--font-size-md)',
                marginBottom: 'var(--spacing-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
                background: 'var(--color-bg-input)',
                color: 'var(--color-text-main)',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              autoFocus
              required
            />
            {userName && (
              <div style={{
                marginBottom: 'var(--spacing-md)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-xs)'
              }}>
                Name saved for future logins
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: 'var(--font-size-md)', width: '100%' }}
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
