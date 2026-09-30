import type { Lang } from '../types'

const langCode: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
}

export function speak(text: string, lang: Lang) {
  if (!window.speechSynthesis) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langCode[lang]
  utterance.rate = 0.95
  const voices = window.speechSynthesis.getVoices()
  const match = voices.find((v) => v.lang.toLowerCase().startsWith(langCode[lang].slice(0, 2)))
  if (match) utterance.voice = match
  window.speechSynthesis.speak(utterance)
  return true
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}
