import { useState } from 'preact/hooks';
import { Panel } from '@/ui/Panel';
import { ResultCard } from '@/ui/ResultCard';
import { SubTabs } from '@/ui/SubTabs';
import { SIField } from '@/ui/SIField';
import { Field } from '@/ui/Field';
import { parseSI } from '@/lib/si';
import { Select } from '@/ui/Select';
import { pcbMaterials } from '@/lib/units';
import {
  microstripZoFormula,
  striplineZoFormula,
  embeddedMicrostripZoFormula,
  asymmetricStriplineZoFormula,
  edgeCoupledMicrostripZoFormula,
  broadsideCoupledStriplineZoFormula,
  edgeCoupledStriplineZoFormula
 } from '@/lib/impedance';
 import MicrostripIcon from '@/ui/icons/MicrostripIcon';

type Units = 'imperial' | 'metric';
const copperWeightsList = ['0.5oz','1oz','1.5oz','2oz','2.5oz','3oz','4oz','5oz'];

export default function ConductorImpedance() {
  // options
  const [er, setEr] = useState('4.6');
  const [material, setMaterial] = useState('FR-4 (Standard)');
  const [copper, setCopper] = useState('1oz');

  const [tab, setTab] = useState('microstrip');
  return (
    <div class="grid">
      <div class="flex flex-col gap-4">
        <Panel>
          <h2>Impedance Calculator</h2>

          <div class="grid cols-3">
            <Select
              label="Base Copper Weight"
              value={copper}
              onChange={setCopper}
              options={copperWeightsList.map(w => ({ label: w, value: w }))}
            />

            <Select
              label="Material Selection"
              value={material}
              onChange={(v) => {
                setMaterial(v);
                if (v !== 'Custom') {
                  const m = pcbMaterials.find(m => m.name === v);
                  if (m) setEr(String(m.epsilon));
                }
              }}
              options={[
                ...pcbMaterials.map(m => ({ label: m.name, value: m.name })),
                { label: 'Custom', value: 'Custom' },
              ]}
            />

            <Field
              label="Er"
              value={er}
              onInput={setEr}
              type="number"
              step={0.1}
              disabled={material !== 'Custom'}
            />
          </div>

          <SubTabs
            tabs={[
              { key: 'microstrip', label: 'Microstrip' },
              { key: 'stripline', label: 'Stripline' },
              { key: 'embedded_microstrip', label: 'Embedded Microstrip' },
              { key: 'async_stripline', label: 'Asymmetric Stripline' },
              { key: 'edge_coupled_microstrip', label: 'Edge Coupled Microstrip' },
              { key: 'broadside_coupled_stripline', label: 'Broadside Coupled Stripline' },
              { key: 'edge_coupled_stripline', label: 'Edge Coupled Stripline' }
            ]}
            active={tab}
            onSelect={setTab}
          />
          {tab === 'microstrip' && <Microstrip er={er} copper={copper} />}
          {tab === 'stripline' && <Stripline er={er} copper={copper} />}
          {tab === 'embedded_microstrip' && <EmbeddedMicrostrip er={er} copper={copper} />}
          {tab === 'async_stripline' && <AsymmetricStripline er={er} copper={copper} />}
          {tab === 'edge_coupled_microstrip' && <EdgeCoupledMicrostrip er={er} copper={copper} />}
          {tab == 'broadside_coupled_stripline' && <BroadsideCoupledStripline er={er} copper={copper} />}
          {tab == 'edge_coupled_stripline' && <EdgeCoupledStripline er={er} copper={copper} />}
        </Panel>
      </div>
    </div>
  );
}

function Microstrip({ er, copper }: { er: string; copper: string }) {
  const [Height, setHeight] = useState('0.125');
  const [Width, setWidth] = useState('0.25');

  const height = parseSI(Height) ?? 0;
  const width = parseSI(Width) ?? 0;

  const z0 = microstripZoFormula(height, width, copper, parseFloat(er) || 4.2);

  return (
    <div class="grid cols-3">
      <MicrostripIcon />
      <div>
        <SIField label="Substrate height (h), mm" value={Height} setValue={setHeight} suffix="" />
        <SIField label="Trace width (w), mm" value={Width} setValue={setWidth} suffix="" />
      </div>
      <ResultCard rows={[
        { label: <>Z<sub>0</sub></>, value: (isFinite(z0) ? z0.toFixed(2) : '—') + ' Ω' },
      ]} />
    </div>
  );
}

function Stripline({ er, copper }: { er: string; copper: string }) {
  const [Height, setHeight] = useState('0.125');
  const [Width, setWidth] = useState('0.25');

  const height = parseSI(Height) ?? 0;
  const width = parseSI(Width) ?? 0;

  const z0 = striplineZoFormula(height, width, copper, parseFloat(er) || 4.2);
  return (
    <div class="grid cols-3">
      {/* FIXME: draw an appropriate image */}
      <MicrostripIcon />
      <div>
        <SIField label="Substrate height (h), mm" value={Height} setValue={setHeight} suffix="" />
        <SIField label="Trace width (w), mm" value={Width} setValue={setWidth} suffix="" />
      </div>
      <ResultCard rows={[
        { label: <>Z<sub>0</sub></>, value: (isFinite(z0) ? z0.toFixed(2) : '—') + ' Ω' },
      ]} />
    </div>
  );
}

function EmbeddedMicrostrip({ er, copper }: { er: string; copper: string }) {
  const [Height, setHeight] = useState('0.125');
  const [HeightP, setHeightP] = useState('0.125');
  const [Width, setWidth] = useState('0.25');

  const height = parseSI(Height) ?? 0;
  const heightP = parseSI(HeightP) ?? 0;
  const width = parseSI(Width) ?? 0;

  const z0 = embeddedMicrostripZoFormula(height, heightP, width, copper, parseFloat(er) || 4.2);
  return (
    <div class="grid cols-3">
      {/* FIXME: draw an appropriate image */}
      <MicrostripIcon />
      <div>
        <SIField label="Substrate height (h), mm" value={Height} setValue={setHeight} suffix="" />
        <SIField label="Trace height above plane (hp), mm" value={HeightP} setValue={setHeightP} suffix="" />
        <SIField label="Trace width (w), mm" value={Width} setValue={setWidth} suffix="" />
      </div>
      <ResultCard rows={[
        { label: <>Z<sub>0</sub></>, value: (isFinite(z0) ? z0.toFixed(2) : '—') + ' Ω' },
      ]} />
    </div>
  );
}

function AsymmetricStripline({ er, copper }: { er: string; copper: string }) {
  const [HeightA, setHeightA] = useState('0.125');
  const [HeightP, setHeightP] = useState('0.125');
  const [Width, setWidth] = useState('0.25');

  const heightA = parseSI(HeightA) ?? 0;
  const heightP = parseSI(HeightP) ?? 0;
  const width = parseSI(Width) ?? 0;

  const z0 = asymmetricStriplineZoFormula(heightA, heightP, width, copper, parseFloat(er) || 4.2);
  return (
    <div class="grid cols-3">
      {/* FIXME: draw an appropriate image */}
      <MicrostripIcon />
      <div>
        <SIField label="Substrate height (h), mm" value={HeightA} setValue={setHeightA} suffix="" />
        <SIField label="Trace height above plane (hp), mm" value={HeightP} setValue={setHeightP} suffix="" />
        <SIField label="Trace width (w), mm" value={Width} setValue={setWidth} suffix="" />
      </div>
      <ResultCard rows={[
        { label: <>Z<sub>0</sub></>, value: (isFinite(z0) ? z0.toFixed(2) : '—') + ' Ω' },
      ]} />
    </div>
  );
}

function EdgeCoupledMicrostrip({ er, copper }: { er: string; copper: string }) {
  const [Height, setHeight] = useState('0.125');
  const [Width, setWidth] = useState('0.25');
  const [Spacing, setSpacing] = useState('0.15');

  const height = parseSI(Height) ?? 0;
  const width = parseSI(Width) ?? 0;
  const spacing = parseSI(Spacing) ?? 0;

  const zd = edgeCoupledMicrostripZoFormula(height, width, spacing, copper, parseFloat(er) || 4.2);

  return (
    <div class="grid cols-3">
      {/* FIXME: draw an appropriate image */}
      <MicrostripIcon />
      <div>
        <SIField label="Height (h), mm" value={Height} setValue={setHeight} suffix="" />
        <SIField label="Trace width (w), mm" value={Width} setValue={setWidth} suffix="" />
        <SIField label="Trace spacing (s), mm" value={Spacing} setValue={setSpacing} suffix="" />
      </div>
      <ResultCard rows={[
        { label: <>Z<sub>d</sub></>, value: (isFinite(zd) ? zd.toFixed(2) : '—') + ' Ω' },
      ]} />
    </div>
  );
}

function BroadsideCoupledStripline({ er, copper }: { er: string; copper: string }) {
  const [HeightToPlane, setHeightToPlane] = useState('0.125');
  const [HeightBetween, setHeightBetween] = useState('0.125');
  const [Width, setWidth] = useState('0.25');

  const hp = parseSI(HeightToPlane) ?? 0;
  const ht = parseSI(HeightBetween) ?? 0;
  const width = parseSI(Width) ?? 0;

  const z0 = broadsideCoupledStriplineZoFormula(hp, ht, width, copper, parseFloat(er) || 4.2);

  return (
    <div class="grid cols-3">
      {/* FIXME: draw an appropriate image */}
      <MicrostripIcon />
      <div>
        <SIField label="Height to plane (hₚ), mm" value={HeightToPlane} setValue={setHeightToPlane} suffix="" />
        <SIField label="Height between traces (hₜ), mm" value={HeightBetween} setValue={setHeightBetween} suffix="" />
        <SIField label="Trace width (w), mm" value={Width} setValue={setWidth} suffix="" />
      </div>
      <ResultCard rows={[
        { label: <>Z<sub>0</sub></>, value: (isFinite(z0) ? z0.toFixed(2) : '—') + ' Ω' },
      ]} />
    </div>
  );
}

function EdgeCoupledStripline({ er, copper }: { er: string; copper: string }) {
  const [Height, setHeight] = useState('0.125');
  const [Width, setWidth] = useState('0.25');
  const [Spacing, setSpacing] = useState('0.15');

  const height = parseSI(Height) ?? 0;
  const width = parseSI(Width) ?? 0;
  const spacing = parseSI(Spacing) ?? 0;

  const { z0, zd } = edgeCoupledStriplineZoFormula(height, width, spacing, copper, parseFloat(er) || 4.2);

  return (
    <div class="grid cols-3">
      {/* FIXME: draw an appropriate image */}
      <MicrostripIcon />
      <div>
        <SIField label="Height (h), mm" value={Height} setValue={setHeight} suffix="" />
        <SIField label="Trace width (w), mm" value={Width} setValue={setWidth} suffix="" />
        <SIField label="Trace spacing (s), mm" value={Spacing} setValue={setSpacing} suffix="" />
      </div>
      <ResultCard rows={[
        { label: <>Z<sub>0</sub></>, value: (isFinite(z0) ? z0.toFixed(2) : '—') + ' Ω' },
        { label: <>Z<sub>d</sub></>, value: (isFinite(zd) ? zd.toFixed(2) : '—') + ' Ω' },
      ]} />
    </div>
  );
}
