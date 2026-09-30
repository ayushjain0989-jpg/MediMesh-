import { describe, expect, it } from 'vitest'
import { routeCare, type CopilotDuty } from './careCopilot'
import type { Person } from '../types'

const gp: Person = {
  id: 'sun-d',
  hospitalId: 'sunrise',
  role: 'doctor',
  name: 'Dr. Meera Iyer',
  title: 'General Physician',
  specialty: 'General Physician',
  shift: 'day',
  available: true,
  loginId: 'DR-SUN-201',
}

const nurse: Person = {
  id: 'sun-n-night',
  hospitalId: 'sunrise',
  role: 'nurse',
  name: 'Imran Shaik',
  title: 'Night',
  shift: 'night',
  loginId: 'NR-SUN-302',
}

const day: CopilotDuty = {
  shift: 'day',
  clinicOpen: true,
  clinicOpenAt: '08:00',
  hospitalName: 'Sunrise Care Hospital',
  doctors: [gp],
}

describe('Care Copilot', () => {
  it('routes thirsty and tired to GP, not a diagnosis', () => {
    const hit = routeCare('I feel thirsty and tired', day)
    expect(hit.specialty).toBe('General Physician')
    expect(hit.urgency).toBe('routine')
    expect(hit.doctorId).toBe('sun-d')
    expect(hit.disclaimer.en.toLowerCase()).toContain('not a diagnosis')
  })

  it('sends chest pain to emergency instead of an OPD book', () => {
    const hit = routeCare('chest pain and tightness', day)
    expect(hit.urgency).toBe('emergency')
    expect(hit.specialty).toBe('Emergency')
  })

  it('holds a sugar complaint for morning clinic at night', () => {
    const hit = routeCare('thirsty and tired', {
      ...day,
      shift: 'night',
      clinicOpen: false,
      nightNurse: nurse,
    })
    expect(hit.urgency).toBe('night-hold')
    expect(hit.nurseId).toBe('sun-n-night')
  })
})
