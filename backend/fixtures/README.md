# DentHive MongoDB JSON fixtures

These files are **example documents** aligned with the current Mongoose schemas:
- `User` (`backend/models/User.js`)
- `Patient` (`backend/models/Patient.js`)
- `Appointment` (`backend/models/Appointment.js`)
- `ClinicalRecord` (`backend/models/ClinicalRecord.js`)

## Important: login/password
Your backend stores `passwordHash` (bcrypt). A valid login requires a **correct bcrypt hash**.

This repo already seeds demo accounts at server startup via `backend/seed.js`.

### Seeded login credentials (works immediately)
- **Admin**: username `admin` (email `admin@denthive.local`), password `patient1`
- **Secretary**: username `secretary` (email `secretary@denthive.local`), password `patient1`
- **Doctor**: username `doctor` (email `doctor@denthive.local`), password `patient1`
- **Patient**: username `patient` (email `patient@denthive.local`), password `patient1`

So, for most dev usage you do **not** need to import `users.example.json`.

## How to use these fixtures
- Treat them as reference / sample data.
- If you still want to import them manually, do so with care:
  - IDs like `_id` and `ObjectId(...)` are **examples** only.
  - Password hashes included here are placeholders and will not work for login.

## Collections
- `users.example.json`
- `patients.example.json`
- `appointments.example.json`
- `clinical_records.example.json`

