// ============================================
// SHARED SETTINGS HOOK — localStorage persistence
// ============================================

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'saletracker_settings';

const DEFAULTS = {
  userPhone: '',
  notificationsEnabled: false,
  notificationTime: '07:30',
  lastNotifDate: '',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  return [settings, updateSetting];
}
