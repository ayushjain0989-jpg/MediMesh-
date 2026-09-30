import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from hospital_flow import FlowInputs, simulate_flow


class HospitalFlowTests(unittest.TestCase):
    def setUp(self):
        self.base = FlowInputs(
            hospitalId="sunrise",
            hospitalName="Sunrise",
            waitingCount=10,
            avgConsultMinutes=12,
            doctorsOnDuty=2,
            emergencyArrivals=0,
            emergencyDivertMinutes=8,
            pharmacyQueue=0,
            avgDispenseMinutes=4,
            pharmacistsOnDuty=2,
            stockouts=0,
            staffOnDuty=12,
            targetStaff=12,
            occupancy=0.5,
            nearHandover=False,
        )

    def test_consult_formula(self):
        result = simulate_flow(self.base)
        consult = next(s for s in result.steps if s.id == "consult")
        self.assertEqual(consult.value, 60.0)
        self.assertEqual(result.predictedMinutes, 60.0)

    def test_handover_penalty(self):
        open_clinic = simulate_flow(self.base)
        handing = simulate_flow(
            FlowInputs(
                hospitalId="sunrise",
                hospitalName="Sunrise",
                waitingCount=10,
                avgConsultMinutes=12,
                doctorsOnDuty=2,
                staffOnDuty=12,
                targetStaff=12,
                occupancy=0.5,
                nearHandover=True,
            )
        )
        self.assertAlmostEqual(handing.predictedMinutes, round(open_clinic.predictedMinutes * 1.12, 1))


if __name__ == "__main__":
    unittest.main()
