import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DualWait, DutyToggle } from '../components/DualWait'
import { Avatar, Card } from '../components/ui'
import { routeCare } from '../lib/careCopilot'
import { clinicIsOpen, nightNurseOf } from '../lib/duty'
import { flowInputs, hospitalOf } from '../lib/selectors'
import { dualWait } from '../lib/wait'
import { useMesh } from '../state/MeshContext'

const CHIPS = ['I feel thirsty and tired', 'Chest feels tight', 'My child has fever', 'Knee pain after a fall']

export function AiPage() {
  const { state, session, lang, dutyShift } = useMesh()
  const [params] = useSearchParams()
  const [text, setText] = useState(params.get('q') ?? 'I feel thirsty and tired')
  const [asked, setAsked] = useState(Boolean(params.get('q')))
  const hospitalId = session?.hospitalId
  const hospital = hospitalId ? hospitalOf(state, hospitalId) : null
  const doctors = useMemo(
    () => state.people.filter((p) => p.hospitalId === hospitalId && p.role === 'doctor'),
    [state.people, hospitalId],
  )
  const nurse = hospitalId ? nightNurseOf(state.people, hospitalId) : undefined
  const open = hospital ? clinicIsOpen(hospital, dutyShift) : false
  const hit = asked && hospital
    ? routeCare(text, {
        shift: dutyShift,
        clinicOpen: open,
        clinicOpenAt: hospital.clinicOpen,
        hospitalName: hospital.name,
        doctors,
        nightNurse: nurse,
      })
    : null
  const doctor = doctors.find((d) => d.id === hit?.doctorId)
  const nursePerson = state.people.find((p) => p.id === hit?.nurseId)
  const patientId = session
    ? state.people.find((p) => p.id === session.personId)?.patientId
    : undefined
  const snap = hospitalId ? dualWait(state, hospitalId, patientId, dutyShift) : null
  const consult = hospitalId ? flowInputs(state, hospitalId, dutyShift) : null
  const matchedRule = asked
    ? state.copilotRules.find((r) => {
        try {
          return new RegExp(r.ifKeywords, 'i').test(text)
        } catch {
          return false
        }
      })
    : undefined
  const patient = state.patients.find((p) => p.id === patientId)
  const rx = state.prescriptions.find((p) => p.patientId === patientId && p.status !== 'dispensed')

  return (
    <div className="space-y-4 px-5 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand">Care Copilot</p>
          <h1 className="text-2xl font-extrabold">What are you feeling?</h1>
        </div>
        <DutyToggle />
      </div>
      <p className="text-sm text-muted">
        Not a diagnosis. We match your words to who is on this shift and show both waits: your turn, and the whole hospital.{' '}
        <Link to="/app/database" className="font-bold text-brand">
          Show AI type & database →
        </Link>
      </p>
      <textarea
        className="h-24 w-full rounded-2xl bg-white p-3 text-sm card-shadow"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold card-shadow"
            onClick={() => {
              setText(c)
              setAsked(true)
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <button type="button" className="w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white" onClick={() => setAsked(true)}>
        Explain where I should go
      </button>
      {hit && (
        <Card className={hit.urgency === 'emergency' ? 'ring-2 ring-rose' : ''}>
          {hit.urgency === 'emergency' && (
            <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose">
              Emergency path — do not book an OPD slot
            </p>
          )}
          {hit.urgency === 'night-hold' && (
            <p className="mb-2 rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white">
              Night duty · OPD doctors are off until {hospital?.clinicOpen}
            </p>
          )}
          <p className="text-sm font-extrabold text-brand">{hit.title[lang]}</p>
          <p className="mt-2 text-sm">{hit.meaning[lang]}</p>
          <p className="mt-2 text-sm font-semibold">{hit.next[lang]}</p>
          {matchedRule && (
            <div className="mt-3 rounded-xl bg-canvas p-3 font-mono text-[11px] leading-relaxed">
              <p className="font-sans text-[10px] font-bold uppercase tracking-wide text-brand">
                Database rule {matchedRule.id} · predefined IF–THEN · not generative
              </p>
              <p className="mt-1">
                IF patient_text MATCHES '{matchedRule.ifKeywords}'
              </p>
              <p>
                THEN specialty = {matchedRule.thenSpecialty}, urgency = {matchedRule.thenUrgency}
              </p>
              <p>ACTION: {matchedRule.thenAction}</p>
              <p>is_diagnosis = {String(matchedRule.isDiagnosis)}</p>
              {patient && (
                <p className="mt-2 font-sans text-[11px] text-muted">
                  Looked up patients: {patient.name} · {patient.condition}
                  {rx ? ` · Rx ${rx.medicine}` : ''}
                  {doctor ? ` · doctor ${doctor.name}` : ''}
                </p>
              )}
            </div>
          )}
          {nursePerson && !open && hit.urgency !== 'routine' && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-canvas p-2">
              <Avatar name={nursePerson.name} hue="#0f766e" />
              <div>
                <p className="font-bold">{nursePerson.name}</p>
                <p className="text-xs text-muted">{nursePerson.title}</p>
              </div>
            </div>
          )}
          {doctor && hit.urgency !== 'emergency' && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-canvas p-2">
              <Avatar name={doctor.name} hue={doctor.hue} />
              <div>
                <p className="font-bold">{doctor.name}</p>
                <p className="text-xs text-muted">
                  {hit.specialty}
                  {open ? ' · on this shift' : ` · clinic ${hospital?.clinicOpen}`}
                </p>
              </div>
            </div>
          )}
          {snap && hit.urgency !== 'emergency' && (
            <div className="mt-3">
              <DualWait snap={snap} night={!open} />
            </div>
          )}
          {consult && (
            <p className="mt-3 font-mono text-[10px] text-muted">
              Consult piece: {consult.waitingCount} × {consult.avgConsultMinutes} ÷ {Math.max(consult.doctorsOnDuty, 1)}
            </p>
          )}
          <p className="mt-3 text-[11px] text-muted">{hit.disclaimer[lang]}</p>
          {hit.urgency === 'emergency' ? (
            <p className="mt-3 rounded-2xl bg-rose py-3 text-center text-sm font-bold text-white">Go to casualty now</p>
          ) : (
            <Link
              to={doctor ? `/app/book?doctor=${doctor.id}` : '/app/book'}
              className="mt-3 block rounded-2xl bg-ink py-3 text-center text-sm font-bold text-white"
            >
              {open ? 'Book this clinic' : 'Hold morning clinic'}
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}
