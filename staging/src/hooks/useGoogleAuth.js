import { useState } from 'react';
import { initSheetsAPI, getAuthorizedUsers, getAdminEmails } from '../utils/googleSheets';
import { isAdminWithSheet } from '../utils/googleAuth';

/**
 * Custom hook for Google Authentication logic
 */
export const useGoogleAuth = () => {
    const [user, setUser] = useState(null);
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (userInfo) => {
        setLoading(true);
        setUser(userInfo);
        setError('');

        try {
            // Initialize Sheets API
            await initSheetsAPI();
            console.log('Sheets API initialized successfully');

            // Get admin emails
            const sheetAdmins = await getAdminEmails();
            console.log('🔐 All admin emails:', sheetAdmins);

            // Check if user is admin
            if (isAdminWithSheet(userInfo.email, sheetAdmins)) {
                console.log('✅ User is admin:', userInfo.email);
                setAuthorized(true);
            }
            // Check if user is authorized 
            else {
                const authorizedUsers = await getAuthorizedUsers();
                console.log('🔍 Checking authorization for:', userInfo.email);

                if (authorizedUsers.includes(userInfo.email)) {
                    setAuthorized(true);
                } else {
                    setError('You are not authorized to access this app. Please contact the administrator.');
                    setAuthorized(false);
                }
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Failed to initialize. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        console.log('🚪 Signing out user...');

        // Revoke the Google token
        if (window.googleAccessToken) {
            fetch(`https://oauth2.googleapis.com/revoke?token=${window.googleAccessToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).catch((error) => console.error('❌ Error revoking token:', error));

            delete window.googleAccessToken;
            delete window.tokenExpiresAt;
        }

        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }

        sessionStorage.clear();
        setUser(null);
        setAuthorized(false);

        // Reload to fully reset app state
        window.location.reload();
    };

    return {
        user,
        authorized,
        loading,
        error,
        handleLogin,
        handleSignOut,
        setAuthorized // Exposed for cases like Admin Setup needing to update auth state
    };
};
