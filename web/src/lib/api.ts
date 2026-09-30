import type { FlowInputs, FlowResult, Role } from '../types'
import { simulateFlow } from './hospitalFlow'

const TOKEN_KEY = 'medimesh-jwt'

export type RemoteUser = {
  id: string
  login_id: string
  role: Role
  hospital_id: string
  name: string
}

export type LoginRemoteOk = {
  ok: true
  accessToken: string
  user: RemoteUser
}

export type LoginRemoteFail = {
  ok: false
  error: string
  network?: boolean
}

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export function decodeJwt(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } | null {
  try {
    const [header, payload] = token.split('.')
    if (!header || !payload) return null
    return { header: jsonFromB64(header), payload: jsonFromB64(payload) }
  } catch {
    return null
  }
}

function jsonFromB64(part: string) {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((part.length + 3) % 4)
  return JSON.parse(atob(padded)) as Record<string, unknown>
}

function apiUrl(path: string) {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
  return base ? `${base}${path}` : `/api${path}`
}

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function loginRemote(role: Role, loginId: string, password: string): Promise<LoginRemoteOk | LoginRemoteFail> {
  try {
    const res = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, loginId, password }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      detail?: string | { msg?: string }[]
      access_token?: string
      user?: RemoteUser
    }
    if (!res.ok || !data.access_token || !data.user) {
      const detail = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail
      return { ok: false, error: detail || 'Sign-in failed.' }
    }
    return { ok: true, accessToken: data.access_token, user: data.user }
  } catch {
    return { ok: false, network: true, error: 'API unreachable' }
  }
}

export async function fetchFlow(inputs: FlowInputs): Promise<FlowResult> {
  try {
    const res = await fetch(apiUrl('/analytics/flow'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(inputs),
    })
    if (!res.ok) throw new Error('analytics down')
    const data = (await res.json()) as FlowResult
    return { ...data, source: 'fastapi' }
  } catch {
    return simulateFlow(inputs, 'local')
  }
}
