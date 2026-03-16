import { useEffect, useRef, useCallback } from 'react';

/**
 * Handles the mobile back button behavior:
 * - If a panel is open (location panel, dashboard, admin), close it
 * - If on a non-default view, go back to map
 * - If already on base state (map, no panels), require double-press to exit
 */
export function useBackButton({
  selectedLocation,
  clearSelection,
  showDashboard,
  setShowDashboard,
  showAdminSetup,
  setShowAdminSetup,
  currentView,
  setCurrentView,
}) {
  const lastBackPress = useRef(0);
  const toastTimeout = useRef(null);
  const toastEl = useRef(null);

  const showExitToast = useCallback(() => {
    // Remove existing toast if any
    if (toastEl.current) {
      toastEl.current.remove();
      toastEl.current = null;
    }
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    const toast = document.createElement('div');
    toast.textContent = 'Press back again to exit';
    toast.style.cssText =
      'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
      'background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:8px;' +
      'font-size:14px;z-index:99999;pointer-events:none;transition:opacity 0.3s;';
    document.body.appendChild(toast);
    toastEl.current = toast;

    toastTimeout.current = setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }
      toastEl.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    // Push an initial history entry so we have something to pop
    window.history.pushState({ saletracker: 'base' }, '');

    const handlePopState = (e) => {
      // Always push a new state so the browser doesn't actually navigate away
      window.history.pushState({ saletracker: 'base' }, '');

      // Priority 1: Close location panel
      if (selectedLocation) {
        clearSelection();
        return;
      }

      // Priority 2: Close dashboard
      if (showDashboard) {
        setShowDashboard(false);
        return;
      }

      // Priority 3: Close admin setup
      if (showAdminSetup) {
        setShowAdminSetup(false);
        return;
      }

      // Priority 4: Go back to map view if on another view
      if (currentView !== 'map') {
        setCurrentView('map');
        return;
      }

      // Priority 5: Double-press to exit
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        // Second press within 2 seconds — exit
        // Remove our extra history entry and go back for real
        window.history.go(-2);
        return;
      }

      lastBackPress.current = now;
      showExitToast();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      if (toastEl.current) toastEl.current.remove();
    };
  }, [
    selectedLocation,
    clearSelection,
    showDashboard,
    setShowDashboard,
    showAdminSetup,
    setShowAdminSetup,
    currentView,
    setCurrentView,
    showExitToast,
  ]);
}
