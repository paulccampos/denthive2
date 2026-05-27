# TODO

## Secretary + Queue: make UI buttons work + reorder + full patient info

- [x] Step 1: Add `queuePosition` to `backend/models/Appointment.js` and ensure default behavior

- [x] Step 2: Update `backend/routes/queue.js` to sort by `queuePosition` (fallback to `scheduledAt`)

- [ ] Step 3: Add backend endpoints:
  - [x] 3a) `DELETE /api/appointments/:id` (mark canceled)
  - [x] 3b) `PATCH /api/queue/reorder` (set queuePosition based on provided ID order)

- [ ] Step 4: Update SecretaryBookings frontend:
  - [ ] 4a) Row click opens modal with full patient info
  - [ ] 4b) Add Delete booking button
- [ ] Step 5: Update QueueManagement frontend:
  - [ ] 5a) Implement drag-and-drop reorder and “first -> last” action
  - [ ] 5b) Implement delete/check-in actions via backend
- [ ] Step 6: Run backend + frontend smoke tests

