import { Navigate, Outlet } from 'react-router-dom'
import { hospitalOf } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'
import { BottomNav } from './BottomNav'

export function Shell() {
  const { session, person, state, clockLabel, dutyShift, setDutyShift } = useMesh()
  if (!session || !person) return <Navigate to="/" replace />
  const hospital = hospitalOf(state, session.hospitalId)

  return (
    <div className="min-h-screen bg-[#cfe8e4] sm:py-8">
      <div className="phone-shadow relative mx-auto min-h-screen overflow-hidden bg-canvas sm:min-h-[844px] sm:max-w-[390px] sm:rounded-[36px]">
        <button
          type="button"
          className="flex w-full items-center justify-between px-6 pt-3 text-[11px] font-semibold text-ink"
          onClick={() => setDutyShift(dutyShift === 'day' ? 'night' : 'day')}
        >
          <span>{clockLabel}</span>
          <span className="text-muted">
            {hospital.city} · {dutyShift === 'night' ? 'Night' : 'Day'}
          </span>
        </button>
        <div className="h-[calc(100vh-1.6rem)] overflow-y-auto pb-24 no-scrollbar sm:h-[800px]">
          <Outlet />
        </div>
        <BottomNav role={session.role} />
      </div>
    </div>
  )
}
