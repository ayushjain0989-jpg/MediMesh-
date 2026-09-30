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
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
  doctor: [
    { to: '/app', label: 'Home', icon: IconHome, end: true },
    { to: '/app/patients', label: 'Patients', icon: IconUsers },
    { to: '/app/reports', label: 'Reports', icon: IconChart },
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
    { to: '/app/profile', label: 'Profile', icon: IconUser },
  ],
}

export function BottomNav({ role }: { role: Role }) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 pb-3 pt-1 backdrop-blur">
      <ul className="grid grid-cols-4">
        {tabs[role].map((tab) => {
          const Icon = tab.icon
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                    isActive ? 'text-brand' : 'text-muted'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
