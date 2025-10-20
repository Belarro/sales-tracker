// ============================================
// ADMIN SETUP COMPONENT
// ============================================
// Admin interface for managing users

import { useState, useEffect } from 'react';
import { addAuthorizedUser, removeAuthorizedUser, getAuthorizedUsers } from '../utils/googleSheets.js';

const AdminSetup = ({ onComplete, user }) => {
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAuthorizedUsers();
  }, []);

  const loadAuthorizedUsers = async () => {
    setLoading(true);
    try {
      const users = await getAuthorizedUsers();
      setAuthorizedUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Failed to load users. Check your Google Sheets setup.' });
    }
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUserEmail || !newUserEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    if (authorizedUsers.includes(newUserEmail)) {
      setMessage({ type: 'error', text: 'This user is already authorized' });
      return;
    }

    const success = await addAuthorizedUser(newUserEmail);
    if (success) {
      setNewUserEmail('');
      setMessage({ type: 'success', text: `${newUserEmail} has been authorized` });
      // Reload the list from Google Sheets to ensure it's in sync
      await loadAuthorizedUsers();
    } else {
      setMessage({ type: 'error', text: 'Failed to add user. Please try again.' });
    }
  };

  const handleRemoveUser = async (email) => {
    if (!confirm(`Remove ${email} from authorized users?`)) {
      return;
    }

    const success = await removeAuthorizedUser(email);
    if (success) {
      setMessage({ type: 'success', text: `${email} has been removed` });
      // Reload the list from Google Sheets to ensure it's in sync
      await loadAuthorizedUsers();
    } else {
      setMessage({ type: 'error', text: 'Failed to remove user. Please try again.' });
    }
  };

  return (
    <div className="admin-setup">
      <h2>Admin Setup</h2>
      <p>
        Welcome, Admin! Use this panel to manage who can access the Sales Tracker app.
        Add email addresses of salespeople you want to authorize.
      </p>

      {message.text && (
        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </div>
      )}

      <div className="user-management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Authorized Users</h3>
          <button
            onClick={loadAuthorizedUsers}
            className="btn btn-secondary"
            type="button"
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            🔄 Refresh List
          </button>
        </div>

        <form onSubmit={handleAddUser} className="add-user-form">
          <input
            type="email"
            placeholder="Enter email address to authorize"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Add User
          </button>
        </form>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="user-list">
            {authorizedUsers.length === 0 ? (
              <div className="user-item">
                <span>No users added yet. Add your first user above.</span>
              </div>
            ) : (
              authorizedUsers.map((email) => (
                <div key={email} className="user-item">
                  <span>{email}</span>
                  <button
                    onClick={() => handleRemoveUser(email)}
                    className="btn btn-danger btn-small"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'right' }}>
        <button onClick={onComplete} className="btn btn-primary">
          Continue to App
        </button>
      </div>
    </div>
  );
};

export default AdminSetup;