import type { FlowInputs, Hospital, MeshState, Shift, StockItem } from '../types'

export function hospitalOf(state: MeshState, hospitalId: string): Hospital {
  const found = state.hospitals.find((h) => h.id === hospitalId)
  if (!found) throw new Error('Unknown hospital')
  return found
}

export function scoped<T extends { hospitalId: string }>(rows: T[], hospitalId: string): T[] {
  return rows.filter((row) => row.hospitalId === hospitalId)
}

export function stockouts(stock: StockItem[]): number {
  return stock.filter((s) => s.quantity <= 0).length
}

export function stockStatus(item: StockItem): 'out' | 'low' | 'ok' {
  if (item.quantity <= 0) return 'out'
  if (item.quantity <= item.reorderAt) return 'low'
  return 'ok'
}

export function flowInputs(state: MeshState, hospitalId: string, shift: Shift = 'day'): FlowInputs {
  const hospital = hospitalOf(state, hospitalId)
  const queue = scoped(state.queue, hospitalId)
  const stock = scoped(state.stock, hospitalId)
  const waiting = queue.filter((q) => q.status === 'waiting').length
  const pharmacyQueue = queue.filter((q) => q.status === 'pharmacy').length
  const night = shift === 'night'
  return {
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    waitingCount: waiting,
    avgConsultMinutes: hospital.avgConsultMinutes,
    doctorsOnDuty: night ? 0 : hospital.doctorsOnDuty,
    emergencyArrivals: night ? Math.max(hospital.emergencyArrivals, 1) : hospital.emergencyArrivals,
    emergencyDivertMinutes: hospital.emergencyDivertMinutes,
    pharmacyQueue,
    avgDispenseMinutes: hospital.avgDispenseMinutes,
    pharmacistsOnDuty: night ? Math.min(hospital.pharmacistsOnDuty, 1) : hospital.pharmacistsOnDuty,
    stockouts: stockouts(stock),
    staffOnDuty: night ? Math.max(3, Math.round(hospital.staffOnDuty * 0.4)) : hospital.staffOnDuty,
    targetStaff: hospital.targetStaff,
    occupancy: hospital.occupancy,
    nearHandover: night || hospital.nearHandover,
  }
}

export function meshDemand(state: MeshState) {
  const bySku = new Map<string, { name: string; sku: string; soldWeek: number; hospitalsOut: string[] }>()
  for (const item of state.stock) {
    const cur = bySku.get(item.sku) ?? { name: item.name, sku: item.sku, soldWeek: 0, hospitalsOut: [] }
    cur.soldWeek += item.soldWeek
    if (item.quantity <= 0) cur.hospitalsOut.push(item.hospitalId)
    bySku.set(item.sku, cur)
  }
  return [...bySku.values()].sort((a, b) => b.soldWeek - a.soldWeek)
}
