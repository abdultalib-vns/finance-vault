// ── FinAura Custom Service Worker Extensions ──────────────────
// Notification Click Handler for Daily Backup Reminder
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || '/?action=daily_backup';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it, post backup trigger message, and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          try {
            client.postMessage({ action: 'trigger_daily_backup', timestamp: Date.now() });
          } catch (err) {}
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no window is currently open, open a new window with the backup action URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
