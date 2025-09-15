import { render } from 'preact';
import { Router, Route } from 'wouter';
import { lazy, Suspense } from 'preact/compat';
import 'virtual:uno.css';
import './styles.css';
import { AppShell } from './ui/AppShell';

const Home = lazy(() => import('./pages/Home'));
const OhmsLaw = lazy(() => import('./tabs/OhmLaw'));
const Impedance = lazy(() => import('./tabs/Impedance'));
const BatteryLife  = lazy(() => import('./tabs/BatteryLife'));

function Loading() { return <div class="p-4">Loading...</div>; }

(() => {
  try {
    const stored = localStorage.getItem('theme');
    const theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    (root as any).style.colorScheme = theme;
  } catch {}
})();

render(
  <Router>
    <AppShell>
      <Suspense fallback={<Loading/>}>
        <Route path="/" component={Home} />
        <Route path="/ohm" component={OhmsLaw} />
        <Route path="/impedance" component={Impedance} />
        <Route path="/battery" component={BatteryLife} />
      </Suspense>
    </AppShell>
  </Router>,
  document.getElementById('app')!
);