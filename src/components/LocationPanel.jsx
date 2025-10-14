// ============================================
// LOCATION PANEL COMPONENT
// ============================================
// Slide-up panel for viewing and editing location details

import { useState, useEffect } from 'react';
import { CONFIG } from '../config.js';
import { calculateFollowUpDate, formatDate } from '../utils/dateUtils.js';
import { saveLocationData, getLocationHistory, checkLocationExists, archiveLocation, deleteLocation } from '../utils/googleSheets.js';

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
  const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);
  const [existingNotes, setExistingNotes] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isRevisit, setIsRevisit] = useState(false);
  const [needsFollowUp, setNeedsFollowUp] = useState(true);
  const [showCustomBusinessType, setShowCustomBusinessType] = useState(false);
  const [customBusinessType, setCustomBusinessType] = useState('');

  useEffect(() => {
    if (location) {
      // Load visit history first
      loadVisitHistory(location.name, location.address);
      loadExistingData(location.name, location.address);
    }
  }, [location]);

  const loadExistingData = async (name, address) => {
    try {
      const existingLocation = await checkLocationExists(name, address);

      if (existingLocation) {
        // Location was visited before
        setIsRevisit(true);
        setFormData({
          locationName: name,
          businessAddress: address,
          businessPhone: existingLocation.businessPhone || location.phone || '',
          businessEmail: existingLocation.businessEmail || '',
          businessWebsite: existingLocation.businessWebsite || location.website || '',
          contactPerson: existingLocation.contactPerson || '',
          contactTitle: existingLocation.contactTitle || '',
          directPhone: existingLocation.directPhone || '',
          directEmail: existingLocation.directEmail || '',
          businessTypes: existingLocation.businessTypes || '',
          interestLevel: existingLocation.interestLevel || '',
          visitNotes: '',
          followUpDate: existingLocation.followUpDate || calculateFollowUpDate(CONFIG.FOLLOW_UP_DAYS)
        });
        setExistingNotes(existingLocation.visitNotes || '');
      } else {
        // First visit
        setIsRevisit(false);
        setFormData({
          locationName: name,
          businessAddress: address,
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
        setExistingNotes('');
      }
      setNewNotes('');
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

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

    // Handle "Other" selection for business type
    if (name === 'businessTypes' && value === 'Other') {
      setShowCustomBusinessType(true);
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set follow-up checkbox based on interest level
    if (name === 'interestLevel') {
      if (value === 'Not Interested' || value === 'Closed Deal') {
        setNeedsFollowUp(false);
      } else if (value === 'Interested' || value === 'Follow Up' || value === 'Pending') {
        setNeedsFollowUp(true);
      }
    }

    // Mark form as dirty if user enters data in key fields
    if (['contactPerson', 'contactTitle', 'visitNotes'].includes(name) && value.trim()) {
      setHasUnsavedChanges(true);
    }
  };

  const handleNewNotesChange = (e) => {
    setNewNotes(e.target.value);
    setNotesCharCount(e.target.value.length);
    if (e.target.value.trim()) {
      setHasUnsavedChanges(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Generate date stamp in format [09-10-25]
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const dateStamp = `[${day}-${month}-${year}]`;

      // Combine notes: existing + new with date stamp
      let combinedNotes = '';
      if (isRevisit && existingNotes) {
        // Append new notes to existing
        combinedNotes = existingNotes + '\n\n' + dateStamp + ' ' + newNotes;
      } else {
        // First visit
        combinedNotes = dateStamp + ' ' + (newNotes || formData.visitNotes);
      }

      // Save Google Maps URL with coordinates embedded for both clicking and markers
      let directLink = '';
      if (location.lat && location.lng) {
        // Best: Create Google Maps URL with coordinates
        // Format: https://www.google.com/maps/@LAT,LNG,17z
        directLink = `https://www.google.com/maps/@${location.lat},${location.lng},17z`;
      } else if (location.googleMapsUrl) {
        // Use the Google Maps URL from the place data
        directLink = location.googleMapsUrl;
      } else if (location.placeId) {
        // Create URL from Place ID
        directLink = `https://www.google.com/maps/place/?q=place_id:${location.placeId}`;
      } else {
        // Last resort: search by address
        directLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.businessAddress)}`;
      }

      const dataToSave = {
        ...formData,
        visitNotes: combinedNotes,
        directLink,
        followUpDate: needsFollowUp ? formData.followUpDate : ''
      };

      const success = await saveLocationData(dataToSave, user.name, user.email);

      if (success) {
        setMessage({ type: 'success', text: '✅ Visit saved successfully! Closing panel in 2 seconds...' });
        setHasUnsavedChanges(false);

        // Reload the data to show updated info
        await loadExistingData(formData.locationName, formData.businessAddress);
        await loadVisitHistory(formData.locationName, formData.businessAddress);

        // Notify parent to refresh map
        if (onSave) onSave();

        // Clear only the new notes field
        setNewNotes('');
        setNotesCharCount(0);

        // Auto-scroll to top to see the success message
        const panelContent = document.querySelector('.panel-content');
        if (panelContent) {
          panelContent.scrollTop = 0;
        }

        // Auto-close panel after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: '❌ Failed to save visit. Please try again.' });
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

  const handleArchive = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${formData.locationName}"?\n\n` +
      'This location will be hidden from the map but can be unarchived later from the Google Sheet.'
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const success = await archiveLocation(formData.locationName, formData.businessAddress);

      if (success) {
        setMessage({ type: 'success', text: '✅ Location archived successfully!' });

        // Wait a moment to show the success message
        setTimeout(() => {
          if (onSave) onSave(); // Refresh the map
          onClose(); // Close the panel
        }, 1500);
      } else {
        setMessage({ type: 'error', text: '❌ Failed to archive location. Please try again.' });
      }
    } catch (error) {
      console.error('Error archiving location:', error);
      setMessage({ type: 'error', text: '❌ An error occurred. Please try again.' });
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `⚠️ PERMANENTLY DELETE "${formData.locationName}"?\n\n` +
      'This will remove the location from the Data sheet.\n' +
      'Visit history will be preserved.\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure?'
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const success = await deleteLocation(formData.locationName, formData.businessAddress);

      if (success) {
        setMessage({ type: 'success', text: '✅ Location deleted successfully!' });

        // Wait a moment to show the success message
        setTimeout(() => {
          if (onSave) onSave(); // Refresh the map
          onClose(); // Close the panel
        }, 1500);
      } else {
        setMessage({ type: 'error', text: '❌ Failed to delete location. Please try again.' });
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      setMessage({ type: 'error', text: '❌ An error occurred. Please try again.' });
    }

    setLoading(false);
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
          {(location.googleMapsUrl || location.placeId || formData.directLink) && (
            <div className="detail-row">
              <span className="detail-label">📍 Location Link:</span>
              <span className="detail-value">
                <a
                  href={
                    location.googleMapsUrl ||
                    (formData.directLink && formData.directLink.startsWith('http') ? formData.directLink : null) ||
                    (formData.directLink && formData.directLink.startsWith('ChIJ') ? `https://www.google.com/maps/place/?q=place_id:${formData.directLink}` : null) ||
                    (location.placeId ? `https://www.google.com/maps/place/?q=place_id:${location.placeId}` : null) ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.businessAddress)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1a73e8',
                    fontWeight: '600',
                    textDecoration: 'none',
                    padding: '4px 12px',
                    background: '#e3f2fd',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '13px'
                  }}
                >
                  🗺️ Open in Google Maps
                </a>
              </span>
            </div>
          )}
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
        </div>

        <form onSubmit={handleSubmit} className="visit-form">
          {isRevisit && (
            <div style={{
              background: '#e3f2fd',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '2px solid #1976d2'
            }}>
              <h4 style={{ color: '#1976d2', marginBottom: '8px', fontSize: '16px' }}>
                📍 Previously Visited Location
              </h4>
              <div style={{ fontSize: '14px', color: '#555' }}>
                <strong>Visit Count:</strong> {visitHistory.length} visit{visitHistory.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          <h3 style={{ marginBottom: '15px', color: '#333' }}>
            {isRevisit ? 'Update Visit Information' : 'Add Visit Notes'}
          </h3>

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
            {!showCustomBusinessType ? (
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
                <option value="Other">Other (Custom)</option>
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  value={customBusinessType}
                  onChange={(e) => setCustomBusinessType(e.target.value)}
                  placeholder="Enter custom business type"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (customBusinessType.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          businessTypes: customBusinessType.trim()
                        }));
                        setShowCustomBusinessType(false);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ✓ Use This Type
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomBusinessType(false);
                      setCustomBusinessType('');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '12px' }}>
                  This new type will be saved with this location
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Interest Level *</label>
            <select
              name="interestLevel"
              value={formData.interestLevel}
              onChange={handleChange}
              required
              className={`interest-level-select ${formData.interestLevel ? `interest-${formData.interestLevel.toLowerCase().replace(/ /g, '-')}` : ''}`}
            >
              <option value="">Select interest level</option>
              {CONFIG.INTEREST_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{
            background: '#f0f7ff',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #b3d9ff'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '0' }}>
              <input
                type="checkbox"
                checked={needsFollowUp}
                onChange={(e) => setNeedsFollowUp(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>
                Schedule follow-up visit?
              </span>
            </label>
            <small style={{ color: '#555', fontSize: '12px', marginLeft: '28px', display: 'block', marginTop: '4px' }}>
              {needsFollowUp
                ? '✓ Follow-up will be scheduled for ' + CONFIG.FOLLOW_UP_DAYS + ' business days ahead'
                : '✗ No follow-up will be scheduled for this visit'
              }
            </small>
          </div>

          {isRevisit && existingNotes && (
            <div className="form-group">
              <label style={{ color: '#1976d2', fontWeight: '600' }}>
                📝 Previous Notes (Read-Only)
              </label>
              <div style={{
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                maxHeight: '200px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333'
              }}>
                {existingNotes}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>
              {isRevisit ? 'Add New Notes *' : 'Visit Notes *'}
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
              value={isRevisit ? newNotes : formData.visitNotes}
              onChange={isRevisit ? handleNewNotesChange : handleChange}
              name={isRevisit ? 'newNotes' : 'visitNotes'}
              required
              placeholder={isRevisit ? 'Add new notes about this visit...' : 'Add notes about your visit, what you discussed, etc.'}
              style={{
                minHeight: '150px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {isRevisit
                ? 'Your new notes will be added with today\'s date [' + new Date().toLocaleDateString('en-GB').slice(0, -2) + String(new Date().getFullYear()).slice(-2) + ']'
                : 'Tip: Include details about the conversation, menu items discussed, pricing, and next steps.'
              }
            </small>
          </div>

          {needsFollowUp && (
            <div className="follow-up-date">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Follow-up Date:</strong> {formatDate(formData.followUpDate)}
                  {!isEditingFollowUp && (
                    <>
                      <br />
                      <small>(Automatically set to {CONFIG.FOLLOW_UP_DAYS} business days ahead)</small>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingFollowUp(!isEditingFollowUp)}
                  style={{
                    background: '#2e7d32',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {isEditingFollowUp ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {isEditingFollowUp && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="date"
                    value={formData.followUpDate.split('-').reverse().join('-')}
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split('-');
                      setFormData(prev => ({
                        ...prev,
                        followUpDate: `${day}-${month}-${year}`
                      }));
                      setIsEditingFollowUp(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '14px',
                      border: '1px solid #2e7d32',
                      borderRadius: '4px',
                      marginTop: '5px'
                    }}
                  />
                  <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    Select a new follow-up date
                  </small>
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleCloseWithWarning} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isRevisit ? 'Update Visit' : 'Save Visit')}
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

        {isRevisit && (
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '2px solid #ddd'
          }}>
            <button
              type="button"
              onClick={handleArchive}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#f57c00',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              📦 Archive this location
            </button>
            <small style={{
              display: 'block',
              marginTop: '8px',
              color: '#666',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              Archived locations are hidden from the map but remain in the Google Sheet
            </small>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '12px'
              }}
            >
              🗑️ Delete this location
            </button>
            <small style={{
              display: 'block',
              marginTop: '8px',
              color: '#d32f2f',
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              ⚠️ Permanent deletion - cannot be undone!
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPanel;