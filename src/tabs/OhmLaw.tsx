import { useMemo, useState } from 'preact/hooks';
import { Panel } from '@/ui/Panel';
import { ResultCard } from '@/ui/ResultCard';
import { SubTabs } from '@/ui/SubTabs';
import { SIField } from '@/ui/SIField';
import { parseSI, formatSI } from '@/lib/si';
import { LEDVfSelect } from '@/ui/LEDVfSelect';

type SolveFor = 'V' | 'I' | 'R' | 'P';

export default function OhmsLaw() {
  const [solveFor, setSolveFor] = useState<SolveFor>('V');
  const [amps, setAmps] = useState('1');
  const [ohms, setOhms] = useState('12');
  const [volts, setVolts] = useState('12');
  const [watts, setWatts] = useState('12');

  const solved = useMemo(() => {
    const I = parseSI(amps) ?? 0;
    const R = parseSI(ohms) ?? 0;
    const V = parseSI(volts) ?? 0;
    const P = parseSI(watts) ?? 0;

    let out = { V, I, R, P };
    try {
      if (solveFor === 'V') out.V = I * R;
      if (solveFor === 'I') out.I = V / (R||1e-12);
      if (solveFor === 'R') out.R = V / (I||1e-12);
      if (solveFor === 'P') out.P = V * I;
    } catch {}
    return out;
  }, [solveFor, amps, ohms, volts, watts]);

  // Sub-tabs
  const [tab, setTab] = useState('led');
  return (
    <div class="grid cols-2">
      <div class="flex flex-col gap-4">
        <Panel>
          <h2>Ohm’s Law</h2>
          <div class="tabs">
            {(['V','I','R','P'] as SolveFor[]).map(k => (
              <button class="tab-btn" aria-selected={solveFor===k} onClick={()=>setSolveFor(k)}>{k}</button>
            ))}
          </div>
          <div class="grid cols-2">
            <SIField label="Ohms" value={ohms} setValue={setOhms} placeholder="e.g. 330, 4k7, 1M" suffix="Ω" disabled={solveFor === 'R'} />
            <SIField label="Volts" value={volts} setValue={setVolts} placeholder="e.g. 5, 3.3, 12V" suffix="V" disabled={solveFor === 'V'} />
            <SIField label="Amps" value={amps} setValue={setAmps} placeholder="e.g. 10m, 2A" suffix="A" disabled={solveFor === 'I'} />
            <SIField label="Wattage" value={watts} setValue={setWatts} placeholder="e.g. 0.25W, 2W" suffix="W" disabled={solveFor === 'P'} />
          </div>
          <ResultCard rows={[
            { label: 'Ohms', value: formatSI(solved.R, 'Ω') },
            { label: 'Volts', value: formatSI(solved.V, 'V') },
            { label: 'Amps', value: formatSI(solved.I, 'A') },
            { label: 'Watts', value: formatSI(solved.P, 'W') }
          ]} />
        </Panel>

        <Panel>
          <SubTabs
            tabs={[
              { key: 'led', label: 'LED' },
              { key: 'r_series', label: 'R Series' },
              { key: 'r_parallel', label: 'R Parallel' },
              { key: 'ptc', label: 'PTC' },
              { key: 'capacitor', label: 'Capacitor' },
              { key: 'inductor', label: 'Inductor' }
            ]}
            active={tab}
            onSelect={setTab}
          />
          {tab === 'led' && <Led/>}
          {tab === 'r_series' && <RSeries/>}
          {tab === 'r_parallel' && <RParallel/>}
          {tab === 'ptc' && <PTCStub/>}
          {tab === 'capacitor' && <Capacitor/>}
          {tab === 'inductor' && <Inductor/>}
        </Panel>
      </div>
    </div>
  );
}

function Led() {
  const [Vs, setVs] = useState('12');
  const [Vf, setVf] = useState('2');
  const [If_mA, setIf] = useState('10');
  const [solveCurrent, setSolveCurrent] = useState(false);
  const [R, setR] = useState('1000');

  const calc = useMemo(() => {
    const VsV = parseSI(Vs) ?? 0;
    const VfV = parseSI(Vf) ?? 0;
    const hasSuffix = /[TGMKkmunpfµR]/.test(If_mA);
    const IfParsed = parseSI(If_mA) ?? 0;
    const IfA = hasSuffix ? IfParsed : IfParsed / 1000; // treat bare numbers as mA
    const ROhm = parseSI(R) ?? 0;
    if (solveCurrent) {
      const I = (VsV - VfV) / ROhm;
      return { R: ROhm, I, P: I*I*ROhm };
    } else {
      const Rneed = (VsV - VfV) / (IfA || 1e-12);
      return { R: Rneed, I: IfA, P: IfA*IfA*Rneed };
    }
  }, [Vs, Vf, If_mA, R, solveCurrent]);

  return (
    <div class="grid cols-2">
      <div class="flex flex-col gap-3">
        <SIField label="+V Value" value={Vs} setValue={setVs} suffix="V" />
        <div class="field">
          <div class="grid cols-2">
            <LEDVfSelect value={Vf} setValue={setVf} />
            <SIField label="V" value={Vf} setValue={setVf} suffix="V" />
          </div>
        </div>
        <SIField label="LED Current" value={If_mA} setValue={setIf} suffix="mA" disabled={!!solveCurrent} />
        <label class="flex items-center gap-2">
          <input type="checkbox" checked={solveCurrent} onChange={(e)=>setSolveCurrent((e.target as HTMLInputElement).checked)}/>
          <span class="small">Solve for LED Current</span>
        </label>
        <SIField label="Resistor Value" value={R} setValue={setR} suffix="Ω" disabled={!solveCurrent} />
      </div>
      <ResultCard rows={[
        { label: 'Resistor Value', value: calc.R.toFixed(3) + ' Ω' },
        { label: 'LED Current', value: (calc.I*1000).toFixed(3) + ' mA' },
        { label: 'Resistor Power Dissipation', value: calc.P.toFixed(4) + ' W' }
      ]} />
    </div>
  );
}

function RSeries() {
  const [a, setA] = useState('100');
  const [b, setB] = useState('220');
  const [c, setC] = useState('330');

  const R = (parseSI(a) || 0) + (parseSI(b) || 0) + (parseSI(c) || 0);
  return (
    <div class="grid cols-2">
      <div class="grid">
        <SIField label="R1" value={a} setValue={setA} suffix="Ω" />
        <SIField label="R2" value={b} setValue={setB} suffix="Ω" />
        <SIField label="R3" value={c} setValue={setC} suffix="Ω" />
      </div>
      <ResultCard rows={[{label:'Total Resistance', value: R.toFixed(3) + ' Ω'}]} />
    </div>
  );
}

function RParallel() {
  const [a, setA] = useState('1000');
  const [b, setB] = useState('1000');
  const [c, setC] = useState('');

  const inv = (x:number)=> x>0? 1/x : 0;
  const R = 1 / (
    inv(parseSI(a) || 0) +
    inv(parseSI(b) || 0) +
    inv(parseSI(c) || 0)
  );

  return (
    <div class="grid cols-2">
      <div class="grid">
        <SIField label="R1" value={a} setValue={setA} suffix="Ω" />
        <SIField label="R2" value={b} setValue={setB} suffix="Ω" />
        <SIField label="R3" value={c} setValue={setC} suffix="Ω" />
      </div>
      <ResultCard rows={[{label:'Total Resistance', value: (isFinite(R)?R:0).toFixed(3) + ' Ω'}]} />
    </div>
  );
}

function PTCStub() {
  return <div class="small">PTC calculator stub — add your curve model later.</div>;
}

function Capacitor() {
  return <div class="small">PTC calculator stub — add your curve model later.</div>;
}

function Inductor() {
  return <div class="small">PTC calculator stub — add your curve model later.</div>;
}
