import { useMemo, useState } from 'preact/hooks';
import { Panel } from '@/ui/Panel';
import { Field } from '@/ui/Field';
import { ResultCard } from '@/ui/ResultCard';
import { SubTabs } from '@/ui/SubTabs';

type SolveFor = 'V' | 'I' | 'R' | 'P';

export default function OhmsLaw() {
  const [solveFor, setSolveFor] = useState<SolveFor>('V');
  const [amps, setAmps] = useState('1');
  const [ohms, setOhms] = useState('12');
  const [volts, setVolts] = useState('12');
  const [watts, setWatts] = useState('12');

  const solved = useMemo(() => {
    const I = parseFloat(amps) || 0;
    const R = parseFloat(ohms) || 0;
    const V = parseFloat(volts) || 0;
    const P = parseFloat(watts) || 0;

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
            <Field label="Amps" value={amps} onInput={setAmps} type="number" step="any" />
            <Field label="Ohms" value={ohms} onInput={setOhms} type="number" step="any" />
            <Field label="Volts" value={volts} onInput={setVolts} type="number" step="any" />
            <Field label="Wattage" value={watts} onInput={setWatts} type="number" step="any" />
          </div>
          <ResultCard rows={[
            { label: 'Volts', value: solved.V.toFixed(4) + ' V' },
            { label: 'Amps', value: solved.I.toFixed(4) + ' A' },
            { label: 'Ohms', value: solved.R.toFixed(4) + ' Ω' },
            { label: 'Watts', value: solved.P.toFixed(4) + ' W' }
          ]} />
        </Panel>

        <Panel>
          <SubTabs
            tabs={[
              { key: 'led', label: 'LED Bias' },
              { key: 'series', label: 'R Series' },
              { key: 'parallel', label: 'R Parallel' },
              { key: 'ptc', label: 'PTC' }
            ]}
            active={tab}
            onSelect={setTab}
          />
          {tab === 'led' && <LedBias/>}
          {tab === 'series' && <RSeries/>}
          {tab === 'parallel' && <RParallel/>}
          {tab === 'ptc' && <PTCStub/>}
        </Panel>
      </div>

      <aside class="sidebar">
        <Panel title="Options">
          <div class="small">This tab doesn't use substrate/copper options.</div>
        </Panel>
      </aside>
    </div>
  );
}

function LedBias() {
  const [Vs, setVs] = useState('12');
  const [Vf, setVf] = useState('2');
  const [If_mA, setIf] = useState('10');
  const [solveCurrent, setSolveCurrent] = useState(false);
  const [R, setR] = useState('1000');

  const calc = useMemo(() => {
    const VsV = parseFloat(Vs) || 0;
    const VfV = parseFloat(Vf) || 0;
    const IfA = (parseFloat(If_mA) || 0) / 1000;
    const ROhm = parseFloat(R) || 1e-12;
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
        <Field label="+V Value" value={Vs} onInput={setVs} suffix="Volts" type="number" step="any"/>
        <Field label="LED Voltage Drop" value={Vf} onInput={setVf} suffix="Volts" type="number" step="any"/>
        <Field label="LED Current" value={If_mA} onInput={setIf} suffix="mA" type="number" step="any" disabled={!!solveCurrent}/>
        <label class="flex items-center gap-2">
          <input type="checkbox" checked={solveCurrent} onChange={(e)=>setSolveCurrent((e.target as HTMLInputElement).checked)}/>
          <span class="small">Solve for LED Current</span>
        </label>
        <Field label="Resistor Value" value={R} onInput={setR} suffix="Ohms" type="number" step="any" disabled={!solveCurrent}/>
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

  const R = (parseFloat(a)||0)+(parseFloat(b)||0)+(parseFloat(c)||0);
  return (
    <div class="grid cols-2">
      <div class="grid">
        <Field label="R1" value={a} onInput={setA} suffix="Ω" type="number" step="any"/>
        <Field label="R2" value={b} onInput={setB} suffix="Ω" type="number" step="any"/>
        <Field label="R3" value={c} onInput={setC} suffix="Ω" type="number" step="any"/>
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
  const R = 1/ (inv(parseFloat(a)||0)+inv(parseFloat(b)||0)+inv(parseFloat(c)||0));

  return (
    <div class="grid cols-2">
      <div class="grid">
        <Field label="R1" value={a} onInput={setA} suffix="Ω" type="number" step="any"/>
        <Field label="R2" value={b} onInput={setB} suffix="Ω" type="number" step="any"/>
        <Field label="R3" value={c} onInput={setC} suffix="Ω" type="number" step="any"/>
      </div>
      <ResultCard rows={[{label:'Total Resistance', value: (isFinite(R)?R:0).toFixed(3) + ' Ω'}]} />
    </div>
  );
}

function PTCStub() {
  return <div class="small">PTC calculator stub — add your curve model later.</div>;
}
