import type { Hospital, Patient, Prescription, TimelineItem } from '../types'
import { downloadTextPdf } from './pdfDownload'

export function downloadMedicalReportPdf(opts: {
  hospital: Hospital
  patient: Patient
  notes: TimelineItem[]
  prescriptions: Prescription[]
}) {
  const { hospital, patient, notes, prescriptions } = opts
  const slug = patient.name.replace(/\s+/g, '-')
  downloadTextPdf(`MediMesh-report-${slug}.pdf`, [
    'MediMesh medical report',
    `${hospital.name} · ${hospital.city}`,
    'Export from Medical Records · not a diagnosis',
    '',
    `Patient: ${patient.name}`,
    `Age / sex: ${patient.age} / ${patient.sex}`,
    `MRN: ${patient.mrn ?? '—'}`,
    `Phone: ${patient.phone ?? '—'}`,
    `Condition on file: ${patient.condition}`,
    `Ward: ${patient.ward ?? 'OPD'}${patient.bed ? ` · bed ${patient.bed}` : ''}`,
    '',
    'Vitals',
    `Heart rate: ${patient.hr ?? '—'} bpm`,
    `Blood pressure: ${patient.bp ?? '—'} mmHg`,
    `Oxygen: ${patient.oxygen ?? 98} %`,
    `Temperature: ${patient.temp ?? '—'}`,
    `Blood group: ${patient.bloodGroup ?? '—'}`,
    `Weight: ${patient.weightKg ?? '—'} kg`,
    `Allergies: ${patient.allergies ?? 'None'}`,
    '',
    'Latest notes',
    ...(notes.length
      ? notes.flatMap((n) => [`- ${n.title} (${n.when})`, `  ${n.detail}`])
      : ['- No notes on file']),
    '',
    'Medicines on file',
    ...(prescriptions.length
      ? prescriptions.map((rx) => `- ${rx.medicine} · ${rx.dose} · ${rx.status}`)
      : ['- No prescription rows']),
    '',
    'This PDF is generated in the browser from this hospital seed / EHR rows.',
  ])
}
