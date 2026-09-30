import { Card } from '../components/ui'
import { hospitalOf, scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'

export function ReceptionistPage() {
  const { state, session, dispatch } = useMesh()
  if (!session) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const queue = scoped(state.queue, session.hospitalId).filter((q) => q.status !== 'done')
  const patients = scoped(state.patients, session.hospitalId)
  const doctors = state.people.filter((p) => p.hospitalId === session.hospitalId && p.role === 'doctor')

  return (
    <div className="space-y-4 px-5 pt-2">
      <h1 className="text-xl font-extrabold">Front desk</h1>
      <p className="text-xs text-muted">
        {hospital.name} · {hospital.clinicOpen}–{hospital.clinicClose}
      </p>
      <form
        className="space-y-2 rounded-2xl bg-white p-4 card-shadow"
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          const name = String(data.get('name') ?? '').trim()
          if (!name) return
          dispatch({
            type: 'check-in',
            hospitalId: session.hospitalId,
            name,
            age: Number(data.get('age') ?? 40),
            department: String(data.get('dept') ?? 'General'),
            urgent: data.get('urgent') === 'on',
          })
          e.currentTarget.reset()
        }}
      >
        <p className="font-bold">Check in patient</p>
        <input name="name" placeholder="Name" className="w-full rounded-xl bg-canvas px-3 py-2 text-sm" />
        <input name="age" type="number" defaultValue={40} className="w-full rounded-xl bg-canvas px-3 py-2 text-sm" />
        <select name="dept" className="w-full rounded-xl bg-canvas px-3 py-2 text-sm">
          <option>General</option>
          <option>Cardiology</option>
          <option>Paediatrics</option>
          <option>Chest</option>
        </select>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="urgent" /> Urgent
        </label>
        <button type="submit" className="w-full rounded-2xl bg-brand py-2.5 text-sm font-bold text-white">
          Issue token
        </button>
      </form>
      {doctors.map((d) => (
        <Card key={d.id}>
          <p className="font-bold">{d.name}</p>
          <p className="text-xs text-muted">
            {d.room} · {d.available ? 'Available' : 'Busy'} · cleared {d.clearedToday}
          </p>
        </Card>
      ))}
      {queue.map((q) => (
        <Card key={q.id} className="flex justify-between text-sm">
          <span>
            <span className="font-bold">{q.token}</span> {patients.find((p) => p.id === q.patientId)?.name}
          </span>
          <span className="text-muted">{q.status}</span>
        </Card>
      ))}
    </div>
  )
}
