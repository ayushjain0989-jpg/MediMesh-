import { Card } from '../components/ui'
import { scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'

export function HealthPage() {
  const { state, person, session } = useMesh()
  if (!session || !person) return null
  const patientId = person.role === 'patient' ? person.patientId : scoped(state.patients, session.hospitalId)[0]?.id
  const patient = state.patients.find((p) => p.id === patientId)
  const items = state.timeline.filter((t) => t.patientId === patientId)
  const hr = Number(patient?.hr ?? 74)

  return (
    <div className="space-y-4 px-5 pt-2">
      <h1 className="text-2xl font-extrabold">Report</h1>
      <div className="rounded-3xl bg-sky-100 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-muted">Heart Rate</p>
            <p className="text-4xl font-extrabold">
              {hr} <span className="text-base font-semibold text-muted">bpm</span>
            </p>
          </div>
          <Spark hr={hr} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-rose-100 p-4">
          <p className="text-xs font-semibold text-muted">Blood Group</p>
          <p className="mt-2 text-3xl font-extrabold">{patient?.bloodGroup ?? '—'}</p>
        </div>
        <div className="rounded-3xl bg-emerald-100 p-4">
          <p className="text-xs font-semibold text-muted">Weight</p>
          <p className="mt-2 text-3xl font-extrabold">
            {patient?.weightKg ?? '—'} <span className="text-base">kg</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[11px] text-muted">Blood pressure</p>
          <p className="text-xl font-extrabold">{patient?.bp ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-[11px] text-muted">Oxygen</p>
          <p className="text-xl font-extrabold">{patient?.oxygen ?? 98}%</p>
        </Card>
      </div>
      <h2 className="font-extrabold">Latest Report</h2>
      <Card className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky">📄</span>
        <div className="flex-1">
          <p className="font-bold">General Health</p>
          <p className="text-xs text-muted">{patient?.condition} · {items.length} notes</p>
        </div>
      </Card>
      {patient?.condition.toLowerCase().includes('diabetes') && (
        <Card className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-600">📄</span>
          <div className="flex-1">
            <p className="font-bold">Diabetes</p>
            <p className="text-xs text-muted">Fasting sugar due this week · 1 file</p>
          </div>
        </Card>
      )}
      {items.map((item) => (
        <Card key={item.id}>
          <p className="font-bold">{item.title}</p>
          <p className="text-xs text-muted">{item.detail}</p>
          <p className="mt-1 text-[11px] font-semibold text-brand">{item.when}</p>
        </Card>
      ))}
    </div>
  )
}

function Spark({ hr }: { hr: number }) {
  const h = Math.min(40, Math.max(12, (hr - 50) * 0.6))
  return (
    <svg viewBox="0 0 120 48" className="h-12 w-28 text-sky" fill="none" stroke="currentColor" strokeWidth="3">
      <path d={`M2 28h18l8-${h * 0.4} 10 ${h * 0.2} 8-${h} 12 ${h * 1.1} 10-8 14 4 20 0`} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
