const express = require('express');
const ClinicalRecord = require('../models/ClinicalRecord');
const Appointment = require('../models/Appointment');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.post('/', requireAuth(['doctor']), async (req, res) => {
  try {
    const {
      appointmentId,
      procedures = [],
      consultationNotes,
    } = req.body || {};

    if (!appointmentId) return res.status(400).json({ error: 'Missing appointmentId' });

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const record = await ClinicalRecord.create({
      patientId: appt.patientId,
      appointmentId: appt._id,
      procedures,
      consultationNotes,
      createdByUserId: req.auth.sub,
      createdByRole: 'doctor',
      status: 'completed',
    });

    appt.status = 'completed';
    await appt.save();

    return res.status(201).json({ clinicalRecord: record });
  } catch (e) {
    return res.status(500).json({ error: 'Clinical record failed' });
  }
});

module.exports = { clinicalRouter: router };

