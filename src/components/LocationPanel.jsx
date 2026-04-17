// ============================================
// LOCATION PANEL — Single scrollable form
// Flow: Details (contact info) → Log (outcome, notes, sample)
// Pipeline columns are auto-set behind the scenes, not shown to user
// ============================================

import { useState, useEffect } from 'react';
import { CONFIG } from '../config.js';
import { saveLocationData, archiveLocation, deleteLocation, getNoteTemplates, addNoteTemplate, updatePipelineData, deleteProspect } from '../utils/googleSheets.js';
import { calculateNextActionDate, calculateSnappedFollowUpDate, toEUDateString } from '../utils/dateUtils.js';
import { getPinColor, getColorLabel } from '../utils/colorUtils.js';
import { getFollowUpMessage, getStageLabel } from '../utils/followUpTemplates.js';
import { createFollowUpEvent } from '../utils/googleCalendar.js';

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

// Split a full phone string like "+4915157431078" into { code: '+49', number: '015157431078' }
// Adds leading 0 for German mobile display (0159...) while storing +49159... internally
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
      // Add leading 0 for display (German convention: 0159...)
      if (c === '+49' && number && !number.startsWith('0')) {
        number = '0' + number;
      }
      return { code: c, number };
    }
  }
  // No known code found — default to +49, keep as-is for display
  let number = full.replace(/^\+/, '');
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
    language: '',
    usesMicrogreens: false
  });
  const [phoneCode, setPhoneCode] = useState('+49');
  const [phoneNumber, setPhoneNumber] = useState('');
  // Full phone = code + number (strip leading 0 for international format)
  // Also prevent double country code (e.g. +49 + 4930... → +494930...)
  const buildFullPhone = () => {
    if (!phoneNumber) return '';
    const stripped = phoneNumber.replace(/^0+/, '');
    const codeDigits = phoneCode.replace('+', '');
    // If number already starts with country code digits, don't add code again
    if (stripped.startsWith(codeDigits)) {
      return '+' + stripped;
    }
    return phoneCode + stripped;
  };
  const fullPhone = buildFullPhone();
  const [pipelineStage, setPipelineStage] = useState('new_visit');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [showFollowUpPreview, setShowFollowUpPreview] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState(null);
  const [awaitingSentConfirm, setAwaitingSentConfirm] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);
  const [quickSendPreview, setQuickSendPreview] = useState(null); // { msg, contactEmail }

  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await getNoteTemplates();
      setNoteTemplates(templates);
    };
    loadTemplates();
  }, []);

  // Auto-generate the follow-up message as soon as the visit is saved
  useEffect(() => {
    if (!savedSuccessfully) return;
    if (pipelineStage === 'closed_won' || pipelineStage === 'closed_lost') return;
    const locWithForm = {
      ...location,
      contactPerson: formData.contactPerson || location.contactPerson || 'there',
      contactTitle: formData.contactTitle || location.contactTitle || '',
      directPhone: fullPhone || location.directPhone || '',
      businessPhone: location.businessPhone || '',
      directEmail: formData.email || location.directEmail || '',
      pipelineStage: pipelineStage || 'new_visit',
      language: formData.language || location.language || 'DE'
    };
    const msg = getFollowUpMessage(locWithForm, user?.name);
    setFollowUpMsg(msg);
  }, [savedSuccessfully]);

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
        language: location.language || '',
        usesMicrogreens: location.usesMicrogreens || false
      });
      const { code, number } = splitPhone(location.directPhone || '');
      setPhoneCode(code);
      setPhoneNumber(number);
      setPipelineStage(location.pipelineStage || 'new_visit');
      // Default follow-up to 1 week if outcome is Follow Up or Interested
      const interest = location.interestLevel || 'Follow Up';
      if (interest === 'Follow Up') {
        setFollowUpDate(calculateSnappedFollowUpDate(7));
      } else {
        setFollowUpDate('');
      }
      setSaveMessage({ type: '', text: '' });
      setSavedSuccessfully(false);
      setAwaitingSentConfirm(false);
      setShowFollowUpPreview(false);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setInterest = (level) => {
    setFormData(prev => ({ ...prev, interestLevel: level }));
    // Auto-set a default follow-up date when Follow Up is selected
    if (level === 'Follow Up' && !followUpDate) {
      setFollowUpDate(calculateSnappedFollowUpDate(7)); // Default: 1 week
    }
  };

  const handleFollowUpPreset = (days) => {
    setFollowUpDate(calculateSnappedFollowUpDate(days));
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
      // Use manually-set pipeline stage, but auto-set for terminal outcomes
      let finalStage = pipelineStage;
      if (formData.interestLevel === 'Closed Deal') {
        finalStage = CONFIG.PIPELINE_STAGES.CLOSED_WON;
        setPipelineStage(finalStage);
      } else if (formData.interestLevel === 'Not Interested') {
        finalStage = CONFIG.PIPELINE_STAGES.CLOSED_LOST;
        setPipelineStage(finalStage);
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
        pipelineStage: finalStage,
        followUpCount: String(newCount),
        lastFollowUpDate: location.lastFollowUpDate || '',
        nextActionDate: followUpDate,
        nextActionType: followUpDate ? 'physical_visit' : '',
        automationStatus: followUpDate ? 'pending' : '',
        materialsSent: location.materialsSent || '',
        notesInternal: location.notesInternal || '',
        language: formData.language,
        usesMicrogreens: formData.usesMicrogreens,
        locationName: location.locationName,
        businessAddress: location.businessAddress,
        timestamp: undefined
      };

      const success = await saveLocationData(checkInData, user.name, user.email);

      if (success) {
        setSaveMessage({ type: 'success', text: 'Visit logged — follow-up message ready below' });
        setSavedSuccessfully(true);
        if (location.isProspect && location._prospectRowIndex !== undefined) {
          await deleteProspect(location._prospectRowIndex).catch(() => {});
        }
        onSave();
        // Stay open so the follow-up message + Save to Contacts are visible
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
    'Not Interested': '#f44336',
    'Closed Deal': '#4caf50',
    'Follow Up': '#ffc107'
  };

  const showFollowUp = formData.interestLevel === 'Follow Up';

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

        {/* PIPELINE STAGE — read-only status badge (updated automatically) */}
        {(() => {
          const stageMap = {
            'new_visit':          { label: 'New Visit',        color: '#9e9e9e' },
            'follow_up_1':        { label: 'Follow-up 1',      color: '#ffc107' },
            'follow_up_2':        { label: 'Follow-up 2',      color: '#ffa000' },
            'follow_up_3':        { label: 'Follow-up 3',      color: '#ff8f00' },
            'follow_up_4':        { label: 'Follow-up 4',      color: '#ff6f00' },
            'order_confirmed':    { label: 'Order Confirmed',  color: '#2196F3' },
            'delivery_reminder':  { label: 'Delivery',         color: '#1976D2' },
            'post_delivery':      { label: 'Post-Delivery',    color: '#1565C0' },
            'active_customer':    { label: 'Active Customer',  color: '#4caf50' },
            'inactive':           { label: 'Inactive',         color: '#757575' },
            'closed_won':         { label: 'Won',              color: '#2e7d32' },
            'closed_lost':        { label: 'Lost',             color: '#c62828' }
          };
          const s = stageMap[pipelineStage] || stageMap['new_visit'];
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage</span>
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--border-radius-full)',
                background: s.color, color: '#fff',
                fontSize: '12px', fontWeight: '700'
              }}>{s.label}</span>
            </div>
          );
        })()}

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
            <label>Handy Nummer</label>
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
                  setPhoneNumber(val);
                }}
                placeholder="015906442264"
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-sm)' }}>
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

          {/* Uses Microgreens */}
          <div className="form-group">
            <label>Uses Microgreens Already?</label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, usesMicrogreens: !prev.usesMicrogreens }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: 'var(--border-radius-md)',
                border: `1.5px solid ${formData.usesMicrogreens ? '#16a34a' : 'var(--color-border)'}`,
                background: formData.usesMicrogreens ? '#dcfce7' : 'var(--color-bg-main)',
                color: formData.usesMicrogreens ? '#15803d' : 'var(--color-text-muted)',
                fontWeight: '600', fontSize: 'var(--font-size-sm)',
                cursor: 'pointer', fontFamily: 'inherit', width: '100%', transition: 'all 150ms'
              }}
            >
              <span style={{
                width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                border: `2px solid ${formData.usesMicrogreens ? '#16a34a' : '#d1d5db'}`,
                background: formData.usesMicrogreens ? '#16a34a' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {formData.usesMicrogreens && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
              </span>
              🌿 Yes, already using microgreens
            </button>
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

        </form>

        {/* ===== SEND FOLLOW-UP (only visible after save) ===== */}
        {savedSuccessfully && (pipelineStage || 'new_visit') !== 'closed_won' && (pipelineStage || 'new_visit') !== 'closed_lost' && (
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
              {getStageLabel(pipelineStage || 'new_visit')}
            </div>

            {followUpMsg ? (
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

                {/* Copy + Send buttons — NO auto-advance, use pipeline chips above */}
                {(() => {
                  const hasPhone = !!followUpMsg.waLink;
                  const contactEmail = formData.email || location.directEmail || location.businessEmail || '';
                  const hasEmail = !!contactEmail;

                  const openEmail = () => {
                    const subject = encodeURIComponent(`Belarro — ${location.locationName || ''}`);
                    const body = encodeURIComponent(followUpMsg.body);
                    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
                  };

                  const openWhatsApp = (e) => {
                    if (e) e.preventDefault();
                    navigator.clipboard.writeText(followUpMsg.body).catch(() => {});
                    if (followUpMsg.waLink) {
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

                      {!awaitingSentConfirm ? (
                        /* Step 1: Send buttons */
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                          {hasPhone && (
                            <a
                              href={followUpMsg.waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                openWhatsApp(e);
                                setAwaitingSentConfirm(true);
                              }}
                              style={{
                                flex: 1, textAlign: 'center', padding: '14px',
                                borderRadius: 'var(--border-radius-md)', background: '#25D366',
                                color: '#fff', fontWeight: '700', fontSize: 'var(--font-size-sm)',
                                textDecoration: 'none', fontFamily: 'inherit', minWidth: '120px'
                              }}
                            >
                              Send WhatsApp
                            </a>
                          )}

                          {hasEmail && (
                            <button
                              type="button"
                              onClick={() => { openEmail(); setAwaitingSentConfirm(true); }}
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

                          {hasPhone && hasEmail && (
                            <button
                              type="button"
                              onClick={() => { openWhatsApp(); openEmail(); setAwaitingSentConfirm(true); }}
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
                      ) : (
                        /* Step 2: Confirm message was actually sent */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                          <div style={{
                            fontSize: 'var(--font-size-sm)', fontWeight: '600',
                            color: 'var(--color-text-main)', textAlign: 'center'
                          }}>
                            Did you send the message?
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                              type="button"
                              disabled={markingSent}
                              onClick={async () => {
                                setMarkingSent(true);
                                try {
                                  const nextStage = followUpMsg.nextStage || pipelineStage;
                                  const nextDateISO = followUpMsg.nextActionDays
                                    ? calculateSnappedFollowUpDate(followUpMsg.nextActionDays)
                                    : '';
                                  const nextDateEU = nextDateISO ? toEUDateString(new Date(nextDateISO + 'T00:00:00')) : '';
                                  const todayEU = toEUDateString(new Date());
                                  const count = parseInt(location.followUpCount || '0', 10) + 1;
                                  const nextStageLabel = (followUpMsg.nextStage || '').replace(/_/g, ' ');
                                  const logEntry = `[${todayEU}] ${(followUpMsg.stage || 'unknown').replace(/_/g, ' ')} sent → next: ${nextStageLabel || 'done'} on ${nextDateEU || 'n/a'}`;
                                  const existingNotes = location.notesInternal || '';
                                  const updatedNotes = existingNotes ? `${existingNotes}\n${logEntry}` : logEntry;

                                  await updatePipelineData(location.locationName, location.businessAddress, {
                                    pipelineStage: nextStage,
                                    followUpCount: String(count),
                                    lastFollowUpDate: todayEU,
                                    nextActionDate: nextDateEU,
                                    nextActionType: followUpMsg.nextActionType || '',
                                    automationStatus: 'sent',
                                    notesInternal: updatedNotes,
                                  });
                                  // Auto-create Google Calendar event for next follow-up (needs ISO date)
                                  if (nextDateISO && nextStage !== 'closed_lost' && nextStage !== 'closed_won') {
                                    createFollowUpEvent(
                                      location, nextDateISO, nextStage,
                                      `Follow up with ${location.contactPerson} at ${location.locationName}`
                                    ).catch(err => console.error('Failed to create calendar event:', err));
                                  }
                                  setPipelineStage(nextStage);
                                  setShowFollowUpPreview(false);
                                  setAwaitingSentConfirm(false);
                                } catch (err) {
                                  console.error('Failed to update pipeline:', err);
                                }
                                setMarkingSent(false);
                              }}
                              style={{
                                flex: 1, textAlign: 'center', padding: '14px',
                                borderRadius: 'var(--border-radius-md)', background: '#25D366',
                                color: '#fff', fontWeight: '700', fontSize: 'var(--font-size-sm)',
                                cursor: 'pointer', fontFamily: 'inherit', border: 'none'
                              }}
                            >
                              {markingSent ? 'Saving...' : 'Yes, sent'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAwaitingSentConfirm(false);
                              }}
                              style={{
                                flex: 1, textAlign: 'center', padding: '14px',
                                borderRadius: 'var(--border-radius-md)',
                                border: '1.5px solid var(--color-border)', background: 'var(--color-bg-main)',
                                color: 'var(--color-text-secondary)', fontWeight: '600',
                                fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'inherit'
                              }}
                            >
                              Not sent
                            </button>
                          </div>
                        </div>
                      )}
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

        {/* ===== SAVE TO CONTACTS (only after saving the visit) ===== */}
        {savedSuccessfully && formData.contactPerson && fullPhone && (
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
              padding: '12px',
              marginTop: 'var(--spacing-md)',
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
            Save {formData.contactPerson.split(' ')[0]} to Phone Contacts
          </button>
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
            {location.isProspect ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  if (!window.confirm('Remove from To Visit list?')) return;
                  setIsSaving(true);
                  await deleteProspect(location._prospectRowIndex).catch(() => {});
                  onSave();
                  onClose();
                  setIsSaving(false);
                }}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                Remove from To Visit
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* QUICK SEND PREVIEW POPUP */}
      {quickSendPreview && (
        <div
          onClick={() => setQuickSendPreview(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 env(safe-area-inset-bottom,0) 0'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-main)', borderRadius: '16px 16px 0 0',
              padding: '20px', width: '100%', maxWidth: '520px',
              maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '12px'
            }}
          >
            <div style={{ fontWeight: '700', fontSize: 'var(--font-size-md)' }}>Message Preview</div>
            <div style={{
              background: 'var(--color-bg-secondary)', borderRadius: '12px',
              padding: '14px 16px', fontSize: '14px', lineHeight: '1.6',
              whiteSpace: 'pre-wrap', overflowY: 'auto', flex: 1,
              color: 'var(--color-text-main)'
            }}>
              {quickSendPreview.msg.body}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {quickSendPreview.msg.waLink && (
                <a
                  href={quickSendPreview.msg.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    navigator.clipboard.writeText(quickSendPreview.msg.body).catch(() => {});
                    setQuickSendPreview(null);
                  }}
                  style={{
                    flex: 1, textAlign: 'center', padding: '14px',
                    borderRadius: 'var(--border-radius-md)', background: '#25D366',
                    color: '#fff', fontWeight: '700', fontSize: 'var(--font-size-sm)',
                    textDecoration: 'none', fontFamily: 'inherit'
                  }}
                >
                  Send WhatsApp
                </a>
              )}
              {quickSendPreview.contactEmail && (
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(`Belarro — ${location.locationName || ''}`);
                    const body = encodeURIComponent(quickSendPreview.msg.body);
                    window.location.href = `mailto:${quickSendPreview.contactEmail}?subject=${subject}&body=${body}`;
                    setQuickSendPreview(null);
                  }}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 'var(--border-radius-md)',
                    background: '#4285F4', color: '#fff', fontWeight: '700',
                    fontSize: 'var(--font-size-sm)', cursor: 'pointer',
                    fontFamily: 'inherit', border: 'none'
                  }}
                >
                  Send Email
                </button>
              )}
              <button
                type="button"
                onClick={() => setQuickSendPreview(null)}
                style={{
                  padding: '14px 16px', borderRadius: 'var(--border-radius-md)',
                  border: '1.5px solid var(--color-border)', background: 'var(--color-bg-main)',
                  color: 'var(--color-text-secondary)', fontWeight: '600',
                  fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPanel;
