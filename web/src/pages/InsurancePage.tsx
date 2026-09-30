import { useMemo, useState } from 'react'
import { Card } from '../components/ui'
import { checkOffer } from '../lib/coverCheck'
import { downloadApplyPdf } from '../lib/coverPdf'
import { hospitalOf, scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'
import type { CoverOffer } from '../types'

export function InsurancePage() {
  const { state, session, person, dispatch } = useMesh()
  const [picked, setPicked] = useState<string | null>(null)
  const [nominee, setNominee] = useState('')
  const [relation, setRelation] = useState('Spouse')
  if (!session || !person) return null

  const hospital = hospitalOf(state, session.hospitalId)
  const patientId = person.role === 'patient' ? person.patientId : scoped(state.patients, session.hospitalId)[0]?.id
  const patient = state.patients.find((p) => p.id === patientId)
  const offers = state.coverOffers.filter((o) => o.hospitalId === session.hospitalId)
  const policies = state.policies.filter((p) => p.patientId === patientId)
  const apps = state.coverApps.filter((a) => a.patientId === patientId)
  const hospitalApps = state.coverApps.filter((a) => a.hospitalId === session.hospitalId)
  const cashless = state.claims.find((c) => c.patientId === patientId)
  const staff = person.role === 'administrator' || person.role === 'receptionist' || person.role === 'doctor'
  const offer = offers.find((o) => o.id === picked) ?? null
  const check = useMemo(
    () => (offer && patient ? checkOffer(offer, patient, policies) : null),
    [offer, patient, policies],
  )

  if (!patient) {
    return (
      <div className="space-y-4 px-5">
        <h1 className="text-2xl font-extrabold">Cover desk</h1>
        <Card>
          <p className="text-sm">No patient on this login.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand">Apply · offered at this hospital</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Cover desk</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          This hospital <b>offers</b> a plan at the desk. You <b>apply</b>, name a nominee, and staff can issue it. Cashless
          is for today’s visit here — not a billed claim form and not a diagnosis.
        </p>
      </div>

      {policies.length > 0 && (
        <section className="grid gap-3 md:grid-cols-2">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <p className="text-xs font-bold text-muted">Already issued</p>
              <p className="text-lg font-extrabold">{policy.planName}</p>
              <p className="text-sm">{policy.provider}</p>
              <p className="mt-1 font-mono text-xs">{policy.policyNumber}</p>
              <p className="mt-2 text-xs text-muted">
                Valid {policy.validFrom} → {policy.validTill} · cashless at {hospital.name}
              </p>
            </Card>
          ))}
        </section>
      )}

      {policies.length > 0 && (
        <Card>
          <p className="font-extrabold">Today’s visit</p>
          <p className="mt-1 text-sm text-muted">
            {cashless?.visitLabel ?? 'OPD at this hospital'} · {cashless?.doctorName ?? 'Duty doctor'}
          </p>
          <p className="mt-2 text-xs text-muted">
            Status: {cashless?.status === 'pre-auth' ? 'cashless requested' : cashless?.status ?? 'not asked yet'}
          </p>
          {cashless?.checkNote && <p className="mt-1 text-xs">{cashless.checkNote}</p>}
          {cashless?.status !== 'pre-auth' && cashless?.status !== 'approved' && (
            <button
              type="button"
              className="mt-3 rounded-2xl bg-ink px-5 py-2.5 text-sm font-bold text-white"
              onClick={() => dispatch({ type: 'request-cashless', patientId: patient.id })}
            >
              Ask cashless for this visit
            </button>
          )}
        </Card>
      )}

      <div>
        <h2 className="text-xl font-extrabold">Offers at {hospital.name}</h2>
        <p className="text-sm text-muted">Choose a plan to apply. Premium is only how TPA prices the year — the product is the offer.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {offers.map((row) => (
          <OfferCard key={row.id} offer={row} active={picked === row.id} onPick={() => setPicked(row.id)} />
        ))}
      </div>

      {offer && check && (
        <Card>
          <p className="text-sm font-extrabold">Apply for {offer.planName}</p>
          <p className="mt-1 text-xs text-muted">{offer.promise}</p>
          <ul className="mt-3 space-y-1 text-xs">
            {check.hits.map((h) => (
              <li key={h.id}>
                <b className={h.ok ? 'text-brand' : 'text-rose'}>{h.id}</b> · {h.text}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm font-semibold">{check.note}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Nominee
              <input
                value={nominee}
                onChange={(e) => setNominee(e.target.value)}
                placeholder="Name on the apply"
                className="mt-1 w-full rounded-2xl border border-line bg-canvas px-3 py-2 text-sm font-medium outline-none focus:border-brand"
              />
            </label>
            <label className="text-sm font-bold">
              Relation
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-line bg-canvas px-3 py-2 text-sm font-medium outline-none focus:border-brand"
              >
                {['Spouse', 'Parent', 'Child', 'Self', 'Sibling'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">
            Condition copied from EHR for waiting-period rule only: <b>{patient.condition}</b>. We do not invent ICD codes.
          </p>
          <button
            type="button"
            disabled={!check.ok || !nominee.trim()}
            className="mt-4 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            onClick={() => {
              dispatch({
                type: 'apply-cover',
                hospitalId: session.hospitalId,
                patientId: patient.id,
                offerId: offer.id,
                nominee: nominee.trim(),
                relation,
              })
              setNominee('')
            }}
          >
            Submit application
          </button>
        </Card>
      )}

      {apps.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold">Your applications</h2>
          {apps.map((app) => {
            const row = state.coverOffers.find((o) => o.id === app.offerId)
            if (!row) return null
            return (
              <Card key={app.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-extrabold">{row.planName}</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {row.provider} · nominee {app.nominee} ({app.relation}) · {app.appliedAt}
                </p>
                <p className="mt-1 text-xs">{app.note}</p>
                <button
                  type="button"
                  className="mt-3 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-brand card-shadow"
                  onClick={() => downloadApplyPdf({ hospital, patient, offer: row, application: app })}
                >
                  Download application PDF
                </button>
              </Card>
            )
          })}
        </section>
      )}

      {staff && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold">Desk queue</h2>
          {hospitalApps.length === 0 && <p className="text-sm text-muted">No applications at this hospital yet.</p>}
          {hospitalApps.map((app) => {
            const row = state.coverOffers.find((o) => o.id === app.offerId)
            const who = state.patients.find((p) => p.id === app.patientId)
            if (!row || !who) return null
            return (
              <Card key={app.id}>
                <p className="font-extrabold">
                  {who.name} · {row.planName}
                </p>
                <p className="text-xs text-muted">
                  {app.status} · {app.nominee} · {app.appliedAt}
                </p>
                {app.status === 'applied' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-2xl bg-brand px-4 py-2 text-sm font-bold text-white"
                      onClick={() =>
                        dispatch({
                          type: 'decide-cover',
                          applicationId: app.id,
                          status: 'issued',
                          note: `Issued at ${hospital.name}. Cashless starts after waiting days. Not a diagnosis.`,
                        })
                      }
                    >
                      Issue this offer
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-rose card-shadow"
                      onClick={() =>
                        dispatch({
                          type: 'decide-cover',
                          applicationId: app.id,
                          status: 'declined',
                          note: 'Desk declined — pick another offer.',
                        })
                      }
                    >
                      Decline
                    </button>
                  </div>
                )}
              </Card>
            )
          })}
        </section>
      )}
    </div>
  )
}

function OfferCard({
  offer,
  active,
  onPick,
}: {
  offer: CoverOffer
  active: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`rounded-2xl bg-white p-4 text-left card-shadow ${active ? 'ring-2 ring-brand' : ''}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{offer.kind === 'top-up' ? 'Top-up' : 'Fresh apply'}</p>
      <p className="mt-1 font-extrabold">{offer.planName}</p>
      <p className="text-sm">{offer.provider}</p>
      <p className="mt-2 text-xs text-muted">{offer.promise}</p>
      <p className="mt-3 text-[11px] font-semibold text-brand">{offer.cashless ? 'Cashless at this hospital' : 'Reimbursement'}</p>
    </button>
  )
}
