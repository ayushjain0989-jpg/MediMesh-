import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui'
import { fetchFlow } from '../lib/api'
import { flowInputs, hospitalOf, meshDemand, scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'
import { useEffect, useState } from 'react'
import type { FlowResult } from '../types'

export function AdminPage() {
  const { state, session, dutyShift } = useMesh()
  const hospitalId = session?.hospitalId
  const inputs = useMemo(
    () => (hospitalId ? flowInputs(state, hospitalId, dutyShift) : null),
    [state, hospitalId, dutyShift],
  )
  const [flow, setFlow] = useState<FlowResult | null>(null)
  useEffect(() => {
    if (!inputs) return
    fetchFlow(inputs).then(setFlow)
  }, [JSON.stringify(inputs)])
  if (!session || !inputs) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const queue = scoped(state.queue, session.hospitalId)
  const stock = scoped(state.stock, session.hospitalId)
  const sales = stock.reduce((n, s) => n + s.soldToday * 120, 0)

  return (
    <div className="space-y-4 px-5 pt-2">
      <div>
        <p className="text-xl font-extrabold">Hospital Analytics</p>
        <p className="text-xs text-muted">Today · {hospital.name}</p>
        <Link to="/app/database" className="mt-1 inline-block text-xs font-bold text-brand">
          Show AI type & database →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Total Patients" value={String(queue.length + 48)} delta="+12%" />
        <Metric label="Avg. Waiting Time" value={`${Math.round(flow?.predictedMinutes ?? 28)} min`} delta="+18%" />
        <Metric label="Bed Occupancy" value={`${Math.round(hospital.occupancy * 100)}%`} delta="+5%" />
        <Metric label="Pharmacy Sales" value={`₹${(sales / 100000).toFixed(1)} L`} delta="+8%" />
      </div>
      <Card>
        <p className="text-sm font-extrabold">Departments</p>
        <p className="mt-1 text-xs text-muted">{queue.filter((q) => q.status === 'waiting').length} waiting in OPD right now.</p>
      </Card>
    </div>
  )
}

export function FlowPage() {
  const { state, session, dispatch, dutyShift } = useMesh()
  const hospitalId = session?.hospitalId
  const inputs = useMemo(
    () => (hospitalId ? flowInputs(state, hospitalId, dutyShift) : null),
    [state, hospitalId, dutyShift],
  )
  const [flow, setFlow] = useState<FlowResult | null>(null)
  const [showSim, setShowSim] = useState(false)
  useEffect(() => {
    if (!inputs) return
    fetchFlow(inputs).then(setFlow)
  }, [JSON.stringify(inputs)])
  if (!session || !inputs || !flow) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const demand = meshDemand(state)

  return (
    <div className="space-y-4 px-5 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">HospitalFlow AI</h1>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand">Beta</span>
      </div>
      <Link to="/app/database" className="text-xs font-bold text-brand">
        Show AI type & database →
      </Link>
      <Card>
        <p className="text-sm font-extrabold text-brand">Why is the waiting time increasing?</p>
        <p className="mt-2 text-sm">The waiting time increased because:</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
          <li>{inputs.doctorsOnDuty} doctors on duty vs target load</li>
          <li>Average consultation duration is {inputs.avgConsultMinutes} minutes.</li>
          <li>{inputs.pharmacyQueue} at pharmacy · {inputs.stockouts} stock-outs</li>
          {inputs.nearHandover && <li>Shift handover window is open (×1.12).</li>}
        </ul>
        <p className="mt-3 text-sm font-bold">Recommended actions:</p>
        <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm">
          <li>Add more registration counters.</li>
          <li>Adjust appointment slots.</li>
          <li>Move a pharmacist to the OPD window.</li>
        </ol>
        <p className="mt-3 text-3xl font-extrabold text-brand">{Math.round(flow.predictedMinutes)} min</p>
        <p className="text-xs text-muted">
          Typical {Math.round(flow.p50)} · most patients by {Math.round(flow.p80)} · {flow.source === 'fastapi' ? 'Analytics service' : 'On-device model'}
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white"
          onClick={() => setShowSim((s) => !s)}
        >
          {showSim ? 'Hide Simulation' : 'View Simulation'}
        </button>
      </Card>
      {showSim && (
        <Card>
          <p className="text-xs font-bold text-muted">Visible calculation</p>
          <ul className="mt-2 space-y-2">
            {flow.steps.map((step) => (
              <li key={step.id} className="rounded-xl bg-canvas p-2 text-xs">
                <p className="font-bold">{step.label} · {step.value}{step.unit}</p>
                <p className="text-muted">{step.formula}</p>
                <p className="text-brand">{step.substitution}</p>
              </li>
            ))}
          </ul>
          <label className="mt-3 block text-xs font-semibold">
            Doctors on duty: {hospital.doctorsOnDuty}
            <input
              type="range"
              className="w-full"
              min={0}
              max={8}
              value={hospital.doctorsOnDuty}
              onChange={(e) =>
                dispatch({ type: 'patch-hospital', hospitalId: hospital.id, patch: { doctorsOnDuty: Number(e.target.value) } })
              }
            />
          </label>
        </Card>
      )}
      <Card>
        <p className="text-xs font-bold">Mesh buying power</p>
        {demand.slice(0, 3).map((d) => (
          <p key={d.sku} className="mt-1 flex justify-between text-sm">
            <span>{d.name}</span>
            <span>{d.soldWeek}/wk</span>
          </p>
        ))}
      </Card>
    </div>
  )
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <Card>
      <p className="text-[11px] text-muted">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] font-semibold text-mint">{delta}</p>
    </Card>
  )
}
