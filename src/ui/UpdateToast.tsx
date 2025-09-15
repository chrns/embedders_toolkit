

import { useEffect, useState } from 'preact/hooks';

// Get app version baked at build time (via define or env). Falls back to 'dev'.
function getLocalVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : (import.meta as any).env?.VITE_APP_VERSION) as string | undefined;
    return (v && String(v)) || 'dev';
  } catch {
    return 'dev';
  }
}

// Detect if the app is running as an installed PWA (standalone)
function isInstalledPWA(): boolean {
  // Chrome/Edge
  const standaloneMedia = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  // iOS Safari
  const iosStandalone = typeof navigator !== 'undefined' && (navigator as any).standalone === true;
  // Some Android cases
  const androidRef = typeof document !== 'undefined' && document.referrer && document.referrer.startsWith('android-app://');
  return !!(standaloneMedia || iosStandalone || androidRef);
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

/**
 * UpdateToast — minimal version checker for installed PWAs.
 * Behavior:
 *  - If running as an installed PWA and online, fetch /version.txt.
 *  - If server version ≠ local build version → show a dismissible banner suggesting reinstall.
 *  - When dismissed (X), remember that server version so we don't show it again until a NEW server version appears.
 */
export function UpdateToast() {
  const [visible, setVisible] = useState(false);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const localVersion = getLocalVersion();

  useEffect(() => {
    if (!isInstalledPWA()) return; // Only check for installed apps

    const ctrl = new AbortController();
    const run = async () => {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) return;
      const sv = await fetchServerVersion(ctrl.signal);
      if (!sv) return;
      setServerVersion(sv);

      const dismissedFor = (() => { try { return localStorage.getItem('updateToast.dismissedFor'); } catch { return null; } })();
      if (sv !== localVersion && sv !== dismissedFor) {
        setVisible(true);
      }
    };

    run();

    const onOnline = () => run();
    const onVisible = () => { if (document.visibilityState === 'visible') run(); };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      ctrl.abort();
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [localVersion]);

  if (!visible) return null;

  return (
    <div class="update-toast" role="status" aria-live="polite">
      <span>
        A new version of this app is available{serverVersion ? `: ${serverVersion}` : ''}. Please reinstall to update.
      </span>
      <button
        class="button ghost"
        aria-label="Dismiss update notice"
        onClick={() => {
          try { if (serverVersion) localStorage.setItem('updateToast.dismissedFor', serverVersion); } catch {}
          setVisible(false);
        }}
      >×</button>
    </div>
  );
}