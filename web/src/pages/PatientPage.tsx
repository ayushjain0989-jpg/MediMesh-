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
    state.people.find((p) => p.id === upcoming?.doctorId) ??
    state.people.find((p) => p.id === snap.ticket?.doctorId)

  return (
    <div className="space-y-6 px-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{dutyShift === 'night' ? 'Good evening,' : 'Good Morning,'}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{firstName(person.name)}</h1>
          <p className="mt-1 text-sm text-muted">
            {hospital.name} · {patient?.mrn ?? person.loginId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DutyToggle />
          <span className="relative">
            <Avatar name={person.name} hue="#1db8a6" size={48} />
            <IconBell className="absolute -right-1 -top-1 h-4 w-4 text-brand" />
          </span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-7">
          <Card>
            <p className="text-sm font-extrabold">Care Copilot</p>
            <p className="mt-1 text-xs text-muted">Keyword + shift rules. Not a diagnosis. Not ChatGPT.</p>
            <div className="mt-3">
              <SearchBox value={q} onChange={setQ} placeholder="Tell MediMesh how you feel…" />
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white sm:w-auto sm:px-8"
              onClick={() => navigate(`/app/ai${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)}
            >
              Ask Care Copilot
            </button>
          </Card>

          <div>
            <p className="mb-2 text-sm font-extrabold">Health Overview</p>
            <div className="grid grid-cols-3 gap-3">
              <Mini k="Heart Rate" v={patient?.hr ?? '—'} u="bpm" />
              <Mini k="Blood Pressure" v={patient?.bp ?? '—'} u="mmHg" />
              <Mini k="Oxygen" v={patient?.oxygen ? String(patient.oxygen) : '98'} u="%" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Quick to="/app/book" color="bg-sky-50" label="Find Doctor" />
            <Quick to="/app/ai" color="bg-violet-50" label="Symptoms" />
            <Quick to="/app/rx" color="bg-amber-50" label="Medicines" />
            <Quick to="/app/health" color="bg-emerald-50" label="Lab Tests" />
          </div>
        </section>

        <aside className="space-y-4 lg:col-span-5">
          {upcoming && waitDoctor && (
            <div className="rounded-3xl bg-ink p-5 text-white">
              <p className="text-[11px] text-white/70">Your next appointment</p>
              <p className="mt-1 text-4xl font-extrabold">{upcoming.time.split(' ')[0]}</p>
              <p className="text-sm text-white/80">
                {upcoming.dateLabel} · {waitDoctor.name} · {waitDoctor.title}
              </p>
              {upcoming.token ? (
                <p className="mt-3 text-sm font-bold text-brand">Live token {upcoming.token}</p>
              ) : (
                <p className="mt-3 text-xs text-white/70">
                  {open ? 'Confirm the slot to mint a live OPD token.' : 'OPD closed — token issues when clinic opens.'}
                </p>
              )}
            </div>
          )}

          <DualWait snap={snap} night={!open} />

          <Card>
            <p className="text-xs font-semibold text-muted">
              {waitDoctor?.name ?? 'Your doctor'} ·{' '}
              {open ? (waitDoctor?.available ? 'seeing patients now' : 'with someone') : 'off this shift'}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              Your turn is people ahead × consult minutes ÷ doctors on this shift. Hospital-wide adds pharmacy, stock-outs,
              handover and crowd.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Mini({ k, v, u }: { k: string; v: string; u: string }) {
  return (
    <Card className="text-center">
      <p className="text-[10px] text-muted">{k}</p>
      <p className="text-lg font-extrabold">{v}</p>
      <p className="text-[10px] text-muted">{u}</p>
    </Card>
  )
}

function Quick({ to, color, label }: { to: string; color: string; label: string }) {
  return (
    <Link to={to} className={`rounded-2xl ${color} px-3 py-4 text-center card-shadow`}>
      <span className="block text-sm font-bold leading-tight">{label}</span>
    </Link>
  )
}
