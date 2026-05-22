const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.get('/', requireAuth(['secretary', 'admin', 'doctor']), async (req, res) => {
  try {
    const status = req.query.status; // waiting/calling/...
    const filter = status ? { status } : { status: { $in: ['waiting', 'calling'] } };

    const items = await Appointment.find(filter)
      .sort({ scheduledAt: 1 })
      .limit(100);

    const enriched = await Promise.all(
      items.map(async (a) => {
        const patient = await Patient.findById(a.patientId);
        return {
          _id: a._id,
          patientId: a.patientId,
          patientName: a.patientNameSnapshot,
          patientDentId: patient?.denthivePatientId,
          serviceType: a.serviceType,
          scheduledAt: a.scheduledAt,
          assignedTo: a.preferredDoctor,
          status: a.status,
          toothFlags: a.toothFlags || [],
        };
      })
    );

    return res.json({ queue: enriched });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load queue' });
  }
});

router.post('/:id/checkin', requireAuth(['secretary', 'admin']), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Not found' });

    appt.status = 'calling';
    appt.checkedInAt = new Date();
    await appt.save();

    return res.json({ appointment: appt });
  } catch (e) {
    return res.status(500).json({ error: 'Check-in failed' });
  }
});

router.post('/:id/complete', requireAuth(['secretary', 'admin']), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Not found' });

    appt.status = 'completed';
    appt.completedAt = new Date();
    await appt.save();

    return res.json({ appointment: appt });
  } catch (e) {
    return res.status(500).json({ error: 'Complete failed' });
  }
});

module.exports = { queueRouter: router };

