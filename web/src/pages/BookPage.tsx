import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DualWait } from '../components/DualWait'
import { Avatar, Card, IconBack } from '../components/ui'
import { DEMO_MONTH_LABEL, DEMO_TODAY, clinicIsOpen, specialtyQueue } from '../lib/duty'
import { hospitalOf } from '../lib/selectors'
import { dualWait } from '../lib/wait'
import { useMesh } from '../state/MeshContext'

const TIMES = ['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '06:00 PM']
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function BookPage() {
  const { state, session, person, dispatch, dutyShift } = useMesh()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [day, setDay] = useState(DEMO_TODAY)
  const [time, setTime] = useState('10:30 AM')
  const [picked, setPicked] = useState<string | null>(params.get('doctor'))
  const [cat, setCat] = useState('All')
  const [done, setDone] = useState(false)
  const hospitalId = session?.hospitalId
  const doctors = useMemo(() => {
    if (!hospitalId) return []
    return state.people.filter((p) => {
      if (p.hospitalId !== hospitalId || p.role !== 'doctor') return false
      if (cat !== 'All' && p.specialty !== cat) return false
      return true
    })
  }, [state.people, hospitalId, cat])

  if (!session || !person) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const open = clinicIsOpen(hospital, dutyShift)
  const patient = state.patients.find((p) => p.id === person.patientId) ?? state.patients.find((p) => p.hospitalId === session.hospitalId)
  const defaultId =
    params.get('doctor') ??
    (patient?.condition.includes('diabetes')
      ? doctors.find((d) => d.specialty === 'General Physician')?.id
      : doctors[0]?.id)
  const selected = doctors.find((d) => d.id === (picked ?? defaultId)) ?? doctors[0]
  const patientId = person.patientId ?? patient?.id
  const isToday = day === DEMO_TODAY
  const dateLabel = isToday ? `Today, ${day} ${DEMO_MONTH_LABEL}` : `${day} ${DEMO_MONTH_LABEL}`
  const issueToken = Boolean(isToday && open)
  const first = new Date(2026, 8, 1).getDay()
  const startPad = (first + 6) % 7
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const snap = dualWait(state, session.hospitalId, patientId, dutyShift)
  const confirmed = state.appointments.find((a) => a.patientId === patientId && a.status === 'upcoming')

  if (done && selected) {
    return (
      <div className="space-y-4 px-5 pt-6">
        <p className="text-center text-5xl">✓</p>
        <h1 className="text-center text-2xl font-extrabold">
          {issueToken || confirmed?.token ? 'Token issued' : 'Appointment held'}
        </h1>
        {confirmed?.token ? (
          <p className="text-center font-mono text-4xl font-extrabold text-brand">{confirmed.token}</p>
        ) : null}
        <p className="text-center text-sm text-muted">
          {selected.name} · {dateLabel} · {time}
          <br />
          {hospital.name}
        </p>
        <DualWait snap={snap} night={!open} />
        <p className="text-center text-xs text-muted">
          {issueToken || confirmed?.token
            ? 'This token is in the live OPD queue. Home and the doctor list update when someone is called next.'
            : open
              ? 'Future slot — the token is minted on that morning, not today.'
              : `OPD closed until ${hospital.clinicOpen}. Night duty can see you now; this slot is held for morning clinic.`}
        </p>
        <Link to="/app" className="block rounded-2xl bg-brand py-3 text-center text-sm font-bold text-white">
          Track wait on Home
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-5 pb-4 pt-2">
      <button type="button" className="flex items-center gap-1 text-sm font-bold" onClick={() => navigate(-1)}>
        <IconBack className="h-5 w-5" /> Book Appointment
      </button>

      {!open && (
        <Card className="border border-ink/10 bg-ink text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/60">Night duty</p>
          <p className="mt-1 text-sm">
            Clinic is closed until {hospital.clinicOpen}. You can still hold a morning slot — a live token is issued when OPD opens.
          </p>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button type="button" className="text-muted">
            ‹
          </button>
          <p className="font-extrabold">September 2026</p>
          <button type="button" className="text-muted">
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted">
          {WEEK.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({ length: startPad }).map((_, i) => (
            <span key={`p${i}`} />
          ))}
          {days.map((d) => {
            const past = d < DEMO_TODAY
            const selectedDay = d === day
            return (
              <button
                key={d}
                type="button"
                disabled={past}
                onClick={() => setDay(d)}
                className={`h-8 rounded-full text-[13px] font-semibold ${
                  selectedDay ? 'bg-brand text-white' : past ? 'text-slate-300' : 'text-ink'
                }`}
              >
                {d}
              </button>
            )
          })}
        </div>
      </Card>

      <div>
        <p className="mb-2 font-extrabold">Available Time</p>
        <div className="grid grid-cols-3 gap-2">
          {TIMES.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setTime(slot)}
              className={`rounded-xl py-2.5 text-xs font-bold ${
                time === slot ? 'bg-brand text-white' : 'bg-white text-ink card-shadow'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {['All', 'General Physician', 'Cardiology', 'Dermatology', 'Orthopedics'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCat(c)
              setPicked(null)
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              cat === c ? 'bg-ink text-white' : 'bg-white text-muted'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="font-extrabold">Doctor</p>
      <div className="space-y-2">
        {doctors.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setPicked(d.id)}
            className={`flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left card-shadow ${
              selected?.id === d.id ? 'ring-2 ring-brand' : ''
            }`}
          >
            <Avatar name={d.name} hue={d.hue} />
            <div className="flex-1">
              <p className="font-bold">{d.name}</p>
              <p className="text-xs text-muted">{d.title}</p>
              <p className="text-xs text-amber">
                ★ {d.rating} ({d.reviews} reviews)
              </p>
              <p className="text-[11px] text-muted">
                {open ? (d.available ? 'On this shift' : 'Busy / paused') : `Opens ${hospital.clinicOpen}`}
              </p>
            </div>
            <span className="text-muted">›</span>
          </button>
        ))}
      </div>

      {person.role === 'patient' && selected && patientId && (
        <button
          type="button"
          className="w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-white"
          onClick={() => {
            dispatch({
              type: 'book-slot',
              hospitalId: session.hospitalId,
              patientId,
              doctorId: selected.id,
              time,
              dateLabel,
              issueToken,
              department: specialtyQueue(selected.specialty),
            })
            setDone(true)
          }}
        >
          {issueToken ? 'Confirm & get token' : 'Hold morning slot'}
        </button>
      )}
    </div>
  )
}
