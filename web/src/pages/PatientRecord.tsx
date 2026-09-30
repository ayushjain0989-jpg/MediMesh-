import { Link, useParams } from 'react-router-dom'
import { Avatar, Card, IconBack } from '../components/ui'
import { downloadMedicalReportPdf } from '../lib/reportPdf'
import { hospitalOf, scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'

export function PatientsListPage() {
  const { state, session } = useMesh()
  if (!session) return null
  const patients = scoped(state.patients, session.hospitalId)
  const queue = scoped(state.queue, session.hospitalId)
  return (
    <div className="space-y-3 px-5 pt-2">
      <h1 className="text-xl font-extrabold">{session.role === 'receptionist' ? 'Live queue' : 'Patients'}</h1>
      {patients.map((p) => {
        const ticket = queue.find((q) => q.patientId === p.id && q.status !== 'done')
        return (
          <Link key={p.id} to={`/app/patients/${p.id}`}>
            <Card className="flex items-center gap-3">
              <Avatar name={p.name} />
              <div className="flex-1">
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-muted">
                  {p.age} · {p.sex} · {p.mrn} · {p.condition}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-brand">{ticket?.token ?? p.bed ?? 'OPD'}</span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export function PatientRecord() {
  const { id } = useParams()
  const { state, session, dispatch, person } = useMesh()
  if (!session) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const p = state.patients.find((x) => x.id === id)
  if (!p) return <p className="p-5">Patient not found.</p>
  const ticket = state.queue.find((q) => q.patientId === p.id && q.status === 'with-doctor')
  const notes = state.timeline.filter((t) => t.patientId === p.id)
  const rx = state.prescriptions.filter((r) => r.patientId === p.id)
  return (
    <div className="space-y-4 px-5 pt-2">
      <Link to="/app/patients" className="flex items-center gap-1 text-sm font-semibold text-brand">
        <IconBack className="h-4 w-4" /> Patient Record
      </Link>
      <Card className="flex gap-3">
        <Avatar name={p.name} size={52} />
        <div>
          <p className="text-lg font-extrabold">{p.name}</p>
          <p className="text-xs text-muted">
            Age {p.age} · {p.sex === 'M' ? 'Male' : 'Female'} · {p.mrn}
          </p>
        </div>
      </Card>
      <div className="flex gap-2 text-xs font-semibold">
        <span className="rounded-full bg-brand px-3 py-1 text-white">Overview</span>
        <span className="rounded-full bg-white px-3 py-1 text-muted">History</span>
        <span className="rounded-full bg-white px-3 py-1 text-muted">Reports</span>
        <span className="rounded-full bg-white px-3 py-1 text-muted">Prescriptions</span>
      </div>
      <Card>
        <p className="text-xs font-bold text-muted">Medical History</p>
        <p className="mt-2 text-sm">• {p.condition}</p>
        <p className="text-sm">• Allergy: {p.allergies}</p>
        <p className="text-sm">• Previous surgeries: {p.surgeries}</p>
      </Card>
      <button
        type="button"
        className="w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white"
        onClick={() => downloadMedicalReportPdf({ hospital, patient: p, notes, prescriptions: rx })}
      >
        Download medical report PDF
      </button>
      <div>
        <p className="mb-2 text-xs font-bold text-muted">Recent Vitals</p>
        <div className="grid grid-cols-3 gap-2">
          <Vital k="BP" v={p.bp ?? '—'} u="mmHg" />
          <Vital k="Heart Rate" v={p.hr ?? '—'} u="bpm" />
          <Vital k="Temperature" v={p.temp ?? '—'} />
        </div>
      </div>
      {person?.role === 'doctor' && ticket && (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-2xl bg-white py-3 text-sm font-bold card-shadow"
            onClick={() => dispatch({ type: 'complete-ticket', ticketId: ticket.id })}
          >
            Add Notes
          </button>
          <Link to="/app/reports" className="flex-1 rounded-2xl bg-brand py-3 text-center text-sm font-bold text-white">
            Create Prescription
          </Link>
        </div>
      )}
    </div>
  )
}

function Vital({ k, v, u }: { k: string; v: string; u?: string }) {
  return (
    <Card className="text-center">
      <p className="text-[10px] text-muted">{k}</p>
      <p className="text-lg font-extrabold">{v}</p>
      {u && <p className="text-[10px] text-muted">{u}</p>}
    </Card>
  )
}
