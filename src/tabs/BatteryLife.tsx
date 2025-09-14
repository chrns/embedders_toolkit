import { useMemo, useState } from 'preact/hooks';
import { Panel } from '@/ui/Panel';
import { ResultCard } from '@/ui/ResultCard';
import { SIField } from '@/ui/SIField';
import { Select } from '@/ui/Select';
import { batteries } from '@/lib/units';
import { Field } from '@/ui/Field';
import { parseSI } from '@/lib/si';

export default function BatteryLife() {
  const [batteryType, setBatteryType] = useState('LiSOCL2 (DD36000)');
  const [capacity, setCapacity] = useState('36000');
  const [selfDischarge, setSelfDischarge] = useState('0.08');
  const [nominalVoltage, setNominalVoltage] = useState('3.6');
  const [maxContCurrent, setContCurrent] = useState('450.0');
  const [maxPulseCurrent, setPulseCurrent] = useState('1000.0');

  const [dischargeCurrent, setDischargeCurrent] = useState('100m');

  const [timeFmt, setTimeFmt] = useState<'Hours'|'Days'|'Weeks'|'Months'|'Years'>('Hours');

  const lifeHours = useMemo(() => {
    const C_mAh = Number(capacity) || 0; // capacity in mAh
    const I_A = parseSI(dischargeCurrent) ?? 0; // A
    const I_mA = I_A * 1000; // mA
    if (C_mAh <= 0 || I_mA <= 0) return 0;

    // self-discharge as fraction per month, e.g. 0.08 => 0.0008 / month
    const r_percent = Number(selfDischarge) || 0; // % per month
    const r = r_percent / 100; // fraction per month

    // Convert to continuous decay rate per hour
    const monthHours = 30 * 24; // 720 h
    const k = r / monthHours; // per hour

    if (k <= 0) {
      return C_mAh / I_mA; // no self-discharge → classic formula
    }

    // t = (1/k) * ln(1 + k*C/I)
    const t = (1 / k) * Math.log(1 + (k * C_mAh) / I_mA);
    return isFinite(t) && t > 0 ? t : 0;
  }, [capacity, selfDischarge, dischargeCurrent]);

  const converted = useMemo(() => {
    const h = lifeHours;
    switch (timeFmt) {
      case 'Days': return h / 24;
      case 'Weeks': return h / (24 * 7);
      case 'Months': return h / (24 * 30);
      case 'Years': return h / (24 * 365);
      default: return h; // Hours
    }
  }, [lifeHours, timeFmt]);


  return (
    <div class="grid">
      <div class="flex flex-col gap-4">
        <Panel>
          <h2>Battery Life</h2>

          <div class="grid cols-2">
            <Select
              label="Material Selection"
              value={batteryType}
              onChange={(v) => {
                setBatteryType(v);
                if (v !== 'Custom') {
                  const m = batteries.find(m => m.name === v);
                  if (m) setCapacity(String(m.capacity));
                  if (m) setSelfDischarge(String(m.selfDischarge));
                  if (m) setNominalVoltage(String(m.nominalVoltage));
                  if (m) setContCurrent(String(m.maxContCurrent));
                  if (m) setPulseCurrent(String(m.maxPulseCurrent));
                }
              }}
              options={[
                ...batteries.map(m => ({ label: m.name, value: m.name })),
                { label: 'Custom', value: 'Custom' },
              ]}
            />

            <Field
              label="Capacity, mAh"
              value={capacity}
              onInput={setCapacity}
              type="number"
              step={0.1}
              disabled={batteryType !== 'Custom'}
            />

            <Field
              label="Self Discharge, %/month"
              value={selfDischarge}
              onInput={setSelfDischarge}
              type="number"
              step={0.1}
              disabled={batteryType !== 'Custom'}
            />

            <Field
              label="Nominal Voltage, V"
              value={nominalVoltage}
              onInput={setNominalVoltage}
              type="number"
              step={0.1}
              disabled={batteryType !== 'Custom'}
            />

            <Field
              label="Max Continious Current, mA"
              value={maxContCurrent}
              onInput={setContCurrent}
              type="number"
              step={0.1}
              disabled={batteryType !== 'Custom'}
            />

            <Field
              label="Max Pulse Current, mA"
              value={maxPulseCurrent}
              onInput={setPulseCurrent}
              type="number"
              step={0.1}
              disabled={batteryType !== 'Custom'}
            />
          </div>
          <div class="grid">
            <SIField label="Discharge current" value={dischargeCurrent} setValue={setDischargeCurrent} placeholder="e.g. 100m" suffix="A" />
          </div>
          <div class="grid cols-2">
            <Select
              label="Time Format"
              value={timeFmt}
              onChange={(v)=> setTimeFmt(v as any)}
              options={[
                {label:'Hours', value:'Hours'},
                {label:'Days', value:'Days'},
                {label:'Weeks', value:'Weeks'},
                {label:'Months', value:'Months'},
                {label:'Years', value:'Years'},
              ]}
            />
          </div>
          <ResultCard rows={[
            { label: 'Battery Life', value: `${converted.toFixed(2)} ${timeFmt}` },
          ]} />
        </Panel>
      </div>
    </div>
  );
}