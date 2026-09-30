import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { seed } from '../data/seed'
import { setAccessToken } from '../lib/api'
import { clockFor } from '../lib/duty'
import { nextToken, tokenNumber } from '../lib/wait'
import type { Lang, MeshAction, MeshState, Person, Session, Shift } from '../types'

const SESSION_KEY = 'medimesh-session'
const LANG_KEY = 'medimesh-lang'
const DUTY_KEY = 'medimesh-duty'

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const next = raw ? (JSON.parse(raw) as Session) : null
    if (next?.accessToken) setAccessToken(next.accessToken)
    return next
  } catch {
    return null
  }
}

function reducer(state: MeshState, action: MeshAction): MeshState {
  switch (action.type) {
    case 'check-in': {
      const hospital = state.hospitals.find((h) => h.id === action.hospitalId)
      if (!hospital) return state
      const stamp = Date.now()
      const patientId = `walk-${stamp}`
      const token = nextToken(hospital.tokenPrefix, state.queue, action.hospitalId)
      return {
        ...state,
        patients: [
          ...state.patients,
          {
            id: patientId,
            hospitalId: action.hospitalId,
            name: action.name,
            age: action.age,
            sex: 'M',
            condition: 'Walk-in',
            language: 'en',
            ward: 'OPD',
          },
        ],
        queue: [
          ...state.queue,
          {
            id: `q-${stamp}`,
            hospitalId: action.hospitalId,
            patientId,
            token,
            department: action.department,
            status: 'waiting',
            urgent: action.urgent,
            arrivedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }
    }
    case 'call-next': {
      const waiting = state.queue
        .filter((q) => q.hospitalId === action.hospitalId && q.status === 'waiting')
        .sort((a, b) => {
          if (a.urgent !== b.urgent) return Number(b.urgent) - Number(a.urgent)
          const mine = Number(b.doctorId === action.doctorId) - Number(a.doctorId === action.doctorId)
          if (mine !== 0) return mine
          return tokenNumber(a.token) - tokenNumber(b.token)
        })
      const next = waiting[0]
      if (!next) return state
      return {
        ...state,
        queue: state.queue.map((q) =>
          q.id === next.id ? { ...q, status: 'with-doctor', doctorId: action.doctorId } : q,
        ),
        people: state.people.map((p) =>
          p.id === action.doctorId ? { ...p, available: false, nextFree: 'with patient' } : p,
        ),
      }
    }
    case 'send-pharmacy':
      return {
        ...state,
        queue: state.queue.map((q) => (q.id === action.ticketId ? { ...q, status: 'pharmacy' } : q)),
      }
    case 'complete-ticket': {
      const ticket = state.queue.find((q) => q.id === action.ticketId)
      return {
        ...state,
        queue: state.queue.map((q) => (q.id === action.ticketId ? { ...q, status: 'done' } : q)),
        people: state.people.map((p) =>
          ticket?.doctorId && p.id === ticket.doctorId
            ? { ...p, clearedToday: (p.clearedToday ?? 0) + 1, available: true, nextFree: 'now' }
            : p,
        ),
      }
    }
    case 'dispense': {
      const rx = state.prescriptions.find((p) => p.id === action.prescriptionId)
      if (!rx) return state
      return {
        ...state,
        prescriptions: state.prescriptions.map((p) =>
          p.id === action.prescriptionId ? { ...p, status: 'dispensed' } : p,
        ),
        stock: state.stock.map((s) => {
          if (s.hospitalId !== rx.hospitalId) return s
          const rxKey = rx.medicine.toLowerCase()
          const nameKey = s.name.toLowerCase()
          const same =
            rxKey.includes(nameKey) ||
            nameKey.includes(rxKey) ||
            rxKey.split(' ')[0] === nameKey.split(' ')[0]
          if (!same) return s
          return {
            ...s,
            quantity: Math.max(0, s.quantity - 1),
            soldToday: s.soldToday + 1,
            soldWeek: s.soldWeek + 1,
          }
        }),
        queue: state.queue.map((q) =>
          q.hospitalId === rx.hospitalId && q.patientId === rx.patientId && q.status === 'pharmacy'
            ? { ...q, status: 'done' }
            : q,
        ),
      }
    }
    case 'adjust-stock':
      return {
        ...state,
        stock: state.stock.map((s) =>
          s.id === action.stockId ? { ...s, quantity: Math.max(0, s.quantity + action.delta) } : s,
        ),
      }
    case 'add-handover': {
      const id = `h-${Date.now()}`
      return {
        ...state,
        handovers: [
          {
            ...action.handover,
            id,
            createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            signed: false,
          },
          ...state.handovers,
        ],
      }
    }
    case 'sign-handover':
      return {
        ...state,
        handovers: state.handovers.map((h) => (h.id === action.handoverId ? { ...h, signed: true } : h)),
      }
    case 'approve-treatment':
      return {
        ...state,
        treatments: state.treatments.map((t) =>
          t.id === action.treatmentId
            ? { ...t, status: 'approved', approvedAt: 'Just now' }
            : t,
        ),
      }
    case 'update-story':
      return {
        ...state,
        treatments: state.treatments.map((t) =>
          t.id === action.treatmentId
            ? { ...t, story: { ...t.story, [action.lang]: action.story }, status: 'draft' }
            : t,
        ),
      }
    case 'patch-hospital':
      return {
        ...state,
        hospitals: state.hospitals.map((h) =>
          h.id === action.hospitalId ? { ...h, ...action.patch } : h,
        ),
      }
    case 'toggle-doctor':
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.personId
            ? {
                ...p,
                available: !p.available,
                nextFree: p.available ? 'paused' : 'now',
              }
            : p,
        ),
      }
    case 'book-slot': {
      const hospital = state.hospitals.find((h) => h.id === action.hospitalId)
      if (!hospital) return state
      const stamp = Date.now()
      const existingTicket = state.queue.find(
        (q) =>
          q.hospitalId === action.hospitalId &&
          q.patientId === action.patientId &&
          (q.status === 'waiting' || q.status === 'with-doctor'),
      )
      let ticketId = existingTicket?.id
      let token = existingTicket?.token
      let queue = state.queue
      if (action.issueToken) {
        if (existingTicket) {
          queue = state.queue.map((q) =>
            q.id === existingTicket.id
              ? { ...q, doctorId: action.doctorId, department: action.department, source: 'booking' }
              : q,
          )
        } else {
          token = nextToken(hospital.tokenPrefix, state.queue, action.hospitalId)
          ticketId = `q-${stamp}`
          queue = [
            ...state.queue,
            {
              id: ticketId,
              hospitalId: action.hospitalId,
              patientId: action.patientId,
              token,
              department: action.department,
              status: 'waiting' as const,
              urgent: false,
              arrivedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              doctorId: action.doctorId,
              source: 'booking' as const,
            },
          ]
        }
      }
      const appointment = {
        id: `ap-${stamp}`,
        hospitalId: action.hospitalId,
        patientId: action.patientId,
        doctorId: action.doctorId,
        dateLabel: action.dateLabel,
        time: action.time,
        status: 'upcoming' as const,
        token,
        ticketId,
      }
      return {
        ...state,
        queue,
        appointments: [
          appointment,
          ...state.appointments.filter(
            (a) => !(a.patientId === action.patientId && a.status === 'upcoming' && a.hospitalId === action.hospitalId),
          ),
        ],
        people: state.people.map((p) =>
          p.patientId === action.patientId && token ? { ...p, title: `Token ${token}` } : p,
        ),
      }
    }
    case 'apply-cover': {
      const offer = state.coverOffers.find((o) => o.id === action.offerId)
      if (!offer || offer.hospitalId !== action.hospitalId) return state
      const stamp = Date.now()
      const row = {
        id: `app-${stamp}`,
        hospitalId: action.hospitalId,
        patientId: action.patientId,
        offerId: action.offerId,
        nominee: action.nominee,
        relation: action.relation,
        declaredCondition: state.patients.find((p) => p.id === action.patientId)?.condition ?? 'On file',
        status: 'applied' as const,
        appliedAt: new Date().toLocaleString('en-IN'),
        note: 'Desk has the application. This is not a claim and not a diagnosis.',
      }
      return { ...state, coverApps: [row, ...state.coverApps] }
    }
    case 'decide-cover': {
      const app = state.coverApps.find((a) => a.id === action.applicationId)
      if (!app) return state
      if (action.status !== 'issued') {
        return {
          ...state,
          coverApps: state.coverApps.map((a) =>
            a.id === action.applicationId ? { ...a, status: action.status, note: action.note } : a,
          ),
        }
      }
      const offer = state.coverOffers.find((o) => o.id === app.offerId)
      const hospital = state.hospitals.find((h) => h.id === app.hospitalId)
      if (!offer || !hospital) return state
      const policyId = `pol-${Date.now()}`
      const policy = {
        id: policyId,
        hospitalId: app.hospitalId,
        patientId: app.patientId,
        policyNumber: `MM-${hospital.tokenPrefix}-${String(Date.now()).slice(-5)}`,
        provider: offer.provider,
        planName: offer.planName,
        cashless: offer.cashless,
        coveragePercent: offer.coveragePercent,
        sumInsured: offer.sumInsured,
        premium: offer.premiumYear,
        validFrom: '30 Sep 2026',
        validTill: '29 Sep 2027',
        waitingDays: offer.waitingDays,
        networkHospital: true,
      }
      return {
        ...state,
        policies: [policy, ...state.policies],
        coverApps: state.coverApps.map((a) =>
          a.id === action.applicationId
            ? { ...a, status: 'issued', note: action.note, policyId }
            : a,
        ),
      }
    }
    case 'request-cashless': {
      const policy = state.policies.find((p) => p.patientId === action.patientId)
      if (!policy) return state
      const existing = state.claims.find((c) => c.patientId === action.patientId && c.status === 'draft')
      if (existing) {
        return {
          ...state,
          claims: state.claims.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  status: 'pre-auth',
                  checkNote: 'Cashless asked for today’s visit at this hospital. Desk runs IF–THEN, not a billed claim pack.',
                }
              : c,
          ),
        }
      }
      const visit = state.appointments.find((a) => a.patientId === action.patientId && a.status === 'upcoming')
      const doctor = state.people.find((p) => p.id === visit?.doctorId)
      return {
        ...state,
        claims: [
          {
            id: `cs-${Date.now()}`,
            hospitalId: policy.hospitalId,
            patientId: action.patientId,
            policyId: policy.id,
            reference: `MM-CS-${String(Date.now()).slice(-4)}`,
            status: 'pre-auth',
            visitLabel: visit ? `${visit.dateLabel} · ${visit.time}` : 'Today’s OPD at this hospital',
            doctorName: doctor?.name ?? 'Duty doctor',
            checkNote: 'Cashless asked for this visit. Not a diagnosis. Not a claim-rejection agent.',
          },
          ...state.claims,
        ],
      }
    }
    default:
      return state
  }
}

type MeshCtx = {
  state: MeshState
  dispatch: (action: MeshAction) => void
  session: Session | null
  person: Person | null
  lang: Lang
  setLang: (lang: Lang) => void
  dutyShift: Shift
  clockLabel: string
  setDutyShift: (shift: Shift) => void
  enter: (person: Person, accessToken?: string) => void
  signOut: () => void
}

const Ctx = createContext<MeshCtx | null>(null)

export function MeshProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, seed)
  const [session, setSession] = useState<Session | null>(loadSession)
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = sessionStorage.getItem(LANG_KEY)
    return stored === 'hi' || stored === 'te' || stored === 'en' ? stored : 'en'
  })
  const [dutyShift, setDutyShiftState] = useState<Shift>(() =>
    sessionStorage.getItem(DUTY_KEY) === 'night' ? 'night' : 'day',
  )
  const clockLabel = clockFor(dutyShift)

  const person = useMemo(
    () => state.people.find((p) => p.id === session?.personId) ?? null,
    [state.people, session],
  )

  const value = useMemo<MeshCtx>(
    () => ({
      state,
      dispatch,
      session,
      person,
      lang,
      dutyShift,
      clockLabel,
      setDutyShift: (next) => {
        sessionStorage.setItem(DUTY_KEY, next)
        setDutyShiftState(next)
      },
      setLang: (next) => {
        sessionStorage.setItem(LANG_KEY, next)
        setLangState(next)
      },
      enter: (who, accessToken) => {
        const next: Session = {
          personId: who.id,
          hospitalId: who.hospitalId,
          role: who.role,
          accessToken,
          tokenSource: accessToken ? 'jwt' : 'local',
        }
        setAccessToken(accessToken ?? null)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
        setSession(next)
      },
      signOut: () => {
        setAccessToken(null)
        sessionStorage.removeItem(SESSION_KEY)
        setSession(null)
      },
    }),
    [state, session, person, lang, dutyShift, clockLabel],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMesh() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMesh outside provider')
  return ctx
}
