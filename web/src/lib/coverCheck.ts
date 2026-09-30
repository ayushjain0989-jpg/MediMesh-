import type { CoverOffer, CoverPolicy, Patient } from '../types'

export type OfferHit = { id: string; ok: boolean; text: string }

export function checkOffer(offer: CoverOffer, patient: Patient, policies: CoverPolicy[]) {
  const same = policies.filter((p) => p.patientId === patient.id && p.provider === offer.provider)
  const hits: OfferHit[] = [
    {
      id: 'O1',
      ok: patient.age >= offer.minAge && patient.age <= offer.maxAge,
      text: `IF age ${patient.age} is between ${offer.minAge} and ${offer.maxAge} THEN this desk can offer the plan.`,
    },
    {
      id: 'O2',
      ok: true,
      text: 'IF this hospital is on the MediMesh network THEN cashless is at this desk, not a city-wide claim portal.',
    },
    {
      id: 'O3',
      ok: true,
      text: `IF condition on file is “${patient.condition}” THEN a ${offer.waitingDays}-day wait applies for that illness. Apply is still allowed. Not a diagnosis.`,
    },
    {
      id: 'O4',
      ok: offer.kind === 'top-up' ? same.length > 0 : true,
      text:
        offer.kind === 'top-up'
          ? same.length
            ? 'IF you already hold this insurer THEN this card is a top-up, not a duplicate policy.'
            : 'IF you have no policy with this insurer THEN pick a fresh plan first.'
          : same.length
            ? 'IF you already hold this insurer THEN issuing again would be a top-up — tell the desk.'
            : 'IF no same-insurer policy is on file THEN this is a fresh apply.',
    },
  ]
  const ok = hits.every((h) => h.ok)
  return {
    ok,
    hits,
    note: ok
      ? 'Desk can take this application. Premium is yearly; we do not treat rupees as the product.'
      : 'One rule failed — pick another offer or wait for the desk.',
  }
}
