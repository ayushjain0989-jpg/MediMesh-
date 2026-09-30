import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { IconPlus } from '../components/ui'
import { loginRemote } from '../lib/api'
import { authenticate, DEMO_PASSWORD, portalRoles } from '../lib/auth'
import { useMesh } from '../state/MeshContext'
import type { Role } from '../types'

export function LoginPage() {
  const { state, enter, session } = useMesh()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('patient')
  const [loginId, setLoginId] = useState('PT-SUN-101')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const current = portalRoles.find((r) => r.role === role) ?? portalRoles[0]
  const demoRows = useMemo(
    () =>
      portalRoles.map((tab) => {
        const person = state.people.find((p) => p.loginId === tab.sampleId)
        return { ...tab, name: person?.name ?? tab.label, hospital: person?.hospitalId ?? 'sunrise' }
      }),
    [state.people],
  )

  if (session) return <Navigate to="/app" replace />

  function fillDemo(nextRole: Role) {
    const tab = portalRoles.find((r) => r.role === nextRole)
    setRole(nextRole)
    setLoginId(tab?.sampleId ?? '')
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const id = loginId.trim()
    const pass = password.trim()
    const remote = await loginRemote(role, id, pass)
    if (remote.ok) {
      const who = state.people.find((p) => p.id === remote.user.id)
      setBusy(false)
      if (!who) {
        setError('This ID is valid, but it is not in the local hospital seed.')
        return
      }
      enter(who, remote.accessToken)
      navigate('/app')
      return
    }
    const local = authenticate(state.people, role, id, pass)
    setBusy(false)
    if (!local.ok) {
      setError(local.error)
      return
    }
    enter(local.person)
    navigate('/app')
  }

  return (
    <div className="portal-bg min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <IconPlus className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-extrabold tracking-tight">MediMesh AI</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
                Multi-hospital care
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted sm:flex">
            <a href="#demo-accounts" className="hover:text-ink">
              Demo accounts
            </a>
            <span>Patients · Doctors · Staff</span>
          </nav>
          <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white">Portal</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-lg flex-col items-center px-5 py-12 sm:py-16">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand card-shadow">
          <KeyIcon />
        </span>
        <h1 className="mt-5 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">MediMesh Portal Access</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Same pattern as a Vercel portal: pick a role, enter ID and password. FastAPI issues a JWT; the API can live on
          Render and the website on Vercel.
        </p>

        <div className="mt-8 flex w-full flex-wrap justify-center gap-1 rounded-full bg-white p-1 card-shadow">
          {portalRoles.map((tab) => (
            <button
              key={tab.role}
              type="button"
              onClick={() => fillDemo(tab.role)}
              className={`rounded-full px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm ${
                role === tab.role ? 'bg-brand text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 w-full rounded-3xl bg-white p-6 card-shadow sm:p-8">
          <label className="block text-sm font-bold">
            {current.label} ID
            <input
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value)
                setError('')
              }}
              autoComplete="username"
              placeholder={current.sampleId}
              className="mt-2 w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm font-medium outline-none focus:border-brand"
            />
          </label>
          <p className="mt-1 text-xs text-muted">Example: {current.sampleId} · {current.hint}</p>

          <label className="mt-4 block text-sm font-bold">
            Password
            <span className="relative mt-2 block">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                autoComplete="current-password"
                placeholder="Hospital account password"
                className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 pr-16 text-sm font-medium outline-none focus:border-brand"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="mt-6 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? 'Issuing JWT…' : `Sign in to ${current.label} portal →`}
          </button>
          <button
            type="button"
            className="mt-3 w-full text-sm font-semibold text-brand"
            onClick={() => fillDemo(role)}
          >
            Fill demo ID and password
          </button>
        </form>

        <section id="demo-accounts" className="mt-8 w-full rounded-3xl bg-white p-5 card-shadow sm:p-6">
          <p className="text-sm font-extrabold">Demo accounts · Sunrise Care</p>
          <p className="mt-1 text-xs text-muted">
            Password for every account is <span className="font-mono font-bold text-ink">{DEMO_PASSWORD}</span>. Lotus uses
            LOT, Arogya uses ARO (example PT-LOT-101).
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted">
                <tr>
                  <th className="py-2 font-semibold">Role</th>
                  <th className="py-2 font-semibold">User ID</th>
                  <th className="py-2 font-semibold">Name</th>
                </tr>
              </thead>
              <tbody>
                {demoRows.map((row) => (
                  <tr key={row.role} className="border-t border-line">
                    <td className="py-2 font-bold">{row.label}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="font-mono font-bold text-brand"
                        onClick={() => fillDemo(row.role)}
                      >
                        {row.sampleId}
                      </button>
                    </td>
                    <td className="py-2 text-muted">{row.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="14" r="4" />
      <path d="M12 14h8l-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
