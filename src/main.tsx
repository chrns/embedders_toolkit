import { render } from 'preact';
import { Router, Route } from 'wouter';
import { lazy, Suspense } from 'preact/compat';
import 'virtual:uno.css';
import './styles.css';
import { AppShell } from './ui/AppShell';

const Home = lazy(() => import('./pages/Home'));
const OhmsLaw = lazy(() => import('./tabs/OhmLaw'));
const ConductorImpedance = lazy(() => import('./tabs/ConductorImpedance'));

function Loading() { return <div class="p-4">Loading...</div>; }

render(
  <Router>
    <AppShell>
      <Suspense fallback={<Loading/>}>
        <Route path="/" component={Home} />
        <Route path="/ohm" component={OhmsLaw} />
        <Route path="/impedance" component={ConductorImpedance} />
      </Suspense>
    </AppShell>
  </Router>,
  document.getElementById('app')!
);