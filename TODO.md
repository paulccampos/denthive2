# DentHive - Implementation TODO

## Plan Summary
- Create backend from scratch (Express + MongoDB via mongoose)
- Add minimal REST APIs for auth, patient registry, appointments/queue, clinical records, admin staff
- Wire existing frontend HTML minimally so login/signup/booking/registry/queue use backend

## Steps
- [x] Create backend package.json + server.js

- [ ] Add MongoDB connection (mongodb://localhost:270127) to DB name `denthive`
- [ ] Implement JWT auth helpers
- [ ] Create Mongoose models: User, Patient, Appointment, QueueItem, ClinicalRecord
- [ ] Implement REST routes under `/api/auth`, `/api/patients`, `/api/appointments`, `/api/queue`, `/api/clinical-records`, `/api/admin/users`
- [ ] Seed default users on first run
- [x] Update frontend login.html to call backend login and redirect
- [x] Update frontend signup.html to call backend register and redirect
- [x] Update bookingpage.html confirm button to create appointment

- [ ] Update registry.html to load patient list into table
- [ ] Update queuemanagement.html to load queue list into table
- [ ] Run `npm install` (backend) and start server
- [ ] Manual test: register -> login -> booking -> queue -> registry

