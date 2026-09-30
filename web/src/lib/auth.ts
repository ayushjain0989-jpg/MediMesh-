import type { Person, Role } from '../types'

/** Shared demo password for every seeded account. Swap for hashed secrets when Supabase Auth is wired. */
export const DEMO_PASSWORD = 'mesh123'

export const LOGIN_IDS: Record<string, string> = {
  'sun-p': 'PT-SUN-101',
  'sun-d': 'DR-SUN-201',
  'sun-d2': 'DR-SUN-202',
  'sun-d3': 'DR-SUN-203',
  'sun-d4': 'DR-SUN-204',
  'sun-d5': 'DR-SUN-205',
  'sun-n-day': 'NR-SUN-301',
  'sun-n-night': 'NR-SUN-302',
  'sun-ph': 'PH-SUN-401',
  'sun-r': 'RC-SUN-501',
  'sun-a': 'AD-SUN-601',
  'lot-p': 'PT-LOT-101',
  'lot-d': 'DR-LOT-201',
  'lot-n-day': 'NR-LOT-301',
  'lot-n-night': 'NR-LOT-302',
  'lot-ph': 'PH-LOT-401',
  'lot-r': 'RC-LOT-501',
  'lot-a': 'AD-LOT-601',
  'aro-p': 'PT-ARO-101',
  'aro-d': 'DR-ARO-201',
  'aro-n-day': 'NR-ARO-301',
  'aro-n-night': 'NR-ARO-302',
  'aro-ph': 'PH-ARO-401',
  'aro-r': 'RC-ARO-501',
  'aro-a': 'AD-ARO-601',
}

export const portalRoles: { role: Role; label: string; hint: string; sampleId: string }[] = [
  { role: 'patient', label: 'Patient', hint: 'Appointments, wait, Care Copilot', sampleId: 'PT-SUN-101' },
  { role: 'doctor', label: 'Doctor', hint: 'OPD queue and explainers', sampleId: 'DR-SUN-201' },
  { role: 'nurse', label: 'Nurse', hint: 'Ward and shift handover', sampleId: 'NR-SUN-301' },
  { role: 'pharmacist', label: 'Pharmacist', hint: 'Stock and prescriptions', sampleId: 'PH-SUN-401' },
  { role: 'administrator', label: 'Admin', hint: 'HospitalFlow and staffing', sampleId: 'AD-SUN-601' },
]

export function attachLoginIds(people: Omit<Person, 'loginId'>[]): Person[] {
  return people.map((person) => ({
    ...person,
    loginId: LOGIN_IDS[person.id] ?? person.id.toUpperCase(),
  }))
}

export function authenticate(
  people: Person[],
  role: Role,
  loginId: string,
  password: string,
): { ok: true; person: Person } | { ok: false; error: string } {
  const id = loginId.trim().toUpperCase()
  const pass = password.trim()
  if (!id || !pass) return { ok: false, error: 'Enter your user ID and password.' }

  const person = people.find((p) => p.loginId.toUpperCase() === id)
  if (!person) return { ok: false, error: 'Unknown user ID. Check the demo accounts below.' }
  if (person.role !== role) {
    return {
      ok: false,
      error: `This ID belongs to a ${person.role} account. Switch the tab above.`,
    }
  }
  if (pass !== DEMO_PASSWORD) return { ok: false, error: 'Wrong password. Demo password is mesh123.' }
  return { ok: true, person }
}
