import Decimal from 'decimal.js-light';

const ozToUmMap: Record<string, number> = { '0.5oz': 17.5, '1oz': 35, '1.5oz': 52.5, '2oz': 70, '2.5oz': 87.5, '3oz': 105, '4oz': 140, '5oz': 175 };

export function microstripZoFormula(h_mm: number, w_mm: number, copperWeight: string, er: number): number {
  const t_um = ozToUmMap[copperWeight] ?? 35;     // copper thickness in micrometers
  const t_mm = t_um / 1000;                       // convert to mm
  const lnTerm = Math.log((5.98 * h_mm) / (0.8 * w_mm + t_mm));
  const factor = 87 / Math.sqrt(er + 1.41);
  return factor * lnTerm;
}

export function striplineZoFormula(h_mm: number, w_mm: number, copperWeight: string, er: number): number {
  // copper thickness from oz/ft² -> micrometers -> millimeters
  const t_um = ozToUmMap[copperWeight] ?? 35;
  const t_mm = t_um / 1000;

  // Z0 ≈ (60 / √εr) * ln( (1.9(2h + t)) / (0.8w + t) )
  const numerator = 1.9 * (2 * h_mm + t_mm);
  const denominator = 0.8 * w_mm + t_mm;
  const lnTerm = Math.log(numerator / denominator);
  const factor = 60 / Math.sqrt(er);
  return factor * lnTerm;
}

export function embeddedMicrostripZoFormula(
  h_mm: number,
  hp_mm: number,
  w_mm: number,
  copperWeight: string,
  er: number
): number {
  // copper thickness conversion (oz/ft² → µm → mm)
  const t_um = ozToUmMap[copperWeight] ?? 35;
  const t_mm = t_um / 1000;

  // ε_rp ≈ ε_r [ 1 − exp( −1.55 * h / h_p ) ]
  const ratio = hp_mm > 0 ? (h_mm / hp_mm) : 0; // guard divide-by-zero
  const erp = er * (1 - Math.exp(-1.55 * ratio));

  // Z0 ≈ (60 / √ε_rp) × ln( (5.98 h_p) / (0.8 w + t) )
  const numerator = 5.98 * hp_mm;
  const denominator = 0.8 * w_mm + t_mm;
  const lnTerm = Math.log(numerator / denominator);
  const factor = 60 / Math.sqrt(erp || er || 1e-12);
  return factor * lnTerm;
}

export function asymmetricStriplineZoFormula(
  ha_mm: number,
  hb_mm: number,
  w_mm: number,
  copperWeight: string,
  er: number
): number {
  // copper thickness conversion (oz/ft² → µm → mm)
  const t_um = ozToUmMap[copperWeight] ?? 35;
  const t_mm = t_um / 1000;

  // Z0 ≈ (80 / √εr) × ln( (1.9(2ha + t)) / (0.8w + t) ) × (1 − ha / (4 hb))
  const numerator = 1.9 * (2 * ha_mm + t_mm);
  const denominator = 0.8 * w_mm + t_mm;
  const lnTerm = Math.log(numerator / denominator);
  const asymFactor = 1 - (hb_mm !== 0 ? (ha_mm / (4 * hb_mm)) : 0); // guard divide-by-zero
  const factor = 80 / Math.sqrt(er);
  return factor * lnTerm * asymFactor;
}

export function edgeCoupledMicrostripZoFormula(
  h_mm: number,
  w_mm: number,
  s_mm: number,
  copperWeight: string,
  er: number
): number {
  // Copper thickness: oz/ft² → µm → mm
  const t_um = ozToUmMap[copperWeight] ?? 35;
  const t_mm = t_um / 1000;

  // Zd ≈ 174 / √(εr + 1.41) * ln( 5.98 h / (0.8 w + t) ) * [ 1 − 0.48 exp( −0.96 s / h ) ]
  const baseLn = Math.log((5.98 * h_mm) / (0.8 * w_mm + t_mm));
  const coupling = 1 - 0.48 * Math.exp(-0.96 * (s_mm / (h_mm || 1e-12)));
  const factor = 174 / Math.sqrt(er + 1.41);
  return factor * baseLn * coupling;
}

export function broadsideCoupledStriplineZoFormula(
  hp_mm: number,
  ht_mm: number,
  w_mm: number,
  copperWeight: string,
  er: number
): number {
  // copper thickness conversion (oz/ft² → µm → mm)
  const t_um = ozToUmMap[copperWeight] ?? 35;
  const t_mm = t_um / 1000;

  // Z0 ≈ (80 / √εr) × ln( (1.9(2hp + t)) / (0.8w + t) ) × (1 − hp / (4(ht + hp + t)))
  const numerator = 1.9 * (2 * hp_mm + t_mm);
  const denominator = 0.8 * w_mm + t_mm;
  const lnTerm = Math.log(numerator / denominator);

  const correction = 1 - (hp_mm / (4 * (ht_mm + hp_mm + t_mm)));
  const factor = 80 / Math.sqrt(er);

  return factor * lnTerm * correction;
}

export function edgeCoupledStriplineZoFormula(
  h_mm: number,
  w_mm: number,
  s_mm: number,
  copperWeight: string,
  er: number
): { z0: number; zd: number } {
  // copper thickness conversion (oz/ft² → µm → mm)
  const t_um = ozToUmMap[copperWeight] ?? 35;
  const t_mm = t_um / 1000;

  // Z0 ≈ (60 / √εr) × ln( (1.9(2h + t)) / (0.8w + t) )
  const numerator = 1.9 * (2 * h_mm + t_mm);
  const denominator = 0.8 * w_mm + t_mm;
  const lnTerm = Math.log(numerator / denominator);
  const z0 = (60 / Math.sqrt(er)) * lnTerm;

  // Zd ≈ 2 Z0 [ 1 − 0.347 exp( −2.9 s / (2h + t) ) ]
  const coupling = 1 - 0.347 * Math.exp((-2.9 * s_mm) / (2 * h_mm + t_mm));
  const zd = 2 * z0 * coupling;

  return { z0, zd };
}
