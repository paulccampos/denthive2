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

// Update editable fields for authenticated patient
// Does NOT allow changing immutable identifiers (including createdAt/dateCreated).
router.put('/me', requireAuth(['patient']), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.auth.sub });
    if (!patient) return res.status(400).json({ error: 'Patient profile not found' });

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      dob,
      gender,
      allergies,
      medications,
      chronicConditions,
    } = req.body || {}

    if (typeof firstName === 'string') patient.firstName = firstName.trim()
    if (typeof lastName === 'string') patient.lastName = lastName.trim()
    if (typeof email === 'string') patient.email = email.trim()
    if (typeof phone === 'string') patient.phone = phone.trim()
    if (typeof address === 'string') patient.address = address.trim()
    if (typeof gender === 'string') patient.gender = gender.trim()

    if (dob !== undefined) {
      const date = dob ? new Date(dob) : null
      if (date && Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Invalid dob' })
      patient.dob = date || null
    }

    if (allergies !== undefined) patient.allergies = Array.isArray(allergies) ? allergies.filter(Boolean) : []
    if (medications !== undefined) patient.medications = Array.isArray(medications) ? medications.filter(Boolean) : []
    if (chronicConditions !== undefined) patient.chronicConditions = Array.isArray(chronicConditions) ? chronicConditions.filter(Boolean) : []

    await patient.save()

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
    })
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

module.exports = { patientsRouter: router };



