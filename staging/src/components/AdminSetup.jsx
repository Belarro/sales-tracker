// ============================================
// ADMIN SETUP COMPONENT (PRO VERSION)
// ============================================

import { useState, useEffect } from 'react';
import {
  addAuthorizedUser,
  removeAuthorizedUser,
  getAuthorizedUsers,
  getNoteTemplates,
  addNoteTemplate,
  removeNoteTemplate,
  getAdminEmails,
  addAdminEmail,
  removeAdminEmail
} from '../utils/googleSheets.js';
import { CONFIG } from '../config.js';
import '../styles/variables.css';

const AdminSetup = ({ onComplete, user }) => {
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminEmails, setAdminEmails] = useState([]);

  useEffect(() => {
    loadAuthorizedUsers();
    loadNoteTemplates();
    loadAdminEmails();
  }, []);

  const loadAuthorizedUsers = async () => {
    setLoading(true);
    try {
      const users = await getAuthorizedUsers();
      setAuthorizedUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Failed to load users.' });
    }
    setLoading(false);
  };

  const loadNoteTemplates = async () => {
    try {
      const templates = await getNoteTemplates();
      setNoteTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadAdminEmails = async () => {
    try {
      const emails = await getAdminEmails();
      setAdminEmails(emails);
    } catch (error) {
      console.error('Error loading admins:', error);
      setAdminEmails(CONFIG.ADMIN_EMAILS);
    }
  };

  // Generic handler for adding/removing to avoid code repetition would be better, 
  // but sticking to existing logic for safety, just styling updates.

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail.includes('@')) return setMessage({ type: 'error', text: 'Invalid email' });
    if (authorizedUsers.includes(newUserEmail)) return setMessage({ type: 'error', text: 'User exists' });

    const success = await addAuthorizedUser(newUserEmail);
    if (success) {
      setNewUserEmail('');
      setMessage({ type: 'success', text: 'User added' });
      await loadAuthorizedUsers();
    } else {
      setMessage({ type: 'error', text: 'Failed to add user' });
    }
  };

  const handleRemoveUser = async (email) => {
    if (!confirm(`Remove ${email}?`)) return;
    const success = await removeAuthorizedUser(email);
    if (success) {
      setMessage({ type: 'success', text: 'User removed' });
      await loadAuthorizedUsers();
    } else {
      setMessage({ type: 'error', text: 'Failed to remove user' });
    }
  };

  const handleAddTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.trim()) return;
    const success = await addNoteTemplate(newTemplate.trim());
    if (success) {
      setNewTemplate('');
      setMessage({ type: 'success', text: 'Template added' });
      await loadNoteTemplates();
    }
  };

  const handleRemoveTemplate = async (template) => {
    if (!confirm('Delete template?')) return;
    const success = await removeNoteTemplate(template);
    if (success) {
      setMessage({ type: 'success', text: 'Template deleted' });
      await loadNoteTemplates();
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.includes('@')) return;
    const success = await addAdminEmail(newAdminEmail);
    if (success) {
      setNewAdminEmail('');
      setMessage({ type: 'success', text: 'Admin added' });
      await loadAdminEmails();
    }
  };

  const handleRemoveAdmin = async (email) => {
    if (!confirm(`Remove admin ${email}?`)) return;
    const success = await removeAdminEmail(email);
    if (success) {
      setMessage({ type: 'success', text: 'Admin removed' });
      await loadAdminEmails();
    }
  };

  // --- STYLES ---
  const containerStyle = {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-md)'
  };

  const cardStyle = {
    background: 'var(--color-bg-glass)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)'
  };

  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-md)',
    color: 'var(--color-text-main)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600'
  };

  const inputGroupStyle = {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-md)'
  };

  const inputStyle = {
    flex: 1,
    padding: '12px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    color: 'var(--color-text-main)',
    fontSize: 'var(--font-size-md)'
  };

  const listItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--border-radius-md)',
    marginBottom: '8px',
    color: 'var(--color-text-secondary)'
  };

  return (
    <div className="admin-setup" style={containerStyle}>
      <h2 style={{ color: 'var(--color-text-main)', marginBottom: 'var(--spacing-md)' }}>Admin Console</h2>

      {message.text && (
        <div style={{
          padding: '12px',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-md)',
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: message.type === 'error' ? '#fca5a5' : '#6ee7b7',
          border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
        }}>
          {message.text}
        </div>
      )}

      {/* ADMINS MANAGEMENT */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <span>Admins</span>
          <button onClick={loadAdminEmails} className="btn btn-secondary" style={{ fontSize: '12px' }}>Refresh</button>
        </div>

        <form onSubmit={handleAddAdmin} style={inputGroupStyle}>
          <input
            type="email"
            placeholder="New Admin Email"
            value={newAdminEmail}
            onChange={e => setNewAdminEmail(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {/* System Admins (Immutable) */}
          {CONFIG.ADMIN_EMAILS.map(email => (
            <div key={`sys-${email}`} style={listItemStyle}>
              <span style={{ fontSize: '14px' }}>
                {email} <span style={{ fontSize: '10px', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', borderRadius: '4px', padding: '2px 4px', marginLeft: '5px' }}>SYSTEM</span>
              </span>
              <button disabled className="btn" style={{ padding: '6px 12px', fontSize: '12px', opacity: 0.5, cursor: 'not-allowed', background: 'transparent', color: 'var(--color-text-secondary)' }}>Locked</button>
            </div>
          ))}

          {/* Sheet Admins (Mutable) */}
          {adminEmails
            .filter(email => !CONFIG.ADMIN_EMAILS.includes(email))
            .map(email => (
              <div key={email} style={listItemStyle}>
                <span style={{ fontSize: '14px' }}>{email}</span>
                <button onClick={() => handleRemoveAdmin(email)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Remove</button>
              </div>
            ))}
        </div>
      </div>

      {/* TEAM MANAGEMENT */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <span>Team Access</span>
          <button onClick={loadAuthorizedUsers} className="btn btn-secondary" style={{ fontSize: '12px' }}>Refresh</button>
        </div>

        <form onSubmit={handleAddUser} style={inputGroupStyle}>
          <input
            type="email"
            placeholder="New User Email"
            value={newUserEmail}
            onChange={e => setNewUserEmail(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>

        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {loading ? <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div> : authorizedUsers.map(email => (
            <div key={email} style={listItemStyle}>
              <span style={{ fontSize: '14px' }}>{email}</span>
              <button onClick={() => handleRemoveUser(email)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* NOTE TEMPLATES */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <span>Note Templates</span>
        </div>

        <form onSubmit={handleAddTemplate} style={inputGroupStyle}>
          <input
            type="text"
            placeholder="New Template..."
            value={newTemplate}
            onChange={e => setNewTemplate(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>

        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {noteTemplates.map((template, i) => (
            <div key={i} style={listItemStyle}>
              <span style={{ fontSize: '14px', flex: 1, paddingRight: '10px' }}>{template}</span>
              <button onClick={() => handleRemoveTemplate(template)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
        <button onClick={onComplete} className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminSetup;