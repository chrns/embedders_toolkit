import { CardButton } from '@/ui/CardButton';
import OhmIcon from '@/ui/icons/OhmsIcon';
import TraceIcon from '@/ui/icons/TraceIcon';

export default function Home() {
  return (
    <div class="home-grid">
      <CardButton href="/ohm" label="Ohm's Law">
        <OhmIcon />
      </CardButton>

      <CardButton href="/impedance" label="Conductor Impedance">
        <TraceIcon />
      </CardButton>
    </div>
  );
}