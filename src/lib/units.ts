export const inch = 0.0254; // meters
export const mil = 0.001 * inch; // meters
export const mm = 0.001; // meters
export const c = 299_792_458; // m/s

export class PCBMaterial {
  constructor(
    public name: string,
    public epsilon: number
  ) {}
}

export const pcbMaterials: PCBMaterial[] = [
  new PCBMaterial("FR-4 (Standard)", 4.4),
  new PCBMaterial("FR-4 (High Tg)", 4.2),
  new PCBMaterial("Rogers 4350B", 3.48),
  new PCBMaterial("Rogers 4003C", 3.55),
  new PCBMaterial("Rogers 5880", 2.20),
  new PCBMaterial("Rogers 6010", 10.2),
  new PCBMaterial("Isola FR408", 3.7),
  new PCBMaterial("Isola I-Tera MT40", 3.45),
  new PCBMaterial("Isola Astra MT77", 3.0),
  new PCBMaterial("Taconic TLY-5", 2.2),
  new PCBMaterial("Taconic RF-35", 3.5),
  new PCBMaterial("Taconic CER-10", 10.0),
  new PCBMaterial("Polyimide", 3.8),
  new PCBMaterial("BT Epoxy", 3.9),
];

export class Battery {
    constructor(
        public name: string,
        public capacity: number,
        public selfDischarge: number,
        public nominalVoltage: number,
        public maxContCurrent: number,
        public maxPulseCurrent: number
    ) {}
}

export const batteries: Battery[] = [
    new Battery("Alkaline AA", 2850, 0.3, 1.5, 1000, 0),
    new Battery("Alkaline AAA", 1250, 0.3, 1.5, 400, 0),
    new Battery("Alkaline C", 8350, 0.3, 1.5, 3000, 0),
    new Battery("Alkaline D", 20500, 0.3, 1.5, 7500, 0),
    new Battery("Alkaline 9V", 20500, 0.3, 1.5, 200, 0),
    new Battery("CR1225", 48, 0.12, 1.5, 1, 5),
    new Battery("Li-MnO2 (CR1632)", 125.0, 0.12, 3.0, 1.5, 10.0),
    new Battery("Li-MnO2 (CR2032)", 225.0, 0.12, 3.0, 3.0, 15.0),
    new Battery("Li-MnO2 (CR2430)", 285.0, 0.12, 3.0, 4.0, 20.0),
    new Battery("Li-MnO2 (CR2477)", 850.0, 0.12, 3.0, 2.0, 10.0),
    new Battery("LiSOCL2 (AAA700)", 700.0, 0.08, 3.6, 10.0, 30.0),
    new Battery("LiSOCL2 (A3400)", 3400.0, 0.08, 3.6, 100.0, 200.0),
    new Battery("LiSOCL2 (C9000)", 9000.0, 0.08, 3.6, 230.0, 400.0),
    new Battery("LiSOCL2 (D19000)", 19000.0, 0.08, 3.6, 230.0, 500.0),
    new Battery("LiSOCL2 (DD36000)", 36000.0, 0.08, 3.6, 450.0, 1000.0),
    new Battery("Ni-Cd (AA1100)", 1100.0, 20.0, 1.2, 220.0, 0.0),
    new Battery("Ni-Cd (A1700)", 1700.0, 20.0, 1.2, 340.0, 0.0),
    new Battery("Ni-Cd (C3000)", 3000.0, 20.0, 1.2, 600.0, 0.0),
    new Battery("Ni-Cd (D4400)", 4400.0, 20.0, 1.2, 880.0, 0.0),
    new Battery("Ni-Cd (F7000)", 7000.0, 20.0, 1.2, 1400.0, 0.0),
    new Battery("Ni-MH (AAA800)", 800.0, 30.0, 1.2, 160.0, 0.0),
    new Battery("Ni-MH (AA1800)", 1800.0, 30.0, 1.2, 360.0, 0.0),
    new Battery("Ni-MH (A2500)", 2500.0, 30.0, 1.2, 500.0, 0.0),
    new Battery("Ni-MH (C4500)", 4500.0, 30.0, 1.2, 900.0, 0.0),
    new Battery("Ni-MH (D8000)", 8000.0, 30.0, 1.2, 1600, 0.0),
    new Battery("Ni-MH (F14000)", 14000.0, 30.0, 1.2, 2800, 0.0),
    new Battery("Zinc-Air(180)", 180.0, 0.4, 1.4, 5.0, 0.0),
    new Battery("Zinc-Air(310)", 310, 0.4, 1.4, 10, 0),
    new Battery("Zinc-Air(650)", 650, 0.4, 1.4, 25, 0),
];

