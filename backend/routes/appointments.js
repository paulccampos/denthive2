const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.post('/', requireAuth(['patient']), async (req, res) => {
  try {
    const {
      serviceType,
      preferredDoctor,
      scheduledAt,
      toothFlags = [],
    } = req.body || {};

    if (!serviceType || !scheduledAt) return res.status(400).json({ error: 'Missing serviceType/scheduledAt' });

    const patient = await Patient.findOne({ userId: req.auth.sub });
    if (!patient) return res.status(400).json({ error: 'Patient profile not found' });

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return res.status(400).json({ error: 'Invalid scheduledAt' });

    const appt = await Appointment.create({
      patientId: patient._id,
      patientNameSnapshot: `${patient.firstName} ${patient.lastName}`,
      serviceType,
      preferredDoctor,
      scheduledAt: scheduledDate,
      toothFlags,
      createdByUserId: req.auth.sub,
      status: 'waiting',
    });

    return res.status(201).json({ appointment: appt });
  } catch (e) {
    return res.status(500).json({ error: 'Create appointment failed' });
  }
});

module.exports = { appointmentsRouter: router };

