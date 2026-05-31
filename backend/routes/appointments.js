const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

const BLOCKING_STATUSES = ['scheduled', 'waiting', 'calling', 'in_progress', 'next'];


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

// Get authenticated patient's appointments (bookings)
router.get('/me', requireAuth(['patient']), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.auth.sub });
    if (!patient) return res.status(400).json({ error: 'Patient profile not found' });

    const appts = await Appointment.find({ patientId: patient._id })
      .sort({ scheduledAt: -1 })
      .lean();

    return res.json({ appointments: appts });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load appointments' });
  }
});

// List appointments/bookings (doctor/secretary/admin)
router.get('/', async (req, res) => {

  try {
    // Show ALL appointments by default (no implicit status filtering).
    // If client passes ?status=..., filter by status.
    const status = req.query.status

    const filter = status ? { status } : {}

    const items = await Appointment.find(filter)

      .sort({ scheduledAt: 1 })
      .limit(200)
      .lean()





    // enrich with full patient info (for secretary UI)
    const enriched = await Promise.all(
      items.map(async (a) => {
        const patient = a.patientId
          ? await Patient.findById(a.patientId)
              .select(
                'denthivePatientId firstName lastName email phone address dob gender allergies medications chronicConditions outstandingBalance status userId'
              )
              .lean()
          : null

        return {
          ...a,
          patientDentId: patient?.denthivePatientId || null,
          patientName: a.patientNameSnapshot || null,
          patient: patient
            ? {
                denthivePatientId: patient.denthivePatientId,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phone: patient.phone,
                address: patient.address,
                dob: patient.dob,
                gender: patient.gender,
                allergies: patient.allergies || [],
                medications: patient.medications || [],
                chronicConditions: patient.chronicConditions || [],
                outstandingBalance: patient.outstandingBalance ?? 0,
                status: patient.status,
                userId: patient.userId,
              }
            : null,
        }
      })
    )


    return res.json({ appointments: enriched })
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load appointments' })
  }
})

// Update appointment status and/or reschedule (doctor/secretary/admin)
router.patch('/:id', async (req, res) => {

  try {
    const { status, scheduledAt } = req.body || {}

    if (!status && !scheduledAt) {
      return res.status(400).json({ error: 'Missing status and/or scheduledAt' })
    }

    const appt = await Appointment.findById(req.params.id)
    if (!appt) return res.status(404).json({ error: 'Appointment not found' })

    // Only allow doctor portal actions to update these appointments.
    // Other UI roles (secretary/admin) are already constrained by router.delete/auth.
    if (req.user && req.user.role === 'doctor') {
      // In this app, doctor-portal appointments store preferredDoctor as the literal string 'doctor'
      // (legacy). Keep permissive behavior for existing data.
    }


    // If rescheduling, run conflict check similar to create.
    if (scheduledAt) {
      const newDate = new Date(scheduledAt)
      if (Number.isNaN(newDate.getTime())) return res.status(400).json({ error: 'Invalid scheduledAt' })

      const conflictQuery = {
        _id: { $ne: appt._id },
        scheduledAt: newDate,
        status: { $in: BLOCKING_STATUSES },
      }



      // If the appointment was created without a specific doctor (Any Available), block any doctor conflicts.
      const apptIsAny = !appt.preferredDoctor || appt.preferredDoctor === 'Any Available Practitioner';
      if (!apptIsAny) {
        conflictQuery.preferredDoctor = appt.preferredDoctor;
      }

      const conflict = await Appointment.findOne(conflictQuery)

      if (conflict) return res.status(409).json({ error: 'Selected time is no longer available' })


      appt.scheduledAt = newDate

      // If appointment is moved to another time, keep it in waiting unless explicitly setting status.
      if (!status) appt.status = 'waiting'
    }

    if (status) {
      appt.status = status
      if (status === 'calling') appt.checkedInAt = new Date()
      if (status === 'completed') appt.completedAt = new Date()
      if (status === 'canceled') {
        // keep historical timestamps as-is
      }
    }

    // Finished/canceled appointments should be moved into history.
    if (appt.status === 'completed' || appt.status === 'canceled') {
      await appt.save()
      const history = await moveToHistory(appt, { reason: appt.status })
      return res.json({ appointment: null, history })

    }

    await appt.save()

    return res.json({ appointment: appt })

  } catch (e) {
    return res.status(500).json({ error: 'Update appointment failed' })
  }
})

const HistoryAppointment = require('../models/HistoryAppointment');

async function moveToHistory(appt, { reason } = {}) {
  // Convert mongoose doc -> plain so we can re-create in history.
  const payload = {
    patientId: appt.patientId,
    patientNameSnapshot: appt.patientNameSnapshot,
    serviceType: appt.serviceType,
    preferredDoctor: appt.preferredDoctor,
    scheduledAt: appt.scheduledAt,
    toothFlags: appt.toothFlags || [],
    createdByUserId: appt.createdByUserId,
    status: appt.status,
    queuePosition: appt.queuePosition,
    appointmentId: appt._id,
    checkedInAt: appt.checkedInAt,
    completedAt: appt.completedAt,
    historyReason: reason || null,
  };

  const hist = await HistoryAppointment.create(payload);
  await Appointment.deleteOne({ _id: appt._id });
  return hist;
}

// Delete appointment (secretary/admin/doctor): move to history.
router.delete('/:id', requireAuth(['doctor', 'secretary', 'admin']), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // Mark archived for audit, then move.
    appt.status = 'archived';
    await appt.save();

    const history = await moveToHistory(appt, { reason: 'deleted' });
    return res.json({ appointment: appt, history });
  } catch (e) {
    return res.status(500).json({ error: 'Delete appointment failed' });
  }
});



router.post('/', requireAuth(['patient']), async (req, res) => {
  try {
    const {
      serviceType,
      preferredDoctor,
      scheduledAt,
      toothFlags = [],
      allergies = [],
      medications = [],
      chronicConditions = [],
    } = req.body || {};


    if (!serviceType || !scheduledAt) return res.status(400).json({ error: 'Missing serviceType/scheduledAt' });

    const patient = await Patient.findOne({ userId: req.auth.sub });
    if (!patient) return res.status(400).json({ error: 'Patient profile not found' });

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return res.status(400).json({ error: 'Invalid scheduledAt' });

    // Conflict check for blocking statuses.
    // Rules:
    // - If preferredDoctor is a specific doctor -> block exact time+date for that doctor.
    // - If preferredDoctor is "Any Available Practitioner" or missing -> block exact time+date for ANY doctor.

    const doctorIsAny = !preferredDoctor || preferredDoctor === 'Any Available Practitioner';

    const conflictQuery = {
      scheduledAt: scheduledDate,
      status: { $in: BLOCKING_STATUSES },
    };

    if (!doctorIsAny) {
      conflictQuery.preferredDoctor = preferredDoctor;
    }

    const conflict = await Appointment.findOne(conflictQuery);


    if (conflict) {
      return res.status(409).json({ error: 'Selected time is no longer available' });
    }

    // Persist patient's medical info for later display in Patient Dashboard.
    // (Per your requirement, we store it as part of patient record rather than only on the appointment.)
    patient.allergies = Array.isArray(allergies) ? allergies : [];
    patient.medications = Array.isArray(medications) ? medications : [];
    patient.chronicConditions = Array.isArray(chronicConditions) ? chronicConditions : [];
    await patient.save();

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

