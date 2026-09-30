# MediMesh AI

Affordable multi-hospital platform with **explainable** wait times and **plain-language** treatment notes — not a generic HMS clone.

## What makes this different

Hospitals today hide the wait and speak in medical jargon. MediMesh works more like Rapido: one screen tells a patient **how long**, **who is free**, and **what the tablet actually does**.

1. **HospitalFlow AI** — wait time from named inputs (queue, doctors, pharmacy, stock-outs, handover). Every formula is shown.
2. **Care explainer** — what is happening to you, what the medicine does, how you recover. English / हिन्दी / తెలుగు + read-aloud. Doctor must approve.
3. **Role dashboards** — patient, doctor (waiting / with you / cleared), nurse (day & night handover), pharmacist (in / low / out + fast sellers), receptionist, administrator.
4. **Three hospitals, one app** — Sunrise Care (Hyderabad), Lotus Multispecialty (Vijayawada), Arogya Community (Warangal). Staff, queues, and stock do not leak. Only anonymised demand is pooled so the mesh can buy common tablets cheaper.

## Preview locally

Terminal 1 — web app:

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in with a role tab, user ID, and password. The portal asks FastAPI for a **JWT** (`POST /auth/login`).

Demo password for every account: `mesh123`

| Role | User ID | Person |
| --- | --- | --- |
| Patient | `PT-SUN-101` | Ananya Reddy |
| Doctor | `DR-SUN-201` | Dr. Meera Iyer |
| Nurse | `NR-SUN-301` | Kavitha Rao |
| Pharmacist | `PH-SUN-401` | Ramesh Kulkarni |
| Admin | `AD-SUN-601` | Sanjay Varma |

Terminal 2 — FastAPI (JWT + HospitalFlow). Needed for token login:

```bash
cd analytics
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Vite proxies `/api` to this service. If FastAPI is down, the website still signs in locally (no JWT).

If FastAPI is running, HospitalFlow badges **Analytics service** and login stores a Bearer token. If not, it badges **On-device model**.

## Deploy (optional)

- **Frontend (Vercel)** — import the repo, set Root Directory to `web`, add env `VITE_API_URL` = your Render URL (no trailing slash).
- **Backend (Render)** — `render.yaml` at the repo root. Set `JWT_SECRET` and `CORS_ORIGINS` to your Vercel URL (plus localhost for testing).

## Click-through for a viva / demo

1. Login → Patient tab → `PT-SUN-101` / `mesh123` (Ananya Reddy) — Rapido-style ETA, doctor room, then “what is happening / what this medicine does / how you get better”. Tap **Read aloud**. Switch हिन्दी / తెలుగు.
2. Sign out → Doctor tab → `DR-SUN-201` / `mesh123` (Dr. Meera Iyer) — waiting vs cleared, **Call next**, approve explainers.
3. Nurse `NR-SUN-301` (day) vs `NR-SUN-302` (night) — incoming report from the other shift, write and sign handover.
4. Pharmacist `PH-SUN-401` — which strips are in / low / out, what sold this week, mesh demand across three hospitals.
5. Desk `RC-SUN-501` or Admin `AD-SUN-601` — walk-in check-in, then staffing sliders; formula recalculates.
6. Switch hospital with Arogya pharmacist `PH-ARO-401` — Amlodipine is **out**. That hospital cannot see Sunrise stock.

## Stack

- Web: React + TypeScript + Vite + Tailwind
- Analytics: Python FastAPI (`analytics/hospital_flow.py` matches `web/src/lib/hospitalFlow.ts`)
- Data: in-memory demo seed now; `supabase/schema.sql` ready for tenant isolation later

## HospitalFlow formula

```
consult   = waiting × avg consult ÷ max(doctors, 1)
emergency = arrivals × divert minutes
pharmacy  = Rx queue × avg dispense ÷ max(pharmacists, 1)
stock     = stock-outs × 6 min
staff     = 1 + 0.40 × max(0, 1 − staff/target)
handover  = 1.12 if near shift change else 1
crowd     = 1 + 0.50 × max(0, occupancy − 0.80)

total = (consult + emergency + pharmacy + stock) × staff × handover × crowd
p80   = total + 0.84 × 0.18 × total
```
