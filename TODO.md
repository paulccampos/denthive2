# TODO

- [ ] Make `/doctorfinished` reliably load the correct appointment (and show patient/booking details)
- [ ] Ensure the Finish button always has a valid `appointmentId`
- [ ] Update routing/links from `DoctorBookings` to `DoctorFinished` to pass appointmentId
- [ ] Verify backend move logic: appointment -> `finished` collection via `POST /api/finished/:appointmentId/finish`
- [ ] Manual test end-to-end

