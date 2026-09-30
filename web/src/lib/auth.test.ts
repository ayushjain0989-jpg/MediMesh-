import { describe, expect, it } from 'vitest'
import { authenticate, DEMO_PASSWORD } from './auth'
import type { Person } from '../types'

const people: Person[] = [
  {
    id: 'sun-p',
    hospitalId: 'sunrise',
    role: 'patient',
    name: 'Ananya Reddy',
    title: 'OPD',
    patientId: 'sun-pt-ananya',
    loginId: 'PT-SUN-101',
  },
]

describe('portal auth', () => {
  it('signs in with demo ID and password', () => {
    const result = authenticate(people, 'patient', 'pt-sun-101', DEMO_PASSWORD)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.person.id).toBe('sun-p')
  })

  it('rejects the wrong role tab', () => {
    const result = authenticate(people, 'doctor', 'PT-SUN-101', DEMO_PASSWORD)
    expect(result.ok).toBe(false)
  })

  it('rejects a wrong password', () => {
    const result = authenticate(people, 'patient', 'PT-SUN-101', 'nope')
    expect(result.ok).toBe(false)
  })
})
