// ============================================
// LOCATION PANEL — Single scrollable form
// Flow: Details (contact info) → Log (outcome, notes, sample)
// Pipeline columns are auto-set behind the scenes, not shown to user
// ============================================

import { useState, useEffect } from 'react';
import { CONFIG } from '../config.js';
import { saveLocationData, archiveLocation, deleteLocation, getNoteTemplates, addNoteTemplate, updatePipelineData } from '../utils/googleSheets.js';
import { calculateNextActionDate } from '../utils/dateUtils.js';
import { MANUAL_COLOR_OPTIONS, getPinColor, getColorLabel } from '../utils/colorUtils.js';
import { getFollowUpMessage, getStageLabel } from '../utils/followUpTemplates.js';

/**
 * Generate a vCard (.vcf) and trigger Android "Add Contact" dialog.
 * Includes CATEGORIES and X-ANDROID-CUSTOM for "Belarro" group assignment.
 */
function saveToContacts({ contactPerson, contactTitle, phone, email, locationName }) {
  const [firstName, ...lastParts] = (contactPerson || '').trim().split(/\s+/);
  const lastName = lastParts.join(' ');
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName || ''};${firstName || ''};;;`,
    `FN:${contactPerson || ''}`,
    contactTitle ? `TITLE:${contactTitle}` : '',
    locationName ? `ORG:${locationName}` : '',
    phone ? `TEL;TYPE=CELL:${phone}` : '',
    email ? `EMAIL;TYPE=WORK:${email}` : '',
    'CATEGORIES:Belarro',
    'X-ANDROID-CUSTOM:vnd.android.cursor.item/group_membership;Belarro;;;;;;;;;;;;;',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(contactPerson || 'contact').replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Split a full phone string like "+4915157431078" into { code: '+49', number: '15157431078' }
const KNOWN_CODES = ['+972', '+44', '+43', '+49', '+1'];
function splitPhone(full) {
  if (!full) return { code: '+49', number: '' };
  // Strip spaces
  full = full.replace(/\s/g, '');
  for (const c of KNOWN_CODES) {
    if (full.startsWith(c)) {
      let number = full.slice(c.length);
      // Fix double country code (e.g. +49 49 15906442264 → strip the extra 49)
      const digits = c.replace('+', '');
      if (number.startsWith(digits)) {
        number = number.slice(digits.length);
      }
      // Strip leading zeros (e.g. +49 0159... → 159...)
      number = number.replace(/^0+/, '');
      return { code: c, number };
    }
  }
  // No known code found — default to +49, strip leading + and zeros
  let number = full.replace(/^\+/, '').replace(/^0+/, '');
  return { code: '+49', number };
}

const LocationPanel = ({ location, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    contactPerson: '',
    contactTitle: '',
    email: '',
    businessTypes: '',
    businessWebsite: '',
    interestLevel: '',
    sampleGiven: 'NO',
    visitNotes: '',
    pinColor: '',
    language: ''
  });
  const [phoneCode, setPhoneCode] = useState('+49');
  const [phoneNumber, setPhoneNumber] = useState('');
  // Full phone = code + number (only when number exists)
  const fullPhone = phoneNumber ? phoneCode + phoneNumber : '';
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [showFollowUpPreview, setShowFollowUpPreview] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState(null);
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

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
        email: location.directEmail || '',
        businessTypes: location.businessTypes || '',
        businessWebsite: location.businessWebsite || '',
        interestLevel: location.interestLevel || 'Follow Up',
        sampleGiven: location.sampleGiven || 'NO',
        visitNotes: '',
        pinColor: location.pinColor || '',
        language: location.language || ''
      });
      const { code, number } = splitPhone(location.directPhone || '');
      setPhoneCode(code);
      setPhoneNumber(number);
      // Default follow-up to 1 week if outcome is Follow Up or Interested
      const interest = location.interestLevel || 'Follow Up';
      if (interest === 'Follow Up' || interest === 'Interested') {
        setFollowUpDate(calculateNextActionDate(7));
      } else {
        setFollowUpDate('');
      }
      setSaveMessage({ type: '', text: '' });
      setSavedSuccessfully(false);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setInterest = (level) => {
    setFormData(prev => ({ ...prev, interestLevel: level }));
    // Auto-set a default follow-up date when Follow Up or Interested is selected
    if ((level === 'Follow Up' || level === 'Interested') && !followUpDate) {
      setFollowUpDate(calculateNextActionDate(7)); // Default: 1 week
    }
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
        directPhone: fullPhone,
        directEmail: formData.email,
        businessTypes: formData.businessTypes,
        businessWebsite: formData.businessWebsite,
        followUpDate: followUpDate,
        pipelineStage: pipelineStage,
        followUpCount: String(newCount),
        lastFollowUpDate: location.lastFollowUpDate || '',
        nextActionDate: followUpDate,
        nextActionType: followUpDate ? 'physical_visit' : '',
        automationStatus: followUpDate ? 'pending' : '',
        materialsSent: location.materialsSent || '',
        notesInternal: location.notesInternal || '',
        language: formData.language,
        locationName: location.locationName,
        businessAddress: location.businessAddress,
        timestamp: undefined
      };

      const success = await saveLocationData(checkInData, user.name, user.email);

      if (success) {
        setSaveMessage({ type: 'success', text: 'Visit logged' });
        setSavedSuccessfully(true);
        onSave(); // Refresh the locations list
        setTimeout(() => { onClose(); }, 1200);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save. Try again.' });
      }
    } catch (error) {
      console.error('Save error details:', error);
      const apiError = error?.result?.error;
      let msg = 'Error saving data. Check your connection and try again.';
      if (error.message?.includes('session has expired')) {
        msg = 'Session expired. Please sign out and sign back in.';
      } else if (apiError) {
        msg = `API Error ${apiError.code}: ${apiError.message}`;
      } else if (error.message) {
        msg = error.message;
      }
      setSaveMessage({ type: 'error', text: msg });
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
    'Interested': '#2196F3',
    'Not Interested': '#f44336',
    'Closed Deal': '#4caf50',
    'Follow Up': '#ffc107',
    'Pending': '#9e9e9e'
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
            {/* Status indicator — color dot + label */}
            {(() => {
              const pinColor = getPinColor(location);
              const label = getColorLabel(pinColor);
              return (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--border-radius-full)',
                  background: `${pinColor}25`,
                  border: `1.5px solid ${pinColor}60`,
                }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: pinColor,
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                  <span style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '700',
                    color: 'var(--color-text-main)',
                  }}>
                    {label}
                  </span>
                </div>
              );
            })()}
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
              <select
                name="contactTitle"
                value={formData.contactTitle}
                onChange={handleChange}
              >
                <option value="">Select role...</option>
                {CONFIG.CONTACT_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                style={{
                  width: '58px',
                  minWidth: '58px',
                  padding: '9px 2px',
                  textAlign: 'center',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRight: 'none',
                  borderRadius: 'var(--border-radius-md) 0 0 var(--border-radius-md)',
                  color: 'var(--color-text-main)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  flexShrink: 0
                }}
              >
                <option value="+49">+49</option>
                <option value="+43">+43</option>
                <option value="+44">+44</option>
                <option value="+1">+1</option>
                <option value="+972">+972</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^\d]/g, '');
                  val = val.replace(/^0+/, '');
                  setPhoneNumber(val);
                }}
                placeholder="15906442264"
                style={{
                  borderRadius: '0 var(--border-radius-md) var(--border-radius-md) 0',
                  flex: 1,
                  ...(phoneNumber.length > 0 && phoneNumber.length < 8
                      ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' }
                      : {})
                }}
              />
              {phoneNumber.length > 0 && phoneNumber.length < 8 && (
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontWeight: '600',
                  pointerEvents: 'none'
                }}>
                  Too short
                </div>
              )}
            </div>
            {fullPhone && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                Sending to: {fullPhone}
              </div>
            )}
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

          {/* Save to Contacts — shown when there's a name + phone */}
          {formData.contactPerson && fullPhone && (
            <button
              type="button"
              onClick={() => saveToContacts({
                contactPerson: formData.contactPerson,
                contactTitle: formData.contactTitle,
                phone: fullPhone,
                email: formData.email,
                locationName: location.locationName
              })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: 'var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                border: '1.5px solid var(--color-primary)',
                background: 'var(--color-bg-main)',
                color: 'var(--color-primary)',
                fontWeight: '600',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span>
              Save {formData.contactPerson.split(' ')[0]} to Contacts (Belarro)
            </button>
          )}

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
              rows="5"
              style={{ minHeight: '120px' }}
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

          {/* Pin Color Override */}
          <div className="form-group">
            <label>Pin Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {MANUAL_COLOR_OPTIONS.map(opt => {
                const isSelected = formData.pinColor === opt.value;
                const isAuto = opt.value === '';
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pinColor: opt.value }))}
                    title={opt.label}
                    style={{
                      width: isAuto ? 'auto' : '32px',
                      height: '32px',
                      borderRadius: 'var(--border-radius-full)',
                      border: isSelected
                        ? '2.5px solid var(--color-text-main)'
                        : '2px solid var(--color-border)',
                      background: isAuto ? 'var(--color-bg-secondary)' : opt.value,
                      cursor: 'pointer',
                      padding: isAuto ? '0 12px' : '0',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '600',
                      color: isAuto ? 'var(--color-text-secondary)' : 'transparent',
                      transition: 'all 150ms ease',
                      boxShadow: isSelected && !isAuto ? '0 0 0 2px var(--color-bg-main), 0 0 0 4px var(--color-text-muted)' : 'none',
                    }}
                  >
                    {isAuto ? 'Auto' : ''}
                  </button>
                );
              })}
            </div>
            {formData.pinColor && (
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginTop: '4px'
              }}>
                Manual override active
              </div>
            )}
          </div>

          {/* Language */}
          <div className="form-group">
            <label>Language</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {['DE', 'EN'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, language: lang }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--border-radius-md)',
                    border: `1.5px solid ${formData.language === lang ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: formData.language === lang ? 'var(--color-primary)' : 'var(--color-bg-main)',
                    color: formData.language === lang ? '#fff' : 'var(--color-text-muted)',
                    fontWeight: '600',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'DE' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
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
            {isSaving ? 'Saving...' : savedSuccessfully ? 'Edit Location' : (location.visitHistory?.length ? 'Update Visit' : 'Save Visit')}
          </button>

          {/* QUICK SEND — one-tap send first follow-up via WhatsApp or Email */}
          {formData.contactPerson && (fullPhone || location.businessPhone || formData.email || location.directEmail) && (
            (() => {
              const locForMsg = {
                ...location,
                contactPerson: formData.contactPerson,
                directPhone: fullPhone || location.directPhone || '',
                businessPhone: location.businessPhone || '',
                directEmail: formData.email || location.directEmail || '',
                pipelineStage: location.pipelineStage || 'new_visit',
                language: formData.language || location.language || 'DE',
                locationName: location.locationName
              };
              const msg = getFollowUpMessage(locForMsg, user?.name);
              if (!msg) return null;
              const hasPhone = !!msg.waLink;
              const contactEmail = formData.email || location.directEmail || location.businessEmail || '';
              const hasEmail = !!contactEmail;
              if (!hasPhone && !hasEmail) return null;

              const btnStyle = (bg) => ({
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: '14px',
                borderRadius: 'var(--border-radius-md)',
                background: bg,
                color: '#fff',
                fontWeight: '700',
                fontSize: 'var(--font-size-md)',
                textDecoration: 'none',
                fontFamily: 'inherit',
                marginTop: 'var(--spacing-sm)',
                boxSizing: 'border-box',
                border: 'none',
                cursor: 'pointer'
              });

              return (
                <>
                  {hasPhone && (
                    <a
                      href={msg.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        const isAndroid = /android/i.test(navigator.userAgent);
                        if (isAndroid && msg.phone) {
                          e.preventDefault();
                          navigator.clipboard.writeText(msg.body);
                          window.location.href = `intent://send/${msg.phone}#Intent;scheme=smsto;package=com.whatsapp.w4b;action=android.intent.action.SENDTO;end`;
                        }
                      }}
                      style={btnStyle('#25D366')}
                    >
                      Send WhatsApp Follow-up
                    </a>
                  )}
                  {hasEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        const subject = encodeURIComponent(`Belarro — ${location.locationName || ''}`);
                        const body = encodeURIComponent(msg.body);
                        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(contactEmail)}&su=${subject}&body=${body}`, '_blank');
                      }}
                      style={btnStyle('#4285F4')}
                    >
                      Send Email Follow-up
                    </button>
                  )}
                </>
              );
            })()
          )}
        </form>

        {/* ===== SEND FOLLOW-UP ===== */}
        {(location.pipelineStage || 'new_visit') !== 'closed_won' && (location.pipelineStage || 'new_visit') !== 'closed_lost' && (
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
              marginBottom: 'var(--spacing-xs)'
            }}>
              Follow-up Message
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              {getStageLabel(location.pipelineStage || 'new_visit')}
            </div>

            {!showFollowUpPreview ? (
              <button
                type="button"
                onClick={() => {
                  const locWithForm = {
                    ...location,
                    contactPerson: formData.contactPerson || location.contactPerson || 'there',
                    directPhone: fullPhone || location.directPhone || '',
                    businessPhone: location.businessPhone || '',
                    directEmail: formData.email || location.directEmail || '',
                    pipelineStage: location.pipelineStage || 'new_visit',
                    language: formData.language || location.language || 'DE'
                  };
                  const msg = getFollowUpMessage(locWithForm, user?.name);
                  setFollowUpMsg(msg);
                  setShowFollowUpPreview(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1.5px solid var(--color-primary, #2d5a3d)',
                  background: '#fff',
                  color: 'var(--color-primary, #2d5a3d)',
                  fontWeight: '700',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Preview Message
              </button>
            ) : followUpMsg ? (
              <div>
                {/* Message preview */}
                <div style={{
                  background: '#f0f0f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 'var(--spacing-sm)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  color: '#1a1a1a'
                }}>
                  {followUpMsg.body}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  Language: {followUpMsg.lang} &middot; Stage: {followUpMsg.stage}
                  {followUpMsg.nextStage && ` → Next: ${getStageLabel(followUpMsg.nextStage)}`}
                </div>

                {/* Copy + Send buttons */}
                {(() => {
                  const hasPhone = !!followUpMsg.waLink;
                  const contactEmail = formData.email || location.directEmail || location.businessEmail || '';
                  const hasEmail = !!contactEmail;

                  const advancePipeline = async () => {
                    setSendingFollowUp(true);
                    try {
                      const now = new Date().toISOString().split('T')[0];
                      const nextDate = followUpMsg.nextActionDays
                        ? calculateNextActionDate(followUpMsg.nextActionDays)
                        : '';
                      await updatePipelineData(
                        location.locationName,
                        location.businessAddress,
                        {
                          pipelineStage: followUpMsg.nextStage,
                          followUpCount: String((parseInt(location.followUpCount) || 0) + 1),
                          lastFollowUpDate: now,
                          nextActionDate: nextDate,
                          nextActionType: followUpMsg.nextActionType || '',
                          automationStatus: 'sent'
                        }
                      );
                    } catch (err) {
                      console.error('Failed to update pipeline:', err);
                    }
                    setSendingFollowUp(false);
                    setShowFollowUpPreview(false);
                  };

                  const openEmail = () => {
                    const subject = encodeURIComponent(`Belarro — ${location.locationName || ''}`);
                    const body = encodeURIComponent(followUpMsg.body);
                    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(contactEmail)}&su=${subject}&body=${body}`, '_blank');
                  };

                  const openWhatsApp = async (e) => {
                    const isAndroid = /android/i.test(navigator.userAgent);
                    if (isAndroid && followUpMsg.phone) {
                      if (e) e.preventDefault();
                      await navigator.clipboard.writeText(followUpMsg.body);
                      window.location.href = `intent://send/${followUpMsg.phone}#Intent;scheme=smsto;package=com.whatsapp.w4b;action=android.intent.action.SENDTO;end`;
                    } else if (followUpMsg.waLink) {
                      window.open(followUpMsg.waLink, '_blank');
                    }
                  };

                  if (!hasPhone && !hasEmail) {
                    return (
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <div style={{
                          flex: 1, textAlign: 'center', padding: '14px',
                          borderRadius: 'var(--border-radius-md)', background: '#f5f5f5',
                          color: '#999', fontSize: 'var(--font-size-sm)', fontWeight: '600'
                        }}>
                          No phone or email — add one above
                        </div>
                        <button type="button" onClick={() => setShowFollowUpPreview(false)}
                          style={{ padding: '14px 18px', borderRadius: 'var(--border-radius-md)',
                            border: '1.5px solid var(--color-border)', background: 'var(--color-bg-main)',
                            color: 'var(--color-text-secondary)', fontWeight: '600',
                            fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'inherit'
                          }}>Cancel</button>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                      {/* Copy message button */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(followUpMsg.body);
                          const btn = document.getElementById('copy-msg-btn');
                          if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Message'; }, 1500); }
                        }}
                        id="copy-msg-btn"
                        style={{
                          width: '100%', padding: '12px', borderRadius: 'var(--border-radius-md)',
                          border: '1.5px solid var(--color-border)', background: 'var(--color-bg-main)',
                          color: 'var(--color-text-main)', fontWeight: '600',
                          fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'inherit'
                        }}
                      >
                        Copy Message
                      </button>

                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                        {/* Send WhatsApp — only if phone exists */}
                        {hasPhone && (
                          <a
                            href={followUpMsg.waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={async (e) => {
                              await openWhatsApp(e);
                              await advancePipeline();
                            }}
                            style={{
                              flex: 1, textAlign: 'center', padding: '14px',
                              borderRadius: 'var(--border-radius-md)', background: '#25D366',
                              color: '#fff', fontWeight: '700', fontSize: 'var(--font-size-sm)',
                              textDecoration: 'none', fontFamily: 'inherit', minWidth: '120px'
                            }}
                          >
                            {sendingFollowUp ? 'Updating...' : 'Send WhatsApp'}
                          </a>
                        )}

                        {/* Send Email — only if email exists */}
                        {hasEmail && (
                          <button
                            type="button"
                            onClick={async () => {
                              openEmail();
                              await advancePipeline();
                            }}
                            style={{
                              flex: 1, textAlign: 'center', padding: '14px',
                              borderRadius: 'var(--border-radius-md)', background: '#4285F4',
                              color: '#fff', fontWeight: '700', fontSize: 'var(--font-size-sm)',
                              cursor: 'pointer', fontFamily: 'inherit', border: 'none', minWidth: '120px'
                            }}
                          >
                            Send Email
                          </button>
                        )}

                        {/* Send Both — only if both phone AND email exist */}
                        {hasPhone && hasEmail && (
                          <button
                            type="button"
                            onClick={async () => {
                              openWhatsApp();
                              openEmail();
                              await advancePipeline();
                            }}
                            style={{
                              flex: 1, textAlign: 'center', padding: '14px',
                              borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-main, #1a1a1a)',
                              color: '#fff', fontWeight: '700', fontSize: 'var(--font-size-sm)',
                              cursor: 'pointer', fontFamily: 'inherit', border: 'none', minWidth: '120px'
                            }}
                          >
                            Send Both
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowFollowUpPreview(false)}
                          style={{
                            padding: '14px 18px', borderRadius: 'var(--border-radius-md)',
                            border: '1.5px solid var(--color-border)', background: 'var(--color-bg-main)',
                            color: 'var(--color-text-secondary)', fontWeight: '600',
                            fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'inherit'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No template available for this stage.
              </div>
            )}
          </div>
        )}

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
