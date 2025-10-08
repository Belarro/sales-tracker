// ============================================
// LOGIN COMPONENT
// ============================================
// Handles Google sign-in

import { useEffect } from 'react';
import { CONFIG } from '../config.js';

const Login = ({ onLogin }) => {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 250
        }
      );
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = (response) => {
    try {
      // Decode JWT to get user info
      const userInfo = decodeJWT(response.credential);
      if (userInfo && userInfo.email) {
        onLogin(userInfo);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const decodeJWT = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Sales Tracker</h1>
        <p>Sign in with your Google account to continue</p>
        <div id="googleSignInButton" className="google-signin-button"></div>
      </div>
    </div>
  );
};

export default Login;