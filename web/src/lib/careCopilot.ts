import type { CopilotUrgency, Lang, Person, Shift } from '../types'

export type { CopilotUrgency }

export type CopilotHit = {
  title: Localized
  meaning: Localized
  next: Localized
  specialty: string
  doctorId?: string
  nurseId?: string
  urgency: CopilotUrgency
  disclaimer: Localized
}

export type CopilotDuty = {
  shift: Shift
  clinicOpen: boolean
  clinicOpenAt: string
  hospitalName: string
  doctors: Person[]
  nightNurse?: Person
}

type Localized = Record<Lang, string>

export function routeCare(raw: string, duty: CopilotDuty): CopilotHit {
  const text = raw.toLowerCase()
  const all = duty.doctors
  const onDuty = all.filter((d) => (d.shift ?? 'day') === duty.shift && d.available !== false)
  const pool = duty.clinicOpen ? onDuty : all
  const gp =
    pool.find((d) => d.specialty === 'General Physician') ??
    all.find((d) => d.specialty === 'General Physician') ??
    all.find((d) => d.role === 'doctor')
  const cardio = pool.find((d) => d.specialty === 'Cardiology') ?? all.find((d) => d.specialty === 'Cardiology')
  const derm = pool.find((d) => d.specialty === 'Dermatology') ?? all.find((d) => d.specialty === 'Dermatology')
  const ortho = pool.find((d) => d.specialty === 'Orthopedics') ?? all.find((d) => d.specialty === 'Orthopedics')
  const nurse = duty.nightNurse
  const opens = duty.clinicOpenAt
  const night = duty.shift === 'night' || !duty.clinicOpen

  if (isEmergency(text)) {
    return pack(
      'Emergency — not an OPD booking',
      'Chest tightness, crushing pain, one-sided weakness, or a sudden severe headache is casualty care. Booking a specialist slot would waste time.',
      night
        ? `Go to emergency at ${duty.hospitalName} now. Night duty can start oxygen and an ECG. Do not wait for morning OPD.`
        : `Go to emergency at ${duty.hospitalName} now. Do not take an OPD token for this.`,
      'Emergency',
      undefined,
      'emergency',
      nurse?.id,
    )
  }

  if (/thirst|tired|sugar|diabetes|शुगर|చక్కెర|పిపాస/.test(text)) {
    if (night) {
      return pack(
        'Sugar-related tiredness · night duty',
        'Feeling thirsty and tired often happens when sugar stays high. That is a diabetes follow-up, not a heart emergency by itself. OPD doctors are off this shift.',
        nurse && gp
          ? `${nurse.name} (night duty) can check your sugar now. ${gp.name}'s clinic opens at ${opens} — book that, do not sit in a closed OPD queue. Keep Metformin for after breakfast unless a doctor changes it.`
          : `Night duty can check sugar now. Book general clinic when it opens at ${opens}.`,
        'General Physician',
        gp?.id,
        'night-hold',
        nurse?.id,
      )
    }
    return pack(
      'Sugar-related tiredness',
      'Feeling thirsty and tired often happens when sugar stays high in the blood. That matches a diabetes follow-up, not a heart emergency by itself.',
      gp
        ? `See ${gp.name} in general clinic — they are on this shift. Keep taking Metformin after food unless the doctor changes it.`
        : 'See the general doctor on duty. Keep taking Metformin after food unless the doctor changes it.',
      'General Physician',
      gp?.id,
      'routine',
    )
  }

  if (/pressure|bp|रक्तचाप|రక్తపోటు/.test(text)) {
    if (night) {
      return pack(
        'Blood pressure check · night duty',
        'A routine pressure review is cardiology or GP in the morning. Very high pressure with chest pain or one-sided weakness is emergency.',
        nurse && gp
          ? `${nurse.name} can repeat your BP now. Book ${cardio?.name ?? gp.name} when clinic opens at ${opens}.`
          : `Night duty can repeat BP. Book clinic at ${opens}.`,
        cardio ? 'Cardiology' : 'General Physician',
        cardio?.id ?? gp?.id,
        'night-hold',
        nurse?.id,
      )
    }
    return pack(
      'Heart / blood pressure check',
      'High pressure needs a doctor who looks after the heart and vessels. Pain, one-sided weakness, or a sudden bad headache is emergency care — not this queue.',
      cardio
        ? `${cardio.name} (Cardiology) is on the day roster. Use your GP if this is only a regular BP review.`
        : 'See the general doctor on this shift.',
      cardio ? 'Cardiology' : 'General Physician',
      cardio?.id ?? gp?.id,
      'routine',
    )
  }

  if (/fever|hot|child|बुखार|జ్వరం/.test(text)) {
    if (night) {
      return pack(
        'Fever · night duty',
        'Fever means the body is fighting. Most simple fevers need rest, fluids, and paracetamol — not an antibiotic by default. OPD paediatrics is closed overnight.',
        nurse
          ? `${nurse.name} can check temperature and fluids now. Return to emergency the same night if drowsy, a rash that does not fade, or a seizure. Book general / child clinic at ${opens}.`
          : `Night duty can check temperature. Book clinic at ${opens}.`,
        'General Physician',
        gp?.id,
        'night-hold',
        nurse?.id,
      )
    }
    return pack(
      'Fever',
      'Fever means the body is fighting. Most simple fevers need rest, fluids, and paracetamol — not an antibiotic by default.',
      'Paediatrics if it is a child; otherwise general OPD. Return the same day if drowsy, rash that does not fade, or a seizure.',
      'General Physician',
      gp?.id,
      'routine',
    )
  }

  if (/breath|asthma|wheeze|ఊపిరి/.test(text)) {
    if (night) {
      return pack(
        'Breathing trouble · night duty',
        'Wheeze often means the airways are narrow. Blue lips or very fast breathing is emergency, not a morning booking.',
        nurse
          ? `If breathing is hard, go to casualty now. If it is mild, ${nurse.name} can start nebulisation overnight. Chest clinic opens at ${opens}.`
          : 'Hard breathing is casualty now. Mild wheeze can wait for morning clinic.',
        'General Physician',
        gp?.id,
        'night-hold',
        nurse?.id,
      )
    }
    return pack(
      'Breathing trouble',
      'Wheeze or tightness often means the airways are narrow. An inhaler opens them. Very fast breathing or blue lips is emergency.',
      'Chest / general clinic on this shift. Bring your inhaler if you have one.',
      'General Physician',
      gp?.id,
      'routine',
    )
  }

  if (/skin|rash|itch|दाने/.test(text)) {
    if (night) {
      return pack(
        'Skin complaint · clinic closed',
        'Itch or rash is a skin clinic visit, not a night emergency unless the face swells or breathing is hard.',
        derm
          ? `Book ${derm.name} when dermatology opens at ${opens}. Night duty can give soothing cream if the skin is only itchy.`
          : `Book skin clinic at ${opens}.`,
        'Dermatology',
        derm?.id ?? gp?.id,
        'night-hold',
        nurse?.id,
      )
    }
    return pack(
      'Skin complaint',
      'Itch or rash is usually a skin clinic visit, not a general emergency.',
      derm ? `${derm.name} is on the day dermatology roster.` : 'See general OPD on this shift.',
      'Dermatology',
      derm?.id ?? gp?.id,
      'routine',
    )
  }

  if (/bone|joint|knee|fracture|हड्डी/.test(text)) {
    if (night) {
      return pack(
        'Bone or joint pain · night duty',
        'A sprain can wait for orthopedics in the morning. A bone out of shape after a fall needs X-ray in casualty tonight.',
        ortho && nurse
          ? `If the limb looks wrong, go to casualty. If it is a sprain, ${nurse.name} can ice and rest it. Book ${ortho.name} at ${opens}.`
          : `Casualty if the bone looks wrong. Otherwise book orthopedics at ${opens}.`,
        'Orthopedics',
        ortho?.id ?? gp?.id,
        'night-hold',
        nurse?.id,
      )
    }
    return pack(
      'Bone or joint pain',
      'A sprain or joint pain is orthopedics. A bone out of shape after a fall needs X-ray today.',
      ortho ? `${ortho.name} is on the day orthopedic roster.` : 'See general OPD on this shift.',
      'Orthopedics',
      ortho?.id ?? gp?.id,
      'routine',
    )
  }

  if (night) {
    return pack(
      'Clinic closed this shift',
      'I could not match a specialist from those words, and OPD is closed overnight.',
      nurse && gp
        ? `${nurse.name} can see you on night duty. Book ${gp.name} when clinic opens at ${opens}.`
        : `Start at casualty if you are unwell now. Book general clinic at ${opens}.`,
      'General Physician',
      gp?.id,
      'night-hold',
      nurse?.id,
    )
  }

  return pack(
    'General visit',
    'I could not match a specialist from those words. A general doctor on this shift can examine you and send you on if needed.',
    gp ? `${gp.name} is on the day roster.` : 'Start at the front desk for a general token.',
    'General Physician',
    gp?.id,
    'routine',
  )
}

function isEmergency(text: string) {
  if (/chest/.test(text) && /tight|pain|crush|pressure in chest/.test(text)) return true
  if (/blue lips|one-sided|seizure|unconscious|cannot breathe/.test(text)) return true
  if (/sudden/.test(text) && /headache/.test(text)) return true
  return false
}

function pack(
  title: string,
  meaning: string,
  next: string,
  specialty: string,
  doctorId: string | undefined,
  urgency: CopilotUrgency,
  nurseId?: string,
): CopilotHit {
  return {
    specialty,
    doctorId,
    nurseId,
    urgency,
    title: { en: title, hi: title, te: title },
    meaning: { en: meaning, hi: meaning, te: meaning },
    next: { en: next, hi: next, te: next },
    disclaimer: {
      en: 'This is not a diagnosis. It only routes you to who is on this shift, using your words and this hospital’s live wait.',
      hi: 'यह निदान नहीं है। यह केवल इस शिफ्ट में मौजूद स्टाफ और अस्पताल की प्रतीक्षा से सही कतार सुझाता है।',
      te: 'ఇది రోగ నిర్ధారణ కాదు. ఈ షిఫ్ట్‌లో ఉన్న సిబ్బంది, ఈ ఆసుపత్రి వేచి సమయంతో సరైన క్యూ చూపుతుంది.',
    },
  }
}
