import type { CoverApplication, CoverOffer, Hospital, Patient } from '../types'
import { downloadTextPdf } from './pdfDownload'

export function downloadApplyPdf(opts: {
  hospital: Hospital
  patient: Patient
  offer: CoverOffer
  application: CoverApplication
}) {
  const { hospital, patient, offer, application } = opts
  downloadTextPdf(`MediMesh-cover-apply-${application.id}.pdf`, [
    'MediMesh cover application',
    `${hospital.name} · ${hospital.city}`,
    'Hospital desk offer · not a claim pack · not a diagnosis',
    '',
    `Application: ${application.id}`,
    `Status: ${application.status}`,
    `Applied: ${application.appliedAt}`,
    `Patient: ${patient.name}`,
    `Age / sex: ${patient.age} / ${patient.sex}`,
    `MRN: ${patient.mrn ?? '—'}`,
    `Condition on file: ${application.declaredCondition}`,
    `Nominee: ${application.nominee} (${application.relation})`,
    '',
    `Insurer: ${offer.provider}`,
    `Plan offered: ${offer.planName}`,
    `Kind: ${offer.kind}`,
    `What it does: ${offer.promise}`,
    `Cashless at this hospital: ${offer.cashless ? 'yes' : 'no'}`,
    `Yearly premium (for TPA, not the product): INR ${offer.premiumYear}`,
    `Waiting days for known illness: ${offer.waitingDays}`,
    '',
    application.note ?? 'Desk has this apply. IF-THEN eligibility, not generative AI.',
    'This PDF is an application receipt, not a billed insurance claim form.',
  ])
}
