import { useMemo, useState } from 'preact/hooks';
import { Panel } from '@/ui/Panel';
import { ResultCard } from '@/ui/ResultCard';
import { SubTabs } from '@/ui/SubTabs';
import { SIField } from '@/ui/SIField';
import { Field } from '@/ui/Field';
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
    <div class="grid">
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
              { key: 'resistor', label: 'Resistor' },
              { key: 'capacitor', label: 'Capacitor' },
              { key: 'inductor', label: 'Inductor' },
              { key: 'ntc', label: 'NTC' },
              { key: 'rlc', label: 'Divider' }
            ]}
            active={tab}
            onSelect={setTab}
          />
          {tab === 'led' && <Led/>}
          {tab === 'resistor' && <ResistorTab/>}
          {tab === 'capacitor' && <CapacitorTab/>}
          {tab === 'inductor' && <InductorTab/>}
          {tab === 'ntc' && <NTCTab/>}
          {tab == 'rlc' && <RLCTab/>}
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

function PTCStub() {
  return <div class="small">PTC calculator stub — add your curve model later.</div>;
}

function ResistorTab() {
  // comma-separated capacitances, SI-friendly
  const [list, setList] = useState('10k, 4k7, 1M');
  const [voltage, setVoltage] = useState('5');

  // Parse values like "10k, 4k7, 1M" -> [1e4, 4.7e3, 1e6]
  const res: number[] = list
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(v => parseSI(v))
    .filter((x): x is number => typeof x === 'number' && isFinite(x) && x > 0);

  const V = parseSI(voltage) ?? 0;

  // Series: sum
  const Rser = res.reduce((a, c) => a + c, 0);

  // Parallel: 1 / (sum 1/Ri)
  const Rpar = (() => {
    const denom = res.reduce((a, c) => a + (1 / c), 0);
    return denom > 0 ? 1 / denom : 0;
  })();

  // FIXME: for every resistor!
  const Ppar = V * V / Rpar;
  const Pser = V * V / Rser;

  return (
    <div class="grid cols-2">
      <div class="flex flex-col gap-3">
        <Field
          label="Resistors (comma-separated)"
          value={list}
          onInput={setList}
          type="text"
          placeholder="e.g. 10k, 4k7, 1M"
        />
        <SIField
          label="Voltage"
          value={voltage}
          setValue={setVoltage}
          suffix="V"
          placeholder="e.g. 5"
        />
      </div>

      <ResultCard
        rows={[
          {
            label: 'Parallel',
            value: `${formatSI(Rpar, 'Ω')}  —  P=${formatSI(Ppar, 'W')}`
          },
          {
            label: 'Series',
            value: `${formatSI(Rser, 'Ω')}  —  P=${formatSI(Pser, 'W')}`
          }
        ]}
      />
    </div>
  );
}

function CapacitorTab() {
  // comma-separated capacitances, SI-friendly
  const [list, setList] = useState('10n, 100n, 1u');
  const [voltage, setVoltage] = useState('5');

  // Parse values like "10n,100n,1u" -> [1e-8, 1e-7, 1e-6]
  const caps: number[] = list
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(v => parseSI(v))
    .filter((x): x is number => typeof x === 'number' && isFinite(x) && x > 0);

  const V = parseSI(voltage) ?? 0;

  // Parallel: sum
  const Cpar = caps.reduce((a, c) => a + c, 0);

  // Series: 1 / (sum 1/Ci)
  const Cser = (() => {
    const denom = caps.reduce((a, c) => a + (1 / c), 0);
    return denom > 0 ? 1 / denom : 0;
  })();

  const Qpar = Cpar * V; // Coulombs
  const Qser = Cser * V;

  return (
    <div class="grid cols-2">
      <div class="flex flex-col gap-3">
        <Field
          label="Capacitors (comma-separated)"
          value={list}
          onInput={setList}
          type="text"
          placeholder="e.g. 10n, 100n, 1u"
        />
        <SIField
          label="Voltage"
          value={voltage}
          setValue={setVoltage}
          suffix="V"
          placeholder="e.g. 5"
        />
      </div>

      <ResultCard
        rows={[
          {
            label: 'Parallel',
            value: `${formatSI(Cpar, 'F')}  —  Q=${formatSI(Qpar, 'C')}`
          },
          {
            label: 'Series',
            value: `${formatSI(Cser, 'F')}  —  Q=${formatSI(Qser, 'C')}`
          }
        ]}
      />
    </div>
  );
}

function InductorTab() {
  // comma-separated capacitances, SI-friendly
  const [list, setList] = useState('10n, 100n, 1u');
  const [current, setCurrent] = useState('100m');

  // Parse values like "10n,100n,1u" -> [1e-8, 1e-7, 1e-6]
  const inducs: number[] = list
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(v => parseSI(v))
    .filter((x): x is number => typeof x === 'number' && isFinite(x) && x > 0);

  const I = parseSI(current) ?? 0;

  // Series: sum
  const Lser = inducs.reduce((a, c) => a + c, 0);

  // Parallel: 1 / (sum 1/Li)
  const Lpar = (() => {
    const denom = inducs.reduce((a, c) => a + (1 / c), 0);
    return denom > 0 ? 1 / denom : 0;
  })();

  const Qpar = (I * I * Lpar) / 2;
  const Qser = (I * I * Lser) / 2;

  return (
    <div class="grid cols-2">
      <div class="flex flex-col gap-3">
        <Field
          label="Inductors (comma-separated)"
          value={list}
          onInput={setList}
          type="text"
          placeholder="e.g. 10n, 100n, 1u"
        />
        <SIField
          label="Current"
          value={current}
          setValue={setCurrent}
          suffix="A"
          placeholder="e.g. 100m"
        />
      </div>

      <ResultCard
        rows={[
          {
            label: 'Parallel',
            value: `${formatSI(Lpar, 'H')}  —  W=${formatSI(Qpar, 'J')}`
          },
          {
            label: 'Series',
            value: `${formatSI(Lser, 'H')}  —  W=${formatSI(Qser, 'J')}`
          }
        ]}
      />
    </div>
  );
}

type RLC_Solver = 'R' | 'L' | 'C';

function RLCTab() {
  const [rlcSolveFor, setRlcSolveFor] = useState<RLC_Solver>('R');
  const [Voltage, setVoltage] = useState('3.3');
  const [Value1, setValue_1] = useState('1');
  const [Value2, setValue_2] = useState('1');
  const suffixMap: Record<RLC_Solver, string> = { R: 'Ω', L: 'H', C: 'F' };

  const Result = 0;

  const solved = useMemo(() => {
    const voltage = parseSI(Voltage) ?? 0;
    const val1 = parseSI(Value1) ?? 0;
    const val2 = parseSI(Value2) ?? 0;

    let out = { Result }
    try {
      if (rlcSolveFor === 'R') out.Result = voltage * (val2 / (val1 + val2));
      if (rlcSolveFor === 'L') out.Result = voltage * (val2 / (val1 + val2));
      if (rlcSolveFor === 'C') out.Result = voltage * (val2 / (val1 + val2)); // FIXME
    } catch {}
    return out;
  }, [rlcSolveFor, Voltage, Value1, Value2]);

  return (
    <div class="grid cols-2">
      <div class="flex flex-col gap-3">
          <div class="tabs">
            {(['R','L','C'] as RLC_Solver[]).map(k => (
              <button class="tab-btn" aria-selected={rlcSolveFor===k} onClick={()=>setRlcSolveFor(k)}>{k}</button>
            ))}
          </div>
          <div class="grid cols-2">
            <SIField
              label={<>{rlcSolveFor}<sub>1</sub></>}
              value={Value1}
              setValue={setValue_1}
              placeholder="10k"
              suffix={suffixMap[rlcSolveFor]}
            />
            <SIField
              label={<>{rlcSolveFor}<sub>2</sub></>}
              value={Value2}
              setValue={setValue_2}
              placeholder="10k"
              suffix={suffixMap[rlcSolveFor]}
            />
            <SIField label="Voltage" value={Voltage} setValue={setVoltage} placeholder="3.3" suffix='V' />
          </div>
        </div>
        
        <ResultCard rows={[
          { label: <>V<sub>out</sub></>, value: formatSI(solved.Result, ' V') }
        ]} />
    </div>
  );
}


function NTCTab() {
  const [RCalib, setRCalib] = useState('10k');
  const [TCalib, setTCalib] = useState('25');
  const [Beta, setBeta] = useState('4000');
  const [Tolerance, setTolerance] = useState('1');
  const [TTarget, setTTarget] = useState('75');

  const R = parseSI(RCalib) ?? 0;
  const T = parseSI(TCalib) ?? 0;
  const B = parseSI(Beta) ?? 0;
  const Tol = parseSI(Tolerance) ?? 0;
  const TTar = parseSI(TTarget) ?? 0;
  
  const TypicalR = R * Math.pow(2.71828, B * (1 / (TTar + 273.15) - 1 / (T + 273.15)));
  const MinR = (1 - Tol / 100) * TypicalR ;
  const MaxR = (1 + Tol / 100) * TypicalR;

  return (
    <div class="grid cols-2">
      <div class="grid">
        <SIField label="Calibration resistance" value={RCalib} setValue={setRCalib} suffix="Ω" />
        <SIField label="Calibration temperature" value={TCalib} setValue={setTCalib} suffix="°C" />
        <SIField label="Thermistor beta" value={Beta} setValue={setBeta} suffix="K" />
        <SIField label="Tolerance" value={Tolerance} setValue={setTolerance} suffix="%" />
        <SIField label="Target temperature" value={TTarget} setValue={setTTarget} suffix="°C" />
      </div>
      <ResultCard rows={[
        {
          label:'Typical resistance at 75 °C',
          value: `${formatSI(TypicalR, 'Ω')}`
        },
        {
          label:'Min resistance',
          value: `${formatSI(MinR, 'Ω')}`
        },
        {
          label:'Max resistance',
          value: `${formatSI(MaxR, 'Ω')}`
        }
        ]} />
    </div>
  );
}

