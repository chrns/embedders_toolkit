// Parse values like '1k', '4k7', '2.2M', '330R', '10u', '3µ', '47n', '5m', '1.5'.
// Returns a Number (in base units), or null if not parseable.
export function parseSI(raw: string): number | null {
  if (!raw) return null;

  // Normalize
  let s = raw.trim()
    .replace(/[, _]/g, '')            // commas/underscores/spaces
    .replace(/ohms?/i, '')            // 'ohm'/'ohms'
    .replace(/Ω/g, '')                // omega
    .replace(/^[-+]?$/, '');          // lone sign

  if (!s) return null;

  // Handle scientific notation directly
  if (/^[+-]?\d+(?:\.\d+)?e[+-]?\d+$/i.test(s)) return Number(s);

  // Maps (case sensitive where it matters)
  const MULT: Record<string, number> = {
    '': 1,
    'T': 1e12, 'G': 1e9, 'M': 1e6, 'K': 1e3, 'k': 1e3,
    'm': 1e-3, 'u': 1e-6, 'µ': 1e-6, 'n': 1e-9, 'p': 1e-12, 'f': 1e-15,
    // 'R' is special: decimal marker used in resistor notation (e.g., 4R7 = 4.7)
  };

  // Case A: standard form "12.3k" (optional suffix at end)
  const m1 = s.match(/^([+-]?\d*(?:\.\d+)?)([TGMKkmunpfµ]?)$/);
  if (m1 && m1[1] !== '') {
    const [, num, suf] = m1;
    const k = suf || '';
    const mult = MULT[k] ?? null;
    if (mult == null) return null;
    return Number(num) * mult;
  }

  // Case B: resistor-style decimal marker "4k7" or "330R" or "2M2"
  const m2 = s.match(/^([+-]?\d+)([TGMKkmunpRµf])(\d*)$/);
  if (m2) {
    const [, whole, mark, frac] = m2;
    if (mark === 'R') {
      // 4R7 -> 4.7 (base units)
      const val = Number(`${whole}.${frac || '0'}`);
      return isFinite(val) ? val : null;
    }
    const mult = MULT[mark] ?? null;
    if (mult == null) return null;
    const dec = Number(`${whole}.${frac || '0'}`); // 4k7 -> 4.7 then * 1e3
    return isFinite(dec) ? dec * mult : null;
  }

  // Fallback: plain number
  const n = Number(s);
  return isFinite(n) ? n : null;
}

// Format a base-unit number with an SI prefix, e.g., 4700 -> "4.7k".
export function formatSI(value: number, unit = '', digits = 3): string {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  const pairs: [number, string][] = [
    [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'],
    [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f'],
  ];
  const [m, s] = pairs.find(([m]) => abs >= m) ?? [1, ''];
  const v = value / m;
  const str = (Math.abs(v) >= 100 ? v.toFixed(0)
             : Math.abs(v) >= 10  ? v.toFixed(1)
             : v.toFixed(digits - 1));
  return unit ? `${str}${s}${unit}` : `${str}${s}`;
}
