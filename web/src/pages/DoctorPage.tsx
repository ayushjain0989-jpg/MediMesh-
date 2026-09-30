import { Link } from 'react-router-dom'
import { Avatar, Badge, Card, firstName } from '../components/ui'
import { copy } from '../i18n'
import { simulateFlow } from '../lib/hospitalFlow'
import { flowInputs, scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'

export function DoctorPage() {
  const { state, person, session, lang, dispatch, dutyShift } = useMesh()
  if (!person || !session) return null
  const t = copy[lang]
  const queue = scoped(state.queue, session.hospitalId)
  const waiting = queue.filter((q) => q.status === 'waiting')
  const withYou = queue.filter((q) => q.status === 'with-doctor')
  const patients = scoped(state.patients, session.hospitalId)
  const delay = Math.round(simulateFlow(flowInputs(state, session.hospitalId, dutyShift)).predictedMinutes)
  const today = queue.filter((q) => q.status === 'waiting' || q.status === 'with-doctor')

  return (
    <div className="space-y-4 px-5 pt-2">
      <div>
        <p className="text-xl font-extrabold">
          {dutyShift === 'night' ? 'Good evening' : 'Good Morning'}, {firstName(person.name)}
        </p>
        <p className="text-xs text-muted">
          {person.title} · {dutyShift === 'night' ? 'Night — OPD closed' : 'Day OPD'} ·{' '}
          {state.hospitals.find((h) => h.id === session.hospitalId)?.name}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat n={waiting.length} label="Waiting" />
        <Stat n={person.clearedToday ?? 0} label="Completed" />
        <Stat n={delay} label="Est. Delay" unit="min" />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-2xl bg-brand py-2.5 text-sm font-bold text-white"
          onClick={() => dispatch({ type: 'call-next', hospitalId: session.hospitalId, doctorId: person.id })}
        >
          {t.callNext}
        </button>
        <button
          type="button"
          className="rounded-2xl bg-white px-3 text-xs font-semibold card-shadow"
          onClick={() => dispatch({ type: 'toggle-doctor', personId: person.id })}
        >
          {person.available ? 'Pause' : 'Available'}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold">Today’s Patients</h2>
        <Link to="/app/patients" className="text-xs font-semibold text-brand">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {today.map((q) => {
          const p = patients.find((x) => x.id === q.patientId)
          if (!p) return null
          const tone = q.status === 'with-doctor' ? 'green' : q.status === 'waiting' ? 'amber' : 'blue'
          const label =
            q.status === 'with-doctor' ? 'In Consultation' : q.status === 'waiting' ? `Waiting (${q.token})` : 'Scheduled'
          return (
            <Link key={q.id} to={`/app/patients/${p.id}`}>
              <Card className="flex items-center gap-3">
                <Avatar name={p.name} />
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.mrn} · {q.arrivedAt}
                  </p>
                </div>
                <Badge tone={tone}>{label}</Badge>
              </Card>
            </Link>
          )
        })}
      </div>
      {withYou.map((q) => (
        <div key={q.id} className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl bg-brand py-2 text-xs font-bold text-white"
            onClick={() => dispatch({ type: 'send-pharmacy', ticketId: q.id })}
          >
            Send to pharmacy
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-white py-2 text-xs font-bold card-shadow"
            onClick={() => dispatch({ type: 'complete-ticket', ticketId: q.id })}
          >
            Mark cleared
          </button>
        </div>
      ))}
    </div>
  )
}

function Stat({ n, label, unit }: { n: number; label: string; unit?: string }) {
  return (
    <Card className="text-center">
      <p className="text-2xl font-extrabold text-brand">
        {n}
        {unit ? <span className="text-xs text-muted"> {unit}</span> : null}
      </p>
      <p className="text-[11px] text-muted">{label}</p>
    </Card>
  )
}
