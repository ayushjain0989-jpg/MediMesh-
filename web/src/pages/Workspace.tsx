import { Navigate } from 'react-router-dom'
import { AdminPage } from './AdminPage'
import { DoctorPage } from './DoctorPage'
import { NursePage } from './NursePage'
import { PatientPage } from './PatientPage'
import { PharmacistPage } from './PharmacistPage'
import { ReceptionistPage } from './ReceptionistPage'
import { useMesh } from '../state/MeshContext'

export function Workspace() {
  const { session } = useMesh()
  if (!session) return <Navigate to="/" replace />
  switch (session.role) {
    case 'patient':
      return <PatientPage />
    case 'doctor':
      return <DoctorPage />
    case 'nurse':
      return <NursePage />
    case 'pharmacist':
      return <PharmacistPage />
    case 'receptionist':
      return <ReceptionistPage />
    case 'administrator':
      return <AdminPage />
    default:
      return <Navigate to="/" replace />
  }
}
