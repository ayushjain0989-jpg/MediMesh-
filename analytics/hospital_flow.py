from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

STAFF_ALPHA = 0.40
HANDOVER_FACTOR = 1.12
CROWD_BETA = 0.50
CROWD_THRESHOLD = 0.80
STOCKOUT_MINUTES = 6
SIGMA_RATIO = 0.18


class FlowInputs(BaseModel):
    hospitalId: str
    hospitalName: str = ""
    waitingCount: int = 0
    avgConsultMinutes: float = 12
    doctorsOnDuty: int = 1
    emergencyArrivals: int = 0
    emergencyDivertMinutes: float = 8
    pharmacyQueue: int = 0
    avgDispenseMinutes: float = 5
    pharmacistsOnDuty: int = 1
    stockouts: int = 0
    staffOnDuty: int = 10
    targetStaff: int = 12
    occupancy: float = 0.7
    nearHandover: bool = False


class FlowStep(BaseModel):
    id: str
    label: str
    formula: str
    substitution: str
    value: float
    unit: str
    kind: Literal["add", "multiply", "result"]


class FlowResult(BaseModel):
    hospitalId: str
    predictedMinutes: float
    p50: float
    p80: float
    steps: list[FlowStep]
    warnings: list[str] = Field(default_factory=list)
    source: Literal["fastapi", "local"] = "fastapi"


def _r(n: float) -> float:
    return round(n, 1)


def simulate_flow(inputs: FlowInputs) -> FlowResult:
    doctors = max(inputs.doctorsOnDuty, 1)
    pharmacists = max(inputs.pharmacistsOnDuty, 1)
    staff_ratio = 1.0 if inputs.targetStaff <= 0 else inputs.staffOnDuty / inputs.targetStaff

    consult = (inputs.waitingCount * inputs.avgConsultMinutes) / doctors
    emergency = inputs.emergencyArrivals * inputs.emergencyDivertMinutes
    pharmacy = (inputs.pharmacyQueue * inputs.avgDispenseMinutes) / pharmacists
    stock = inputs.stockouts * STOCKOUT_MINUTES
    additive = consult + emergency + pharmacy + stock

    staff_factor = 1 + STAFF_ALPHA * max(0.0, 1 - staff_ratio)
    handover_factor = HANDOVER_FACTOR if inputs.nearHandover else 1.0
    crowd_over = max(0.0, inputs.occupancy - CROWD_THRESHOLD)
    crowd_factor = 1 + CROWD_BETA * crowd_over

    predicted = additive * staff_factor * handover_factor * crowd_factor
    sigma = SIGMA_RATIO * predicted
    p50 = predicted
    p80 = predicted + 0.84 * sigma

    warnings: list[str] = []
    if inputs.doctorsOnDuty <= 0:
        warnings.append("No doctor on duty — denominator floored at 1 and a staffing penalty is applied.")
    if inputs.pharmacistsOnDuty <= 0:
        warnings.append("No pharmacist on duty — pharmacy wait uses a floor of 1 and staffing penalty still applies.")
    if inputs.stockouts > 0:
        warnings.append(f"{inputs.stockouts} stock-out(s) add substitution delay.")
    if inputs.nearHandover:
        warnings.append("Shift handover window is open — 12% overlap penalty.")

    steps = [
        FlowStep(
            id="consult",
            label="Consult wait",
            formula="waiting × avg consult ÷ max(doctors, 1)",
            substitution=f"{inputs.waitingCount} × {inputs.avgConsultMinutes} ÷ {doctors}",
            value=_r(consult),
            unit="min",
            kind="add",
        ),
        FlowStep(
            id="emergency",
            label="Emergency divert",
            formula="emergency arrivals × divert minutes",
            substitution=f"{inputs.emergencyArrivals} × {inputs.emergencyDivertMinutes}",
            value=_r(emergency),
            unit="min",
            kind="add",
        ),
        FlowStep(
            id="pharmacy",
            label="Pharmacy wait",
            formula="Rx queue × avg dispense ÷ max(pharmacists, 1)",
            substitution=f"{inputs.pharmacyQueue} × {inputs.avgDispenseMinutes} ÷ {pharmacists}",
            value=_r(pharmacy),
            unit="min",
            kind="add",
        ),
        FlowStep(
            id="stock",
            label="Stock-out substitution",
            formula="stock-outs × 6 min",
            substitution=f"{inputs.stockouts} × {STOCKOUT_MINUTES}",
            value=_r(stock),
            unit="min",
            kind="add",
        ),
        FlowStep(
            id="staff",
            label="Staffing factor",
            formula="1 + 0.40 × max(0, 1 − staff/target)",
            substitution=f"1 + 0.40 × max(0, 1 − {inputs.staffOnDuty}/{inputs.targetStaff})",
            value=_r(staff_factor),
            unit="×",
            kind="multiply",
        ),
        FlowStep(
            id="handover",
            label="Handover overlap",
            formula="1.12 if near shift change, else 1.00",
            substitution="1.12" if inputs.nearHandover else "1.00",
            value=_r(handover_factor),
            unit="×",
            kind="multiply",
        ),
        FlowStep(
            id="crowd",
            label="Crowd factor",
            formula="1 + 0.50 × max(0, occupancy − 0.80)",
            substitution=f"1 + 0.50 × max(0, {inputs.occupancy:.2f} − 0.80)",
            value=_r(crowd_factor),
            unit="×",
            kind="multiply",
        ),
        FlowStep(
            id="total",
            label="Predicted total wait",
            formula="(consult + emergency + pharmacy + stock) × staff × handover × crowd",
            substitution=(
                f"({_r(consult)} + {_r(emergency)} + {_r(pharmacy)} + {_r(stock)}) × "
                f"{_r(staff_factor)} × {_r(handover_factor)} × {_r(crowd_factor)}"
            ),
            value=_r(predicted),
            unit="min",
            kind="result",
        ),
    ]

    return FlowResult(
        hospitalId=inputs.hospitalId,
        predictedMinutes=_r(predicted),
        p50=_r(p50),
        p80=_r(p80),
        steps=steps,
        warnings=warnings,
        source="fastapi",
    )
