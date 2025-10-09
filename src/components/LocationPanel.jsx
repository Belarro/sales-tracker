// ============================================
// LOCATION PANEL COMPONENT
// ============================================
// Slide-up panel for viewing and editing location details

import { useState, useEffect } from 'react';
import { CONFIG } from '../config.js';
import { calculateFollowUpDate, formatDate } from '../utils/dateUtils.js';
import { saveLocationData, getLocationHistory } from '../utils/googleSheets.js';

const LocationPanel = ({ location, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    locationName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    contactPerson: '',
    contactTitle: '',
    directPhone: '',
    directEmail: '',
    businessTypes: '',
    interestLevel: '',
    visitNotes: '',
    followUpDate: calculateFollowUpDate(CONFIG.FOLLOW_UP_DAYS)
  });

  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [notesCharCount, setNotesCharCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (location) {
      setFormData({
        locationName: location.name || '',
        businessAddress: location.address || '',
        businessPhone: location.phone || '',
        businessEmail: '',
        businessWebsite: location.website || '',
        contactPerson: '',
        contactTitle: '',
        directPhone: '',
        directEmail: '',
        businessTypes: '',
        interestLevel: '',
        visitNotes: '',
        followUpDate: calculateFollowUpDate(CONFIG.FOLLOW_UP_DAYS)
      });

      // Load visit history
      loadVisitHistory(location.name, location.address);
    }
  }, [location]);

  const loadVisitHistory = async (name, address) => {
    try {
      const history = await getLocationHistory(name, address);
      setVisitHistory(history);
    } catch (error) {
      console.error('Error loading visit history:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Track character count for visit notes
    if (name === 'visitNotes') {
      setNotesCharCount(value.length);
    }

    // Mark form as dirty if user enters data in key fields
    if (['contactPerson', 'contactTitle', 'visitNotes'].includes(name) && value.trim()) {
      setHasUnsavedChanges(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const success = await saveLocationData(formData, user.email);

      if (success) {
        setMessage({ type: 'success', text: '✅ Visit saved successfully!' });
        setHasUnsavedChanges(false); // Clear dirty flag
        // Reload visit history
        await loadVisitHistory(formData.locationName, formData.businessAddress);
        // Notify parent to refresh map
        if (onSave) onSave();

        // Clear the notes fields after saving
        setFormData(prev => ({
          ...prev,
          contactPerson: '',
          contactTitle: '',
          directPhone: '',
          directEmail: '',
          visitNotes: '',
          followUpDate: calculateFollowUpDate(CONFIG.FOLLOW_UP_DAYS)
        }));
        setNotesCharCount(0); // Reset character count
      } else {
        setMessage({ type: 'error', text: 'Failed to save visit. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      const errorMessage = error.message || 'An error occurred. Please try again.';
      setMessage({ type: 'error', text: `❌ ${errorMessage}` });
    }

    setLoading(false);
  };

  const handleCloseWithWarning = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleTouchStart = (e) => {
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setDragCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const dragDistance = dragCurrentY - dragStartY;

    // If dragged down more than 100px, close panel
    if (dragDistance > 100) {
      onClose();
    }

    setIsDragging(false);
    setDragStartY(0);
    setDragCurrentY(0);
  };

  if (!location) return null;

  return (
    <div className="location-panel open">
      <div
        className="panel-handle"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: 'grab' }}
      ></div>
      <div className="panel-content">
        <div className="panel-header">
          <button className="close-panel" onClick={handleCloseWithWarning}>×</button>
          <h2>{formData.locationName}</h2>
        </div>

        {message.text && (
          <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </div>
        )}

        <div className="location-details">
          <div className="detail-row">
            <span className="detail-label">Business Name:</span>
            <span className="detail-value">{formData.locationName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address:</span>
            <span className="detail-value">{formData.businessAddress}</span>
          </div>
          {formData.businessPhone && (
            <div className="detail-row">
              <span className="detail-label">Business Phone:</span>
              <span className="detail-value">
                <a href={`tel:${formData.businessPhone}`}>{formData.businessPhone}</a>
              </span>
            </div>
          )}
          {formData.businessWebsite && (
            <div className="detail-row">
              <span className="detail-label">Website:</span>
              <span className="detail-value">
                <a href={formData.businessWebsite} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </span>
            </div>
          )}
          {location.googleMapsUrl && (
            <div className="detail-row">
              <span className="detail-label">Google Maps:</span>
              <span className="detail-value">
                <a href={location.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                </a>
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="visit-form">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Add Visit Notes</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Person *</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Title *</label>
              <input
                type="text"
                name="contactTitle"
                value={formData.contactTitle}
                onChange={handleChange}
                required
                placeholder="e.g., Manager, Owner"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Direct Phone</label>
              <input
                type="tel"
                name="directPhone"
                value={formData.directPhone}
                onChange={handleChange}
                placeholder="Contact's phone number"
              />
            </div>
            <div className="form-group">
              <label>Direct Email</label>
              <input
                type="email"
                name="directEmail"
                value={formData.directEmail}
                onChange={handleChange}
                placeholder="Contact's email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Business Type *</label>
            <select
              name="businessTypes"
              value={formData.businessTypes}
              onChange={handleChange}
              required
            >
              <option value="">Select business type</option>
              {CONFIG.BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Interest Level *</label>
            <select
              name="interestLevel"
              value={formData.interestLevel}
              onChange={handleChange}
              required
            >
              <option value="">Select interest level</option>
              {CONFIG.INTEREST_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Visit Notes *
              <span style={{
                fontSize: '12px',
                fontWeight: 'normal',
                color: '#666',
                marginLeft: '8px'
              }}>
                ({notesCharCount} characters)
              </span>
            </label>
            <textarea
              name="visitNotes"
              value={formData.visitNotes}
              onChange={handleChange}
              required
              placeholder="Add notes about your visit, what you discussed, etc."
              style={{
                minHeight: '150px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Tip: Include details about the conversation, menu items discussed, pricing, and next steps.
            </small>
          </div>

          <div className="follow-up-date">
            <strong>Follow-up Date:</strong> {formatDate(formData.followUpDate)}
            <br />
            <small>(Automatically set to {CONFIG.FOLLOW_UP_DAYS} business days ahead)</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCloseWithWarning} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Visit'}
            </button>
          </div>
        </form>

        {visitHistory.length > 0 && (
          <div className="visit-history">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              style={{
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px 16px',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                marginBottom: showHistory ? '15px' : '0'
              }}
            >
              <span>Visit History ({visitHistory.length} visit{visitHistory.length !== 1 ? 's' : ''})</span>
              <span style={{ fontSize: '20px' }}>{showHistory ? '▼' : '▶'}</span>
            </button>

            {showHistory && (
              <div>
                {visitHistory.map((visit, index) => (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      {formatDate(visit.timestamp.split('T')[0])} - {visit.salesRep}
                    </div>
                    <div className="history-details">
                      <strong>Contact:</strong> {visit.contactPerson} ({visit.contactTitle})<br />
                      <strong>Interest Level:</strong> {visit.interestLevel}<br />
                      <strong>Business Type:</strong> {visit.businessTypes}<br />
                      <strong>Notes:</strong> {visit.visitNotes}<br />
                      {visit.followUpDate && (
                        <>
                          <strong>Follow-up Date:</strong> {formatDate(visit.followUpDate)}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPanel;