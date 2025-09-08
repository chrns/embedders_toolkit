import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { SIField } from '@/ui/SIField';
import { parseSI } from '@/lib/si';

type Opt = {
  key: string; label: string; color: string;
  range: [number, number];   // volts
};

const OPTIONS: Opt[] = [
  { key:'red',    label:'Red',    color:'#ff2a2a', range:[1.62, 2.03] },
  { key:'yellow', label:'Yellow', color:'#ffd400', range:[2.10, 2.18] },
  { key:'orange', label:'Orange', color:'#ff7a00', range:[2.03, 2.10] },
  { key:'blue',   label:'Blue',   color:'#2a6aff', range:[2.48, 3.70] },
  { key:'green',  label:'Green',  color:'#00c853', range:[1.90, 4.00] },
  { key:'violet', label:'Violet', color:'#8e24aa', range:[2.76, 4.00] },
  { key:'uv',     label:'UV',     color:'#6b00ff', range:[3.10, 4.40] },
  { key:'white',  label:'White',  color:'#e0e0e0', range:[3.20, 3.60] },
];

const CUSTOM_KEY = 'custom';

export function LEDVfSelect(props: {
  label?: string;
  value: string;                    // Vf string (e.g. "2.1")
  setValue: (v: string) => void;
}) {
  const { value, setValue } = props;
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // determine selected by Vf if inside a known range; otherwise "custom"
  const selectedKey = useMemo(() => {
    const v = parseSI(value) ?? NaN;
    const hit = OPTIONS.find(o => v >= o.range[0] && v <= o.range[1]);
    return hit?.key ?? CUSTOM_KEY;
  }, [value]);

  const selectedOpt = OPTIONS.find(o => o.key === selectedKey);

  function pick(opt: Opt | 'custom') {
    setOpen(false);
    if (opt === 'custom') return; // show custom editor below
    const mid = (opt.range[0] + opt.range[1]) / 2;
    setValue(mid.toString());
  }

  // close on outside click/esc
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (btnRef.current && !btnRef.current.contains(t)) {
        const pop = document.getElementById('vf-pop');
        if (pop && !pop.contains(t)) setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    addEventListener('mousedown', onDoc);
    addEventListener('keydown', onEsc);
    return () => { removeEventListener('mousedown', onDoc); removeEventListener('keydown', onEsc); };
  }, [open]);

  return (
    <div class="vf-combo">
      <span class="field-label">{props.label ?? 'LED Voltage Drop'}</span>

      <button
        ref={btnRef}
        class="vf-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        {selectedKey === CUSTOM_KEY ? (
          <span class="dot dot-gradient" aria-hidden="true" />
        ) : (
          <span class="dot" style={`background:${selectedOpt?.color}`} aria-hidden="true" />
        )}
        <span class="vf-text">
          {selectedKey === CUSTOM_KEY ? 'Custom' : selectedOpt?.label}
          <span class="vf-sub">
            {selectedKey === CUSTOM_KEY
              ? `${value || '—'} V`
              : `${selectedOpt!.range[0]}–${selectedOpt!.range[1]} V`}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" class="chev" aria-hidden="true">
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      {open && (
        <div id="vf-pop" class="vf-pop" role="listbox">
          {OPTIONS.map(o => (
            <button
              key={o.key}
              role="option"
              aria-selected={selectedKey === o.key}
              class="vf-opt"
              onClick={() => pick(o)}
            >
              <span class="dot" style={`background:${o.color}`} aria-hidden="true" />
              <span class="vf-label">{o.label}</span>
              <span class="vf-range">{o.range[0]} – {o.range[1]} V</span>
            </button>
          ))}
          <button
            role="option"
            aria-selected={selectedKey === CUSTOM_KEY}
            class="vf-opt"
            onClick={() => pick('custom')}
          >
            <span class="dot dot-gradient" aria-hidden="true" />
            <span class="vf-label">Custom</span>
            <span class="vf-range">{value || '—'} V</span>
          </button>
        </div>
      )}
    </div>
  );
}
