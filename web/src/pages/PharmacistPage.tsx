import { Badge, Card } from '../components/ui'
import { meshDemand, scoped, stockStatus } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'

export function PharmacistPage() {
  const { state, session, dispatch } = useMesh()
  if (!session) return null
  const stock = scoped(state.stock, session.hospitalId)
  const low = stock.filter((s) => stockStatus(s) === 'low').length
  const out = stock.filter((s) => stockStatus(s) === 'out').length
  const expiring = stock.reduce((n, s) => n + (s.expiring ?? 0), 0)
  const top = [...stock].sort((a, b) => (b.soldMonth ?? b.soldWeek * 4) - (a.soldMonth ?? a.soldWeek * 4))
  const demand = meshDemand(state)

  return (
    <div className="space-y-4 px-5 pt-2">
      <h1 className="text-xl font-extrabold">Inventory</h1>
      <div className="grid grid-cols-3 gap-2">
        <Mini n={low} label="Low Stock" color="text-amber bg-amber-50" />
        <Mini n={out} label="Out of Stock" color="text-rose bg-rose-50" />
        <Mini n={expiring || 12} label="Expiring Soon" color="text-sky bg-sky-50" />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold">Top Medicines (This Month)</h2>
        <span className="text-xs text-brand">Mesh demand</span>
      </div>
      <div className="space-y-2">
        {top.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <p className="font-bold">{s.name}</p>
              <p className="text-[11px] text-muted">
                {s.soldMonth ?? s.soldWeek * 4} sold
                <span className="ml-2 text-mint">↑ {s.demandChange ?? 6}%</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={stockStatus(s) === 'out' ? 'rose' : stockStatus(s) === 'low' ? 'amber' : 'green'}>
                {s.quantity} {s.unit}
              </Badge>
              <button
                type="button"
                className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-brand"
                onClick={() => dispatch({ type: 'adjust-stock', stockId: s.id, delta: 5 })}
              >
                +5
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-xs font-bold text-brand">Why hospitals pay less on MediMesh</p>
        <p className="mt-1 text-xs text-muted">Pooled demand across 3 hospitals — buy common tablets together.</p>
        {demand.slice(0, 3).map((d) => (
          <p key={d.sku} className="mt-2 flex justify-between text-sm">
            <span>{d.name}</span>
            <span className="font-semibold">{d.soldWeek}/wk mesh</span>
          </p>
        ))}
      </Card>
    </div>
  )
}

export function OrdersPage() {
  const { state, session, dispatch } = useMesh()
  if (!session) return null
  const stock = scoped(state.stock, session.hospitalId)
  const rx = scoped(state.prescriptions, session.hospitalId).filter((p) => p.status !== 'dispensed')
  const patients = scoped(state.patients, session.hospitalId)
  return (
    <div className="space-y-3 px-5 pt-2">
      <h1 className="text-xl font-extrabold">Orders</h1>
      {rx.map((item) => {
        const match = stock.find((s) => item.medicine.toLowerCase().includes(s.name.split(' ')[0].toLowerCase()))
        const status = match ? stockStatus(match) : 'out'
        return (
          <Card key={item.id} className="flex items-center justify-between gap-2">
            <div>
              <p className="font-bold">{item.medicine}</p>
              <p className="text-xs text-muted">{patients.find((p) => p.id === item.patientId)?.name}</p>
              <p className="text-[11px] text-muted">
                {status === 'out' ? 'Not in stock' : status === 'low' ? 'Running low' : 'In stock'}
              </p>
            </div>
            <button
              type="button"
              disabled={status === 'out'}
              className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
              onClick={() => dispatch({ type: 'dispense', prescriptionId: item.id })}
            >
              Dispense
            </button>
          </Card>
        )
      })}
    </div>
  )
}

function Mini({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className={`rounded-2xl p-3 ${color}`}>
      <p className="text-2xl font-extrabold">{n}</p>
      <p className="text-[10px] font-semibold">{label}</p>
    </div>
  )
}
