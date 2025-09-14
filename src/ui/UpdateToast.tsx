

import { useEffect, useState } from 'preact/hooks';

/**
 * UpdateToast — shows a small banner when a new PWA version is available.
 *
 * Requirements:
 *  - A service worker at /sw.js that responds to {type:'SKIP_WAITING'} by calling self.skipWaiting().
 *  - On activate, the SW should call clients.claim().
 */
export function UpdateToast() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let intervalId: number | undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then(reg => reg?.update());
      }
    };

    // Ensure a SW is present (no-op if already registered elsewhere)
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      try {
        if (!reg) {
          reg = await navigator.serviceWorker.register('/sw.js');
        }
      } catch {
        // SW failed to register; bail out silently
        return;
      }

      // Check once now, also on tab focus/visibility, and hourly
      reg.update();
      document.addEventListener('visibilitychange', onVisibility);
      intervalId = window.setInterval(() => reg?.update(), 60 * 60 * 1000);

      // Listen for a new worker getting installed
      reg.addEventListener('updatefound', () => {
        const newSW = reg!.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          // If there's already a controller, an installed SW means an update
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingSW(newSW);
            setVisible(true);
          }
        });
      });

      // If an updated worker is already waiting (e.g., after a background check)
      if (reg.waiting) {
        setWaitingSW(reg.waiting);
        setVisible(true);
      }

      // When the new SW takes control, reload the page to the fresh version
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (!visible) return null;

  return (
    <div class="update-toast" role="status" aria-live="polite">
      <span>New version is available.</span>
      <button
        class="button"
        onClick={() => {
          // Ask the waiting SW to activate immediately
          waitingSW?.postMessage({ type: 'SKIP_WAITING' });
        }}
      >
        Reload
      </button>
      <button class="button ghost" onClick={() => setVisible(false)}>Later</button>
    </div>
  );
}