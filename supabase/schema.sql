-- Enable in Supabase SQL editor. Demo currently runs on local seed data.

create table if not exists hospitals (
  id text primary key,
  name text not null,
  city text not null,
  beds int not null,
  token_prefix text not null,
  clinic_open time not null,
  clinic_close time not null
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  hospital_id text not null references hospitals(id),
  role text not null check (role in ('patient','doctor','nurse','pharmacist','receptionist','administrator')),
  full_name text not null,
  login_id text unique,
  password_hash text,
  shift text check (shift in ('day','night')),
  patient_id text
);

create table if not exists queue_tickets (
  id uuid primary key default gen_random_uuid(),
  hospital_id text not null references hospitals(id),
  patient_id text not null,
  token text not null,
  department text not null,
  status text not null,
  urgent boolean not null default false,
  doctor_id uuid
);

create table if not exists pharmacy_stock (
  id uuid primary key default gen_random_uuid(),
  hospital_id text not null references hospitals(id),
  sku text not null,
  name text not null,
  quantity int not null,
  reorder_at int not null,
  sold_today int not null default 0,
  sold_week int not null default 0
);

create table if not exists treatments (
  id uuid primary key default gen_random_uuid(),
  hospital_id text not null references hospitals(id),
  patient_id text not null,
  doctor_id uuid,
  status text not null default 'draft',
  happening_en text,
  happening_hi text,
  happening_te text,
  medicine_does_en text,
  medicine_does_hi text,
  medicine_does_te text,
  recover_en text,
  recover_hi text,
  recover_te text
);

alter table hospitals enable row level security;
alter table profiles enable row level security;
alter table queue_tickets enable row level security;
alter table pharmacy_stock enable row level security;
alter table treatments enable row level security;

-- Isolation: a user only sees rows for their hospital_id.
create policy "own hospital" on queue_tickets
  for all using (hospital_id = (select hospital_id from profiles where id = auth.uid()));

create policy "own hospital stock" on pharmacy_stock
  for all using (hospital_id = (select hospital_id from profiles where id = auth.uid()));

create policy "own hospital treatments" on treatments
  for all using (hospital_id = (select hospital_id from profiles where id = auth.uid()));

-- Predefined IF-THEN rules for Care Copilot (not a trained model).
create table if not exists copilot_rules (
  id text primary key,
  if_keywords text not null,
  then_specialty text not null,
  then_urgency text not null check (then_urgency in ('routine','emergency','night-hold')),
  then_action text not null,
  is_diagnosis boolean not null default false
);

insert into copilot_rules (id, if_keywords, then_specialty, then_urgency, then_action, is_diagnosis) values
  ('R1', 'thirst|tired|sugar|diabetes', 'General Physician', 'routine', 'See GP on this shift. Keep Metformin after food. Not a diagnosis.', false),
  ('R2', 'chest tightness|chest pain', 'Emergency', 'emergency', 'Go to casualty now. Do not book an OPD token.', false),
  ('R3', 'fever|child', 'General Physician', 'routine', 'General / paeds OPD. Fluids and paracetamol.', false),
  ('R4', 'knee|bone|joint|fracture', 'Orthopedics', 'routine', 'Orthopedics. X-ray today if the limb looks wrong.', false)
on conflict (id) do nothing;
