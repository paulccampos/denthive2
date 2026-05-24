const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

const BLOCKING_STATUSES = ['scheduled', 'waiting', 'calling', 'in_progress'];

function parseISODateOnly(dateOnly) {
  // dateOnly: YYYY-MM-DD
  const d = new Date(`${dateOnly}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

router.get('/availability', requireAuth(['patient', 'secretary', 'admin', 'doctor']), async (req, res) => {
  try {
    const {
      date, // YYYY-MM-DD
      doctor, // optional string
    } = req.query || {};

    if (!date) return res.status(400).json({ error: 'Missing date (YYYY-MM-DD)' });

    const dayStart = parseISODateOnly(date);
    if (!dayStart) return res.status(400).json({ error: 'Invalid date' });

    // Slots are 15/45 minute-ish in UI; we treat them as fixed start times.
    const timeSlots = [
      '09:00 AM',
      '09:45 AM',
      '10:30 AM',
      '11:15 AM',
      '01:00 PM',
      '01:45 PM',
      '02:30 PM',
      '03:15 PM',
    ];

    const slotToDate = (slot) => {
      // slot example: '09:45 AM'
      const [timePart, mer] = slot.split(' ');
      const [hhStr, mmStr] = timePart.split(':');
      let hh = parseInt(hhStr, 10);
      const mm = parseInt(mmStr, 10);
      const isPM = mer.toUpperCase() === 'PM';
      if (isPM && hh !== 12) hh += 12;
      if (!isPM && hh === 12) hh = 0;
      const d = new Date(dayStart);
      // Using UTC to avoid timezone mismatch between client/server.
      d.setUTCHours(hh, mm, 0, 0);
      return d;
    };

    const slotDates = timeSlots.map(slotToDate);
    const slotMs = slotDates.map((d) => d.getTime());

    const filter = {
      scheduledAt: { $in: slotDates },
      status: { $in: BLOCKING_STATUSES },
    };

    if (doctor && doctor !== 'Any Available Practitioner') {
      filter.preferredDoctor = doctor;
    }

    const existing = await Appointment.find(filter).select('scheduledAt status preferredDoctor');
    const takenMs = new Set(existing.map((a) => new Date(a.scheduledAt).getTime()));

    const availability = timeSlots.map((slot, idx) => ({
      slot,
      available: !takenMs.has(slotMs[idx]),
    }));

    res.json({ date, doctor: doctor || null, availability });
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute availability' });
  }
});

router.post('/', requireAuth(['patient']), async (req, res) => {
  try {
    const { serviceType, preferredDoctor, scheduledAt, toothFlags = [] } = req.body || {};

    if (!serviceType || !scheduledAt) return res.status(400).json({ error: 'Missing serviceType/scheduledAt' });

    const patient = await Patient.findOne({ userId: req.auth.sub });
    if (!patient) return res.status(400).json({ error: 'Patient profile not found' });

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return res.status(400).json({ error: 'Invalid scheduledAt' });

    // Conflict check (same doctor + same exact scheduledAt) for blocking statuses.
    const conflict = await Appointment.findOne({
      scheduledAt: scheduledDate,
      status: { $in: BLOCKING_STATUSES },
      ...(preferredDoctor ? { preferredDoctor } : {}),
    });

    if (conflict) {
      return res.status(409).json({ error: 'Selected time is no longer available' });
    }

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

