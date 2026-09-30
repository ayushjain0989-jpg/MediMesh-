import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { hospitalOf } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'
import { AppNav } from './BottomNav'
import { Avatar, IconPlus } from './ui'

export function Shell() {
  const { session, person, state, clockLabel, dutyShift, setDutyShift, signOut } = useMesh()
  const navigate = useNavigate()
  if (!session || !person) return <Navigate to="/" replace />
  const hospital = hospitalOf(state, session.hospitalId)

  return (
    <div className="portal-bg min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link to="/app" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <IconPlus className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-extrabold tracking-tight">MediMesh AI</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
                {hospital.name}
              </span>
            </span>
          </Link>
          <AppNav role={session.role} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden text-left text-[11px] font-semibold text-muted sm:block"
              onClick={() => setDutyShift(dutyShift === 'day' ? 'night' : 'day')}
            >
              <span className="block">{clockLabel}</span>
              <span>
                {hospital.city} · {dutyShift === 'night' ? 'Night' : 'Day'}
              </span>
            </button>
            <Link to="/app/profile" className="hidden sm:block">
              <Avatar name={person.name} hue={person.hue ?? '#1db8a6'} size={36} />
            </Link>
            <button
              type="button"
              className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white"
              onClick={() => {
                signOut()
                navigate('/', { replace: true })
              }}
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="border-t border-line/70 px-5 py-2 sm:hidden">
          <button
            type="button"
            className="text-[11px] font-semibold text-muted"
            onClick={() => setDutyShift(dutyShift === 'day' ? 'night' : 'day')}
          >
            {clockLabel} · {hospital.city} · {dutyShift === 'night' ? 'Night' : 'Day'}
          </button>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl py-8">
        <Outlet />
      </main>
    </div>
  )
}
