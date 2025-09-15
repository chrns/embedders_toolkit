import { useLocation } from 'wouter';
import { SupportButton } from './SupportButton';
import { ComponentChildren } from 'preact';
import { ThemeToggle } from '@/ui/ThemeToggle';
import { UpdateToast } from '@/ui/UpdateToast';

export function AppShell(props: { children: ComponentChildren }) {
  const [loc, setLoc] = useLocation();

  const showBack = loc !== '/';

  return (
    <div>
      <header class="topbar">

        <div class="flex items-center gap-3">
          {showBack && (
            <button class="back-btn" aria-label="Back to home" onClick={() => setLoc('/')}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          )}
          <div class="brand">Embedder’s Toolkit</div>
        </div>
        <div class="flex items-center gap-2">
          <SupportButton href="https://github.com/sponsors/chrns" />
          <ThemeToggle />
        </div>
      </header>

      <div class="layout">
        <div class="content">{props.children}</div>
      </div>
      <div class="footer-center text-center flex flex-col items-center justify-center gap-1 py-4">
        <UpdateToast />
        <span>
          PWA-ready • {
            (() => {
              const ver = (typeof __APP_VERSION__ !== 'undefined'
                ? __APP_VERSION__
                : (import.meta as any).env?.VITE_APP_VERSION ?? 'dev');
              return /^v?\d/.test(ver) ? `v${ver.replace(/^v/, '')}` : ver;
            })()
          }
        </span>
      </div>
    </div>
  );
}