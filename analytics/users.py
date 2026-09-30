from __future__ import annotations

from typing import Optional, Tuple

DEMO_PASSWORD = "mesh123"

USERS = [
    {"id": "sun-p", "login_id": "PT-SUN-101", "role": "patient", "hospital_id": "sunrise", "name": "Ananya Reddy"},
    {"id": "sun-d", "login_id": "DR-SUN-201", "role": "doctor", "hospital_id": "sunrise", "name": "Dr. Meera Iyer"},
    {"id": "sun-d2", "login_id": "DR-SUN-202", "role": "doctor", "hospital_id": "sunrise", "name": "Dr. Rajesh Kumar"},
    {"id": "sun-d3", "login_id": "DR-SUN-203", "role": "doctor", "hospital_id": "sunrise", "name": "Dr. Ananya Sharma"},
    {"id": "sun-d4", "login_id": "DR-SUN-204", "role": "doctor", "hospital_id": "sunrise", "name": "Dr. Nisha Rao"},
    {"id": "sun-d5", "login_id": "DR-SUN-205", "role": "doctor", "hospital_id": "sunrise", "name": "Dr. Arjun Pal"},
    {"id": "sun-n-day", "login_id": "NR-SUN-301", "role": "nurse", "hospital_id": "sunrise", "name": "Kavitha Rao"},
    {"id": "sun-n-night", "login_id": "NR-SUN-302", "role": "nurse", "hospital_id": "sunrise", "name": "Imran Shaik"},
    {"id": "sun-ph", "login_id": "PH-SUN-401", "role": "pharmacist", "hospital_id": "sunrise", "name": "Ramesh Kulkarni"},
    {"id": "sun-r", "login_id": "RC-SUN-501", "role": "receptionist", "hospital_id": "sunrise", "name": "Priya Menon"},
    {"id": "sun-a", "login_id": "AD-SUN-601", "role": "administrator", "hospital_id": "sunrise", "name": "Sanjay Varma"},
    {"id": "lot-p", "login_id": "PT-LOT-101", "role": "patient", "hospital_id": "lotus", "name": "Suresh Babu"},
    {"id": "lot-d", "login_id": "DR-LOT-201", "role": "doctor", "hospital_id": "lotus", "name": "Dr. Lakshmi Naidu"},
    {"id": "lot-n-day", "login_id": "NR-LOT-301", "role": "nurse", "hospital_id": "lotus", "name": "Fathima Begum"},
    {"id": "lot-n-night", "login_id": "NR-LOT-302", "role": "nurse", "hospital_id": "lotus", "name": "Arjun Prasad"},
    {"id": "lot-ph", "login_id": "PH-LOT-401", "role": "pharmacist", "hospital_id": "lotus", "name": "Nandini Rao"},
    {"id": "lot-r", "login_id": "RC-LOT-501", "role": "receptionist", "hospital_id": "lotus", "name": "Chaitanya"},
    {"id": "lot-a", "login_id": "AD-LOT-601", "role": "administrator", "hospital_id": "lotus", "name": "Revathi G"},
    {"id": "aro-p", "login_id": "PT-ARO-101", "role": "patient", "hospital_id": "arogya", "name": "Lakshmi Devi"},
    {"id": "aro-d", "login_id": "DR-ARO-201", "role": "doctor", "hospital_id": "arogya", "name": "Dr. Harish Patel"},
    {"id": "aro-n-day", "login_id": "NR-ARO-301", "role": "nurse", "hospital_id": "arogya", "name": "Swathi"},
    {"id": "aro-n-night", "login_id": "NR-ARO-302", "role": "nurse", "hospital_id": "arogya", "name": "Raju"},
    {"id": "aro-ph", "login_id": "PH-ARO-401", "role": "pharmacist", "hospital_id": "arogya", "name": "Bhavani"},
    {"id": "aro-r", "login_id": "RC-ARO-501", "role": "receptionist", "hospital_id": "arogya", "name": "Kiran"},
    {"id": "aro-a", "login_id": "AD-ARO-601", "role": "administrator", "hospital_id": "arogya", "name": "Padma N"},
]


def authenticate(login_id: str, password: str, role: str) -> Tuple[Optional[dict], Optional[str]]:
    code = login_id.strip().upper()
    if not code or not password:
        return None, "Enter your user ID and password."
    user = next((u for u in USERS if u["login_id"] == code), None)
    if user is None:
        return None, "Unknown user ID. Check the demo accounts below."
    if user["role"] != role:
        return None, f"This ID belongs to a {user['role']} account. Switch the tab above."
    if password != DEMO_PASSWORD:
        return None, "Wrong password. Demo password is mesh123."
    return user, None
