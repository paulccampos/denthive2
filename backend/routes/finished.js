const express = require('express');
const { requireAuth } = require('../utils/auth');

const Appointment = require('../models/Appointment');
const HistoryAppointment = require('../models/HistoryAppointment');
const FinishedAppointment = require('../models/FinishedAppointment');
const Patient = require('../models/Patient');

const router = express.Router();

// Doctor: move an Appointment into Finished (not yet paid)
// POST /api/finished/:appointmentId/finish
// body: { pricePHP:number, consultationNotes?:string, procedures?:[{tooth, procedure, extracted?}] , toothFlags?:string[] }
router.post('/:appointmentId/finish', requireAuth(['doctor']), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { pricePHP, consultationNotes, procedures = [], toothFlags } = req.body || {};

    if (typeof pricePHP !== 'number' || Number.isNaN(pricePHP)) {
      return res.status(400).json({ error: 'Missing/invalid pricePHP' });
    }

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // 1) Create finished record
    const finished = await FinishedAppointment.create({
      patientId: appt.patientId,
      patientNameSnapshot: appt.patientNameSnapshot,
      serviceType: appt.serviceType,
      preferredDoctor: appt.preferredDoctor,
      scheduledAt: appt.scheduledAt,
      toothFlags: toothFlags || appt.toothFlags || [],
      createdByUserId: appt.createdByUserId,
      appointmentId: appt._id,
      consultationNotes: consultationNotes || '',
      procedures,
      pricePHP,
      status: 'finished',
      finishedAt: new Date(),
      createdByRole: 'doctor',
    });

    // 2) Remove appointment from active queue
    await Appointment.deleteOne({ _id: appt._id });

    return res.status(201).json({ finished });
  } catch (e) {
    return res.status(500).json({ error: 'Finish procedure failed' });
  }
});

// Doctor/Secretary/Admin: list finished (for secretary UI)
router.get('/', requireAuth(['secretary', 'admin', 'doctor']), async (req, res) => {
  try {
    const { status } = req.query || {};
    const filter = status ? { status } : { status: 'finished' };

    const items = await FinishedAppointment.find(filter)
      .sort({ finishedAt: -1 })
      .limit(500)
      .lean();

    // Enrich with patient contact if possible
    const enriched = await Promise.all(
      items.map(async (it) => {
        const patient = it.patientId
          ? await Patient.findById(it.patientId)
              .select('denthivePatientId firstName lastName email phone address dob gender')
              .lean()
          : null;

        return {
          ...it,
          patientDentId: patient?.denthivePatientId || it.patientDentId || null,
          patientName:
            it.patientNameSnapshot || (patient ? `${patient.firstName} ${patient.lastName}` : null),
          patient,
        };
      })
    );

    return res.json({ finished: enriched });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load finished items' });
  }
});

// Secretary: mark paid and move into history
// POST /api/finished/:id/pay
router.post('/:id/pay', requireAuth(['secretary', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const finished = await FinishedAppointment.findById(id);
    if (!finished) return res.status(404).json({ error: 'Finished record not found' });
    if (finished.status !== 'finished') {
      return res.status(400).json({ error: 'Record is not in finished state' });
    }

    finished.status = 'paid';
    finished.paidAt = new Date();
    await finished.save();

    const payload = {
      patientId: finished.patientId,
      patientNameSnapshot: finished.patientNameSnapshot,
      serviceType: finished.serviceType,
      preferredDoctor: finished.preferredDoctor,
      scheduledAt: finished.scheduledAt,
      toothFlags: finished.toothFlags || [],
      createdByUserId: finished.createdByUserId,
      status: 'completed',
      queuePosition: undefined,
      appointmentId: finished.appointmentId || null,
      checkedInAt: null,
      completedAt: new Date(),
      historyReason: 'paid',
    };

    const history = await HistoryAppointment.create(payload);

    // Optionally keep the finished record for audit; remove from finished queue
    await FinishedAppointment.deleteOne({ _id: finished._id });

    return res.json({ history });
  } catch (e) {
    return res.status(500).json({ error: 'Pay procedure failed' });
  }
});

module.exports = { finishedRouter: router };

