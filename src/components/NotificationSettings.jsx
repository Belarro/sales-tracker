// ============================================
// NOTIFICATION SETTINGS — inline panel
// ============================================

import { useState } from 'react';
import { createRecurringReminder } from '../utils/googleCalendar.js';
import { toISODateString } from '../utils/dateUtils.js';

const NotificationSettings = ({ settings, onUpdateSetting, onClose }) => {
  const [permissionState, setPermissionState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const handleEnable = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === 'granted') {
      onUpdateSetting('notificationsEnabled', true);
      // Show a test notification
      new Notification('Sales Tracker', {
        body: 'Notifications enabled! You will get a morning reminder.',
        tag: 'test',
      });
    }
  };

  const handleDisable = () => {
    onUpdateSetting('notificationsEnabled', false);
  };

  const isSupported = typeof Notification !== 'undefined';
  const isGranted = permissionState === 'granted';
  const isDenied = permissionState === 'denied';
  const isEnabled = settings.notificationsEnabled && isGranted;

  return (
    <div className="notif-settings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>Notifications</h3>
        {onClose && (
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
            Done
          </button>
        )}
      </div>

      {!isSupported && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Notifications are not supported in this browser. Try adding the app to your home screen first.
        </p>
      )}

      {isSupported && isDenied && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      )}

      {isSupported && !isDenied && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Morning reminder
            </span>
            <button
              onClick={isEnabled ? handleDisable : handleEnable}
              className={`notif-toggle ${isEnabled ? 'on' : ''}`}
            >
              <span className="notif-toggle-knob" />
            </button>
          </div>

          {isEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Remind at
              </span>
              <input
                type="time"
                value={settings.notificationTime || '07:30'}
                onChange={(e) => onUpdateSetting('notificationTime', e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  background: 'var(--color-bg-input)',
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Set up recurring Monday + Thursday calendar reminders */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
          Follow-up day reminders
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0 0 8px 0', lineHeight: '1.4' }}>
          Add recurring Monday + Thursday 8am events to Google Calendar so you never forget to open Sales Tracker.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '8px 14px' }}
            disabled={settings.mondayReminderSet}
            onClick={async () => {
              try {
                const now = new Date();
                const daysToMon = (1 - now.getDay() + 7) % 7 || 7;
                const nextMon = new Date(now);
                nextMon.setDate(nextMon.getDate() + daysToMon);
                await createRecurringReminder('MO', toISODateString(nextMon));
                onUpdateSetting('mondayReminderSet', true);
              } catch (err) {
                console.error('Failed to create Monday reminder:', err);
                alert('Failed to create calendar event. Please sign out and sign back in.');
              }
            }}
          >
            {settings.mondayReminderSet ? 'Monday added' : 'Add Monday 8am'}
          </button>
          <button
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '8px 14px' }}
            disabled={settings.thursdayReminderSet}
            onClick={async () => {
              try {
                const now = new Date();
                const daysToThu = (4 - now.getDay() + 7) % 7 || 7;
                const nextThu = new Date(now);
                nextThu.setDate(nextThu.getDate() + daysToThu);
                await createRecurringReminder('TH', toISODateString(nextThu));
                onUpdateSetting('thursdayReminderSet', true);
              } catch (err) {
                console.error('Failed to create Thursday reminder:', err);
                alert('Failed to create calendar event. Please sign out and sign back in.');
              }
            }}
          >
            {settings.thursdayReminderSet ? 'Thursday added' : 'Add Thursday 8am'}
          </button>
        </div>
      </div>

      {/* Phone number for WhatsApp summary */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
          Your phone (for WhatsApp summary)
        </div>
        <input
          type="tel"
          placeholder="+49 159..."
          value={settings.userPhone || ''}
          onChange={(e) => onUpdateSetting('userPhone', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-sm)',
            background: 'var(--color-bg-input)',
          }}
        />
      </div>
    </div>
  );
};

export default NotificationSettings;
