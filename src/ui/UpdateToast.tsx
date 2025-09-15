import { useEffect, useState, useRef } from 'preact/hooks';

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
  const [reloading, setReloading] = useState(false);
  const waitingUrlRef = useRef<string | null>(null);

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
        try { localStorage.removeItem('sw-notified'); } catch {}
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
            const url = (newSW as any).scriptURL as string | undefined;
            waitingUrlRef.current = url ?? null;
            const lastNotified = (() => { try { return localStorage.getItem('sw-notified'); } catch { return null; } })();
            if (!url || lastNotified !== url) {
              setWaitingSW(newSW);
              setVisible(true);
            }
          }
        });
      });

      // If an updated worker is already waiting (e.g., after a background check)
      if (reg.waiting) {
        const url = (reg.waiting as any).scriptURL as string | undefined;
        waitingUrlRef.current = url ?? null;
        const lastNotified = (() => { try { return localStorage.getItem('sw-notified'); } catch { return null; } })();
        if (!url || lastNotified !== url) {
          setWaitingSW(reg.waiting);
          setVisible(true);
        }
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
        onClick={async () => {
          if (reloading) return;
          setReloading(true);
          setShouldReload(true);
          try { sessionStorage.setItem('sw-skipwaiting-clicked', '1'); } catch {}

          try {
            const reg = await navigator.serviceWorker.getRegistration();
            const sw = reg?.waiting || waitingSW;
            if (sw) {
              // When the waiting SW activates, we’ll get controllerchange. Add an extra guard here too.
              const onState = () => {
                if (sw.state === 'activated') {
                  try { localStorage.removeItem('sw-notified'); } catch {}
                  window.location.replace(window.location.href);
                }
              };
              try { sw.addEventListener('statechange', onState); } catch {}

              // Ask it to activate now
              sw.postMessage({ type: 'SKIP_WAITING' });

              // Fallback: if nothing happens soon, hard-reload anyway
              window.setTimeout(() => {
                window.location.replace(window.location.href);
              }, 2500);
            } else {
              // No waiting SW? Trigger an update check and fallback reload.
              await reg?.update();
              window.setTimeout(() => {
                window.location.replace(window.location.href);
              }, 1200);
            }
          } catch {
            // As a last resort, hard reload
            window.location.replace(window.location.href);
          }
        }}
      >
        { reloading ? 'Updating…' : 'Reload' }
      </button>
      <button
        class="button ghost"
        disabled={reloading}
        onClick={() => {
          try {
            if (waitingUrlRef.current) localStorage.setItem('sw-notified', waitingUrlRef.current);
          } catch {}
          setVisible(false);
        }}
      >Later</button>
    </div>
  );
}