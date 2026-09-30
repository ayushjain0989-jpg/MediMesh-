import type { Hospital, Person, Shift } from '../types'

export const DEMO_TODAY = 14
export const DEMO_MONTH_LABEL = 'Sep 2026'

export function clockFor(shift: Shift) {
  return shift === 'night' ? '9:10' : '9:41'
}

export function clinicIsOpen(hospital: Hospital, shift: Shift) {
  return shift === 'day' && Boolean(hospital.clinicOpen)
}

export function doctorsOnThisShift(doctors: Person[], shift: Shift) {
  return doctors.filter((d) => d.role === 'doctor' && (d.shift ?? 'day') === shift)
}

export function liveDoctors(doctors: Person[], shift: Shift) {
  return doctorsOnThisShift(doctors, shift).filter((d) => d.available !== false)
}

export function nightNurseOf(people: Person[], hospitalId: string) {
  return people.find((p) => p.hospitalId === hospitalId && p.role === 'nurse' && p.shift === 'night')
}

export function dayNurseOf(people: Person[], hospitalId: string) {
  return people.find((p) => p.hospitalId === hospitalId && p.role === 'nurse' && p.shift === 'day')
}

export function specialtyQueue(specialty?: string) {
  if (!specialty || specialty === 'General Physician') return 'General'
  return specialty
}
