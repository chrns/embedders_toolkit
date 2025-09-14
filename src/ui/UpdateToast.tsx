

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
  const [shouldReload, setShouldReload] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let intervalId: number | undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then(reg => reg?.update());
      }
    };

    // Guard variable and handler for controllerchange
    let controllerChanged = false;
    const onControllerChange = () => {
      if (controllerChanged) return; // debounce duplicate events
      controllerChanged = true;
      const asked = shouldReload || sessionStorage.getItem('sw-skipwaiting-clicked') === '1';
      if (asked) {
        try { sessionStorage.removeItem('sw-skipwaiting-clicked'); } catch {}
        // Hard navigation helps Safari/iOS avoid reload loops
        window.location.replace(window.location.href);
      }
    };

    // Ensure a SW is present (no-op if already registered elsewhere)
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      try {
        if (!reg) {
          reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        }
      } catch {
        // SW failed to register; bail out silently
        return;
      }

      // Check once now, also on tab focus/visibility, and hourly
      reg.update();
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pageshow', onVisibility);
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

      // Guarded reload to avoid iOS PWA refresh loops
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    });

    // Also use the ready registration (when the SW is already active at load)
    navigator.serviceWorker.ready.then((readyReg) => {
      // Run an immediate update check and on window focus (important for installed PWAs)
      readyReg.update();
      const onFocus = () => readyReg.update();
      window.addEventListener('focus', onFocus);
      // cleanup focus listener when effect unmounts
      // (we cannot remove here; add to outer cleanup below via closure)
      (onFocus as any)._added = true;
      (navigator as any)._updateToastOnFocus = onFocus;
    });

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onVisibility);
      if (intervalId) clearInterval(intervalId);
      try { navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange as any); } catch {}
      try {
        const onFocus = (navigator as any)._updateToastOnFocus;
        if (onFocus && (onFocus as any)._added) {
          window.removeEventListener('focus', onFocus);
          delete (navigator as any)._updateToastOnFocus;
        }
      } catch {}
    };
  }, [shouldReload]);

  if (!visible) return null;

  return (
    <div class="update-toast" role="status" aria-live="polite">
      <span>New version is available.</span>
      <button
        class="button"
        onClick={() => {
          setShouldReload(true);
          try { sessionStorage.setItem('sw-skipwaiting-clicked', '1'); } catch {}
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