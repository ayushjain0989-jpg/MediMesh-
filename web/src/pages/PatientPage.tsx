import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DualWait, DutyToggle } from '../components/DualWait'
import { Avatar, Card, IconBell, SearchBox, firstName } from '../components/ui'
import { clinicIsOpen } from '../lib/duty'
import { hospitalOf } from '../lib/selectors'
import { dualWait } from '../lib/wait'
import { useMesh } from '../state/MeshContext'

export function PatientPage() {
  const { state, person, session, dutyShift } = useMesh()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const hospitalId = session?.hospitalId
  const patientId = person?.patientId
  const snap = useMemo(
    () => (hospitalId ? dualWait(state, hospitalId, patientId, dutyShift) : null),
    [state, hospitalId, patientId, dutyShift],
  )
  if (!person || !session || !hospitalId || !snap) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const open = clinicIsOpen(hospital, dutyShift)
  const patient = state.patients.find((p) => p.id === person.patientId)
  const upcoming = state.appointments.find((a) => a.patientId === patientId && a.status === 'upcoming')
  const waitDoctor =
    state.people.find((p) => p.id === snap.ticket?.doctorId) ??
    state.people.find((p) => p.id === upcoming?.doctorId) ??
    state.people.find((p) => p.hospitalId === session.hospitalId && p.role === 'doctor' && p.specialty === 'General Physician')

  return (
    <div className="space-y-4 px-5 pt-2">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted">{dutyShift === 'night' ? 'Good evening,' : 'Good Morning,'}</p>
          <p className="text-xl font-extrabold">{firstName(person.name)}</p>
        </div>
        <span className="relative">
          <Avatar name={person.name} hue="#1db8a6" size={40} />
          <IconBell className="absolute -right-1 -top-1 h-4 w-4 text-brand" />
        </span>
      </header>

      <DutyToggle />

      <SearchBox value={q} onChange={setQ} placeholder="Tell MediMesh how you feel…" />
      <button
        type="button"
        className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white"
        onClick={() => navigate(`/app/ai${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)}
      >
        Ask Care Copilot
      </button>

      {upcoming && waitDoctor && (
        <div className="rounded-3xl bg-ink p-4 text-white">
          <p className="text-[11px] text-white/70">Your next appointment</p>
          <p className="mt-1 text-3xl font-extrabold">{upcoming.time.split(' ')[0]}</p>
          <p className="text-xs text-white/80">
            {upcoming.dateLabel} · {waitDoctor.name} · {waitDoctor.title}
          </p>
          {upcoming.token ? (
            <p className="mt-2 text-sm font-bold text-brand">Live token {upcoming.token}</p>
          ) : (
            <p className="mt-2 text-xs text-white/70">
              {open ? 'Confirm the slot to mint a live OPD token.' : 'OPD closed — token issues when clinic opens.'}
            </p>
          )}
        </div>
      )}

      <DualWait snap={snap} night={!open} />

      <Card>
        <p className="text-xs font-semibold text-muted">
          {waitDoctor?.name ?? 'Your doctor'} · {open ? (waitDoctor?.available ? 'seeing patients now' : 'with someone') : 'off this shift'}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Your turn is people ahead × consult minutes ÷ doctors on this shift. Hospital-wide adds pharmacy, stock-outs, handover and crowd.
        </p>
      </Card>

      <div>
        <p className="mb-2 text-sm font-extrabold">Health Overview</p>
        <div className="grid grid-cols-3 gap-2">
          <Mini k="Heart Rate" v={patient?.hr ?? '—'} u="bpm" />
          <Mini k="Blood Pressure" v={patient?.bp ?? '—'} u="mmHg" />
          <Mini k="Oxygen" v={patient?.oxygen ? String(patient.oxygen) : '98'} u="%" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Quick to="/app/book" color="bg-sky-50" label="Find Doctor" />
        <Quick to="/app/ai" color="bg-violet-50" label="Symptoms" />
        <Quick to="/app/rx" color="bg-amber-50" label="Medicines" />
        <Quick to="/app/health" color="bg-emerald-50" label="Lab Tests" />
      </div>
    </div>
  )
}

function Mini({ k, v, u }: { k: string; v: string; u: string }) {
  return (
    <Card className="text-center">
      <p className="text-[10px] text-muted">{k}</p>
      <p className="text-sm font-extrabold">{v}</p>
      <p className="text-[10px] text-muted">{u}</p>
    </Card>
  )
}

function Quick({ to, color, label }: { to: string; color: string; label: string }) {
  return (
    <Link to={to} className={`rounded-2xl ${color} p-2 text-center`}>
      <span className="block text-[10px] font-bold leading-tight">{label}</span>
    </Link>
  )
}
