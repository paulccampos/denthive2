const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Appointment = require('./models/Appointment');
const ClinicalRecord = require('./models/ClinicalRecord');
const Patient = require('./models/Patient');
const User = require('./models/User');

async function ensureStaffExists() {
  // Not required for this task; ClinicalRecord can still be created without a valid createdByUserId.
}

function maybeObjectIdHex(str) {
  if (!str) return null;
  return str;
}

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const DB_NAME = process.env.MONGO_DB || 'denthive';

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });

  const appointmentsFixturePath = path.join(__dirname, 'fixtures', 'appointments.example.json');
  const clinicalFixturePath = path.join(__dirname, 'fixtures', 'clinical_records.example.json');

  const appointments = JSON.parse(fs.readFileSync(appointmentsFixturePath, 'utf8'));
  const clinical = JSON.parse(fs.readFileSync(clinicalFixturePath, 'utf8'));

  // 1) Ensure appointments exist (because clinical records depend on them)
  let apptCreated = 0;
  for (const a of appointments) {
    const exists = await Appointment.findById(a._id).lean();
    if (exists) continue;

    const appt = await Appointment.create({
      _id: a._id,
      patientId: a.patientId,
      patientNameSnapshot: a.patientNameSnapshot,
      serviceType: a.serviceType,
      preferredDoctor: a.preferredDoctor,
      scheduledAt: new Date(a.scheduledAt),
      toothFlags: Array.isArray(a.toothFlags) ? a.toothFlags : [],
      createdByUserId: a.createdByUserId,
      status: a.status,
      checkedInAt: a.checkedInAt ? new Date(a.checkedInAt) : null,
      completedAt: a.completedAt ? new Date(a.completedAt) : null,
    });

    apptCreated++;
  }

  // 2) Ensure clinical records exist
  let clinicalCreated = 0;
  let clinicalSkipped = 0;

  for (const c of clinical) {
    const appt = await Appointment.findById(c.appointmentId).lean();
    if (!appt) {
      clinicalSkipped++;
      continue;
    }

    const exists = await ClinicalRecord.findOne({ appointmentId: appt._id }).lean();
    if (exists) {
      clinicalSkipped++;
      continue;
    }

    let createdByUserId = c.createdByUserId;
    if (createdByUserId) {
      const u = await User.findById(createdByUserId).lean();
      if (!u) createdByUserId = null;
    }

    if (!createdByUserId) {
      const doctorUser = await User.findOne({ role: 'doctor' }).lean();
      createdByUserId = doctorUser?._id || null;
    }

    await ClinicalRecord.create({
      patientId: appt.patientId,
      appointmentId: appt._id,
      procedures: Array.isArray(c.procedures) ? c.procedures : [],
      consultationNotes: c.consultationNotes || undefined,
      createdByUserId,
      createdByRole: 'doctor',
      status: c.status || 'completed',
      // timestamps will be auto-managed by mongoose unless you need exact fixtures timestamps
    });

    clinicalCreated++;
  }

  console.log(`[auto_seed_demo] appointments created=${apptCreated}`);
  console.log(`[auto_seed_demo] clinical created=${clinicalCreated} skipped=${clinicalSkipped}`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error('[auto_seed_demo] failed:', e);
  process.exit(1);
});

