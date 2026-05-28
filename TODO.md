# Task TODO: Make medical record functionable in patients dashboard

- [ ] Update `backend/routes/patients.js` to add `GET /api/patients/me` for authenticated patients (return allergies/medications/chronicConditions + basic profile fields needed by dashboard).
- [ ] Update `backend/routes/clinical.js` to add `GET /api/clinical-records/me` for authenticated patients to read their clinical records (read-only).
- [ ] Update `frontend-react/src/pages/PatientDashboard.jsx` to fetch and render clinical records under the Medical Record card (read-only) and handle loading/empty states.
- [ ] Optionally adjust “Edit” button behavior to be view-only/no-op with a helpful message.
- [ ] Smoke test:
  - [ ] Run backend and verify endpoints respond.
  - [ ] Run/build frontend and confirm patient dashboard loads with clinical records.
