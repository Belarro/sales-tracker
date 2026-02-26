// ============================================
// LOCATION PANEL — Single scrollable form
// Flow: Details (contact info) → Log (outcome, notes, sample)
// Pipeline columns are auto-set behind the scenes, not shown to user
// ============================================

import { useState, useEffect } from 'react';
import { CONFIG } from '../config.js';
import { saveLocationData, archiveLocation, deleteLocation, getNoteTemplates, addNoteTemplate } from '../utils/googleSheets.js';
import { calculateNextActionDate } from '../utils/dateUtils.js';

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
    visitNotes: ''
  });
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [noteTemplates, setNoteTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await getNoteTemplates();
      setNoteTemplates(templates);
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    if (location) {
      setFormData({
        contactPerson: location.contactPerson || '',
        contactTitle: location.contactTitle || '',
        email: location.directEmail || location.businessEmail || '',
        phone: location.directPhone || location.businessPhone || '',
        businessTypes: location.businessTypes || '',
        businessWebsite: location.businessWebsite || '',
        interestLevel: location.interestLevel || '',
        sampleGiven: location.sampleGiven || 'NO',
        visitNotes: ''
      });
      setFollowUpDate('');
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

  const handleFollowUpPreset = (days) => {
    setFollowUpDate(calculateNextActionDate(days));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.interestLevel) {
      setSaveMessage({ type: 'error', text: 'Please select an outcome' });
      return;
    }

    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });

    try {
      // Auto-set pipeline stage based on outcome
      let pipelineStage = location.pipelineStage || CONFIG.PIPELINE_STAGES.NEW_VISIT;
      if (formData.interestLevel === 'Closed Deal') {
        pipelineStage = CONFIG.PIPELINE_STAGES.CLOSED_WON;
      } else if (formData.interestLevel === 'Not Interested') {
        pipelineStage = CONFIG.PIPELINE_STAGES.CLOSED_LOST;
      }

      // Auto-increment follow-up count if there was a previous follow-up
      const prevCount = parseInt(location.followUpCount) || 0;
      const newCount = location.nextActionDate ? prevCount + 1 : prevCount;

      // Build directLink with precise coordinates if available
      let directLink = location.directLink || '';
      if (location.lat && location.lng && !directLink.match(/^-?\d+\.\d+,-?\d+\.\d+/)) {
        // Store as "LAT,LNG|PLACE_ID" for precise marker placement
        directLink = `${location.lat},${location.lng}`;
        if (location.placeId) directLink += `|${location.placeId}`;
      }

      const checkInData = {
        ...location,
        ...formData,
        directLink: directLink,
        directPhone: formData.phone,
        directEmail: formData.email,
        businessTypes: formData.businessTypes,
        businessWebsite: formData.businessWebsite,
        // Pipeline fields — auto-set, not manual
        pipelineStage: pipelineStage,
        followUpCount: String(newCount),
        lastFollowUpDate: location.lastFollowUpDate || '',
        nextActionDate: followUpDate,
        nextActionType: followUpDate ? 'physical_visit' : '',
        automationStatus: followUpDate ? 'pending' : '',
        materialsSent: location.materialsSent || '',
        notesInternal: location.notesInternal || '',
        locationName: location.locationName,
        businessAddress: location.businessAddress,
        timestamp: undefined
      };

      const success = await saveLocationData(checkInData, user.name, user.email);

      if (success) {
        setSaveMessage({ type: 'success', text: 'Visit logged' });
        setTimeout(() => { onSave(); onClose(); }, 1200);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save. Try again.' });
      }
    } catch (error) {
      console.error(error);
      setSaveMessage({ type: 'error', text: 'Error saving data.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive this location? It will be hidden from the map and list.')) return;
    setIsSaving(true);
    try {
      const success = await archiveLocation(location.locationName, location.businessAddress);
      if (success) {
        setSaveMessage({ type: 'success', text: 'Archived' });
        setTimeout(() => { onSave(); onClose(); }, 1000);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to archive.' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('PERMANENTLY DELETE this location? This cannot be undone.')) return;
    setIsSaving(true);
    try {
      const success = await deleteLocation(location.locationName, location.businessAddress);
      if (success) {
        setSaveMessage({ type: 'success', text: 'Deleted' });
        setTimeout(() => { onSave(); onClose(); }, 1000);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to delete.' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!location) return null;

  const outcomeColors = {
    'Interested': '#059669',
    'Not Interested': '#dc2626',
    'Closed Deal': '#059669',
    'Follow Up': '#d97706',
    'Pending': '#6b7280'
  };

  const showFollowUp = formData.interestLevel === 'Follow Up' || formData.interestLevel === 'Interested';

  return (
    <div className="location-panel open">
      <div className="panel-content">
        {/* HEADER */}
        <div className="panel-header">
          <div style={{ minWidth: 0 }}>
            <h2>{location.locationName}</h2>
            <div style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              marginTop: '2px'
            }}>
              {location.businessAddress}
            </div>
          </div>
          <button className="close-panel" onClick={onClose}>×</button>
        </div>

        {/* FEEDBACK */}
        {saveMessage.text && (
          <div className={`message ${saveMessage.type === 'error' ? 'error-message' : 'success-message'}`}>
            {saveMessage.text}
          </div>
        )}

        {/* SINGLE SCROLLABLE FORM */}
        <form onSubmit={handleSubmit}>

          {/* ===== SECTION: DETAILS ===== */}
          <div style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--spacing-sm)'
          }}>
            Contact Details
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label>Title / Role</label>
              <input
                type="text"
                name="contactTitle"
                value={formData.contactTitle}
                onChange={handleChange}
                placeholder="Owner, Manager..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Business Type</label>
              <select
                name="businessTypes"
                value={formData.businessTypes}
                onChange={handleChange}
              >
                <option value="">Select type...</option>
                {CONFIG.BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="businessWebsite"
                value={formData.businessWebsite}
                onChange={handleChange}
                placeholder="www.example.com"
              />
            </div>
          </div>

          {/* ===== DIVIDER ===== */}
          <div style={{
            borderTop: '1px solid var(--color-border)',
            margin: 'var(--spacing-md) 0',
          }} />

          {/* ===== SECTION: LOG VISIT ===== */}
          <div style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--spacing-sm)'
          }}>
            Log Visit
          </div>

          {/* Outcome */}
          <div className="form-group">
            <label>Outcome</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
              {CONFIG.INTEREST_LEVELS.map(level => {
                const isActive = formData.interestLevel === level;
                const activeColor = outcomeColors[level] || 'var(--color-primary)';

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setInterest(level)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--border-radius-md)',
                      border: `1.5px solid ${isActive ? activeColor : 'var(--color-border)'}`,
                      background: isActive ? activeColor : 'var(--color-bg-main)',
                      color: isActive ? '#fff' : 'var(--color-text-secondary)',
                      fontWeight: '600',
                      fontSize: 'var(--font-size-sm)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            {noteTemplates.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: 'var(--spacing-sm)'
              }}>
                {noteTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      visitNotes: prev.visitNotes ? prev.visitNotes + ' ' + template : template
                    }))}
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: 'var(--border-radius-full)',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
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
              placeholder="What happened? Key takeaways?"
              rows="3"
            />
            {formData.visitNotes && !noteTemplates.includes(formData.visitNotes) && (
              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Save this as a reusable template?')) {
                      const success = await addNoteTemplate(formData.visitNotes);
                      if (success) {
                        setNoteTemplates(prev => [...prev, formData.visitNotes]);
                      }
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Save as template
                </button>
              </div>
            )}
          </div>

          {/* Sample Given */}
          <div className="form-group">
            <label>Sample Given?</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {['YES', 'NO'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sampleGiven: opt }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--border-radius-md)',
                    border: `1.5px solid ${formData.sampleGiven === opt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: formData.sampleGiven === opt ? 'var(--color-primary)' : 'var(--color-bg-main)',
                    color: formData.sampleGiven === opt ? '#fff' : 'var(--color-text-muted)',
                    fontWeight: '600',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up scheduling (shown for Follow Up / Interested) */}
          {showFollowUp && (
            <div className="form-group">
              <label>Schedule Follow-Up</label>
              <div className="action-preset-row">
                {CONFIG.FOLLOW_UP_PRESETS.map(preset => (
                  <button
                    key={preset.days}
                    type="button"
                    className={`action-preset-btn ${followUpDate === calculateNextActionDate(preset.days) ? 'selected' : ''}`}
                    onClick={() => handleFollowUpPreset(preset.days)}
                  >
                    {preset.label}
                  </button>
                ))}
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  style={{
                    background: 'var(--color-bg-input)',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '8px 10px',
                    fontSize: 'var(--font-size-sm)'
                  }}
                />
              </div>
              {followUpDate && (
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-success)',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  Follow-up: {followUpDate}
                </div>
              )}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 'var(--font-size-md)',
              fontWeight: '700',
              marginTop: 'var(--spacing-md)'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Visit'}
          </button>
        </form>

        {/* ===== VISIT HISTORY ===== */}
        {location.visitHistory && location.visitHistory.length > 0 && (
          <div className="visit-history">
            <h3>Visit History ({location.visitHistory.length})</h3>
            {location.visitHistory.slice(0, 5).map((visit, idx) => (
              <div key={idx} className="history-item">
                <div className="history-date">
                  {new Date(visit.timestamp).toLocaleDateString()} — {visit.visitorEmail}
                </div>
                {visit.notes && <div className="history-details">{visit.notes}</div>}
              </div>
            ))}
          </div>
        )}

        {/* ===== MANAGE ===== */}
        <div style={{
          marginTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--spacing-md)'
        }}>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--spacing-sm)'
          }}>
            Manage
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              type="button"
              onClick={handleArchive}
              disabled={isSaving}
              className="btn btn-secondary"
              style={{ flex: 1, color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
            >
              Archive
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPanel;
