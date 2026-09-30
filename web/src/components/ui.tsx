import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function IconHome(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  )
}
export function IconCal(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  )
}
export function IconHeart(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z" />
    </svg>
  )
}
export function IconUser(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.2-3 3.8-4.5 7-4.5S17.8 16 19 19" />
    </svg>
  )
}
export function IconUsers(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.4" />
      <path d="M4 19c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5M14 19c.4-2 1.6-3.2 3.5-3.2 1.6 0 2.7.8 3.5 3.2" />
    </svg>
  )
}
export function IconChart(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-4M12 15V8M16 15v-6" />
    </svg>
  )
}
export function IconBox(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 8 12 4l8 4-8 4-8-4Z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  )
}
export function IconList(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 7h12M8 12h12M8 17h12" />
      <circle cx="4" cy="7" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}
export function IconSpark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3v4M12 17v4M4.9 6.5 7.7 8.3M16.3 15.7l2.8 1.8M3 12h4M17 12h4M4.9 17.5 7.7 15.7M16.3 8.3l2.8-1.8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
export function IconBuilding(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h8" />
    </svg>
  )
}
export function IconCheck(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 13.5 9.5 18 19 7" />
    </svg>
  )
}
export function IconBack(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  )
}
export function IconSearch(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
export function IconBell(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 16h12l-1.2-2.2A6 6 0 0 1 16 10V9a4 4 0 1 0-8 0v1a6 6 0 0 1-0.8 3.8L6 16Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  )
}
export function IconPlus(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
      <path d="M12 6v12M6 12h12" strokeLinecap="round" />
    </svg>
  )
}

export function Avatar({ name, hue, size = 44 }: { name: string; hue?: string; size?: number }) {
  const initials = name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: hue ?? '#2f6fed', fontSize: size * 0.34 }}
    >
      {initials}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-shadow rounded-2xl bg-white p-4 ${className}`}>{children}</div>
}

export function Badge({
  children,
  tone = 'blue',
}: {
  children: ReactNode
  tone?: 'blue' | 'green' | 'amber' | 'rose' | 'gray'
}) {
  const map = {
    blue: 'bg-blue-50 text-brand',
    green: 'bg-emerald-50 text-mint',
    amber: 'bg-amber-50 text-amber',
    rose: 'bg-rose-50 text-rose',
    gray: 'bg-slate-100 text-muted',
  }
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[tone]}`}>{children}</span>
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 card-shadow">
      <IconSearch className="h-5 w-5 text-muted" />
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function firstName(full: string) {
  return full.replace(/^Dr\.\s*/, '').split(' ')[0]
}
