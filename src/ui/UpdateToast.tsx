import { useEffect, useState } from 'preact/hooks';

// Helper: get the build version baked into the app at build time
function getLocalVersion(): string {
  try {
    // __APP_VERSION__ comes from Vite define (fallback to env)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : (import.meta as any).env?.VITE_APP_VERSION) as string | undefined;
    return (v && String(v)) || 'dev';
  } catch {
    return 'dev';
  }
}

// Helper: fetch version.txt from the server (no-cache) to compare
async function fetchServerVersion(signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch('/version.txt', { cache: 'no-cache', redirect: 'follow', signal });
    if (!res.ok) return null;
    const txt = (await res.text()).trim();
    return txt || null;
  } catch {
    return null;
  }
}

export function UpdateToast() {
  const [visible, setVisible] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const localVersion = getLocalVersion();

  // 1) On start, if online, check server version; if mismatched → show banner
  useEffect(() => {
    const ctrl = new AbortController();

    async function check() {
      // Gate on online; if offline, do nothing.
      if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) return;
      const sv = await fetchServerVersion(ctrl.signal);
      if (!sv) return; // can't determine server version
      setServerVersion(sv);
      if (sv !== localVersion) setVisible(true);
    }

    check();

    // When the app goes online (e.g., user disables airplane mode), re-check
    const onOnline = () => check();
    const onVisibility = () => { if (document.visibilityState === 'visible') check(); };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      ctrl.abort();
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [localVersion]);

  // 2) Update flow when user clicks Update
  async function performUpdate() {
    if (reloading) return;
    setReloading(true);

    // Prefer service worker-controlled update if present
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        // Force SW to check for a new version of sw.js
        await reg?.update();

        // If an updated worker is already waiting, activate it
        const sw = reg?.waiting ?? null;
        if (sw) {
          const once = () => {
            // After activation, hard-reload to ensure all resources are from the new version/cache
            window.location.replace(window.location.href);
          };
          try { sw.addEventListener('statechange', once, { once: true } as AddEventListenerOptions); } catch {}
          sw.postMessage({ type: 'SKIP_WAITING' });
          // Safety fallback if events don't fire
          setTimeout(() => window.location.replace(window.location.href), 2000);
          return;
        }

        // If there's an installing worker, wait until it's installed and then skip waiting
        if (reg?.installing) {
          const installing = reg.installing;
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              installing.postMessage?.({ type: 'SKIP_WAITING' });
              setTimeout(() => window.location.replace(window.location.href), 1000);
            }
          });
          return;
        }

        // Otherwise, we may not have a waiting SW yet. Try to register to pick up the new sw.js (cache-busted)
        try {
          await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        } catch {}
      }
    } catch {}

    // Last-resort hard reload with cache-busting to bypass HTTP cache
    const url = new URL(window.location.href);
    url.searchParams.set('v', String(Date.now()));
    window.location.replace(url.toString());
  }

  if (!visible) return null;

  return (
    <div class="update-toast" role="status" aria-live="polite">
      <span>
        New version is available{serverVersion ? `: ${serverVersion}` : ''}.
      </span>
      <button class="button" onClick={performUpdate} disabled={reloading}>
        {reloading ? 'Updating…' : 'Update'}
      </button>
      <button class="button ghost" disabled={reloading} onClick={() => setVisible(false)}>
        Later
      </button>
    </div>
  );
}