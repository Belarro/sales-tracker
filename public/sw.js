// ============================================
// SERVICE WORKER — Sales Tracker PWA
// ============================================

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Handle notification click — open the app to Tasks view
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate('/?view=tasks');
          return;
        }
      }
      // Otherwise open new window
      return self.clients.openWindow('/?view=tasks');
    })
  );
});
