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
      // Prefer queuePosition when present; fallback to scheduledAt.
      .sort({ queuePosition: 1, scheduledAt: 1 })
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

// Reorder queue via drag/drop.
// Body: { ids: [appointmentId1, appointmentId2, ...] }
router.patch('/reorder', requireAuth(['secretary', 'admin']), async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Missing ids array' });
    }

    // Update queuePosition in the order provided.
    const bulk = Appointment.collection.initializeUnorderedBulkOp();

    ids.forEach((id, idx) => {
      bulk.find({ _id: id }).updateOne({ $set: { queuePosition: idx + 1 } });
    });

    await bulk.execute();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to reorder queue' });
  }
});

module.exports = { queueRouter: router };


