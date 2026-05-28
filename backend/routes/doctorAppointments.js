const express = require('express');
const Appointment = require('../models/Appointment');
const HistoryAppointment = require('../models/HistoryAppointment');
const ClinicalRecord = require('../models/ClinicalRecord');
const Patient = require('../models/Patient');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

// Doctor workflow: mark finished (complete) and optionally create a follow-up appointment.
// POST /api/doctor-appointments/:id/finish
// body:
//  {
//    hasNextCheckup: boolean,
//    nextScheduledAtISO: string (optional, required when hasNextCheckup=true),
//    pricePHP: number (required),
//    procedures: [{ tooth?: string, procedure?: string, extracted?: boolean }] (optional),
//    consultationNotes: string (optional),
//  }
router.post('/:id/finish', requireAuth(['doctor']), async (req, res) => {
  try {
    const { hasNextCheckup, nextScheduledAtISO, pricePHP, procedures = [], consultationNotes } = req.body || {};

    if (typeof pricePHP !== 'number' || Number.isNaN(pricePHP)) {
      return res.status(400).json({ error: 'Missing/invalid pricePHP' });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // Only allow the doctor portal’s appointments.
    if (appt.preferredDoctor !== 'doctor') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Validate next date if requested.
    let nextDate = null;
    if (hasNextCheckup) {
      if (!nextScheduledAtISO) return res.status(400).json({ error: 'nextScheduledAtISO is required when hasNextCheckup=true' });
      nextDate = new Date(nextScheduledAtISO);
      if (Number.isNaN(nextDate.getTime())) return res.status(400).json({ error: 'Invalid nextScheduledAtISO' });
    }

    // 1) Mark current appointment completed + move to history
    const completedAt = new Date();
    appt.status = 'completed';
    appt.completedAt = completedAt;

    const histPayload = {
      patientId: appt.patientId,
      patientNameSnapshot: appt.patientNameSnapshot,
      serviceType: appt.serviceType,
      preferredDoctor: appt.preferredDoctor,
      scheduledAt: appt.scheduledAt,
      toothFlags: appt.toothFlags || [],
      createdByUserId: appt.createdByUserId,
      status: appt.status,
      queuePosition: appt.queuePosition,
      checkedInAt: appt.checkedInAt,
      completedAt: appt.completedAt,
      historyReason: 'completed',
    };

    const history = await HistoryAppointment.create(histPayload);

    // Remove from active appointments (consistent with existing history move strategy)
    await Appointment.deleteOne({ _id: appt._id });

    // 2) Create clinical record tied to the appointment that was just completed
    await ClinicalRecord.create({
      patientId: appt.patientId,
      appointmentId: appt._id,
      procedures,
      consultationNotes,
      pricePHP,
      createdByUserId: req.auth.sub,
      createdByRole: 'doctor',
      status: 'completed',
    });

    // 3) Optional: create new follow-up appointment
    let createdNextAppointment = null;
    if (hasNextCheckup) {
      const conflict = await Appointment.findOne({
        scheduledAt: nextDate,
        preferredDoctor: appt.preferredDoctor,
        status: { $in: ['scheduled', 'waiting', 'calling', 'in_progress', 'next'] },
      });

      if (conflict) {
        return res.status(409).json({ error: 'Selected next time is no longer available' });
      }

      const patient = await Patient.findById(appt.patientId).lean();
      if (!patient) return res.status(400).json({ error: 'Patient profile not found' });

      createdNextAppointment = await Appointment.create({
        patientId: appt.patientId,
        patientNameSnapshot: appt.patientNameSnapshot,
        serviceType: appt.serviceType,
        preferredDoctor: appt.preferredDoctor,
        scheduledAt: nextDate,
        toothFlags: appt.toothFlags || [],
        createdByUserId: req.auth.sub,
        status: 'waiting',
      });
    }

    return res.json({ history, nextAppointment: createdNextAppointment });
  } catch (e) {
    return res.status(500).json({ error: 'Doctor finish failed' });
  }
});

// Doctor workflow: mark "Next" meaning: update status from waiting -> next
router.patch('/:id/next', requireAuth(['doctor']), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (appt.preferredDoctor !== 'doctor') return res.status(403).json({ error: 'Forbidden' });

    if (appt.status !== 'waiting') {
      return res.status(400).json({ error: 'Can only mark Next from waiting status' });
    }

    appt.status = 'next';
    await appt.save();
    return res.json({ appointment: appt });
  } catch (e) {
    return res.status(500).json({ error: 'Mark next failed' });
  }
});

module.exports = { doctorAppointmentsRouter: router };

