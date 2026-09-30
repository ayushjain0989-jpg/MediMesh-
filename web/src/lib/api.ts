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
  if (base) return `${base}${path}`
  if (import.meta.env.DEV) return `/api${path}`
  return null
}

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function withTimeout(ms: number) {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), ms)
  return { signal: ctrl.signal, cancel: () => window.clearTimeout(timer) }
}

export async function loginRemote(role: Role, loginId: string, password: string): Promise<LoginRemoteOk | LoginRemoteFail> {
  const url = apiUrl('/auth/login')
  if (!url) return { ok: false, network: true, error: 'API not configured' }
  const wait = withTimeout(2500)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, loginId: loginId.trim(), password }),
      signal: wait.signal,
    })
    const data = (await res.json().catch(() => null)) as {
      detail?: string | { msg?: string }[]
      access_token?: string
      user?: RemoteUser
    } | null
    if (!data || typeof data !== 'object' || !data.access_token || !data.user) {
      const detail = Array.isArray(data?.detail) ? data.detail[0]?.msg : data?.detail
      return {
        ok: false,
        network: res.status !== 401,
        error: detail || (res.status === 401 ? 'Wrong ID or password.' : 'API unreachable'),
      }
    }
    return { ok: true, accessToken: data.access_token, user: data.user }
  } catch {
    return { ok: false, network: true, error: 'API unreachable' }
  } finally {
    wait.cancel()
  }
}

export async function fetchFlow(inputs: FlowInputs): Promise<FlowResult> {
  const url = apiUrl('/analytics/flow')
  if (!url) return simulateFlow(inputs, 'local')
  const wait = withTimeout(2500)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(inputs),
      signal: wait.signal,
    })
    if (!res.ok) throw new Error('analytics down')
    const data = (await res.json()) as FlowResult
    return { ...data, source: 'fastapi' }
  } catch {
    return simulateFlow(inputs, 'local')
  } finally {
    wait.cancel()
  }
}
