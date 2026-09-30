import { useEffect, useState } from 'react'
import { fetchFlow } from '../lib/api'
import { copy } from '../i18n'
import type { FlowInputs, FlowResult, Lang } from '../types'

export function HospitalFlowPanel({
  inputs,
  compact = false,
  lang,
}: {
  inputs: FlowInputs
  compact?: boolean
  lang: Lang
}) {
  const t = copy[lang]
  const [result, setResult] = useState<FlowResult | null>(null)

  useEffect(() => {
    let live = true
    fetchFlow(inputs).then((data) => {
      if (live) setResult(data)
    })
    return () => {
      live = false
    }
  }, [JSON.stringify(inputs)])

  if (!result) {
    return (
      <div className="rounded-3xl bg-teal-deep p-5 text-paper">
        <p className="text-sm opacity-70">HospitalFlow AI</p>
        <p className="mt-2 font-display text-2xl">Counting the minutes…</p>
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-teal-deep text-paper">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gold">{t.flowTitle}</p>
            <p className="mt-1 text-sm text-mist">{t.flowHint}</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
            {result.source === 'fastapi' ? t.live : t.local}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-end gap-8">
          <div>
            <p className="font-display text-6xl leading-none">{Math.round(result.predictedMinutes)}</p>
            <p className="mt-1 text-sm text-mist">minutes · {t.p50}</p>
          </div>
          <div className="text-sm text-mist">
            <p>
              {t.p80}: <span className="text-paper">{Math.round(result.p80)} min</span>
            </p>
            <p className="mt-1">
              {inputs.waitingCount} waiting · {inputs.doctorsOnDuty} doctors · {inputs.pharmacyQueue} at pharmacy
            </p>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="border-t border-white/10 bg-black/15 p-5 sm:p-6">
          <p className="mb-3 text-xs tracking-[0.16em] uppercase text-gold">Visible calculation</p>
          <ol className="space-y-2">
            {result.steps.map((step) => (
              <li
                key={step.id}
                className={`grid grid-cols-[1fr_auto] gap-3 rounded-2xl px-3 py-2 text-sm ${
                  step.kind === 'result' ? 'bg-gold/20' : 'bg-white/5'
                }`}
              >
                <div>
                  <p className="font-semibold">{step.label}</p>
                  <p className="font-mono text-[11px] text-mist">{step.formula}</p>
                  <p className="font-mono text-[11px] text-gold/90">{step.substitution}</p>
                </div>
                <p className="font-display text-xl">
                  {step.value}
                  <span className="ml-1 text-xs">{step.unit}</span>
                </p>
              </li>
            ))}
          </ol>
          {result.warnings.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gold">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
