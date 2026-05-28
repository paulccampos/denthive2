const express = require('express');
const ClinicalRecord = require('../models/ClinicalRecord');
const Appointment = require('../models/Appointment');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

// Create clinical record (doctor)
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

// Read authenticated patient's own clinical records (patient)
router.get('/me', requireAuth(['patient']), async (req, res) => {
  try {
    const Patient = require('../models/Patient');

    const patientProfile = await Patient.findOne({ userId: req.auth.sub }).lean();
    if (!patientProfile) return res.status(400).json({ error: 'Patient profile not found' });

    const records = await ClinicalRecord.find({ patientId: patientProfile._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ clinicalRecords: records });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load clinical records' });
  }
});



module.exports = { clinicalRouter: router };


