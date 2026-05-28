const express = require('express');
const { requireAuth } = require('../utils/auth');

const Appointment = require('../models/Appointment');
const HistoryAppointment = require('../models/HistoryAppointment');

const router = express.Router();

// Secretary/Admin: list history records
router.get('/', requireAuth(['secretary', 'admin']), async (req, res) => {
  try {
    const { status } = req.query || {};
    const filter = status ? { status } : {};

    const items = await HistoryAppointment.find(filter)
      .sort({ scheduledAt: -1 })
      .limit(500)
      .lean();

    return res.json({ history: items });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load history' });
  }
});

// Permanently delete history record
router.delete('/:id', requireAuth(['secretary', 'admin']), async (req, res) => {
  try {
    const result = await HistoryAppointment.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'History record not found' });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to delete history record' });
  }
});

// Restore: move history record back into appointments collection
router.post('/:id/restore', requireAuth(['secretary', 'admin']), async (req, res) => {
  try {
    const hist = await HistoryAppointment.findById(req.params.id);
    if (!hist) return res.status(404).json({ error: 'History record not found' });

    // Create appointment with same details but reset status to waiting (or keep original if you prefer).
    // Queue management expects active statuses; waiting is safe.
    const restored = await Appointment.create({
      patientId: hist.patientId,
      patientNameSnapshot: hist.patientNameSnapshot,
      serviceType: hist.serviceType,
      preferredDoctor: hist.preferredDoctor,
      scheduledAt: hist.scheduledAt,
      toothFlags: hist.toothFlags || [],
      createdByUserId: hist.createdByUserId,
      status: 'waiting',
      queuePosition: hist.queuePosition,
      checkedInAt: hist.checkedInAt || null,
      completedAt: hist.completedAt || null,
    });

    await HistoryAppointment.deleteOne({ _id: hist._id });
    return res.json({ appointment: restored });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to restore history record' });
  }
});

module.exports = { historyRouter: router };

