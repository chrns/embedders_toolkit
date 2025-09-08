import Decimal from 'decimal.js-light';

/** Microstrip quick approximation.
 * Inputs: w, h, t in meters; er unitless.
 * Returns: effective permittivity and Z0 (ohms).
 */
export function microstripZ0({
  w, h, t, er
}: { w: number; h: number; t: number; er: number }) {
  const W = new Decimal(w || 1e-9);
  const H = new Decimal(h || 1e-9);
  const T = new Decimal(t || 0);
  const ER = new Decimal(er || 4.2);
  const ONE = new Decimal(1);

  // u = w/h (dimensionless)
  const u = W.div(H);
  const uNum = u.toNumber();

  // Effective permittivity (common closed form)
  const sqrtTerm = ONE.plus(new Decimal(12).div(u.plus(1e-12))).sqrt();
  const e_eff = ER.plus(ONE).div(2).plus(
    ER.minus(ONE).div(2).div(sqrtTerm)
  );

  // Optional rough thickness correction (kept tiny for demo)
  // Many references add t via effective width; we keep it simple.

  // Characteristic impedance
  let z0: Decimal;
  if (uNum <= 1) {
    // Z0 = (60/√εeff) * ln(8/ (w/h) + (w/h)/4)
    const lnArg = new Decimal(8).div(u.plus(1e-12)).plus(u.div(4));
    z0 = new Decimal(60).div(e_eff.sqrt()).mul(lnArg.ln());
  } else {
    // Z0 = (120π)/(√εeff * (w/h + 1.393 + 0.667 ln(w/h + 1.444)))
    const denom = u
      .plus(1.393)
      .plus(new Decimal(0.667).mul(u.plus(1.444).ln()));
    z0 = new Decimal(120 * Math.PI).div(e_eff.sqrt().mul(denom));
  }

  return {
    e_eff: e_eff.toNumber(),
    Z0: z0.toNumber()
  };
}