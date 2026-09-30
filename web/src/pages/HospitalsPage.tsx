import { Card } from '../components/ui'
import { flowInputs } from '../lib/selectors'
import { simulateFlow } from '../lib/hospitalFlow'
import { useMesh } from '../state/MeshContext'

export function HospitalsPage() {
  const { state, session, dutyShift } = useMesh()
  if (!session) return null
  return (
    <div className="space-y-4 px-5 pt-2">
      <h1 className="text-xl font-extrabold">Select Hospital</h1>
      {state.hospitals.map((h) => {
        const mins = Math.round(simulateFlow(flowInputs(state, h.id, dutyShift)).predictedMinutes)
        const current = h.id === session.hospitalId
        return (
          <Card key={h.id} className={current ? 'ring-2 ring-brand' : ''}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
              {current ? 'Your current hospital' : h.city}
            </p>
            <p className="text-lg font-extrabold">{h.name}</p>
            <p className="text-xs text-muted">{h.city}</p>
            <p className="mt-2 text-sm">
              <span className="font-extrabold text-brand">{mins} min</span> typical wait
            </p>
          </Card>
        )
      })}
      <button type="button" className="w-full rounded-2xl border border-dashed border-brand py-3 text-sm font-bold text-brand">
        + Add Hospital
      </button>
    </div>
  )
}
