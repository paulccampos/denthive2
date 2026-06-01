# DentHive MongoDB JSON fixtures

These files are **example documents** aligned with the current Mongoose schemas:
- `User` (`backend/models/User.js`)
- `Patient` (`backend/models/Patient.js`)
- `Appointment` (`backend/models/Appointment.js`)
- `ClinicalRecord` (`backend/models/ClinicalRecord.js`)

## Important: login/password
Your backend stores `passwordHash` (bcrypt). A valid login requires a **correct bcrypt hash**.

This repo does **not** auto-seed demo login accounts at server startup.

So, for most dev usage you typically **should not** rely on `users.example.json` for working passwords.
Accounts must be created via your admin workflow (or `/api/auth/register` for patients).



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

