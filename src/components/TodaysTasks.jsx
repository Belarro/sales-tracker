// ============================================
// TODAY'S TASKS VIEW — with quick actions, summary, calendar
// ============================================

import { useState, useMemo } from 'react';
import { getFollowUpMessage } from '../utils/followUpTemplates.js';
import { generateDailySummary } from '../utils/summaryUtils.js';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils.js';
import { createFollowUpEvent } from '../utils/googleCalendar.js';
import { updatePipelineData } from '../utils/googleSheets.js';
import { calculateNextActionDate, calculateSnappedFollowUpDate, toISODateString, toEUDateString } from '../utils/dateUtils.js';

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

// ── Stage dots ──
const STAGE_SEQUENCE = ['new_visit','follow_up_1','follow_up_2','follow_up_3','follow_up_4','order_confirmed'];
const STAGE_DOT_LABELS = ['Intro','FU 1','FU 2','FU 3','Close','Order'];

const StageDots = ({ stage, accentColor }) => {
  const currentIdx = STAGE_SEQUENCE.indexOf(stage);
  const showStages = 4; // show first 4 dots
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {STAGE_DOT_LABELS.slice(0, showStages).map((label, i) => {
        const done = currentIdx > i;
        const current = currentIdx === i;
        return (
          <div key={i} title={label} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: done ? 'var(--color-success)' : current ? accentColor : 'var(--color-border)',
            border: current ? `2px solid ${accentColor}` : done ? '2px solid var(--color-success)' : '2px solid var(--color-border)',
            transition: 'all 150ms',
            flexShrink: 0,
          }} />
        );
      })}
      {stage && (
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', marginLeft: '4px' }}>
          {STAGE_DOT_LABELS[Math.max(0, currentIdx)] || stage.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  );
};

// ── Task Card ──
const TaskCard = ({ location, accentColor, onSelect, user, onRefresh }) => {
  const [marking, setMarking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState('');

  const days = location._daysUntilAction;
  const urgencyLabel = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `in ${days}d`;
  const isOverdueCard = days < 0;
  const isTodayCard = days === 0;

  const followUp = useMemo(
    () => getFollowUpMessage(location, user?.displayName || user?.name, null),
    [location, user]
  );

  const isOrderConfirm = location.pipelineStage === 'order_confirmed';
  const hasPhone = !!followUp?.phone;
  const hasEmail = !!(location.businessEmail || location.directEmail);
  const followUpCount = parseInt(location.followUpCount || '0', 10);

  // History entries from notesInternal
  const historyLines = useMemo(() => {
    if (!location.notesInternal) return [];
    return location.notesInternal.split('\n').filter(Boolean).reverse();
  }, [location.notesInternal]);

  // Auto-calculate next date (no date picker for normal stages)
  const getAutoNextDate = () => {
    if (isOrderConfirm) return null; // needs manual date
    if (followUp?._nextActionDate) return toISODateString(followUp._nextActionDate);
    if (followUp?.nextActionDays) return calculateSnappedFollowUpDate(followUp.nextActionDays);
    return toISODateString(new Date(Date.now() + 86400000));
  };

  const executeDone = async (nextDateISO, finalFollowUp) => {
    setMarking(true);
    try {
      const count = followUpCount + 1;
      const todayEU = toEUDateString(new Date());
      const nextDateEU = nextDateISO ? toEUDateString(new Date(nextDateISO + 'T00:00:00')) : '';
      const stageName = (finalFollowUp.stage || 'unknown').replace(/_/g, ' ');
      const logEntry = `[${todayEU}] ${stageName} → next: ${finalFollowUp.nextStage?.replace(/_/g, ' ') || 'done'} on ${nextDateEU || 'n/a'}`;
      const updatedNotes = location.notesInternal
        ? `${location.notesInternal}\n${logEntry}`
        : logEntry;

      await updatePipelineData(location.locationName, location.businessAddress, {
        pipelineStage: finalFollowUp.nextStage || location.pipelineStage,
        followUpCount: String(count),
        lastFollowUpDate: todayEU,
        nextActionDate: nextDateEU,
        nextActionType: finalFollowUp.nextActionType || '',
        automationStatus: 'pending',
        notesInternal: updatedNotes,
      });

      // Schedule calendar event silently
      if (nextDateISO && finalFollowUp.nextStage && !['closed_lost','closed_won'].includes(finalFollowUp.nextStage)) {
        const nextLoc = { ...location, nextActionDate: nextDateISO, pipelineStage: finalFollowUp.nextStage };
        const nextFU = getFollowUpMessage(nextLoc, user?.displayName || user?.name, null);
        createFollowUpEvent(nextLoc, nextDateISO, finalFollowUp.nextStage, nextFU?.body || '').catch(() => {});
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to advance pipeline:', err);
      setMarking(false);
    }
  };

  // Primary action: Send via WA + mark done (auto-date)
  const handleSendAndDone = (e) => {
    e.stopPropagation();
    if (marking || !followUp) return;
    if (isOrderConfirm) {
      const now = new Date();
      const daysUntilTue = (2 - now.getDay() + 7) % 7 || 7;
      const nextTue = new Date(now);
      nextTue.setDate(nextTue.getDate() + daysUntilTue);
      setPickedDate(toISODateString(nextTue));
      setShowDatePicker(true);
      return;
    }
    // Open WA
    if (followUp.waLink) window.open(followUp.waLink, '_blank');
    // Mark done with auto-date
    executeDone(getAutoNextDate(), followUp);
  };

  const handleConfirmOrderDone = async (e) => {
    e.stopPropagation();
    if (marking) return;
    setShowDatePicker(false);
    const finalFollowUp = getFollowUpMessage(
      location, user?.displayName || user?.name, { deliveryDate: pickedDate }
    );
    const deliveryD = new Date(pickedDate + 'T00:00:00');
    const monday = new Date(deliveryD);
    monday.setDate(monday.getDate() - 1);
    if (finalFollowUp?.waLink) window.open(finalFollowUp.waLink, '_blank');
    await executeDone(toISODateString(monday), finalFollowUp);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!followUp?.body) return;
    navigator.clipboard.writeText(followUp.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEmail = (e) => {
    e.stopPropagation();
    const email = location.businessEmail || location.directEmail || '';
    if (!email || !followUp?.body) return;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent('Belarro')}&body=${encodeURIComponent(followUp.body)}`;
  };

  const handleCalendar = (e) => {
    e.stopPropagation();
    window.open(generateGoogleCalendarUrl(location, followUp?.body || '', window.location.origin + '/?view=tasks'), '_blank');
  };

  const handleMenu = (e) => {
    e.stopPropagation();
    const lang = (location.language || 'DE').toUpperCase();
    const base = lang === 'EN' ? 'https://belarro.com/for-chefs' : 'https://belarro.com/de/for-chefs';
    const params = new URLSearchParams();
    if (location.locationName) params.set('r', location.locationName);
    if (location.contactPerson) params.set('p', location.contactPerson);
    if (location.contactTitle) params.set('t', location.contactTitle);
    const link = `${base}?${params.toString()}`;
    let phone = (location.directPhone || location.businessPhone || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
    for (const code of ['49','44','43','972','1']) {
      if (phone.startsWith(code + code)) { phone = phone.slice(code.length); break; }
    }
    if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(link)}`, '_blank');
    else navigator.clipboard.writeText(link);
  };

  // Format a due date string nicely
  const formatDue = (dateStr) => {
    if (!dateStr) return '';
    const m = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    const iso = m ? `${m[3]}-${m[2]}-${m[1]}` : dateStr;
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="task-card" onClick={() => onSelect(location)} style={{ cursor: 'pointer' }}>
      <div className="task-card-accent" style={{ backgroundColor: accentColor }} />
      <div className="task-card-body">

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px', gap: '8px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '700', color: 'var(--color-text-main)', margin: 0 }}>
            {location.locationName}
          </h3>
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
            background: isOverdueCard ? 'var(--color-danger-light)' : isTodayCard ? '#dcfce7' : `${accentColor}18`,
            color: isOverdueCard ? 'var(--color-danger)' : isTodayCard ? '#16a34a' : accentColor,
            fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0
          }}>
            {urgencyLabel}
          </span>
        </div>

        {/* ── Contact ── */}
        {location.contactPerson && (
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '1px' }}>
            {location.contactPerson}{location.contactTitle ? ` · ${location.contactTitle}` : ''}
          </div>
        )}
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          {location.businessAddress}
        </div>

        {/* ── Stage dots + due date ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <StageDots stage={location.pipelineStage} accentColor={accentColor} />
          {location.nextActionDate && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
              {formatDue(location.nextActionDate)}
            </span>
          )}
        </div>

        {/* ── Follow-up history summary ── */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowHistory(h => !h); }}
          style={{
            width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)', padding: '7px 10px', marginBottom: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '700', color: followUpCount > 0 ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
              {followUpCount} follow-up{followUpCount !== 1 ? 's' : ''} sent
            </span>
            {location.lastFollowUpDate && (
              <span>· Last: {formatDue(location.lastFollowUpDate)}</span>
            )}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ color: 'var(--color-text-muted)', transform: showHistory ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* ── History log ── */}
        {showHistory && (
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--color-bg-secondary)', borderRadius: 'var(--border-radius-sm)',
            padding: '8px 10px', marginBottom: '10px', marginTop: '-6px',
            border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 6px 6px'
          }}>
            {historyLines.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No history yet</div>
            ) : historyLines.map((line, i) => (
              <div key={i} style={{ fontSize: '11px', color: 'var(--color-text-muted)', padding: '3px 0',
                borderBottom: i < historyLines.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                {line}
              </div>
            ))}
          </div>
        )}

        {/* ── Message preview ── */}
        {followUp?.body && (
          <div style={{
            fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--border-radius-sm)', padding: '8px 10px', marginBottom: '10px',
            borderLeft: `3px solid ${accentColor}`, lineHeight: '1.5',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {followUp.body}
          </div>
        )}

        {/* ── Primary action: Send & Done ── */}
        {!showDatePicker ? (
          <button
            className="task-send-btn"
            onClick={handleSendAndDone}
            disabled={marking}
            style={{
              width: '100%', padding: '11px', marginBottom: '8px',
              background: marking ? 'var(--color-border)' : '#25D366',
              color: '#fff', border: 'none', borderRadius: 'var(--border-radius-md)',
              fontSize: '14px', fontWeight: '700', cursor: marking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'opacity 150ms',
            }}
          >
            {marking ? (
              <span>Saving...</span>
            ) : (
              <>
                {Icons.whatsapp}
                <span>{isOrderConfirm ? 'Confirm Order & Send' : 'Send Follow-up & Done'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </button>
        ) : (
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)', padding: '10px', marginBottom: '8px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '8px' }}>
              Pick delivery Tuesday:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="date" value={pickedDate} onChange={(e) => setPickedDate(e.target.value)}
                min={toISODateString(new Date())}
                style={{ flex: 1, padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '14px', background: 'var(--color-bg-input,#fff)' }}
              />
              <button className="task-action-btn task-action-done" onClick={handleConfirmOrderDone} disabled={!pickedDate} style={{ padding: '8px 12px' }}>
                {Icons.check}<span>Confirm</span>
              </button>
              <button className="task-action-btn" onClick={(e) => { e.stopPropagation(); setShowDatePicker(false); }} style={{ padding: '8px 10px' }}>
                <span>✕</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Secondary: Copy + Email only ── */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="task-action-btn" onClick={handleCopy} title="Copy message" style={{ flex: 1 }}>
            {copied ? Icons.check : Icons.copy}
            <span>{copied ? 'Copied' : 'Copy text'}</span>
          </button>
          {hasEmail && (
            <button className="task-action-btn task-action-email" onClick={handleEmail} title="Send email" style={{ flex: 1 }}>
              {Icons.email}<span>Email</span>
            </button>
          )}
        </div>

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
