import { FormEvent, useState } from 'react';
import {
  Complex,
  magnitude,
  ohmsLaw,
  parallelResistance,
  phaseDegrees,
  seriesResistance,
  impedanceRL,
  impedanceRC,
  singlePhasePower,
  threePhasePowerLine,
  reactanceL,
  reactanceC,
  impedanceRLC,
  voltageDivider,
  capacitorEnergy,
  rcCutoff,
  pwmAverageVoltage,
  pwmRmsVoltage,
  periodFromFreq,
  freqFromPeriod,
  pwmDutyFromTimes,
  pwmHighTimeFromDuty,
  resonanceLC,
  idealTransformer,
  pfCorrectionCap,
  inductorEnergy,
  ledResistor,
  deltaToWye,
  wyeToDelta,
  cableVoltageDrop,
  regulatorDissipation,
  rlcQFactor,
} from './lib/calculations';

const formatNumber = (value: number, precision = 4) => {
  if (!Number.isFinite(value)) return '—';
  return Number(value.toPrecision(precision)).toString();
};

const parseNumber = (value: string) => {
  if (value.trim() === '') return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isNaN(parsed) ? null : parsed;
};

const parseList = (value: string) => {
  return value
    .split(/[ ,]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v.replace(',', '.')))
    .filter((v) => !Number.isNaN(v));
};

const ResultBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass p-3 md:p-4">
    <div className="mb-2 text-sm font-semibold text-cyan-200">{title}</div>
    <div className="result-box bg-slate-900/40">{children}</div>
  </div>
);

const SectionCard = ({
  title,
  children,
  description,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) => (
  <section className="glass p-3.5 md:p-4 shadow-glass">
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="badge mb-2 w-fit">Раздел</div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-300">{description}</p>}
      </div>
    </div>
    <div className="mt-3 space-y-2.5">{children}</div>
  </section>
);

function ImpedanceResult({ label, z }: { label: string; z: Complex }) {
  const mag = magnitude(z);
  const phi = phaseDegrees(z);
  return (
    <ResultBlock title={label}>
      <div className="space-y-1 text-sm leading-relaxed text-slate-100">
        <div>
          Z = {formatNumber(z.real)} + j{formatNumber(z.imag)} Ом
        </div>
        <div>|Z| = {formatNumber(mag)} Ом</div>
        <div>φ = {formatNumber(phi, 5)}°</div>
      </div>
    </ResultBlock>
  );
}

function PowerResultBox({
  title,
  result,
}: {
  title: string;
  result: { P: number; Q: number; S: number; phiDeg: number } | null;
}) {
  return (
    <ResultBlock title={title}>
      {result ? (
        <div className="space-y-1 text-sm text-slate-100">
          <div>P = {formatNumber(result.P)} Вт</div>
          <div>Q = {formatNumber(result.Q)} вар</div>
          <div>S = {formatNumber(result.S)} ВА</div>
          <div>φ = {formatNumber(result.phiDeg, 5)}°</div>
        </div>
      ) : (
        <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
      )}
    </ResultBlock>
  );
}

function App() {
  // Закон Ома
  const [ohmU, setOhmU] = useState('');
  const [ohmI, setOhmI] = useState('');
  const [ohmR, setOhmR] = useState('');
  const [ohmResult, setOhmResult] = useState<ReturnType<typeof ohmsLaw> | null>(null);
  const [ohmError, setOhmError] = useState<string | null>(null);

  // R последовательное/параллельное
  const [seriesInput, setSeriesInput] = useState('');
  const [seriesResult, setSeriesResult] = useState<number | null>(null);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  const [parallelInput, setParallelInput] = useState('');
  const [parallelResult, setParallelResult] = useState<number | null>(null);
  const [parallelError, setParallelError] = useState<string | null>(null);

  // Импедансы
  const [rlR, setRlR] = useState('');
  const [rlL, setRlL] = useState('');
  const [rlF, setRlF] = useState('');
  const [rlZ, setRlZ] = useState<Complex | null>(null);
  const [rlError, setRlError] = useState<string | null>(null);

  const [rcR, setRcR] = useState('');
  const [rcC, setRcC] = useState('');
  const [rcF, setRcF] = useState('');
  const [rcZ, setRcZ] = useState<Complex | null>(null);
  const [rcError, setRcError] = useState<string | null>(null);

  // Мощности
  const [spU, setSpU] = useState('');
  const [spI, setSpI] = useState('');
  const [spCos, setSpCos] = useState('');
  const [spResult, setSpResult] = useState<ReturnType<typeof singlePhasePower> | null>(null);
  const [spError, setSpError] = useState<string | null>(null);

  const [tpU, setTpU] = useState('');
  const [tpI, setTpI] = useState('');
  const [tpCos, setTpCos] = useState('');
  const [tpResult, setTpResult] = useState<ReturnType<typeof threePhasePowerLine> | null>(null);
  const [tpError, setTpError] = useState<string | null>(null);

  // Реактивные сопротивления
  const [xlL, setXlL] = useState('');
  const [xlF, setXlF] = useState('');
  const [xlResult, setXlResult] = useState<number | null>(null);
  const [xlError, setXlError] = useState<string | null>(null);

  const [xcC, setXcC] = useState('');
  const [xcF, setXcF] = useState('');
  const [xcResult, setXcResult] = useState<number | null>(null);
  const [xcError, setXcError] = useState<string | null>(null);

  // Импеданс RLC
  const [rlcR, setRlcR] = useState('');
  const [rlcL, setRlcL] = useState('');
  const [rlcC, setRlcC] = useState('');
  const [rlcF, setRlcF] = useState('');
  const [rlcZ, setRlcZ] = useState<Complex | null>(null);
  const [rlcError, setRlcError] = useState<string | null>(null);

  // Делитель напряжения
  const [vdVin, setVdVin] = useState('');
  const [vdR1, setVdR1] = useState('');
  const [vdR2, setVdR2] = useState('');
  const [vdResult, setVdResult] = useState<{ Vout: number; ratio: number } | null>(null);
  const [vdError, setVdError] = useState<string | null>(null);

  // Энергия конденсатора
  const [capC, setCapC] = useState('');
  const [capV, setCapV] = useState('');
  const [capResult, setCapResult] = useState<number | null>(null);
  const [capError, setCapError] = useState<string | null>(null);

  // RC-фильтр (срез, постоянная времени)
  const [rcfR, setRcfR] = useState('');
  const [rcfC, setRcfC] = useState('');
  const [rcfResult, setRcfResult] = useState<{ tau: number; fc: number } | null>(null);
  const [rcfError, setRcfError] = useState<string | null>(null);

  // Резонанс LC
  const [resL, setResL] = useState('');
  const [resC, setResC] = useState('');
  const [resResult, setResResult] = useState<{ f0: number } | null>(null);
  const [resError, setResError] = useState<string | null>(null);

  // Трансформатор
  const [trU1, setTrU1] = useState('');
  const [trN1, setTrN1] = useState('');
  const [trN2, setTrN2] = useState('');
  const [trI1, setTrI1] = useState('');
  const [trResult, setTrResult] = useState<{ U2: number; ratio: number; I2?: number } | null>(null);
  const [trError, setTrError] = useState<string | null>(null);

  // Компенсация реактивки
  const [pfP, setPfP] = useState('');
  const [pfU, setPfU] = useState('');
  const [pfF, setPfF] = useState('');
  const [pfCosNow, setPfCosNow] = useState('');
  const [pfCosTarget, setPfCosTarget] = useState('');
  const [pfResult, setPfResult] = useState<{ Qc_var: number; C_per_phase: number } | null>(null);
  const [pfError, setPfError] = useState<string | null>(null);

  // Дополнительные расчёты
  const [indL, setIndL] = useState('');
  const [indI, setIndI] = useState('');
  const [indResult, setIndResult] = useState<number | null>(null);
  const [indError, setIndError] = useState<string | null>(null);

  const [ledUin, setLedUin] = useState('');
  const [ledUf, setLedUf] = useState('');
  const [ledIf, setLedIf] = useState('');
  const [ledResult, setLedResult] = useState<{ R: number; P: number } | null>(null);
  const [ledError, setLedError] = useState<string | null>(null);

  const [deltaRa, setDeltaRa] = useState('');
  const [deltaRb, setDeltaRb] = useState('');
  const [deltaRc, setDeltaRc] = useState('');
  const [deltaResult, setDeltaResult] = useState<{ R1: number; R2: number; R3: number } | null>(null);
  const [deltaError, setDeltaError] = useState<string | null>(null);

  const [wyeR1, setWyeR1] = useState('');
  const [wyeR2, setWyeR2] = useState('');
  const [wyeR3, setWyeR3] = useState('');
  const [wyeResult, setWyeResult] = useState<{ Ra: number; Rb: number; Rc: number } | null>(null);
  const [wyeError, setWyeError] = useState<string | null>(null);

  const [cableRho, setCableRho] = useState('0.018'); // медь Ом*мм2/м
  const [cableLen, setCableLen] = useState('');
  const [cableI, setCableI] = useState('');
  const [cableArea, setCableArea] = useState('');
  const [cableU, setCableU] = useState('');
  const [cablePh, setCablePh] = useState<'1' | '3'>('1');
  const [cableResult, setCableResult] = useState<{ dU: number; dU_percent?: number } | null>(null);
  const [cableError, setCableError] = useState<string | null>(null);

  const [regVin, setRegVin] = useState('');
  const [regVout, setRegVout] = useState('');
  const [regI, setRegI] = useState('');
  const [regResult, setRegResult] = useState<{ Pdiss: number } | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  const [qR, setQR] = useState('');
  const [qL, setQL] = useState('');
  const [qC, setQC] = useState('');
  const [qResult, setQResult] = useState<{ Q: number; f0: number; bw: number } | null>(null);
  const [qError, setQError] = useState<string | null>(null);
  // PWM / импульсы
  const [pwmVh, setPwmVh] = useState('');
  const [pwmVl, setPwmVl] = useState('');
  const [pwmDuty, setPwmDuty] = useState('');
  const [pwmAvg, setPwmAvg] = useState<number | null>(null);
  const [pwmRms, setPwmRms] = useState<number | null>(null);
  const [pwmError, setPwmError] = useState<string | null>(null);

  const [pwmF, setPwmF] = useState('');
  const [pwmPeriod, setPwmPeriod] = useState<number | null>(null);
  const [pwmFError, setPwmFError] = useState<string | null>(null);

  const [pwmT, setPwmT] = useState('');
  const [pwmFreqOut, setPwmFreqOut] = useState<number | null>(null);
  const [pwmTError, setPwmTError] = useState<string | null>(null);

  const [pwmPeriodInput, setPwmPeriodInput] = useState('');
  const [pwmTHigh, setPwmTHigh] = useState('');
  const [pwmDutyResult, setPwmDutyResult] = useState<number | null>(null);
  const [pwmTHighError, setPwmTHighError] = useState<string | null>(null);

  const [pwmDutyInput, setPwmDutyInput] = useState('');
  const [pwmTHighResult, setPwmTHighResult] = useState<number | null>(null);
  const [pwmTHighOutError, setPwmTHighOutError] = useState<string | null>(null);

  const handleOhmsLaw = (e: FormEvent) => {
    e.preventDefault();
    setOhmError(null);
    try {
      const result = ohmsLaw({
        voltage: parseNumber(ohmU),
        current: parseNumber(ohmI),
        resistance: parseNumber(ohmR),
      });
      setOhmResult(result);
    } catch (err) {
      setOhmResult(null);
      setOhmError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleSeries = (e: FormEvent) => {
    e.preventDefault();
    setSeriesError(null);
    const values = parseList(seriesInput);
    if (!values.length) {
      setSeriesResult(null);
      setSeriesError('Введите хотя бы одно сопротивление.');
      return;
    }
    setSeriesResult(seriesResistance(values));
  };

  const handleParallel = (e: FormEvent) => {
    e.preventDefault();
    setParallelError(null);
    try {
      const values = parseList(parallelInput);
      if (!values.length) {
        setParallelResult(null);
        setParallelError('Введите хотя бы одно сопротивление.');
        return;
      }
      setParallelResult(parallelResistance(values));
    } catch (err) {
      setParallelResult(null);
      setParallelError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleRL = (e: FormEvent) => {
    e.preventDefault();
    setRlError(null);
    try {
      const R = parseNumber(rlR);
      const L = parseNumber(rlL);
      const f = parseNumber(rlF);
      if (R === null || L === null || f === null) {
        throw new Error('Введите R, L и f.');
      }
      setRlZ(impedanceRL(R, L, f));
    } catch (err) {
      setRlZ(null);
      setRlError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleRC = (e: FormEvent) => {
    e.preventDefault();
    setRcError(null);
    try {
      const R = parseNumber(rcR);
      const C = parseNumber(rcC);
      const f = parseNumber(rcF);
      if (R === null || C === null || f === null) {
        throw new Error('Введите R, C и f.');
      }
      setRcZ(impedanceRC(R, C, f));
    } catch (err) {
      setRcZ(null);
      setRcError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleSinglePhase = (e: FormEvent) => {
    e.preventDefault();
    setSpError(null);
    try {
      const U = parseNumber(spU);
      const I = parseNumber(spI);
      const cosPhi = parseNumber(spCos);
      if (U === null || I === null || cosPhi === null) {
        throw new Error('Введите U, I и cosφ.');
      }
      setSpResult(singlePhasePower(U, I, cosPhi));
    } catch (err) {
      setSpResult(null);
      setSpError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleThreePhase = (e: FormEvent) => {
    e.preventDefault();
    setTpError(null);
    try {
      const U = parseNumber(tpU);
      const I = parseNumber(tpI);
      const cosPhi = parseNumber(tpCos);
      if (U === null || I === null || cosPhi === null) {
        throw new Error('Введите Uл, Iл и cosφ.');
      }
      setTpResult(threePhasePowerLine(U, I, cosPhi));
    } catch (err) {
      setTpResult(null);
      setTpError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleXL = (e: FormEvent) => {
    e.preventDefault();
    setXlError(null);
    try {
      const L = parseNumber(xlL);
      const f = parseNumber(xlF);
      if (L === null || f === null) {
        throw new Error('Введите L и f.');
      }
      setXlResult(reactanceL(L, f));
    } catch (err) {
      setXlResult(null);
      setXlError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleXC = (e: FormEvent) => {
    e.preventDefault();
    setXcError(null);
    try {
      const C = parseNumber(xcC);
      const f = parseNumber(xcF);
      if (C === null || f === null) {
        throw new Error('Введите C и f.');
      }
      setXcResult(reactanceC(C, f));
    } catch (err) {
      setXcResult(null);
      setXcError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleRLC = (e: FormEvent) => {
    e.preventDefault();
    setRlcError(null);
    try {
      const R = parseNumber(rlcR);
      const L = parseNumber(rlcL);
      const C = parseNumber(rlcC);
      const f = parseNumber(rlcF);
      if (R === null || L === null || C === null || f === null) {
        throw new Error('Введите R, L, C и f.');
      }
      setRlcZ(impedanceRLC(R, L, C, f));
    } catch (err) {
      setRlcZ(null);
      setRlcError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleVoltageDivider = (e: FormEvent) => {
    e.preventDefault();
    setVdError(null);
    try {
      const Vin = parseNumber(vdVin);
      const R1 = parseNumber(vdR1);
      const R2 = parseNumber(vdR2);
      if (Vin === null || R1 === null || R2 === null) {
        throw new Error('Введите Vin, R1 и R2.');
      }
      setVdResult(voltageDivider(Vin, R1, R2));
    } catch (err) {
      setVdResult(null);
      setVdError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleCapEnergy = (e: FormEvent) => {
    e.preventDefault();
    setCapError(null);
    try {
      const C = parseNumber(capC);
      const V = parseNumber(capV);
      if (C === null || V === null) {
        throw new Error('Введите C и V.');
      }
      setCapResult(capacitorEnergy(C, V));
    } catch (err) {
      setCapResult(null);
      setCapError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleRCCutoff = (e: FormEvent) => {
    e.preventDefault();
    setRcfError(null);
    try {
      const R = parseNumber(rcfR);
      const C = parseNumber(rcfC);
      if (R === null || C === null) {
        throw new Error('Введите R и C.');
      }
      setRcfResult(rcCutoff(R, C));
    } catch (err) {
      setRcfResult(null);
      setRcfError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleResonance = (e: FormEvent) => {
    e.preventDefault();
    setResError(null);
    try {
      const L = parseNumber(resL);
      const C = parseNumber(resC);
      if (L === null || C === null) {
        throw new Error('Введите L и C.');
      }
      setResResult(resonanceLC(L, C));
    } catch (err) {
      setResResult(null);
      setResError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleTransformer = (e: FormEvent) => {
    e.preventDefault();
    setTrError(null);
    try {
      const U1 = parseNumber(trU1);
      const N1 = parseNumber(trN1);
      const N2 = parseNumber(trN2);
      const I1 = parseNumber(trI1);
      if (U1 === null || N1 === null || N2 === null) {
        throw new Error('Введите U1, N1, N2.');
      }
      setTrResult(idealTransformer({ U1, N1, N2, I1: I1 === null ? undefined : I1 }));
    } catch (err) {
      setTrResult(null);
      setTrError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handlePfCorrection = (e: FormEvent) => {
    e.preventDefault();
    setPfError(null);
    try {
      const P = parseNumber(pfP);
      const U = parseNumber(pfU);
      const f = parseNumber(pfF);
      const cosN = parseNumber(pfCosNow);
      const cosT = parseNumber(pfCosTarget);
      if (P === null || U === null || f === null || cosN === null || cosT === null) {
        throw new Error('Введите P, Uл, f, cosφ начальный и целевой.');
      }
      setPfResult(pfCorrectionCap({ P_kw: P, U_line: U, f, cosNow: cosN, cosTarget: cosT }));
    } catch (err) {
      setPfResult(null);
      setPfError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleInductorEnergy = (e: FormEvent) => {
    e.preventDefault();
    setIndError(null);
    try {
      const L = parseNumber(indL);
      const I = parseNumber(indI);
      if (L === null || I === null) throw new Error('Введите L и I.');
      setIndResult(inductorEnergy(L, I));
    } catch (err) {
      setIndResult(null);
      setIndError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleLedResistor = (e: FormEvent) => {
    e.preventDefault();
    setLedError(null);
    try {
      const Uin = parseNumber(ledUin);
      const Uf = parseNumber(ledUf);
      const If = parseNumber(ledIf);
      if (Uin === null || Uf === null || If === null) throw new Error('Введите Uвх, Uдиода и Iдиода.');
      setLedResult(ledResistor(Uin, Uf, If));
    } catch (err) {
      setLedResult(null);
      setLedError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleDeltaToWye = (e: FormEvent) => {
    e.preventDefault();
    setDeltaError(null);
    try {
      const Ra = parseNumber(deltaRa);
      const Rb = parseNumber(deltaRb);
      const Rc = parseNumber(deltaRc);
      if (Ra === null || Rb === null || Rc === null) throw new Error('Введите Ra, Rb, Rc.');
      setDeltaResult(deltaToWye(Ra, Rb, Rc));
    } catch (err) {
      setDeltaResult(null);
      setDeltaError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleWyeToDelta = (e: FormEvent) => {
    e.preventDefault();
    setWyeError(null);
    try {
      const R1 = parseNumber(wyeR1);
      const R2 = parseNumber(wyeR2);
      const R3 = parseNumber(wyeR3);
      if (R1 === null || R2 === null || R3 === null) throw new Error('Введите R1, R2, R3.');
      setWyeResult(wyeToDelta(R1, R2, R3));
    } catch (err) {
      setWyeResult(null);
      setWyeError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleCableDrop = (e: FormEvent) => {
    e.preventDefault();
    setCableError(null);
    try {
      const rho = parseNumber(cableRho);
      const len = parseNumber(cableLen);
      const I = parseNumber(cableI);
      const area = parseNumber(cableArea);
      const U = parseNumber(cableU);
      if (rho === null || len === null || I === null || area === null) throw new Error('Введите ρ, L, I, S.');
      setCableResult(cableVoltageDrop({ rho, length: len, current: I, area, phases: cablePh === '3' ? 3 : 1, U_supply: U ?? undefined }));
    } catch (err) {
      setCableResult(null);
      setCableError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleRegDiss = (e: FormEvent) => {
    e.preventDefault();
    setRegError(null);
    try {
      const Vin = parseNumber(regVin);
      const Vout = parseNumber(regVout);
      const I = parseNumber(regI);
      if (Vin === null || Vout === null || I === null) throw new Error('Введите Vin, Vout и I.');
      setRegResult(regulatorDissipation(Vin, Vout, I));
    } catch (err) {
      setRegResult(null);
      setRegError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handleQFactor = (e: FormEvent) => {
    e.preventDefault();
    setQError(null);
    try {
      const R = parseNumber(qR);
      const L = parseNumber(qL);
      const C = parseNumber(qC);
      if (R === null || L === null || C === null) throw new Error('Введите R, L, C.');
      setQResult(rlcQFactor(R, L, C));
    } catch (err) {
      setQResult(null);
      setQError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const normalizeDuty = (value: string) => {
    if (!value.trim()) return null;
    const num = Number(value.replace(',', '.'));
    if (Number.isNaN(num)) return null;
    return num > 1 ? num / 100 : num; // допускаем ввод в процентах
  };

  const handlePwmAvgRms = (e: FormEvent) => {
    e.preventDefault();
    setPwmError(null);
    try {
      const Vh = parseNumber(pwmVh);
      const Vl = parseNumber(pwmVl);
      const dutyNorm = normalizeDuty(pwmDuty);
      if (Vh === null || Vl === null || dutyNorm === null) {
        throw new Error('Введите Vhigh, Vlow и скважность.');
      }
      setPwmAvg(pwmAverageVoltage(Vh, Vl, dutyNorm));
      setPwmRms(pwmRmsVoltage(Vh, Vl, dutyNorm));
    } catch (err) {
      setPwmAvg(null);
      setPwmRms(null);
      setPwmError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handlePwmFreqToPeriod = (e: FormEvent) => {
    e.preventDefault();
    setPwmFError(null);
    try {
      const f = parseNumber(pwmF);
      if (f === null) {
        throw new Error('Введите частоту.');
      }
      setPwmPeriod(periodFromFreq(f));
    } catch (err) {
      setPwmPeriod(null);
      setPwmFError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handlePwmPeriodToFreq = (e: FormEvent) => {
    e.preventDefault();
    setPwmTError(null);
    try {
      const T = parseNumber(pwmT);
      if (T === null) {
        throw new Error('Введите период.');
      }
      setPwmFreqOut(freqFromPeriod(T));
    } catch (err) {
      setPwmFreqOut(null);
      setPwmTError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handlePwmTHighToDuty = (e: FormEvent) => {
    e.preventDefault();
    setPwmTHighError(null);
    try {
      const tHigh = parseNumber(pwmTHigh);
      const period = parseNumber(pwmPeriodInput);
      if (tHigh === null || period === null) {
        throw new Error('Введите tвкл и период.');
      }
      setPwmDutyResult(pwmDutyFromTimes(tHigh, period));
    } catch (err) {
      setPwmDutyResult(null);
      setPwmTHighError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const handlePwmDutyToTHigh = (e: FormEvent) => {
    e.preventDefault();
    setPwmTHighOutError(null);
    try {
      const dutyNorm = normalizeDuty(pwmDutyInput);
      const period = parseNumber(pwmPeriodInput);
      if (dutyNorm === null || period === null) {
        throw new Error('Введите duty и период.');
      }
      setPwmTHighResult(pwmHighTimeFromDuty(dutyNorm, period));
    } catch (err) {
      setPwmTHighResult(null);
      setPwmTHighOutError(err instanceof Error ? err.message : 'Ошибка расчёта');
    }
  };

  const pwmSection = (
    <SectionCard title="Импульсные сигналы / PWM" description="Среднее, RMS, период, tвкл, скважность.">
      <div className="space-y-6">
        <div className="glass p-4">
          <div className="mb-2 text-sm font-semibold text-cyan-200">Среднее и RMS</div>
          <form onSubmit={handlePwmAvgRms} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1">
                <div className="label">Vhigh (В)</div>
                <input className="input" type="number" step="any" value={pwmVh} onChange={(e) => setPwmVh(e.target.value)} />
              </label>
              <label className="space-y-1">
                <div className="label">Vlow (В)</div>
                <input className="input" type="number" step="any" value={pwmVl} onChange={(e) => setPwmVl(e.target.value)} />
              </label>
              <label className="space-y-1">
                <div className="label">Скважность (0..1 или %)</div>
                <input className="input" type="number" step="any" value={pwmDuty} onChange={(e) => setPwmDuty(e.target.value)} />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="button">
                Рассчитать
              </button>
              {pwmError && <span className="text-sm text-rose-200">{pwmError}</span>}
            </div>
          </form>
          <ResultBlock title="Результат">
            {pwmAvg !== null || pwmRms !== null ? (
              <div className="space-y-1 text-sm text-slate-100">
                {pwmAvg !== null && <div>Vср = {formatNumber(pwmAvg)} В</div>}
                {pwmRms !== null && <div>V_rms = {formatNumber(pwmRms)} В</div>}
              </div>
            ) : (
              <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
            )}
          </ResultBlock>
        </div>

        <div className="glass p-4">
          <div className="mb-2 text-sm font-semibold text-cyan-200">Частота и период</div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <form onSubmit={handlePwmFreqToPeriod} className="space-y-3">
                <label className="space-y-1">
                  <div className="label">f (Гц)</div>
                  <input className="input" type="number" step="any" value={pwmF} onChange={(e) => setPwmF(e.target.value)} />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="button">
                    T из f
                  </button>
                  {pwmFError && <span className="text-sm text-rose-200">{pwmFError}</span>}
                </div>
              </form>
              <ResultBlock title="Результат T">
                {pwmPeriod !== null ? (
                  <div className="text-sm text-slate-100">T = {formatNumber(pwmPeriod)} с</div>
                ) : (
                  <div className="text-slate-400">Введите частоту и нажмите «Рассчитать».</div>
                )}
              </ResultBlock>
            </div>
            <div className="space-y-3">
              <form onSubmit={handlePwmPeriodToFreq} className="space-y-3">
                <label className="space-y-1">
                  <div className="label">T (с)</div>
                  <input className="input" type="number" step="any" value={pwmT} onChange={(e) => setPwmT(e.target.value)} />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="button">
                    f из T
                  </button>
                  {pwmTError && <span className="text-sm text-rose-200">{pwmTError}</span>}
                </div>
              </form>
              <ResultBlock title="Результат f">
                {pwmFreqOut !== null ? (
                  <div className="text-sm text-slate-100">f = {formatNumber(pwmFreqOut)} Гц</div>
                ) : (
                  <div className="text-slate-400">Введите период и нажмите «Рассчитать».</div>
                )}
              </ResultBlock>
            </div>
          </div>
        </div>

        <div className="glass p-3">
          <div className="mb-2 text-sm font-semibold text-cyan-200">Скважность ↔ время включения</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <form onSubmit={handlePwmTHighToDuty} className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1">
                    <div className="label">tвкл (с)</div>
                    <input className="input" type="number" step="any" value={pwmTHigh} onChange={(e) => setPwmTHigh(e.target.value)} />
                  </label>
                  <label className="space-y-1">
                    <div className="label">Период T (с)</div>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      value={pwmPeriodInput}
                      onChange={(e) => setPwmPeriodInput(e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="button">
                    Duty из tвкл
                  </button>
                  {pwmTHighError && <span className="text-sm text-rose-200">{pwmTHighError}</span>}
                </div>
              </form>
              <ResultBlock title="Duty результат">
                {pwmDutyResult !== null ? (
                  <div className="text-sm text-slate-100">
                    duty = {formatNumber(pwmDutyResult, 5)} ({formatNumber(pwmDutyResult * 100, 5)} %)
                  </div>
                ) : (
                  <div className="text-slate-400">Введите tвкл и период.</div>
                )}
              </ResultBlock>
            </div>

            <div className="space-y-2">
              <form onSubmit={handlePwmDutyToTHigh} className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1">
                    <div className="label">duty (0..1 или %)</div>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      value={pwmDutyInput}
                      onChange={(e) => setPwmDutyInput(e.target.value)}
                    />
                  </label>
                  <label className="space-y-1">
                    <div className="label">Период T (с)</div>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      value={pwmPeriodInput}
                      onChange={(e) => setPwmPeriodInput(e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="button">
                    tвкл из duty
                  </button>
                  {pwmTHighOutError && <span className="text-sm text-rose-200">{pwmTHighOutError}</span>}
                </div>
              </form>
              <ResultBlock title="tвкл результат">
                {pwmTHighResult !== null ? (
                  <div className="text-sm text-slate-100">tвкл = {formatNumber(pwmTHighResult)} с</div>
                ) : (
                  <div className="text-slate-400">Введите duty и период.</div>
                )}
              </ResultBlock>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Скважность можно вводить дробью (0..1) или в процентах (например, 25).</p>
        </div>
      </div>
    </SectionCard>
  );

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="glass relative overflow-hidden p-5 text-center">
          <div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-emerald-500/10"
            aria-hidden
          />
          <div className="relative space-y-3">
            <div className="badge mx-auto w-fit">Электротехника</div>
            <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Электротехнический калькулятор
            </h1>
            <p className="text-slate-300">React + TypeScript + Vite + TailwindCSS</p>
          </div>
        </header>

        <div className="section-grid">
          <SectionCard title="Закон Ома" description="Задайте любые два параметра, третий найдётся.">
            <form onSubmit={handleOhmsLaw} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">U (В)</div>
                  <input
                    className="input"
                    type="number"
                    step="any"
                    value={ohmU}
                    onChange={(e) => setOhmU(e.target.value)}
                    placeholder="напряжение"
                  />
                </label>
                <label className="space-y-1">
                  <div className="label">I (А)</div>
                  <input
                    className="input"
                    type="number"
                    step="any"
                    value={ohmI}
                    onChange={(e) => setOhmI(e.target.value)}
                    placeholder="ток"
                  />
                </label>
                <label className="space-y-1">
                  <div className="label">R (Ом)</div>
                  <input
                    className="input"
                    type="number"
                    step="any"
                    value={ohmR}
                    onChange={(e) => setOhmR(e.target.value)}
                    placeholder="сопротивление"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {ohmError && <span className="text-sm text-rose-200">{ohmError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {ohmResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>U = {formatNumber(ohmResult.voltage)} В</div>
                  <div>I = {formatNumber(ohmResult.current)} А</div>
                  <div>R = {formatNumber(ohmResult.resistance)} Ом</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard
            title="Последовательное соединение"
            description="Эквивалентное сопротивление при последовательном соединении."
          >
            <form onSubmit={handleSeries} className="space-y-3">
              <label className="space-y-1">
                <div className="label">Сопротивления (Ом)</div>
                <input
                  className="input"
                  type="text"
                  value={seriesInput}
                  onChange={(e) => setSeriesInput(e.target.value)}
                  placeholder="например: 10 22 33"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {seriesError && <span className="text-sm text-rose-200">{seriesError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {seriesResult !== null ? (
                <div className="text-sm text-slate-100">Эквивалентное R = {formatNumber(seriesResult)} Ом</div>
              ) : (
                <div className="text-slate-400">Введите значения и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard
            title="Параллельное соединение"
            description="Эквивалентное сопротивление при параллельном соединении."
          >
            <form onSubmit={handleParallel} className="space-y-3">
              <label className="space-y-1">
                <div className="label">Сопротивления (Ом)</div>
                <input
                  className="input"
                  type="text"
                  value={parallelInput}
                  onChange={(e) => setParallelInput(e.target.value)}
                  placeholder="например: 10 22 33"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {parallelError && <span className="text-sm text-rose-200">{parallelError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {parallelResult !== null ? (
                <div className="text-sm text-slate-100">Эквивалентное R = {formatNumber(parallelResult)} Ом</div>
              ) : (
                <div className="text-slate-400">Введите значения и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard title="Импеданс RL" description="Импеданс цепи R-L: Z = R + jωL">
            <form onSubmit={handleRL} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">R (Ом)</div>
                  <input className="input" type="number" step="any" value={rlR} onChange={(e) => setRlR(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">L (Гн)</div>
                  <input className="input" type="number" step="any" value={rlL} onChange={(e) => setRlL(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">f (Гц)</div>
                  <input className="input" type="number" step="any" value={rlF} onChange={(e) => setRlF(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {rlError && <span className="text-sm text-rose-200">{rlError}</span>}
              </div>
            </form>
            {rlZ ? (
              <ImpedanceResult label="Результат" z={rlZ} />
            ) : (
              <ResultBlock title="Результат">
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              </ResultBlock>
            )}
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard title="Импеданс RC" description="Импеданс цепи R-C: Z = R - j/(ωC)">
            <form onSubmit={handleRC} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">R (Ом)</div>
                  <input className="input" type="number" step="any" value={rcR} onChange={(e) => setRcR(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">C (Ф)</div>
                  <input className="input" type="number" step="any" value={rcC} onChange={(e) => setRcC(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">f (Гц)</div>
                  <input className="input" type="number" step="any" value={rcF} onChange={(e) => setRcF(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {rcError && <span className="text-sm text-rose-200">{rcError}</span>}
              </div>
            </form>
            {rcZ ? (
              <ImpedanceResult label="Результат" z={rcZ} />
            ) : (
              <ResultBlock title="Результат">
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              </ResultBlock>
            )}
          </SectionCard>

          <SectionCard
            title="Мощность однофазной сети"
            description="P = U * I * cosφ, Q = U * I * sinφ, S = U * I"
          >
            <form onSubmit={handleSinglePhase} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">U (В)</div>
                  <input className="input" type="number" step="any" value={spU} onChange={(e) => setSpU(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">I (А)</div>
                  <input className="input" type="number" step="any" value={spI} onChange={(e) => setSpI(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">cosφ</div>
                  <input className="input" type="number" step="any" value={spCos} onChange={(e) => setSpCos(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {spError && <span className="text-sm text-rose-200">{spError}</span>}
              </div>
            </form>
            <PowerResultBox title="Результат" result={spResult} />
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard
            title="Мощность трёхфазной сети"
            description="P = √3 * Uл * Iл * cosφ, Q = √3 * Uл * Iл * sinφ, S = √3 * Uл * Iл"
          >
            <form onSubmit={handleThreePhase} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">Uл (В)</div>
                  <input className="input" type="number" step="any" value={tpU} onChange={(e) => setTpU(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">Iл (А)</div>
                  <input className="input" type="number" step="any" value={tpI} onChange={(e) => setTpI(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">cosφ</div>
                  <input className="input" type="number" step="any" value={tpCos} onChange={(e) => setTpCos(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {tpError && <span className="text-sm text-rose-200">{tpError}</span>}
              </div>
            </form>
            <PowerResultBox title="Результат" result={tpResult} />
          </SectionCard>

          {pwmSection}
        </div>

        <div className="section-grid">
          <SectionCard
            title="Реактивное сопротивление катушки (X_L)"
            description="X_L = 2π f L — модуль реактивного сопротивления индуктивности."
          >
            <form onSubmit={handleXL} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="label">L (Гн)</div>
                  <input className="input" type="number" step="any" value={xlL} onChange={(e) => setXlL(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">f (Гц)</div>
                  <input className="input" type="number" step="any" value={xlF} onChange={(e) => setXlF(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {xlError && <span className="text-sm text-rose-200">{xlError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {xlResult !== null ? (
                <div className="text-sm text-slate-100">X_L = {formatNumber(xlResult)} Ом</div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard
            title="Реактивное сопротивление конденсатора (X_C)"
            description="X_C = 1 / (2π f C) — модуль реактивного сопротивления ёмкости."
          >
            <form onSubmit={handleXC} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="label">C (Ф)</div>
                  <input className="input" type="number" step="any" value={xcC} onChange={(e) => setXcC(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">f (Гц)</div>
                  <input className="input" type="number" step="any" value={xcF} onChange={(e) => setXcF(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {xcError && <span className="text-sm text-rose-200">{xcError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {xcResult !== null ? (
                <div className="text-sm text-slate-100">X_C = {formatNumber(xcResult)} Ом</div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard
            title="Импеданс RLC (последовательный)"
            description="Z = R + j(ωL − 1/(ωC))"
          >
            <form onSubmit={handleRLC} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="space-y-1">
                  <div className="label">R (Ом)</div>
                  <input className="input" type="number" step="any" value={rlcR} onChange={(e) => setRlcR(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">L (Гн)</div>
                  <input className="input" type="number" step="any" value={rlcL} onChange={(e) => setRlcL(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">C (Ф)</div>
                  <input className="input" type="number" step="any" value={rlcC} onChange={(e) => setRlcC(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">f (Гц)</div>
                  <input className="input" type="number" step="any" value={rlcF} onChange={(e) => setRlcF(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {rlcError && <span className="text-sm text-rose-200">{rlcError}</span>}
              </div>
            </form>
            {rlcZ ? (
              <ImpedanceResult label="Результат" z={rlcZ} />
            ) : (
              <ResultBlock title="Результат">
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              </ResultBlock>
            )}
          </SectionCard>

          <SectionCard
            title="Делитель напряжения"
            description="Vout = Vin * R2 / (R1 + R2)"
          >
            <form onSubmit={handleVoltageDivider} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">Vin (В)</div>
                  <input className="input" type="number" step="any" value={vdVin} onChange={(e) => setVdVin(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">R1 (Ом)</div>
                  <input className="input" type="number" step="any" value={vdR1} onChange={(e) => setVdR1(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">R2 (Ом)</div>
                  <input className="input" type="number" step="any" value={vdR2} onChange={(e) => setVdR2(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {vdError && <span className="text-sm text-rose-200">{vdError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {vdResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>Vout = {formatNumber(vdResult.Vout)} В</div>
                  <div>Деление = {formatNumber(vdResult.ratio * 100, 5)} % от Vin</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard
            title="Энергия конденсатора"
            description="W = 0.5 * C * V²"
          >
            <form onSubmit={handleCapEnergy} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="label">C (Ф)</div>
                  <input className="input" type="number" step="any" value={capC} onChange={(e) => setCapC(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">V (В)</div>
                  <input className="input" type="number" step="any" value={capV} onChange={(e) => setCapV(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {capError && <span className="text-sm text-rose-200">{capError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {capResult !== null ? (
                <div className="text-sm text-slate-100">W = {formatNumber(capResult)} Дж</div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard
            title="RC-фильтр"
            description="Постоянная времени τ = R*C, частота среза f_c = 1 / (2πRC)"
          >
            <form onSubmit={handleRCCutoff} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="label">R (Ом)</div>
                  <input className="input" type="number" step="any" value={rcfR} onChange={(e) => setRcfR(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">C (Ф)</div>
                  <input className="input" type="number" step="any" value={rcfC} onChange={(e) => setRcfC(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {rcfError && <span className="text-sm text-rose-200">{rcfError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {rcfResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>τ = {formatNumber(rcfResult.tau)} с</div>
                  <div>f_c = {formatNumber(rcfResult.fc)} Гц</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard title="Резонанс LC" description="f0 = 1 / (2π√(LC))">
            <form onSubmit={handleResonance} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="label">L (Гн)</div>
                  <input className="input" type="number" step="any" value={resL} onChange={(e) => setResL(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">C (Ф)</div>
                  <input className="input" type="number" step="any" value={resC} onChange={(e) => setResC(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {resError && <span className="text-sm text-rose-200">{resError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {resResult ? (
                <div className="text-sm text-slate-100">f₀ = {formatNumber(resResult.f0)} Гц</div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard title="Идеальный трансформатор" description="U2 = U1 * N2/N1, I2 = I1 * N1/N2">
            <form onSubmit={handleTransformer} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-4">
                <label className="space-y-1">
                  <div className="label">U1 (В)</div>
                  <input className="input" type="number" step="any" value={trU1} onChange={(e) => setTrU1(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">N1 (витков)</div>
                  <input className="input" type="number" step="any" value={trN1} onChange={(e) => setTrN1(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">N2 (витков)</div>
                  <input className="input" type="number" step="any" value={trN2} onChange={(e) => setTrN2(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">I1 (А, опц.)</div>
                  <input className="input" type="number" step="any" value={trI1} onChange={(e) => setTrI1(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {trError && <span className="text-sm text-rose-200">{trError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {trResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>U2 = {formatNumber(trResult.U2)} В</div>
                  <div>Коэффициент k = {formatNumber(trResult.ratio)}</div>
                  {trResult.I2 !== undefined && <div>I2 = {formatNumber(trResult.I2)} А</div>}
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard
            title="Компенсация реактивной мощности (трёхфазная)"
            description="Qc = P*(tanφ1 − tanφ2), C = Qc / (3 * 2π f Uл²)"
          >
            <form onSubmit={handlePfCorrection} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                <label className="space-y-1">
                  <div className="label">P (кВт)</div>
                  <input className="input" type="number" step="any" value={pfP} onChange={(e) => setPfP(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">Uл (В)</div>
                  <input className="input" type="number" step="any" value={pfU} onChange={(e) => setPfU(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">f (Гц)</div>
                  <input className="input" type="number" step="any" value={pfF} onChange={(e) => setPfF(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">cosφ тек.</div>
                  <input className="input" type="number" step="any" value={pfCosNow} onChange={(e) => setPfCosNow(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">cosφ цель</div>
                  <input className="input" type="number" step="any" value={pfCosTarget} onChange={(e) => setPfCosTarget(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {pfError && <span className="text-sm text-rose-200">{pfError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {pfResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>Qc = {formatNumber(pfResult.Qc_var)} вар</div>
                  <div>C на фазу = {formatNumber(pfResult.C_per_phase * 1e6)} мкФ</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard title="Добротность RLC" description="Q = (1/R)*√(L/C), f0 = 1/(2π√(LC)), BW = f0/Q">
            <form onSubmit={handleQFactor} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">R (Ом)</div>
                  <input className="input" type="number" step="any" value={qR} onChange={(e) => setQR(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">L (Гн)</div>
                  <input className="input" type="number" step="any" value={qL} onChange={(e) => setQL(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">C (Ф)</div>
                  <input className="input" type="number" step="any" value={qC} onChange={(e) => setQC(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {qError && <span className="text-sm text-rose-200">{qError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {qResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>Q = {formatNumber(qResult.Q)}</div>
                  <div>f₀ = {formatNumber(qResult.f0)} Гц</div>
                  <div>BW = {formatNumber(qResult.bw)} Гц</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard title="Энергия катушки" description="W = 0.5 * L * I²">
            <form onSubmit={handleInductorEnergy} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="label">L (Гн)</div>
                  <input className="input" type="number" step="any" value={indL} onChange={(e) => setIndL(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">I (А)</div>
                  <input className="input" type="number" step="any" value={indI} onChange={(e) => setIndI(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {indError && <span className="text-sm text-rose-200">{indError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {indResult !== null ? (
                <div className="text-sm text-slate-100">W = {formatNumber(indResult)} Дж</div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard title="Сопротивления Δ → Y" description="R1 = Rb*Rc/Σ, R2 = Ra*Rc/Σ, R3 = Ra*Rb/Σ">
            <form onSubmit={handleDeltaToWye} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">Ra (Ом)</div>
                  <input className="input" type="number" step="any" value={deltaRa} onChange={(e) => setDeltaRa(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">Rb (Ом)</div>
                  <input className="input" type="number" step="any" value={deltaRb} onChange={(e) => setDeltaRb(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">Rc (Ом)</div>
                  <input className="input" type="number" step="any" value={deltaRc} onChange={(e) => setDeltaRc(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {deltaError && <span className="text-sm text-rose-200">{deltaError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {deltaResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>R1 = {formatNumber(deltaResult.R1)} Ом</div>
                  <div>R2 = {formatNumber(deltaResult.R2)} Ом</div>
                  <div>R3 = {formatNumber(deltaResult.R3)} Ом</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard title="Сопротивления Y → Δ" description="Ra = Σ * R2 / R3, Rb = Σ * R1 / R3, Rc = Σ * R1 / R2">
            <form onSubmit={handleWyeToDelta} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">R1 (Ом)</div>
                  <input className="input" type="number" step="any" value={wyeR1} onChange={(e) => setWyeR1(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">R2 (Ом)</div>
                  <input className="input" type="number" step="any" value={wyeR2} onChange={(e) => setWyeR2(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">R3 (Ом)</div>
                  <input className="input" type="number" step="any" value={wyeR3} onChange={(e) => setWyeR3(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {wyeError && <span className="text-sm text-rose-200">{wyeError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {wyeResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>Ra = {formatNumber(wyeResult.Ra)} Ом</div>
                  <div>Rb = {formatNumber(wyeResult.Rb)} Ом</div>
                  <div>Rc = {formatNumber(wyeResult.Rc)} Ом</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard title="Падение напряжения в кабеле" description="ΔU = k * ρ * L * I / S">
            <form onSubmit={handleCableDrop} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                <label className="space-y-1">
                  <div className="label">ρ (Ом·мм²/м)</div>
                  <input className="input" type="number" step="any" value={cableRho} onChange={(e) => setCableRho(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">L (м)</div>
                  <input className="input" type="number" step="any" value={cableLen} onChange={(e) => setCableLen(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">I (А)</div>
                  <input className="input" type="number" step="any" value={cableI} onChange={(e) => setCableI(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">S (мм²)</div>
                  <input className="input" type="number" step="any" value={cableArea} onChange={(e) => setCableArea(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">U питания (В, опц.)</div>
                  <input className="input" type="number" step="any" value={cableU} onChange={(e) => setCableU(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="label">Фазы:</span>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="radio" checked={cablePh === '1'} onChange={() => setCablePh('1')} />
                    1ф
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="radio" checked={cablePh === '3'} onChange={() => setCablePh('3')} />
                    3ф
                  </label>
                </div>
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {cableError && <span className="text-sm text-rose-200">{cableError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {cableResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>ΔU = {formatNumber(cableResult.dU)} В</div>
                  {cableResult.dU_percent !== undefined && <div>ΔU = {formatNumber(cableResult.dU_percent)} %</div>}
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>

          <SectionCard title="Тепло на линейном регуляторе" description="Pрасс = (Vin − Vout) * I">
            <form onSubmit={handleRegDiss} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">Vin (В)</div>
                  <input className="input" type="number" step="any" value={regVin} onChange={(e) => setRegVin(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">Vout (В)</div>
                  <input className="input" type="number" step="any" value={regVout} onChange={(e) => setRegVout(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">I (А)</div>
                  <input className="input" type="number" step="any" value={regI} onChange={(e) => setRegI(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {regError && <span className="text-sm text-rose-200">{regError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {regResult ? (
                <div className="text-sm text-slate-100">Pрасс = {formatNumber(regResult.Pdiss)} Вт</div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>

        <div className="section-grid">
          <SectionCard title="Резистор для светодиода" description="R = (Uвх − Uдиода) / Iдиода">
            <form onSubmit={handleLedResistor} className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <label className="space-y-1">
                  <div className="label">Uвх (В)</div>
                  <input className="input" type="number" step="any" value={ledUin} onChange={(e) => setLedUin(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">Uдиода (В)</div>
                  <input className="input" type="number" step="any" value={ledUf} onChange={(e) => setLedUf(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <div className="label">Iдиода (А)</div>
                  <input className="input" type="number" step="any" value={ledIf} onChange={(e) => setLedIf(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="button">
                  Рассчитать
                </button>
                {ledError && <span className="text-sm text-rose-200">{ledError}</span>}
              </div>
            </form>
            <ResultBlock title="Результат">
              {ledResult ? (
                <div className="space-y-1 text-sm text-slate-100">
                  <div>R = {formatNumber(ledResult.R)} Ом</div>
                  <div>Pрез = {formatNumber(ledResult.P)} Вт</div>
                </div>
              ) : (
                <div className="text-slate-400">Введите данные и нажмите «Рассчитать».</div>
              )}
            </ResultBlock>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default App;
