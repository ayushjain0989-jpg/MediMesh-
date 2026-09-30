# MediMesh AI

Explainable multi-hospital OPD portal. Wait times come from a named formula. Care Copilot is IF–THEN, not ChatGPT. Cover desk is apply/offer at this hospital.

Live: https://web-ten-drab-cljuc58g0u.vercel.app

## Demo

Password: `mesh123` · Patient `PT-SUN-101` · Doctor `DR-SUN-201` · Admin `AD-SUN-601`

## Tests

```bash
npm test
```

HospitalFlow: consult = waiting × minutes ÷ doctors, then pharmacy, stock-out, handover 1.12, crowd. Python FastAPI uses the same numbers (`../analytics`).

Vercel build runs tests before `vite build`.
