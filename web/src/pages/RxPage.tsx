import { useState } from 'react'
import { copy, langLabel } from '../i18n'
import { speak, stopSpeaking } from '../lib/speech'
import { scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'
import type { Lang } from '../types'
import { Badge, Card } from '../components/ui'

export function RxPage() {
  const { state, person, session, lang, setLang } = useMesh()
  const [speaking, setSpeaking] = useState(false)
  if (!session || !person) return null
  const t = copy[lang]
  const patientId = person.role === 'patient' ? person.patientId : scoped(state.patients, session.hospitalId)[0]?.id
  const rxs = state.prescriptions.filter((p) => p.patientId === patientId)
  const treatment = state.treatments.find((tr) => tr.patientId === patientId)
  const doctor = state.people.find((p) => p.id === treatment?.doctorId)
  const spoken = treatment
    ? [treatment.happening[lang], treatment.medicineDoes[lang], treatment.recoverBy[lang]].join(' ')
    : rxs.map((r) => `${r.medicine}. ${r.usedFor ?? r.dose}`).join(' ')
  const langs: Lang[] = ['en', 'hi', 'te']

  return (
    <div className="space-y-4 px-5 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">{t.explainer}</h1>
        <Badge>AI Summary</Badge>
      </div>
      <div className="space-y-3">
        {rxs.map((rx, i) => (
          <Card key={rx.id}>
            <p className="text-xs font-bold text-muted">{i + 1}.</p>
            <p className="font-extrabold">{rx.medicine}</p>
            <p className="text-xs text-muted">{rx.schedule ?? rx.dose}</p>
            <p className="mt-1 text-xs">
              <span className="font-semibold">Used for: </span>
              {rx.usedFor ?? 'As advised by your doctor'}
            </p>
          </Card>
        ))}
      </div>
      {treatment && (
        <div className="rounded-2xl bg-sky-50 p-4">
        <p className="text-sm font-extrabold text-sky-800">{t.explainer}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink">
            <li>• {treatment.happening[lang]}</li>
            <li>• {treatment.medicineDoes[lang]}</li>
            <li>• {treatment.recoverBy[lang]}</li>
            <li className="text-rose">• {treatment.redFlags[lang]}</li>
          </ul>
          <p className="mt-2 text-[11px] text-muted">
            {t.approved} · {doctor?.name} {treatment.approvedAt ? `· ${treatment.approvedAt}` : ''}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex-1 rounded-2xl bg-brand py-3 text-sm font-bold text-white"
          onClick={() => {
            if (speaking) {
              stopSpeaking()
              setSpeaking(false)
              return
            }
            speak(spoken, lang)
            setSpeaking(true)
          }}
        >
          {speaking ? t.stop : t.speak}
        </button>
        <select
          className="rounded-2xl bg-white px-3 py-3 text-xs font-semibold card-shadow"
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
        >
          {langs.map((code) => (
            <option key={code} value={code}>
              {langLabel[code]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
