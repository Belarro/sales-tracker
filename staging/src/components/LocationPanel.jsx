// ============================================
// LOCATION PANEL (ACTION SHEET)
// ============================================

import { useState, useEffect } from 'react';
import '../styles/variables.css';
import { CONFIG } from '../config.js';
import { saveLocationData, archiveLocation, deleteLocation, getNoteTemplates, addNoteTemplate } from '../utils/googleSheets.js';

const LocationPanel = ({ location, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    contactPerson: '',
    contactTitle: '',
    email: '',
    phone: '',
    businessTypes: '',
    businessWebsite: '',
    interestLevel: '',
    sampleGiven: 'NO',
    followUpDate: '',
    visitNotes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [noteTemplates, setNoteTemplates] = useState([]);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await getNoteTemplates();
      setNoteTemplates(templates);
    };
    loadTemplates();
  }, []);

  // Initialize form data when location changes
  useEffect(() => {
    if (location) {
      setFormData({
        contactPerson: location.contactPerson || '',
        contactTitle: location.contactTitle || '',
        // Prefer direct contact info, fallback to business info
        email: location.directEmail || location.businessEmail || '',
        phone: location.directPhone || location.businessPhone || '',
        businessTypes: location.businessTypes || '',
        businessWebsite: location.businessWebsite || '',
        interestLevel: '',
        sampleGiven: 'NO',
        followUpDate: '',
        visitNotes: ''
      });
      setSaveMessage({ type: '', text: '' });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setInterest = (level) => {
    setFormData(prev => ({ ...prev, interestLevel: level }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.interestLevel) {
      setSaveMessage({ type: 'error', text: 'Please select an Interest Level' });
      return;
    }

    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });

    try {
      // Prepare the data object merging location info and form data
      const checkInData = {
        ...location,
        ...formData,
        // Map generic form fields to specific sheet columns
        directPhone: formData.phone,
        directEmail: formData.email,
        businessTypes: formData.businessTypes,
        businessWebsite: formData.businessWebsite,

        // Ensure critical fields are present
        locationName: location.locationName,
        businessAddress: location.businessAddress,
        // Exclude timestamp so saveLocationData generates a fresh one
        timestamp: undefined
      };

      // Call saveLocationData(data, userName, userEmail)
      const success = await saveLocationData(checkInData, user.name, user.email);

      if (success) {
        setSaveMessage({ type: 'success', text: 'Visit log saved!' });
        setTimeout(() => {
          onSave();
          onClose(); // Auto-close on success
        }, 1500);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save to Google Sheet.' });
      }
    } catch (error) {
      console.error(error);
      setSaveMessage({ type: 'error', text: 'Error saving data.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this location? It will be hidden from the map and list.')) {
      return;
    }

    setIsSaving(true);
    try {
      const success = await archiveLocation(location.locationName, location.businessAddress);
      if (success) {
        setSaveMessage({ type: 'success', text: 'Location archived.' });
        setTimeout(() => {
          onSave(); // Refresh list
          onClose();
        }, 1000);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to archive.' });
      }
    } catch (error) {
      console.error(error);
      setSaveMessage({ type: 'error', text: 'Error archiving location.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('DANGER: This will PERMANENTLY DELETE this location and its history. This cannot be undone.\n\nAre you sure?')) {
      return;
    }

    setIsSaving(true);
    try {
      const success = await deleteLocation(location.locationName, location.businessAddress);
      if (success) {
        setSaveMessage({ type: 'success', text: 'Location deleted permanently.' });
        setTimeout(() => {
          onSave(); // Refresh list
          onClose();
        }, 1000);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to delete.' });
      }
    } catch (error) {
      console.error(error);
      setSaveMessage({ type: 'error', text: 'Error deleting location.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!location) return null;

  return (
    <div className={`location-panel open`}>
      {/* DRAG HANDLE (Visual only) */}
      <div className="panel-handle" onClick={onClose}></div>

      <div className="panel-content">
        {/* HEADER */}
        <div className="panel-header">
          <div>
            <h2 style={{ marginBottom: '4px' }}>{location.locationName}</h2>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {location.businessAddress}
            </div>
          </div>
          <button className="close-panel" onClick={onClose}>×</button>
        </div>

        {/* FEEDBACK MESSAGE */}
        {saveMessage.text && (
          <div className={`message ${saveMessage.type === 'error' ? 'error-message' : 'success-message'}`}>
            {saveMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="visit-form">

          {/* 1. INTEREST LEVEL (Large Buttons) */}
          <div className="form-group">
            <label>Outcome</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CONFIG.INTEREST_LEVELS.map(level => {
                const isActive = formData.interestLevel === level;
                let activeColor = 'var(--color-primary)';
                if (level === 'Not Interested') activeColor = 'var(--color-danger)';
                if (level === 'Closed Deal' || level === 'Interested') activeColor = 'var(--color-success)';
                if (level === 'Follow Up') activeColor = 'var(--color-warning)';

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setInterest(level)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--border-radius-md)',
                      border: `1px solid ${isActive ? activeColor : 'var(--color-border)'}`,
                      background: isActive ? activeColor : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#fff' : 'var(--color-text-main)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. NOTES (Large input) */}
          <div className="form-group">
            <label>Notes</label>

            {/* Template Chips */}
            {noteTemplates.length > 0 && (
              <div className="note-templates" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {noteTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, visitNotes: prev.visitNotes ? prev.visitNotes + ' ' + template : template }))}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    title="Click to append this note"
                  >
                    + {template.length > 30 ? template.substring(0, 30) + '...' : template}
                  </button>
                ))}
              </div>
            )}

            <textarea
              name="visitNotes"
              value={formData.visitNotes}
              onChange={handleChange}
              placeholder="What happened? Next steps?"
              rows="3"
            />

            {/* Quick Add Template */}
            {formData.visitNotes && !noteTemplates.includes(formData.visitNotes) && (
              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Save this text as a reusable template for future visits?')) {
                      const success = await addNoteTemplate(formData.visitNotes);
                      if (success) {
                        setNoteTemplates(prev => [...prev, formData.visitNotes]);
                        alert('Template saved!');
                      }
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  + Save as Template
                </button>
              </div>
            )}
          </div>

          {/* 3. CONTACT INFO */}
          <div className="form-row">
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Name"
              />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="contactTitle"
                value={formData.contactTitle}
                onChange={handleChange}
                placeholder="Owner/Mgr"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Direct / Business"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Business Type</label>
              <input
                type="text"
                name="businessTypes"
                value={formData.businessTypes}
                onChange={handleChange}
                placeholder="e.g. Italian, Cafe..."
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="text"
                name="businessWebsite"
                value={formData.businessWebsite}
                onChange={handleChange}
                placeholder="website.com"
              />
            </div>
          </div>

          {/* 4. SAMPLE GIVEN */}
          <div className="form-group">
            <label>Sample Given?</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['YES', 'NO'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sampleGiven: opt }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--border-radius-md)',
                    border: `1px solid ${formData.sampleGiven === opt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: formData.sampleGiven === opt ? 'var(--color-primary)' : 'transparent',
                    color: formData.sampleGiven === opt ? '#fff' : 'var(--color-text-secondary)',
                    fontWeight: '600'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 4. FOLLOW UP */}
          {(formData.interestLevel === 'Follow Up' || formData.interestLevel === 'Interested') && (
            <div className="follow-up-date">
              <div className="form-group">
                <label>Follow Up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  style={{ background: '#fff', color: '#000' }} // Force white bg for date picker visibility
                />
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="form-actions" style={{ marginTop: 'var(--spacing-lg)' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
              style={{ width: '100%', padding: '16px', fontSize: 'var(--font-size-md)' }}
            >
              {isSaving ? 'Saving...' : 'LOG VISIT & UPDATE'}
            </button>
          </div>

          {/* DANGER ZONE / MANAGE */}
          <div style={{ marginTop: '30px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '10px', fontSize: '12px', textTransform: 'uppercase' }}>
              Manage Location
            </h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleArchive}
                disabled={isSaving}
                className="btn btn-secondary"
                style={{ flex: 1, borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
              >
                Archive
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="btn btn-secondary"
                style={{ flex: 1, borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </form>

        {/* VISIT HISTORY (Collapsible/Scrollable) */}
        {
          location.visitHistory && location.visitHistory.length > 0 && (
            <div className="visit-history">
              <h3>History ({location.visitHistory.length})</h3>
              {location.visitHistory.slice(0, 3).map((visit, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-date">
                    {new Date(visit.timestamp).toLocaleDateString()} - <span style={{ color: 'var(--color-text-main)' }}>{visit.visitorEmail}</span>
                  </div>
                  <div className="history-details">{visit.notes}</div>
                </div>
              ))}
            </div>
          )
        }
      </div >
    </div >
  );
};

export default LocationPanel;