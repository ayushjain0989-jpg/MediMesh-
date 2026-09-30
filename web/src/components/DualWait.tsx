import { useMesh } from '../state/MeshContext'
import type { DualWaitSnapshot } from '../lib/wait'
import { Card } from './ui'

export function DualWait({
  snap,
  night,
}: {
  snap: DualWaitSnapshot
  night?: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Your turn</p>
        {night ? (
          <>
            <p className="mt-1 text-lg font-extrabold">OPD closed</p>
            <p className="text-[11px] text-muted">Token waits for morning clinic</p>
          </>
        ) : snap.yourTurnMin != null && snap.ticket ? (
          <>
            <p className="mt-1 text-3xl font-extrabold text-brand">{snap.yourTurnMin} min</p>
            <p className="text-[11px] text-muted">
              Token {snap.ticket.token} · {snap.peopleAhead} ahead
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted">{snap.consultMath}</p>
          </>
        ) : (
          <>
            <p className="mt-1 text-lg font-extrabold">No token yet</p>
            <p className="text-[11px] text-muted">Confirm today’s slot to join this queue</p>
          </>
        )}
      </Card>
      <div className="rounded-2xl bg-ink p-3 text-white">
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Hospital-wide</p>
        <p className="mt-1 text-3xl font-extrabold">{snap.hospitalWideMin} min</p>
        <p className="text-[11px] text-white/70">
          {snap.waitingCount} in OPD · {snap.doctors} doctors
        </p>
        <p className="mt-1 text-[10px] text-white/50">Includes pharmacy, stock, handover, crowd</p>
      </div>
    </div>
  )
}

export function DutyToggle() {
  const { dutyShift, setDutyShift } = useMesh()
  return (
    <div className="flex rounded-full bg-white p-1 text-[11px] font-bold card-shadow">
      <button
        type="button"
        className={`rounded-full px-3 py-1 ${dutyShift === 'day' ? 'bg-brand text-white' : 'text-muted'}`}
        onClick={() => setDutyShift('day')}
      >
        Day OPD
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1 ${dutyShift === 'night' ? 'bg-ink text-white' : 'text-muted'}`}
        onClick={() => setDutyShift('night')}
      >
        Night duty
      </button>
    </div>
  )
}
