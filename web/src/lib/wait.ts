import { simulateFlow } from './hospitalFlow'
import { flowInputs } from './selectors'
import type { MeshState, QueueTicket, Shift } from '../types'

export function tokenNumber(token: string) {
  const n = Number(token.split('-')[1])
  return Number.isFinite(n) ? n : 0
}

export function nextToken(prefix: string, queue: QueueTicket[], hospitalId: string) {
  let max = 0
  for (const q of queue) {
    if (q.hospitalId !== hospitalId) continue
    max = Math.max(max, tokenNumber(q.token))
  }
  return `${prefix}-${String(max + 1).padStart(2, '0')}`
}

export function activeTicket(state: MeshState, hospitalId: string, patientId?: string) {
  if (!patientId) return undefined
  return state.queue.find(
    (q) => q.hospitalId === hospitalId && q.patientId === patientId && q.status !== 'done' && q.status !== 'pharmacy',
  )
}

export function peopleAheadOf(state: MeshState, hospitalId: string, ticket: QueueTicket) {
  return state.queue.filter((q) => {
    if (q.hospitalId !== hospitalId || q.status !== 'waiting' || q.id === ticket.id) return false
    if (q.urgent && !ticket.urgent) return true
    if (ticket.urgent && !q.urgent) return false
    return tokenNumber(q.token) < tokenNumber(ticket.token)
  }).length
}

export type DualWaitSnapshot = {
  ticket?: QueueTicket
  peopleAhead: number
  yourTurnMin: number | null
  hospitalWideMin: number
  consultMath: string
  doctors: number
  waitingCount: number
}

export function dualWait(state: MeshState, hospitalId: string, patientId: string | undefined, shift: Shift): DualWaitSnapshot {
  const inputs = flowInputs(state, hospitalId, shift)
  const flow = simulateFlow(inputs)
  const ticket = activeTicket(state, hospitalId, patientId)
  const doctors = Math.max(inputs.doctorsOnDuty, 1)
  const peopleAhead = ticket ? peopleAheadOf(state, hospitalId, ticket) : 0
  const yourTurnMin = ticket
    ? Math.max(1, Math.round((inputs.avgConsultMinutes * (peopleAhead + 1)) / doctors))
    : null
  return {
    ticket,
    peopleAhead,
    yourTurnMin,
    hospitalWideMin: Math.round(flow.predictedMinutes),
    consultMath: ticket
      ? `${peopleAhead + 1} × ${inputs.avgConsultMinutes} ÷ ${doctors}`
      : `${inputs.waitingCount} waiting · ${inputs.doctorsOnDuty} doctors on this shift`,
    doctors: inputs.doctorsOnDuty,
    waitingCount: inputs.waitingCount,
  }
}
