import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { FlowPage } from './pages/AdminPage'
import { BookPage } from './pages/BookPage'
import { HealthPage } from './pages/HealthPage'
import { HospitalsPage } from './pages/HospitalsPage'
import { LoginPage } from './pages/LoginPage'
import { HandoverPage } from './pages/NursePage'
import { PatientRecord, PatientsListPage } from './pages/PatientRecord'
import { OrdersPage, PharmacistPage } from './pages/PharmacistPage'
import { ProfilePage } from './pages/ProfilePage'
import { ReportsPage } from './pages/ReportsPage'
import { RxPage } from './pages/RxPage'
import { AiPage } from './pages/AiPage'
import { DatabasePage } from './pages/DatabasePage'
import { InsurancePage } from './pages/InsurancePage'
import { Workspace } from './pages/Workspace'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<Shell />}>
          <Route index element={<Workspace />} />
          <Route path="book" element={<BookPage />} />
          <Route path="rx" element={<RxPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="patients" element={<PatientsListPage />} />
          <Route path="patients/:id" element={<PatientRecord />} />
          <Route path="handover" element={<HandoverPage />} />
          <Route path="inventory" element={<PharmacistPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="flow" element={<FlowPage />} />
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="ai" element={<AiPage />} />
          <Route path="database" element={<DatabasePage />} />
          <Route path="insurance" element={<InsurancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
