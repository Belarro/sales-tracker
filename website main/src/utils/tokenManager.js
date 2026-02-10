// ============================================
// TOKEN MANAGER
// ============================================
// Handles token refresh and validation

/**
 * Check if the current token is expired or will expire soon
 * @param {number} bufferMinutes - Minutes before expiry to consider token expired (default: 5)
 * @returns {boolean} True if token is expired or will expire soon
 */
export const isTokenExpired = (bufferMinutes = 5) => {
  if (!window.tokenExpiresAt || !window.googleAccessToken) {
    return true;
  }

  const bufferMs = bufferMinutes * 60 * 1000;
  const expiresAt = window.tokenExpiresAt - bufferMs;
  const isExpired = Date.now() >= expiresAt;

  if (isExpired) {
    console.log('⚠️ Token expired or expiring soon');
  }

  return isExpired;
};

/**
 * Request a new token silently (if possible)
 * @returns {Promise<boolean>} True if token was refreshed successfully
 */
export const refreshToken = () => {
  return new Promise((resolve) => {
    if (!window.tokenClient) {
      console.error('Token client not initialized');
      resolve(false);
      return;
    }

    console.log('🔄 Refreshing access token...');

    // Store the original callback
    const originalCallback = window.tokenClient.callback;

    // Set a temporary callback for refresh
    window.tokenClient.callback = (response) => {
      if (response.error) {
        console.error('Token refresh failed:', response.error);
        // Restore original callback
        window.tokenClient.callback = originalCallback;
        resolve(false);
        return;
      }

      // Update token
      window.googleAccessToken = response.access_token;
      const expiresIn = response.expires_in || 3600;
      window.tokenExpiresAt = Date.now() + (expiresIn * 1000);

      // Update gapi client token if available
      if (window.gapi?.client) {
        window.gapi.client.setToken({
          access_token: response.access_token
        });
      }

      console.log(`✅ Token refreshed, expires in ${Math.floor(expiresIn / 60)} minutes`);

      // Restore original callback
      window.tokenClient.callback = originalCallback;
      resolve(true);
    };

    // Request new token without prompt (silent refresh)
    try {
      window.tokenClient.requestAccessToken({ prompt: '' });
    } catch (error) {
      console.error('Error requesting token refresh:', error);
      window.tokenClient.callback = originalCallback;
      resolve(false);
    }
  });
};

/**
 * Ensure we have a valid token, refresh if needed
 * @returns {Promise<boolean>} True if we have a valid token
 */
export const ensureValidToken = async () => {
  if (!isTokenExpired()) {
    return true;
  }

  console.log('Token expired, attempting refresh...');
  return await refreshToken();
};
