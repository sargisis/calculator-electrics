export type OhmsLawResult = {
  voltage: number;
  current: number;
  resistance: number;
};

export function ohmsLaw(params: {
  voltage?: number | null;
  current?: number | null;
  resistance?: number | null;
}): OhmsLawResult {
  const { voltage, current, resistance } = params;
  const provided = [voltage, current, resistance].filter((v) => v !== undefined && v !== null && !Number.isNaN(v)).length;

  if (provided !== 2) {
    throw new Error('Нужно задать ровно ДВА параметра из (U, I, R).');
  }

  if (voltage === undefined || voltage === null || Number.isNaN(voltage)) {
    if (current === undefined || resistance === undefined) {
      throw new Error('Укажите I и R, чтобы найти U.');
    }
    return { voltage: current! * resistance!, current: current!, resistance: resistance! };
  }

  if (current === undefined || current === null || Number.isNaN(current)) {
    if (resistance === undefined) {
      throw new Error('Укажите U и R, чтобы найти I.');
    }
    return { voltage, current: voltage / resistance!, resistance: resistance! };
  }

  if (resistance === undefined || resistance === null || Number.isNaN(resistance)) {
    return { voltage, current, resistance: voltage / current };
  }

  // Should not reach here
  throw new Error('Неверные данные.');
}

export function seriesResistance(resistors: number[]): number {
  return resistors.reduce((sum, r) => sum + r, 0);
}

export function parallelResistance(resistors: number[]): number {
  let invSum = 0;
  for (const r of resistors) {
    if (r === 0) {
      throw new Error('Сопротивление не может быть 0 при параллельном соединении.');
    }
    invSum += 1 / r;
  }
  return 1 / invSum;
}

export type Complex = { real: number; imag: number };

export function magnitude(z: Complex): number {
  return Math.hypot(z.real, z.imag);
}

export function phaseDegrees(z: Complex): number {
  return (Math.atan2(z.imag, z.real) * 180) / Math.PI;
}

export function impedanceRL(R: number, L: number, f: number): Complex {
  const omega = 2 * Math.PI * f;
  return { real: R, imag: omega * L };
}

export function impedanceRC(R: number, C: number, f: number): Complex {
  const omega = 2 * Math.PI * f;
  return { real: R, imag: -1 / (omega * C) };
}

export type PowerResult = { P: number; Q: number; S: number; phiDeg: number };

export function singlePhasePower(U: number, I: number, cosPhi: number): PowerResult {
  validateCosPhi(cosPhi);
  const phi = Math.acos(cosPhi);
  const P = U * I * cosPhi;
  const Q = U * I * Math.sin(phi);
  const S = U * I;
  return { P, Q, S, phiDeg: (phi * 180) / Math.PI };
}

export function threePhasePowerLine(U_line: number, I_line: number, cosPhi: number): PowerResult {
  validateCosPhi(cosPhi);
  const phi = Math.acos(cosPhi);
  const factor = Math.sqrt(3) * U_line * I_line;
  const P = factor * cosPhi;
  const Q = factor * Math.sin(phi);
  const S = factor;
  return { P, Q, S, phiDeg: (phi * 180) / Math.PI };
}

export function pwmAverageVoltage(Vhigh: number, Vlow: number, duty: number): number {
  assertDuty(duty);
  return Vhigh * duty + Vlow * (1 - duty);
}

export function pwmRmsVoltage(Vhigh: number, Vlow: number, duty: number): number {
  assertDuty(duty);
  return Math.sqrt(Vhigh * Vhigh * duty + Vlow * Vlow * (1 - duty));
}

export function periodFromFreq(freq: number): number {
  if (freq <= 0) {
    throw new Error('Частота должна быть > 0.');
  }
  return 1 / freq;
}

export function freqFromPeriod(period: number): number {
  if (period <= 0) {
    throw new Error('Период должен быть > 0.');
  }
  return 1 / period;
}

export function pwmDutyFromTimes(tHigh: number, period: number): number {
  if (tHigh < 0 || period <= 0) {
    throw new Error('tвкл ≥ 0 и период > 0.');
  }
  const duty = tHigh / period;
  assertDuty(duty);
  return duty;
}

export function pwmHighTimeFromDuty(duty: number, period: number): number {
  if (period <= 0) {
    throw new Error('Период должен быть > 0.');
  }
  assertDuty(duty);
  return duty * period;
}

export function reactanceL(L: number, f: number): number {
  if (L <= 0 || f <= 0) {
    throw new Error('L и f должны быть > 0.');
  }
  return 2 * Math.PI * f * L;
}

export function reactanceC(C: number, f: number): number {
  if (C <= 0 || f <= 0) {
    throw new Error('C и f должны быть > 0.');
  }
  return 1 / (2 * Math.PI * f * C);
}

export function impedanceRLC(R: number, L: number, C: number, f: number): Complex {
  if (R < 0 || L <= 0 || C <= 0 || f <= 0) {
    throw new Error('R ≥ 0, L > 0, C > 0 и f > 0.');
  }
  const omega = 2 * Math.PI * f;
  return { real: R, imag: omega * L - 1 / (omega * C) };
}

export function voltageDivider(Vin: number, R1: number, R2: number): { Vout: number; ratio: number } {
  if (R1 < 0 || R2 < 0) {
    throw new Error('R1 и R2 должны быть ≥ 0.');
  }
  const denom = R1 + R2;
  if (denom === 0) {
    throw new Error('Сумма R1 + R2 не может быть 0.');
  }
  const ratio = R2 / denom;
  return { Vout: Vin * ratio, ratio };
}

export function capacitorEnergy(C: number, V: number): number {
  if (C < 0) {
    throw new Error('C должен быть ≥ 0.');
  }
  return 0.5 * C * V * V;
}

export function rcCutoff(R: number, C: number): { tau: number; fc: number } {
  if (R <= 0 || C <= 0) {
    throw new Error('R и C должны быть > 0.');
  }
  const tau = R * C;
  return { tau, fc: 1 / (2 * Math.PI * tau) };
}

export function resonanceLC(L: number, C: number): { f0: number } {
  if (L <= 0 || C <= 0) {
    throw new Error('L и C должны быть > 0.');
  }
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  return { f0 };
}

export function idealTransformer({
  U1,
  N1,
  N2,
  I1,
}: {
  U1: number;
  N1: number;
  N2: number;
  I1?: number | null;
}): { U2: number; ratio: number; I2?: number } {
  if (N1 <= 0 || N2 <= 0) {
    throw new Error('Число витков должно быть > 0.');
  }
  const ratio = N2 / N1;
  const U2 = U1 * ratio;
  const result: { U2: number; ratio: number; I2?: number } = { U2, ratio };
  if (I1 !== undefined && I1 !== null) {
    result.I2 = I1 / ratio;
  }
  return result;
}

export function pfCorrectionCap({
  P_kw,
  U_line,
  f,
  cosNow,
  cosTarget,
}: {
  P_kw: number;
  U_line: number;
  f: number;
  cosNow: number;
  cosTarget: number;
}): { Qc_var: number; C_per_phase: number } {
  validateCosPhi(cosNow);
  validateCosPhi(cosTarget);
  if (f <= 0 || U_line <= 0 || P_kw < 0) {
    throw new Error('P≥0, Uл>0, f>0.');
  }
  const phi1 = Math.acos(cosNow);
  const phi2 = Math.acos(cosTarget);
  const Qc = P_kw * 1000 * (Math.tan(phi1) - Math.tan(phi2)); // вар
  const C = Qc / (3 * (2 * Math.PI * f * U_line * U_line)); // Ф на фазу
  return { Qc_var: Qc, C_per_phase: C };
}

export function inductorEnergy(L: number, I: number): number {
  if (L < 0 || I < 0) {
    throw new Error('L и I должны быть ≥ 0.');
  }
  return 0.5 * L * I * I;
}

export function ledResistor(Uin: number, Uf: number, If: number): { R: number; P: number } {
  if (Uin <= Uf) {
    throw new Error('Uвх должно быть больше падения на диоде.');
  }
  if (If <= 0) {
    throw new Error('Ток должен быть > 0.');
  }
  const R = (Uin - Uf) / If;
  const P = If * If * R;
  return { R, P };
}

export function deltaToWye(Ra: number, Rb: number, Rc: number): { R1: number; R2: number; R3: number } {
  if (Ra <= 0 || Rb <= 0 || Rc <= 0) {
    throw new Error('Сопротивления должны быть > 0.');
  }
  const denom = Ra + Rb + Rc;
  return {
    R1: (Rb * Rc) / denom,
    R2: (Ra * Rc) / denom,
    R3: (Ra * Rb) / denom,
  };
}

export function wyeToDelta(R1: number, R2: number, R3: number): { Ra: number; Rb: number; Rc: number } {
  if (R1 <= 0 || R2 <= 0 || R3 <= 0) {
    throw new Error('Сопротивления должны быть > 0.');
  }
  const sum = R1 + R2 + R3;
  return {
    Ra: (sum * R2) / R3,
    Rb: (sum * R1) / R3,
    Rc: (sum * R1) / R2,
  };
}

export function cableVoltageDrop({
  rho,
  length,
  current,
  area,
  phases = 1,
  U_supply,
}: {
  rho: number; // Ом*мм2/м или Ом*м, жёстко используем Ом*мм2/м
  length: number; // м
  current: number; // А
  area: number; // мм2
  phases?: 1 | 3;
  U_supply?: number;
}): { dU: number; dU_percent?: number } {
  if (rho <= 0 || length <= 0 || current < 0 || area <= 0) {
    throw new Error('Неверные параметры кабеля.');
  }
  const k = phases === 3 ? Math.sqrt(3) : 2;
  const dU = (k * rho * length * current) / area;
  const result: { dU: number; dU_percent?: number } = { dU };
  if (U_supply && U_supply > 0) {
    result.dU_percent = (dU / U_supply) * 100;
  }
  return result;
}

export function regulatorDissipation(Vin: number, Vout: number, Iload: number): { Pdiss: number } {
  if (Vin <= Vout) {
    throw new Error('Vin должно быть больше Vout.');
  }
  if (Iload < 0) {
    throw new Error('Ток должен быть ≥ 0.');
  }
  return { Pdiss: (Vin - Vout) * Iload };
}

export function rlcQFactor(R: number, L: number, C: number): { Q: number; f0: number; bw: number } {
  if (R <= 0 || L <= 0 || C <= 0) {
    throw new Error('R, L, C должны быть > 0.');
  }
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const Q = (1 / R) * Math.sqrt(L / C);
  const bw = f0 / Q;
  return { Q, f0, bw };
}

function validateCosPhi(value: number) {
  if (value < -1 || value > 1) {
    throw new Error('cosφ должен быть в диапазоне [-1, 1].');
  }
}

function assertDuty(duty: number) {
  if (duty < 0 || duty > 1) {
    throw new Error('Скважность (duty) должна быть в диапазоне 0..1.');
  }
}
