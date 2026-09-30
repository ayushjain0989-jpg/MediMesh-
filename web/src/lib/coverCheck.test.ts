import { describe, expect, it } from 'vitest'
import { checkOffer } from './coverCheck'
import type { CoverOffer, Patient } from '../types'

const patient: Patient = {
  id: 'sun-pt-ananya',
  hospitalId: 'sunrise',
  name: 'Ananya Reddy',
  age: 34,
  sex: 'F',
  condition: 'Type 2 diabetes',
  language: 'te',
}

const fresh: CoverOffer = {
  id: 'off-sun-star',
  hospitalId: 'sunrise',
  provider: 'Star Health',
  planName: 'Family mediclaim at Sunrise',
  promise: 'Apply at this desk',
  cashless: true,
  coveragePercent: 70,
  sumInsured: 300000,
  premiumYear: 12600,
  waitingDays: 90,
  minAge: 18,
  maxAge: 70,
  kind: 'fresh',
}

const topup: CoverOffer = { ...fresh, id: 'off-sun-topup', kind: 'top-up', provider: 'Niva Bupa' }

describe('Cover desk IF-THEN', () => {
  it('lets an adult apply for a fresh plan', () => {
    const result = checkOffer(fresh, patient, [])
    expect(result.ok).toBe(true)
    expect(result.hits.find((h) => h.id === 'O1')?.ok).toBe(true)
  })

  it('blocks a child from an adult plan', () => {
    const result = checkOffer(fresh, { ...patient, age: 7 }, [])
    expect(result.ok).toBe(false)
  })

  it('only offers top-up if that insurer is already on file', () => {
    const noPolicy = checkOffer(topup, patient, [])
    expect(noPolicy.ok).toBe(false)
    const hasPolicy = checkOffer(topup, patient, [
      {
        id: 'pol-ananya',
        hospitalId: 'sunrise',
        patientId: 'sun-pt-ananya',
        policyNumber: 'NB-HYD-88421',
        provider: 'Niva Bupa',
        planName: 'Sunrise cashless OPD',
        cashless: true,
        coveragePercent: 80,
        sumInsured: 500000,
        premium: 18400,
        validFrom: '01 Apr 2026',
        validTill: '31 Mar 2027',
        waitingDays: 30,
        networkHospital: true,
      },
    ])
    expect(hasPolicy.ok).toBe(true)
  })
})
