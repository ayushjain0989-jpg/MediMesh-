import { ExplainerCard } from '../components/ExplainerCard'
import { scoped } from '../lib/selectors'
import { useMesh } from '../state/MeshContext'

export function ReportsPage() {
  const { state, session, person, lang, dispatch } = useMesh()
  if (!session || !person) return null
  const treatments = scoped(state.treatments, session.hospitalId)
  return (
    <div className="space-y-4 px-5 pt-2">
      <h1 className="text-xl font-extrabold">Reports & explainers</h1>
      {treatments.map((tr) => (
        <ExplainerCard
          key={tr.id}
          treatment={tr}
          lang={lang}
          doctor={state.people.find((p) => p.id === tr.doctorId)}
          onApprove={person.role === 'doctor' ? () => dispatch({ type: 'approve-treatment', treatmentId: tr.id }) : undefined}
        />
      ))}
    </div>
  )
}
