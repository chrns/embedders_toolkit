import { useEffect, useState } from 'preact/hooks';

function getLocalVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : (import.meta as any).env?.VITE_APP_VERSION) as string | undefined;
    return (v && String(v)) || 'dev';
  } catch {
    return 'dev';
  }
}

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

  useEffect(() => {
    let intervalId: number | undefined;
    const ctrl = new AbortController();

    const ensureSW = async () => {
      if (!('serviceWorker' in navigator)) return;
      const existing = await navigator.serviceWorker.getRegistration();
      if (!existing) {
        try {
          await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        } catch {}
      }
    };

    const check = async () => {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) return;
      const sv = await fetchServerVersion(ctrl.signal);
      if (!sv) return;
      setServerVersion(sv);
      if (sv !== localVersion) setVisible(true);
    };

    // Register SW (if not yet) and check once now
    ensureSW().then(check);

    // Re-check when app becomes visible/online and periodically
    const onOnline = () => check();
    const onVisibility = () => { if (document.visibilityState === 'visible') check(); };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
    intervalId = window.setInterval(check, 60 * 60 * 1000);

    // Reload on controllerchange only if user accepted update
    let controllerChanged = false;
    const onControllerChange = () => {
      if (controllerChanged) return;
      controllerChanged = true;
      const asked = sessionStorage.getItem('sw-accept-update') === '1';
      if (asked) {
        try { sessionStorage.removeItem('sw-accept-update'); } catch {}
        // Hard navigation avoids iOS/Chrome PWA loops
        window.location.replace(window.location.href);
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }

    return () => {
      ctrl.abort();
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalId) clearInterval(intervalId);
      if ('serviceWorker' in navigator) {
        try { navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange as any); } catch {}
      }
    };
  }, [localVersion]);

  async function performUpdate() {
    if (reloading) return;
    setReloading(true);
    try { sessionStorage.setItem('sw-accept-update', '1'); } catch {}

    try {
      if ('serviceWorker' in navigator) {
        const reg1 = await navigator.serviceWorker.getRegistration();
        await reg1?.update();

        let waiting = reg1?.waiting ?? null;

        // Wait for installing → installed → waiting
        if (!waiting && reg1?.installing) {
          await new Promise<void>((resolve) => {
            const sw = reg1.installing!;
            sw.addEventListener('statechange', () => {
              if (sw.state === 'installed') resolve();
            });
          });
          const reg2 = await navigator.serviceWorker.getRegistration();
          waiting = reg2?.waiting ?? null;
        }

        if (!waiting) {
          // Try re-registering to pick up a fresh sw.js without cache
          try { await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }); } catch {}
          const reg3 = await navigator.serviceWorker.getRegistration();
          waiting = reg3?.waiting ?? null;
        }

        if (waiting) {
          try { waiting.postMessage({ type: 'SKIP_WAITING' }); } catch {}
          // Fallback in case controllerchange doesn’t fire
          setTimeout(() => window.location.replace(window.location.href), 2500);
          return;
        }
      }
    } catch {}

    // Last resort: cache-busted reload
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