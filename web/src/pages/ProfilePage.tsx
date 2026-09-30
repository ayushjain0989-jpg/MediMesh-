import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Card } from '../components/ui'
import { langLabel, roleLabel } from '../i18n'
import { hospitalOf } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'
import type { Lang } from '../types'

export function ProfilePage() {
  const { person, session, state, lang, setLang, signOut } = useMesh()
  const navigate = useNavigate()
  const [reminders, setReminders] = useState(true)
  if (!person || !session) return null
  const hospital = hospitalOf(state, session.hospitalId)
  const patient = state.patients.find((p) => p.id === person.patientId)
  const langs: Lang[] = ['en', 'hi', 'te']
  const rows = [
    { to: '/app/database', label: 'AI type & database', icon: '🗄' },
    { to: '/app/health', label: 'Medical Records', icon: '📄' },
    { to: '/app/health', label: 'Insurance Details', icon: '👜' },
    { to: '/app/profile', label: 'Payment Methods', icon: '💳' },
    { to: '/app/book', label: 'Appointment History', icon: '🕒' },
    { to: '/app/ai', label: 'FAQ & Support', icon: '?' },
  ]

  return (
    <div className="space-y-4 px-5 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">My Profile</h1>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg card-shadow">⚙</span>
      </div>
      <Card className="flex items-center gap-3">
        <Avatar name={person.name} hue={person.hue ?? '#1db8a6'} size={64} />
        <div>
          <p className="text-lg font-extrabold">{person.name}</p>
          <p className="text-xs text-muted">{patient?.email ?? `${person.id}@medimesh.demo`}</p>
          <p className="text-xs text-muted">{patient?.phone ?? hospital.city}</p>
          <p className="mt-1 text-[11px] font-semibold text-brand">
            {roleLabel[lang][person.role]} · {hospital.name}
          </p>
          <p className="font-mono text-[11px] text-muted">{person.loginId}</p>
          <p className="mt-1 text-[11px] font-bold text-brand">
            {session.tokenSource === 'jwt' ? 'Signed in with JWT (HS256)' : 'Local demo session'}
          </p>
        </div>
      </Card>
      <div className="space-y-2">
        {rows.map((row) => (
          <Link key={row.label} to={row.to} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 card-shadow">
            <span className="flex items-center gap-3 text-sm font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50">{row.icon}</span>
              {row.label}
            </span>
            <span className="text-muted">›</span>
          </Link>
        ))}
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 card-shadow">
          <span className="flex items-center gap-3 text-sm font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50">🔔</span>
            Reminders
          </span>
          <button
            type="button"
            className={`h-6 w-11 rounded-full ${reminders ? 'bg-brand' : 'bg-slate-200'}`}
            onClick={() => setReminders((v) => !v)}
          >
            <span className={`block h-5 w-5 rounded-full bg-white transition ${reminders ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
      <Card>
        <p className="text-xs font-bold text-muted">Language</p>
        <div className="mt-2 flex gap-2">
          {langs.map((code) => (
            <button
              key={code}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold ${lang === code ? 'bg-brand text-white' : 'bg-canvas text-muted'}`}
              onClick={() => setLang(code)}
            >
              {langLabel[code]}
            </button>
          ))}
        </div>
      </Card>
      <button
        type="button"
        className="w-full rounded-2xl bg-rose-50 py-3 text-sm font-bold text-rose"
        onClick={() => {
          signOut()
          navigate('/', { replace: true })
        }}
      >
        Sign out
      </button>
    </div>
  )
}
