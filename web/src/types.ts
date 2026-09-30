export type Role =
  | 'patient'
  | 'doctor'
  | 'nurse'
  | 'pharmacist'
  | 'receptionist'
  | 'administrator'

export type Lang = 'en' | 'hi' | 'te'
export type Shift = 'day' | 'night'
export type TicketStatus = 'waiting' | 'with-doctor' | 'pharmacy' | 'done'
export type RxStatus = 'pending' | 'ready' | 'dispensed'
export type Approval = 'draft' | 'approved'

export type Localized = Record<Lang, string>

export type Hospital = {
  id: string
  name: string
  city: string
  beds: number
  accent: string
  motto: Localized
  tokenPrefix: string
  calmQueueSize: number
  targetStaff: number
  avgConsultMinutes: number
  avgDispenseMinutes: number
  emergencyDivertMinutes: number
  doctorsOnDuty: number
  pharmacistsOnDuty: number
  staffOnDuty: number
  emergencyArrivals: number
  occupancy: number
  nearHandover: boolean
  clinicOpen: string
  clinicClose: string
}

export type Person = {
  id: string
  hospitalId: string
  role: Role
  name: string
  title: string
  loginId: string
  shift?: Shift
  patientId?: string
  available?: boolean
  nextFree?: string
  room?: string
  clearedToday?: number
  specialty?: string
  years?: number
  rating?: number
  reviews?: number
  slots?: string[]
  hue?: string
}

export type Patient = {
  id: string
  hospitalId: string
  name: string
  age: number
  sex: 'F' | 'M'
  condition: string
  language: Lang
  ward?: string
  mrn?: string
  bed?: string
  allergies?: string
  surgeries?: string
  bp?: string
  hr?: string
  temp?: string
  bloodGroup?: string
  weightKg?: number
  oxygen?: number
  email?: string
  phone?: string
}

export type QueueTicket = {
  id: string
  hospitalId: string
  patientId: string
  token: string
  department: string
  status: TicketStatus
  urgent: boolean
  arrivedAt: string
  doctorId?: string
  source?: 'walk-in' | 'booking'
}

export type Prescription = {
  id: string
  hospitalId: string
  patientId: string
  doctorId: string
  medicine: string
  dose: string
  status: RxStatus
  usedFor?: string
  schedule?: string
  days?: string
}

export type StockItem = {
  id: string
  hospitalId: string
  name: string
  sku: string
  quantity: number
  reorderAt: number
  unit: string
  soldToday: number
  soldWeek: number
  soldMonth?: number
  demandChange?: number
  expiring?: number
}

export type Handover = {
  id: string
  hospitalId: string
  shift: Shift
  authorId: string
  createdAt: string
  watchlist: string
  pendingLabs: string
  medsDue: string
  staffingNote: string
  signed: boolean
}

export type Treatment = {
  id: string
  hospitalId: string
  patientId: string
  doctorId: string
  condition: string
  medicine: string
  dose: string
  why: Localized
  happening: Localized
  medicineDoes: Localized
  recoverBy: Localized
  story: Localized
  watchFor: Localized
  redFlags: Localized
  glossary: { term: string; plain: Localized }[]
  status: Approval
  approvedAt?: string
}

export type FlowInputs = {
  hospitalId: string
  hospitalName: string
  waitingCount: number
  avgConsultMinutes: number
  doctorsOnDuty: number
  emergencyArrivals: number
  emergencyDivertMinutes: number
  pharmacyQueue: number
  avgDispenseMinutes: number
  pharmacistsOnDuty: number
  stockouts: number
  staffOnDuty: number
  targetStaff: number
  occupancy: number
  nearHandover: boolean
}

export type FlowStep = {
  id: string
  label: string
  formula: string
  substitution: string
  value: number
  unit: string
  kind: 'add' | 'multiply' | 'result'
}

export type FlowResult = {
  hospitalId: string
  predictedMinutes: number
  p50: number
  p80: number
  steps: FlowStep[]
  warnings: string[]
  source: 'fastapi' | 'local'
}

export type Appointment = {
  id: string
  hospitalId: string
  patientId: string
  doctorId: string
  dateLabel: string
  time: string
  status: 'upcoming' | 'done'
  token?: string
  ticketId?: string
}

export type TimelineItem = {
  id: string
  patientId: string
  kind: 'consult' | 'rx' | 'lab' | 'followup' | 'meds'
  title: string
  detail: string
  when: string
}

export type Session = {
  personId: string
  hospitalId: string
  role: Role
  accessToken?: string
  tokenSource?: 'jwt' | 'local'
}

export type CopilotRule = {
  id: string
  ifKeywords: string
  thenSpecialty: string
  thenUrgency: CopilotUrgency
  thenAction: string
  isDiagnosis: boolean
}

export type CopilotUrgency = 'routine' | 'emergency' | 'night-hold'

export type MeshState = {
  hospitals: Hospital[]
  people: Person[]
  patients: Patient[]
  queue: QueueTicket[]
  prescriptions: Prescription[]
  stock: StockItem[]
  handovers: Handover[]
  treatments: Treatment[]
  appointments: Appointment[]
  timeline: TimelineItem[]
  copilotRules: CopilotRule[]
}

export type MeshAction =
  | { type: 'check-in'; hospitalId: string; name: string; age: number; department: string; urgent: boolean }
  | { type: 'call-next'; hospitalId: string; doctorId: string }
  | { type: 'send-pharmacy'; ticketId: string }
  | { type: 'complete-ticket'; ticketId: string }
  | { type: 'dispense'; prescriptionId: string }
  | { type: 'adjust-stock'; stockId: string; delta: number }
  | { type: 'add-handover'; handover: Omit<Handover, 'id' | 'createdAt' | 'signed'> }
  | { type: 'sign-handover'; handoverId: string }
  | { type: 'approve-treatment'; treatmentId: string }
  | { type: 'update-story'; treatmentId: string; lang: Lang; story: string }
  | { type: 'patch-hospital'; hospitalId: string; patch: Partial<Hospital> }
  | { type: 'toggle-doctor'; personId: string }
  | {
      type: 'book-slot'
      hospitalId: string
      patientId: string
      doctorId: string
      time: string
      dateLabel: string
      issueToken: boolean
      department: string
    }
