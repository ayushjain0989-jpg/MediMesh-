import { Card } from '../components/ui'
import { copy } from '../i18n'
import { speak, stopSpeaking } from '../lib/speech'
import { useState } from 'react'
import type { Lang, Person, Treatment } from '../types'

export function ExplainerCard({
  treatment,
  lang,
  doctor,
  onApprove,
}: {
  treatment: Treatment
  lang: Lang
  doctor?: Person
  onApprove?: () => void
}) {
  const t = copy[lang]
  const [speaking, setSpeaking] = useState(false)
  const spoken = [treatment.happening[lang], treatment.medicineDoes[lang], treatment.recoverBy[lang]].join(' ')
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand">{t.explainer}</p>
          <h2 className="font-extrabold">{treatment.condition}</h2>
          <p className="text-xs text-muted">
            {treatment.medicine} · {treatment.dose}
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${treatment.status === 'approved' ? 'bg-emerald-50 text-mint' : 'bg-amber-50 text-amber'}`}>
          {treatment.status === 'approved' ? t.approved : t.draft}
        </span>
      </div>
      <div className="mt-3 rounded-xl bg-sky-50 p-3 text-sm">
        <p>{treatment.happening[lang]}</p>
        <p className="mt-2">{treatment.medicineDoes[lang]}</p>
        <p className="mt-2">{treatment.recoverBy[lang]}</p>
      </div>
      <button
        type="button"
        className="mt-3 w-full rounded-xl bg-brand py-2 text-sm font-bold text-white"
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
        {speaking ? t.stop : 'Read Aloud'}
      </button>
      <p className="mt-2 text-[11px] text-muted">
        {doctor?.name}
        {treatment.approvedAt ? ` · ${treatment.approvedAt}` : ''}
      </p>
      {onApprove && treatment.status === 'draft' && (
        <button type="button" className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-sm font-bold text-white" onClick={onApprove}>
          Approve this explanation
        </button>
      )}
    </Card>
  )
}
