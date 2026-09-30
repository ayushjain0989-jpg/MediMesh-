import { NavLink } from 'react-router-dom'
import type { Role } from '../types'
import {
  IconBox,
  IconBuilding,
  IconCal,
  IconChart,
  IconCheck,
  IconHeart,
  IconHome,
  IconList,
  IconSpark,
  IconUser,
  IconUsers,
} from './ui'

type Tab = { to: string; label: string; icon: typeof IconHome; end?: boolean }

const tabs: Record<Role, Tab[]> = {
  patient: [
    { to: '/app', label: 'Home', icon: IconHome, end: true },
    { to: '/app/book', label: 'Appointments', icon: IconCal },
    { to: '/app/health', label: 'Reports', icon: IconHeart },
    { to: '/app/insurance', label: 'Cover', icon: IconCheck },
    { to: '/app/ai', label: 'Copilot', icon: IconSpark },
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
  doctor: [
    { to: '/app', label: 'Home', icon: IconHome, end: true },
    { to: '/app/patients', label: 'Patients', icon: IconUsers },
    { to: '/app/reports', label: 'Reports', icon: IconChart },
    { to: '/app/ai', label: 'Copilot', icon: IconSpark },
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
  nurse: [
    { to: '/app', label: 'Home', icon: IconHome, end: true },
    { to: '/app/patients', label: 'Patients', icon: IconUsers },
    { to: '/app/handover', label: 'Tasks', icon: IconCheck },
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
  pharmacist: [
    { to: '/app', label: 'Home', icon: IconHome, end: true },
    { to: '/app/inventory', label: 'Inventory', icon: IconBox },
    { to: '/app/orders', label: 'Orders', icon: IconList },
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
  receptionist: [
    { to: '/app', label: 'Home', icon: IconHome, end: true },
    { to: '/app/book', label: 'Appointments', icon: IconCal },
    { to: '/app/patients', label: 'Queue', icon: IconUsers },
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
  administrator: [
    { to: '/app', label: 'Home', icon: IconHome, end: true },
    { to: '/app/flow', label: 'AI', icon: IconSpark },
    { to: '/app/hospitals', label: 'Hospitals', icon: IconBuilding },
    { to: '/app/database', label: 'Database', icon: IconList },
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
}

export function AppNav({ role }: { role: Role }) {
  return (
    <nav className="flex flex-1 flex-wrap items-center justify-center gap-1 text-sm font-semibold text-muted">
      {tabs[role].map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                isActive ? 'bg-brand text-white' : 'hover:text-ink'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
