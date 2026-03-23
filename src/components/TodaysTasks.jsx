// ============================================
// TODAY'S TASKS VIEW — with quick actions, summary, calendar
// ============================================

import { useState, useMemo } from 'react';
import { getFollowUpMessage } from '../utils/followUpTemplates.js';
import { generateDailySummary } from '../utils/summaryUtils.js';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils.js';
import { createFollowUpEvent } from '../utils/googleCalendar.js';
import { updatePipelineData } from '../utils/googleSheets.js';
import { calculateNextActionDate, calculateSnappedFollowUpDate, toISODateString } from '../utils/dateUtils.js';

// ── Inline SVG icons ──
const Icons = {
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  whatsapp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  send: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  menu: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  email: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 8L2 4" />
    </svg>
  ),
};

// ── Task Card with quick actions ──
const TaskCard = ({ location, accentColor, onSelect, user, onRefresh }) => {
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState('');
  const days = location._daysUntilAction;

  let urgencyLabel = '';
  if (days < 0) urgencyLabel = `${Math.abs(days)}d overdue`;
  else if (days === 0) urgencyLabel = 'Due today';
  else urgencyLabel = `In ${days}d`;

  const actionLabel = location.nextActionType
    ? location.nextActionType.replace(/_/g, ' ')
    : 'follow up';

  const stageLabel = location.pipelineStage
    ? location.pipelineStage.replace(/_/g, ' ')
    : '';

  // Get follow-up message for this location
  const followUp = useMemo(
    () => getFollowUpMessage(location, user?.displayName || user?.name, null),
    [location, user]
  );

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!followUp?.body) return;
    navigator.clipboard.writeText(followUp.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendWA = (e) => {
    e.stopPropagation();
    if (!followUp?.waLink) return;
    window.open(followUp.waLink, '_blank');
  };

  const handleSendEmail = (e) => {
    e.stopPropagation();
    const email = location.businessEmail || location.directEmail || '';
    if (!email || !followUp?.body) return;
    const subject = encodeURIComponent(`Belarro — ${location.locationName || ''}`);
    const body = encodeURIComponent(followUp.body);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleCalendar = (e) => {
    e.stopPropagation();
    const url = generateGoogleCalendarUrl(
      location,
      followUp?.body || '',
      window.location.origin + '/?view=tasks'
    );
    window.open(url, '_blank');
  };

  const handleSendMenu = (e) => {
    e.stopPropagation();
    const lang = (location.language || 'DE').toUpperCase();
    const base = lang === 'EN' ? 'https://belarro.com/for-chefs' : 'https://belarro.com/de/for-chefs';
    const params = new URLSearchParams();
    if (location.locationName) params.set('c', location.locationName);
    if (location.contactPerson) params.set('n', location.contactPerson);
    const qs = params.toString();
    const link = qs ? `${base}?${qs}` : base;
    let phone = (location.directPhone || location.businessPhone || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
    // Fix double country code
    for (const code of ['972', '44', '43', '49', '1']) {
      if (phone.startsWith(code + code)) { phone = phone.slice(code.length); break; }
    }
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(link)}`, '_blank');
    } else {
      navigator.clipboard.writeText(link);
    }
  };

  // For order_confirmed: user picks delivery Tuesday, not follow-up date
  const isOrderConfirm = (location.pipelineStage || 'new_visit') === 'order_confirmed';

  const handleDone = (e) => {
    e.stopPropagation();
    if (marking || !followUp) return;
    if (isOrderConfirm) {
      // Default to next Tuesday
      const now = new Date();
      const daysUntilTue = (2 - now.getDay() + 7) % 7 || 7;
      const nextTue = new Date(now);
      nextTue.setDate(nextTue.getDate() + daysUntilTue);
      setPickedDate(toISODateString(nextTue));
    } else {
      const defaultDate = followUp._nextActionDate
        ? toISODateString(followUp._nextActionDate)
        : followUp.nextActionDays
          ? calculateSnappedFollowUpDate(followUp.nextActionDays)
          : toISODateString(new Date(Date.now() + 86400000));
      setPickedDate(defaultDate);
    }
    setShowDatePicker(true);
  };

  const handleConfirmDone = async (e) => {
    e.stopPropagation();
    if (marking) return;
    setMarking(true);
    setShowDatePicker(false);
    try {
      const count = parseInt(location.followUpCount || '0', 10) + 1;
      const today = toISODateString(new Date());

      let nextDate = pickedDate || '';
      let finalFollowUp = followUp;

      // For order_confirmed: pickedDate = delivery Tuesday
      // Regenerate the message with the delivery date included,
      // and set next action to Monday before delivery
      if (isOrderConfirm && pickedDate) {
        finalFollowUp = getFollowUpMessage(
          location,
          user?.displayName || user?.name,
          { deliveryDate: pickedDate }
        );
        // Next action = Monday before delivery Tuesday
        const deliveryD = new Date(pickedDate + 'T00:00:00');
        const monday = new Date(deliveryD);
        monday.setDate(monday.getDate() - 1);
        nextDate = toISODateString(monday);
      }

      // Build follow-up history log in notesInternal (column Z)
      const stageName = (finalFollowUp.stage || 'unknown').replace(/_/g, ' ');
      const logEntry = `[${today}] ${stageName} sent → next: ${finalFollowUp.nextStage?.replace(/_/g, ' ') || 'done'} on ${nextDate || 'n/a'}`;
      const existingNotes = location.notesInternal || '';
      const updatedNotes = existingNotes
        ? `${existingNotes}\n${logEntry}`
        : logEntry;
      await updatePipelineData(location.locationName, location.businessAddress, {
        pipelineStage: finalFollowUp.nextStage || location.pipelineStage,
        followUpCount: String(count),
        lastFollowUpDate: today,
        nextActionDate: nextDate,
        nextActionType: finalFollowUp.nextActionType || '',
        automationStatus: 'sent',
        notesInternal: updatedNotes,
      });

      // For order_confirmed: open WhatsApp or Gmail with the thank-you + delivery date message
      if (isOrderConfirm) {
        if (finalFollowUp.waLink) {
          window.open(finalFollowUp.waLink, '_blank');
        } else if (location.businessEmail) {
          const subject = encodeURIComponent(`Belarro — ${location.locationName || ''}`);
          const body = encodeURIComponent(finalFollowUp.body);
          window.location.href = `mailto:${location.businessEmail}?subject=${subject}&body=${body}`;
        }
      }

      // Auto-create Google Calendar event for the next follow-up (silent — no tab opens)
      console.log('Calendar check:', { nextDate, nextStage: finalFollowUp.nextStage, location: location.locationName });
      if (nextDate && finalFollowUp.nextStage && finalFollowUp.nextStage !== 'closed_lost' && finalFollowUp.nextStage !== 'closed_won') {
        const nextLocation = { ...location, nextActionDate: nextDate, pipelineStage: finalFollowUp.nextStage };
        const nextFollowUp = getFollowUpMessage(nextLocation, user?.displayName || user?.name, null);
        console.log('Creating calendar event for:', nextDate, finalFollowUp.nextStage);
        createFollowUpEvent(
          nextLocation,
          nextDate,
          finalFollowUp.nextStage,
          nextFollowUp?.body || `Follow up with ${location.contactPerson} at ${location.locationName}`
        ).then(event => {
          console.log('Calendar event created:', event.htmlLink);
        }).catch(err => console.error('Failed to create calendar event:', err));
      } else {
        console.log('Skipped calendar event — no nextDate or stage is terminal');
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to advance pipeline:', err);
      setMarking(false);
    }
  };

  const hasPhone = followUp?.phone;
  const hasEmail = !!(location.businessEmail || location.directEmail);

  return (
    <div className="task-card" onClick={() => onSelect(location)}>
      <div className="task-card-accent" style={{ backgroundColor: accentColor }} />
      <div className="task-card-body">
        {/* Header row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '4px',
          gap: 'var(--spacing-sm)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: '600',
            color: 'var(--color-text-main)',
            margin: 0
          }}>
            {location.locationName}
          </h3>
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: 'var(--border-radius-full)',
            background: `${accentColor}15`,
            color: accentColor,
            fontWeight: '700',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {urgencyLabel}
          </span>
        </div>

        {/* Contact + address */}
        {location.contactPerson && (
          <div style={{
            color: 'var(--color-text-main)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            marginBottom: '2px'
          }}>
            {location.contactPerson}
          </div>
        )}
        <div style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          marginBottom: '6px'
        }}>
          {location.businessAddress}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: 'var(--border-radius-full)',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}>
            {actionLabel}
          </span>
          {stageLabel && (
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-full)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-muted)',
              textTransform: 'capitalize'
            }}>
              {stageLabel}
            </span>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="task-quick-actions">
          <button
            className="task-action-btn"
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? Icons.check : Icons.copy}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {hasPhone && (
            <button
              className="task-action-btn task-action-wa"
              onClick={handleSendWA}
              title="Send via WhatsApp"
            >
              {Icons.whatsapp}
              <span>Send WA</span>
            </button>
          )}

          {hasEmail && (
            <button
              className="task-action-btn task-action-email"
              onClick={handleSendEmail}
              title="Send via Gmail"
            >
              {Icons.email}
              <span>Email</span>
            </button>
          )}

          <button
            className="task-action-btn task-action-cal"
            onClick={handleCalendar}
            title="Add to Google Calendar"
          >
            {Icons.calendar}
            <span>Calendar</span>
          </button>

          <button
            className="task-action-btn task-action-menu"
            onClick={handleSendMenu}
            title="Send menu & prices link"
          >
            {Icons.menu}
            <span>Menu</span>
          </button>

          <button
            className="task-action-btn task-action-done"
            onClick={handleDone}
            disabled={marking}
            title="Follow up done — advance pipeline"
          >
            {Icons.check}
            <span>{marking ? 'Saving...' : 'Done'}</span>
          </button>
        </div>

        {/* Date picker for next follow-up */}
        {showDatePicker && (
          <div className="task-date-picker" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-main)' }}>
              {isOrderConfirm ? 'Pick delivery Tuesday:' : 'Next follow-up date:'}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={pickedDate}
                onChange={(e) => setPickedDate(e.target.value)}
                min={toISODateString(new Date())}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  background: 'var(--color-bg-input, #fff)',
                }}
              />
              <button
                className="task-action-btn task-action-done"
                onClick={handleConfirmDone}
                disabled={marking}
                style={{ padding: '8px 14px' }}
              >
                {Icons.check}
                <span>Confirm</span>
              </button>
              <button
                className="task-action-btn"
                onClick={(e) => { e.stopPropagation(); setShowDatePicker(false); }}
                style={{ padding: '8px 10px' }}
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Task Section (Overdue / Today / Upcoming) ──
const TaskSection = ({ title, items, accentColor, onSelect, user, onRefresh }) => {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      <div className="task-section-header" style={{ color: accentColor }}>
        {title}
        <span style={{
          fontSize: '11px',
          padding: '1px 8px',
          borderRadius: 'var(--border-radius-full)',
          background: `${accentColor}15`,
          color: accentColor,
          fontWeight: '700'
        }}>
          {items.length}
        </span>
      </div>
      {items.map((loc, idx) => (
        <TaskCard
          key={`${loc.locationName}-${loc.businessAddress}-${idx}`}
          location={loc}
          accentColor={accentColor}
          onSelect={onSelect}
          user={user}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

// ── Morning Summary Banner ──
const MorningSummary = ({ overdue, today, upcoming, completedToday }) => {
  const total = overdue + today + upcoming;
  const done = completedToday || 0;
  const progress = total > 0 ? Math.round((done / (done + total)) * 100) : 100;

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="morning-summary">
      <div className="morning-summary-date">{dateStr}</div>
      <div className="morning-summary-counts">
        {overdue > 0 && <span className="summary-count summary-overdue">{overdue} overdue</span>}
        {today > 0 && <span className="summary-count summary-today">{today} today</span>}
        {upcoming > 0 && <span className="summary-count summary-upcoming">{upcoming} upcoming</span>}
        {total === 0 && <span className="summary-count" style={{ color: 'var(--color-success)' }}>All clear</span>}
      </div>
      {total > 0 && (
        <div className="morning-progress-bar">
          <div className="morning-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

// ── Phone Number Input (inline, for WhatsApp summary) ──
const PhoneInput = ({ value, onChange, onSend }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="tel"
        placeholder="+49..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          padding: '8px 12px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-md)',
          fontSize: 'var(--font-size-sm)',
          background: 'var(--color-bg-input)',
        }}
      />
      <button
        className="task-action-btn task-action-wa"
        onClick={onSend}
        disabled={!value}
        style={{ padding: '8px 12px' }}
      >
        {Icons.send}
        <span>Send</span>
      </button>
    </div>
  );
};

// ── Main Component ──
const TodaysTasks = ({
  overdueTasks = [],
  todayTasks = [],
  upcomingTasks = [],
  onLocationSelect,
  onRefresh,
  user,
  settings,
  onUpdateSetting
}) => {
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const totalTasks = overdueTasks.length + todayTasks.length + upcomingTasks.length;

  const handleSendSummary = () => {
    const phone = settings?.userPhone;
    if (!phone) {
      setShowPhoneInput(true);
      return;
    }
    const summary = generateDailySummary(overdueTasks, todayTasks, upcomingTasks);
    const cleanPhone = phone.replace(/[^0-9+]/g, '').replace(/^\+/, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(summary)}`, '_blank');
  };

  const handlePhoneSave = () => {
    if (settings?.userPhone) {
      setShowPhoneInput(false);
      handleSendSummary();
    }
  };

  return (
    <div className="tasks-view-container">
      {/* Morning Summary Banner */}
      <MorningSummary
        overdue={overdueTasks.length}
        today={todayTasks.length}
        upcoming={upcomingTasks.length}
      />

      {/* WhatsApp Self-Summary Button */}
      {totalTasks > 0 && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <button
            className="summary-send-btn"
            onClick={handleSendSummary}
          >
            {Icons.whatsapp}
            <span>Send me today's summary</span>
          </button>
          {showPhoneInput && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Enter your phone number to receive the summary:
              </div>
              <PhoneInput
                value={settings?.userPhone || ''}
                onChange={(val) => onUpdateSetting('userPhone', val)}
                onSend={handlePhoneSave}
              />
            </div>
          )}
        </div>
      )}

      <TaskSection
        title="OVERDUE"
        items={overdueTasks}
        accentColor="var(--color-danger)"
        onSelect={onLocationSelect}
        user={user}
        onRefresh={onRefresh}
      />

      <TaskSection
        title="TODAY"
        items={todayTasks}
        accentColor="var(--color-warning)"
        onSelect={onLocationSelect}
        user={user}
        onRefresh={onRefresh}
      />

      <TaskSection
        title="UPCOMING"
        items={upcomingTasks}
        accentColor="var(--color-primary)"
        onSelect={onLocationSelect}
        user={user}
        onRefresh={onRefresh}
      />

      {totalTasks === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-2xl) var(--spacing-lg)',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            marginBottom: 'var(--spacing-sm)',
            fontWeight: '600',
            color: 'var(--color-text-secondary)'
          }}>
            All caught up
          </div>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            margin: 0,
            lineHeight: '1.5'
          }}>
            No follow-ups due. Visit a location and schedule a follow-up to see tasks here.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodaysTasks;
