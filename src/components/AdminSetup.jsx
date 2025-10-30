// ============================================
// ADMIN SETUP COMPONENT
// ============================================
// Admin interface for managing users

import { useState, useEffect } from 'react';
import { addAuthorizedUser, removeAuthorizedUser, getAuthorizedUsers, getNoteTemplates, addNoteTemplate, removeNoteTemplate } from '../utils/googleSheets.js';

const AdminSetup = ({ onComplete, user }) => {
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAuthorizedUsers();
    loadNoteTemplates();
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

  const loadNoteTemplates = async () => {
    try {
      const templates = await getNoteTemplates();
      setNoteTemplates(templates);
    } catch (error) {
      console.error('Error loading note templates:', error);
    }
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

  const handleAddTemplate = async (e) => {
    e.preventDefault();

    if (!newTemplate.trim()) {
      setMessage({ type: 'error', text: 'Please enter a template' });
      return;
    }

    if (noteTemplates.includes(newTemplate.trim())) {
      setMessage({ type: 'error', text: 'This template already exists' });
      return;
    }

    const success = await addNoteTemplate(newTemplate.trim());
    if (success) {
      setNewTemplate('');
      setMessage({ type: 'success', text: 'Template added successfully' });
      await loadNoteTemplates();
    } else {
      setMessage({ type: 'error', text: 'Failed to add template. Please try again.' });
    }
  };

  const handleRemoveTemplate = async (template) => {
    if (!confirm(`Remove this template?\n\n"${template}"`)) {
      return;
    }

    const success = await removeNoteTemplate(template);
    if (success) {
      setMessage({ type: 'success', text: 'Template removed successfully' });
      await loadNoteTemplates();
    } else {
      setMessage({ type: 'error', text: 'Failed to remove template. Please try again.' });
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

      {/* Note Templates Management */}
      <div className="user-management" style={{ marginTop: '40px' }}>
        <h3>Visit Note Templates</h3>
        <p style={{ marginBottom: '15px', fontSize: '14px' }}>
          Create pre-written note templates that sales reps can quickly select when adding visit notes.
        </p>

        <form onSubmit={handleAddTemplate} className="add-user-form">
          <input
            type="text"
            value={newTemplate}
            onChange={(e) => setNewTemplate(e.target.value)}
            placeholder="Enter note template (e.g., Owner was not at the place, spoke with worker...)"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            Add Template
          </button>
        </form>

        <div className="user-list">
          {noteTemplates.length === 0 ? (
            <div className="user-item">
              <span>No templates added yet. Default templates will be used.</span>
            </div>
          ) : (
            noteTemplates.map((template, index) => (
              <div key={index} className="user-item" style={{ alignItems: 'flex-start' }}>
                <span style={{ flex: 1, wordBreak: 'break-word' }}>{template}</span>
                <button
                  onClick={() => handleRemoveTemplate(template)}
                  className="btn btn-danger btn-small"
                  style={{ flexShrink: 0 }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
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