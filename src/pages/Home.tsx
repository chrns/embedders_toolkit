import { CardButton } from '@/ui/CardButton';
import OhmIcon from '@/ui/icons/OhmsIcon';
import TraceIcon from '@/ui/icons/TraceIcon';
import BatteryIcon from '@/ui/icons/BatteryIcon';

export default function Home() {
  return (
    <div class="home-grid">
      <CardButton href="/ohm" label="Ohm's Law">
        <OhmIcon />
      </CardButton>

      <CardButton href="/impedance" label="Conductor Impedance">
        <TraceIcon />
      </CardButton>

      <CardButton href="/battery" label="Battery Life">
        <BatteryIcon />
      </CardButton>
    </div>
  );
}