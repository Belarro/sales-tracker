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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const success = await saveLocationData(formData, user.email);

      if (success) {
        setMessage({ type: 'success', text: 'Visit saved successfully!' });
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
      } else {
        setMessage({ type: 'error', text: 'Failed to save visit. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }

    setLoading(false);
  };

  if (!location) return null;

  return (
    <div className="location-panel open">
      <div className="panel-handle"></div>
      <div className="panel-content">
        <div className="panel-header">
          <h2>{formData.locationName}</h2>
          <button className="close-panel" onClick={onClose}>×</button>
        </div>

        {message.text && (
          <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </div>
        )}

        <div className="location-details">
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
            <label>Visit Notes *</label>
            <textarea
              name="visitNotes"
              value={formData.visitNotes}
              onChange={handleChange}
              required
              placeholder="Add notes about your visit, what you discussed, etc."
            />
          </div>

          <div className="follow-up-date">
            <strong>Follow-up Date:</strong> {formatDate(formData.followUpDate)}
            <br />
            <small>(Automatically set to {CONFIG.FOLLOW_UP_DAYS} business days ahead)</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Visit'}
            </button>
          </div>
        </form>

        {visitHistory.length > 0 && (
          <div className="visit-history">
            <h3>Visit History ({visitHistory.length} visit{visitHistory.length !== 1 ? 's' : ''})</h3>
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
    </div>
  );
};

export default LocationPanel;