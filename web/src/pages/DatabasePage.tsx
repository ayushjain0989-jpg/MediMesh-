import { Link } from 'react-router-dom'
import { Card } from '../components/ui'
import { decodeJwt } from '../lib/api'
import { hospitalOf, scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'

export function DatabasePage() {
  const { state, session } = useMesh()
  if (!session) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const patients = scoped(state.patients, session.hospitalId)
  const rx = scoped(state.prescriptions, session.hospitalId)
  const queue = scoped(state.queue, session.hospitalId).filter((q) => q.status !== 'done')
  const stock = scoped(state.stock, session.hospitalId).slice(0, 6)
  const people = scoped(state.people, session.hospitalId)
  const jwt = session.accessToken ? decodeJwt(session.accessToken) : null

  return (
    <div className="space-y-4 px-5 pb-4 pt-2">
      <h1 className="text-2xl font-extrabold">What AI is this?</h1>
      {jwt && (
        <Card>
          <p className="text-sm font-extrabold text-brand">JWT session</p>
          <p className="mt-1 text-xs text-muted">Issued by FastAPI · algorithm HS256 · not a ChatGPT token</p>
          <p className="mt-2 break-all font-mono text-[10px] text-muted">
            {session.accessToken?.slice(0, 36)}…
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>
              <b>login_id</b> {String(jwt.payload.login_id ?? '—')}
            </li>
            <li>
              <b>role</b> {String(jwt.payload.role ?? session.role)}
            </li>
            <li>
              <b>hospital_id</b> {String(jwt.payload.hospital_id ?? session.hospitalId)}
            </li>
            <li>
              <b>exp</b>{' '}
              {typeof jwt.payload.exp === 'number' ? new Date(jwt.payload.exp * 1000).toLocaleString() : '—'}
            </li>
          </ul>
        </Card>
      )}
      <Card>
        <p className="text-lg font-extrabold text-brand">Predefined · rule-based · explainable</p>
        <p className="mt-2 text-sm">
          Not generative AI (not ChatGPT). Care Copilot uses IF–THEN rows in <span className="font-mono">copilot_rules</span>.
          HospitalFlow is a named formula computed from queue + staff — it is not stored as a prediction table.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            <b>Care Copilot</b> — IF keywords THEN specialty (is_diagnosis = false)
          </li>
          <li>
            <b>HospitalFlow</b> — waiting × consult ÷ doctors, then pharmacy, stock, handover, crowd
          </li>
          <li>
            <b>Explainer</b> — doctor-approved text in EN/HI/TE + read-aloud
          </li>
        </ul>
      </Card>

      <h2 className="font-extrabold">Table: copilot_rules</h2>
      <div className="overflow-x-auto rounded-2xl bg-white card-shadow">
        <table className="w-full min-w-[520px] text-left text-[11px]">
          <thead className="bg-canvas text-muted">
            <tr>
              <th className="px-3 py-2">id</th>
              <th className="px-3 py-2">IF keywords</th>
              <th className="px-3 py-2">THEN specialty</th>
              <th className="px-3 py-2">urgency</th>
              <th className="px-3 py-2">diagnosis?</th>
            </tr>
          </thead>
          <tbody>
            {state.copilotRules.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-3 py-2 font-bold text-brand">{r.id}</td>
                <td className="px-3 py-2 font-mono">{r.ifKeywords}</td>
                <td className="px-3 py-2">{r.thenSpecialty}</td>
                <td className="px-3 py-2">{r.thenUrgency}</td>
                <td className="px-3 py-2">{r.isDiagnosis ? 'true' : 'false'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Example: “I feel thirsty and tired” matches R1 (tired) → General Physician → look up this hospital’s GP and the patient’s Metformin row.
      </p>

      <h2 className="font-extrabold">This hospital: {hospital.name}</h2>
      <p className="text-xs text-muted">PostgreSQL/Supabase by design. Demo seed below. Isolated by hospital_id = {hospital.id}</p>

      <Table title="patients" headers={['id', 'name', 'condition', 'lang']} rows={patients.map((p) => [p.id, p.name, p.condition, p.language])} />
      <Table
        title="prescriptions"
        headers={['id', 'patient', 'medicine', 'status']}
        rows={rx.map((p) => [p.id, p.patientId, p.medicine, p.status])}
      />
      <Table
        title="profiles (staff)"
        headers={['login_id', 'role', 'name', 'shift']}
        rows={people.map((p) => [p.loginId, p.role, p.name, p.shift ?? '—'])}
      />
      <Table
        title="queue_tickets"
        headers={['token', 'patient', 'status', 'dept']}
        rows={queue.map((q) => [q.token, q.patientId, q.status, q.department])}
      />
      <Table
        title="pharmacy_stock"
        headers={['sku', 'name', 'qty', 'flag']}
        rows={stock.map((s) => [
          s.sku,
          s.name,
          String(s.quantity),
          s.quantity <= 0 ? 'OUT' : s.quantity <= s.reorderAt ? 'LOW' : 'IN',
        ])}
      />

      <Link to="/app/ai?q=I%20feel%20thirsty%20and%20tired" className="block rounded-2xl bg-brand py-3 text-center text-sm font-bold text-white">
        Try rule R1 on Care Copilot
      </Link>
    </div>
  )
}

function Table({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold text-muted">Table: {title}</p>
      <div className="overflow-x-auto rounded-2xl bg-white card-shadow">
        <table className="w-full min-w-[420px] text-left text-[11px]">
          <thead className="bg-canvas text-muted">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-line">
                {row.map((cell, j) => (
                  <td key={j} className="max-w-[140px] truncate px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
