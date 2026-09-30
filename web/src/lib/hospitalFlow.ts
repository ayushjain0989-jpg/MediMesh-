import type { FlowInputs, FlowResult } from '../types'

/** Transparent HospitalFlow AI model.
 * Coefficients are named and shown in the UI. Python FastAPI uses the same numbers.
 */
export const FLOW = {
  staffAlpha: 0.4,
  handoverFactor: 1.12,
  crowdBeta: 0.5,
  crowdThreshold: 0.8,
  stockoutMinutes: 6,
  sigmaRatio: 0.18,
} as const

function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function simulateFlow(inputs: FlowInputs, source: FlowResult['source'] = 'local'): FlowResult {
  const doctors = Math.max(inputs.doctorsOnDuty, 1)
  const pharmacists = Math.max(inputs.pharmacistsOnDuty, 1)
  const staffRatio = inputs.targetStaff <= 0 ? 1 : inputs.staffOnDuty / inputs.targetStaff

  const consult = (inputs.waitingCount * inputs.avgConsultMinutes) / doctors
  const emergency = inputs.emergencyArrivals * inputs.emergencyDivertMinutes
  const pharmacy = (inputs.pharmacyQueue * inputs.avgDispenseMinutes) / pharmacists
  const stock = inputs.stockouts * FLOW.stockoutMinutes
  const additive = consult + emergency + pharmacy + stock

  const staffFactor = 1 + FLOW.staffAlpha * Math.max(0, 1 - staffRatio)
  const handoverFactor = inputs.nearHandover ? FLOW.handoverFactor : 1
  const crowdOver = Math.max(0, inputs.occupancy - FLOW.crowdThreshold)
  const crowdFactor = 1 + FLOW.crowdBeta * crowdOver

  const predicted = additive * staffFactor * handoverFactor * crowdFactor
  const sigma = FLOW.sigmaRatio * predicted
  const p50 = predicted
  const p80 = predicted + 0.84 * sigma

  const warnings: string[] = []
  if (inputs.doctorsOnDuty <= 0) {
    warnings.push('No doctor on duty — denominator floored at 1 and a staffing penalty is applied.')
  }
  if (inputs.pharmacistsOnDuty <= 0) {
    warnings.push('No pharmacist on duty — pharmacy wait uses a floor of 1 and staffing penalty still applies.')
  }
  if (inputs.stockouts > 0) {
    warnings.push(`${inputs.stockouts} stock-out(s) add substitution delay.`)
  }
  if (inputs.nearHandover) {
    warnings.push('Shift handover window is open — 12% overlap penalty.')
  }

  const steps = [
    {
      id: 'consult',
      label: 'Consult wait',
      formula: 'waiting × avg consult ÷ max(doctors, 1)',
      substitution: `${inputs.waitingCount} × ${inputs.avgConsultMinutes} ÷ ${doctors}`,
      value: round1(consult),
      unit: 'min',
      kind: 'add' as const,
    },
    {
      id: 'emergency',
      label: 'Emergency divert',
      formula: 'emergency arrivals × divert minutes',
      substitution: `${inputs.emergencyArrivals} × ${inputs.emergencyDivertMinutes}`,
      value: round1(emergency),
      unit: 'min',
      kind: 'add' as const,
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy wait',
      formula: 'Rx queue × avg dispense ÷ max(pharmacists, 1)',
      substitution: `${inputs.pharmacyQueue} × ${inputs.avgDispenseMinutes} ÷ ${pharmacists}`,
      value: round1(pharmacy),
      unit: 'min',
      kind: 'add' as const,
    },
    {
      id: 'stock',
      label: 'Stock-out substitution',
      formula: 'stock-outs × 6 min',
      substitution: `${inputs.stockouts} × ${FLOW.stockoutMinutes}`,
      value: round1(stock),
      unit: 'min',
      kind: 'add' as const,
    },
    {
      id: 'staff',
      label: 'Staffing factor',
      formula: '1 + 0.40 × max(0, 1 − staff/target)',
      substitution: `1 + 0.40 × max(0, 1 − ${inputs.staffOnDuty}/${inputs.targetStaff})`,
      value: round1(staffFactor),
      unit: '×',
      kind: 'multiply' as const,
    },
    {
      id: 'handover',
      label: 'Handover overlap',
      formula: '1.12 if near shift change, else 1.00',
      substitution: inputs.nearHandover ? '1.12' : '1.00',
      value: round1(handoverFactor),
      unit: '×',
      kind: 'multiply' as const,
    },
    {
      id: 'crowd',
      label: 'Crowd factor',
      formula: '1 + 0.50 × max(0, occupancy − 0.80)',
      substitution: `1 + 0.50 × max(0, ${inputs.occupancy.toFixed(2)} − 0.80)`,
      value: round1(crowdFactor),
      unit: '×',
      kind: 'multiply' as const,
    },
    {
      id: 'total',
      label: 'Predicted total wait',
      formula: '(consult + emergency + pharmacy + stock) × staff × handover × crowd',
      substitution: `(${round1(consult)} + ${round1(emergency)} + ${round1(pharmacy)} + ${round1(stock)}) × ${round1(staffFactor)} × ${round1(handoverFactor)} × ${round1(crowdFactor)}`,
      value: round1(predicted),
      unit: 'min',
      kind: 'result' as const,
    },
  ]

  return {
    hospitalId: inputs.hospitalId,
    predictedMinutes: round1(predicted),
    p50: round1(p50),
    p80: round1(p80),
    steps,
    warnings,
    source,
  }
}
