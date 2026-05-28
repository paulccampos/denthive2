const express = require('express');
const Patient = require('../models/Patient');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

// patient registry search (secretary/admin/doctor)
router.get('/', requireAuth(['secretary', 'admin', 'doctor', 'patient']), async (req, res) => {
  try {
    const query = (req.query.query || '').trim();
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    if (query) {
      filter.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { denthivePatientId: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(50);
    return res.json({ patients });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load patients' });
  }
});

// Get authenticated patient's own profile
router.get('/me', requireAuth(['patient']), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.auth.sub }).lean();
    if (!patient) return res.status(400).json({ error: 'Patient profile not found' });

    // Frontend expects these arrays for the Medical Record card
    return res.json({
      denthivePatientId: patient.denthivePatientId || null,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || null,
      phone: patient.phone || null,
      address: patient.address || null,
      dob: patient.dob || null,
      gender: patient.gender || null,
      allergies: patient.allergies || [],
      medications: patient.medications || [],
      chronicConditions: patient.chronicConditions || [],
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load patient profile' });
  }
});

module.exports = { patientsRouter: router };


