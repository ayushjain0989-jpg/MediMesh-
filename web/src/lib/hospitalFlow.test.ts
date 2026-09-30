import { describe, expect, it } from 'vitest'
import { simulateFlow } from './hospitalFlow'
import type { FlowInputs } from '../types'

const base: FlowInputs = {
  hospitalId: 'sunrise',
  hospitalName: 'Sunrise',
  waitingCount: 10,
  avgConsultMinutes: 12,
  doctorsOnDuty: 2,
  emergencyArrivals: 0,
  emergencyDivertMinutes: 8,
  pharmacyQueue: 0,
  avgDispenseMinutes: 4,
  pharmacistsOnDuty: 2,
  stockouts: 0,
  staffOnDuty: 12,
  targetStaff: 12,
  occupancy: 0.5,
  nearHandover: false,
}

describe('HospitalFlow', () => {
  it('computes consult wait as waiting × minutes ÷ doctors', () => {
    const result = simulateFlow(base)
    expect(result.steps.find((s) => s.id === 'consult')?.value).toBe(60)
    expect(result.predictedMinutes).toBe(60)
    expect(result.source).toBe('local')
  })

  it('floors doctors at 1 and warns when none are on duty', () => {
    const result = simulateFlow({ ...base, doctorsOnDuty: 0, waitingCount: 6, avgConsultMinutes: 10 })
    expect(result.steps.find((s) => s.id === 'consult')?.value).toBe(60)
    expect(result.warnings.some((w) => w.toLowerCase().includes('doctor'))).toBe(true)
  })

  it('applies 12% handover multiplier', () => {
    const open = simulateFlow({ ...base, nearHandover: false })
    const hand = simulateFlow({ ...base, nearHandover: true })
    expect(hand.predictedMinutes).toBe(Math.round(open.predictedMinutes * 1.12 * 10) / 10)
  })
})
