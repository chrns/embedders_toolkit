import { useMemo, useState } from 'preact/hooks';
import { Panel } from '@/ui/Panel';
import { Field } from '@/ui/Field';
import { Select } from '@/ui/Select';
import { RadioGroup } from '@/ui/RadioGroup';
import { Slider } from '@/ui/Slider';
import { ResultCard } from '@/ui/ResultCard';
import { microstripZ0 } from '@/lib/microstrip';
import { c, inch, mil, mm } from '@/lib/units';

type Units = 'imperial' | 'metric';

export default function ConductorImpedance() {
  const [units, setUnits] = useState<Units>('imperial');
  const [w, setW] = useState('17'); // mils or mm
  const [h, setH] = useState('10');
  const [freq, setFreq] = useState('500'); // MHz
  const [er, setEr] = useState('4.6');
  const [material, setMaterial] = useState('FR-4 STD');
  const [tempRise, setTempRise] = useState(20);
  const [ambient, setAmbient] = useState(22);
  const [copper, setCopper] = useState('1oz');

  // convert to meters
  const w_m = useMemo(() => units === 'imperial' ? parseFloat(w) * mil : parseFloat(w) * mm, [w, units]);
  const h_m = useMemo(() => units === 'imperial' ? parseFloat(h) * mil : parseFloat(h) * mm, [h, units]);
  const t_m = useMemo(() => {
    const oz_to_um = { '0.5oz':17.5, '1oz':35, '1.5oz':52.5, '2oz':70, '2.5oz':87.5, '3oz':105, '4oz':140, '5oz':175 };
    const um = oz_to_um[copper as keyof typeof oz_to_um] ?? 35;
    return um * 1e-6; // meters
  }, [copper]);

  const { Z0, e_eff } = useMemo(() => microstripZ0({
    w: w_m || 1e-6, h: h_m || 1e-6, t: t_m, er: parseFloat(er) || 4.2
  }), [w_m, h_m, t_m, er]);

  // Per-length parameters from Z0 and velocity
  const v = c / Math.sqrt(e_eff); // m/s
  const Z0n = Z0 || 50;
  const L_per_m = Z0n / v;              // H/m
  const C_per_m = 1 / (Z0n * v);        // F/m

  const per_inch = (x:number) => x * inch;

  const rows = [
    { label: 'Zo', value: `${Z0n.toFixed(4)} Ω` },
    { label: 'Lo', value: `${(per_inch(L_per_m) * 1e9).toFixed(4)} nH/in` },
    { label: 'Co', value: `${(per_inch(C_per_m) * 1e12).toFixed(4)} pF/in` },
    { label: 'Tpd', value: `${(inch / v * 1e12).toFixed(4)} ps/in` }
  ];

  return (
    <div class="grid cols-2">
      <div class="flex flex-col gap-4">
        <Panel>
          <h2>Conductor Impedance</h2>
          <div class="grid cols-2">
            <Field label={`Conductor Width (W)`} value={w} onInput={setW} suffix={units==='imperial'?'mils':'mm'} type="number" step="any"/>
            <Field label={`Conductor Height (H)`} value={h} onInput={setH} suffix={units==='imperial'?'mils':'mm'} type="number" step="any"/>
            <Field label="Frequency" value={freq} onInput={setFreq} suffix="MHz" type="number" step="any"/>
          </div>
        </Panel>

        <Panel>
          <div class="grid cols-2">
            <img alt="microstrip diagram" src="data:image/svg+xml;utf8,               <svg xmlns='http://www.w3.org/2000/svg' width='300' height='120'>                 <rect x='10' y='80' width='280' height='20' fill='%23099'/>                 <rect x='60' y='60' width='180' height='18' rx='4' fill='%2339d'/>                 <line x1='100' y1='50' x2='200' y2='50' stroke='white'/>                 <text x='145' y='45' fill='white' font-size='12'>W</text>               </svg>" />
            <ResultCard rows={rows} />
          </div>
        </Panel>
      </div>

      <aside class="sidebar">
        <Panel title="Options">
          <RadioGroup
            label="Base Copper Weight"
            value={copper}
            onChange={setCopper}
            options={[ '0.5oz','1oz','1.5oz','2oz','2.5oz','3oz','4oz','5oz' ].map(v => ({label:v, value:v}))}
          />

          <RadioGroup
            label="Units"
            value={units}
            onChange={(v)=>setUnits(v as Units)}
            options={[{label:'Imperial', value:'imperial'},{label:'Metric', value:'metric'}]}
          />

          <Select
            label="Material Selection"
            value={material}
            onChange={setMaterial}
            options={[
              {label:'FR-4 STD', value:'FR-4 STD'},
              {label:'FR-4 High Tg', value:'FR-4 High Tg'},
              {label:'Rogers 4350', value:'Rogers 4350'}
            ]}
          />

          <Field label="Er" value={er} onInput={setEr} type="number" step="any" />
          <Slider label="Temp Rise (°C)" value={tempRise} min={0} max={70} onInput={setTempRise} />
          <Slider label="Ambient Temp (°C)" value={ambient} min={-20} max={80} onInput={setAmbient} />
          <div class="flex gap-2">
            <button class="button">Solve!</button>
            <button class="button ghost">Print</button>
          </div>
          <div class="small mt-2">Er Effective {(e_eff).toFixed(4)}</div>
          <div class="small">Total Copper Thickness {(t_m*1e6).toFixed(2)} μm</div>
        </Panel>
      </aside>
    </div>
  );
}
