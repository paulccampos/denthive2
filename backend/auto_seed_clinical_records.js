const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Appointment = require('./models/Appointment');
const ClinicalRecord = require('./models/ClinicalRecord');
const Patient = require('./models/Patient');
const User = require('./models/User');

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const DB_NAME = process.env.MONGO_DB || 'denthive';

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });

  const fixturePath = path.join(__dirname, 'fixtures', 'clinical_records.example.json');
  const raw = fs.readFileSync(fixturePath, 'utf8');
  const fixtures = JSON.parse(raw);

  // Ensure clinical records are created only if they don't already exist.
  // Use appointmentId uniqueness to avoid duplicates.
  let created = 0;
  let skipped = 0;

  for (const f of fixtures) {
    // In fixtures, patientId/appointmentId are ObjectId strings.
    // Our DB may not contain those same ids; so we try to match by appointmentId first.
    const appt = await Appointment.findById(f.appointmentId).lean();

    if (!appt) {
      // If appointment doesn't exist, we can't link safely.
      skipped++;
      continue;
    }

    const patientId = appt.patientId;

    const exists = await ClinicalRecord.findOne({ appointmentId: appt._id }).lean();
    if (exists) {
      skipped++;
      continue;
    }

    // createdByUserId should reference a real user; fallback to the doctor user if fixture id missing.
    let createdByUserId = f.createdByUserId;
    if (createdByUserId) {
      const u = await User.findById(createdByUserId).lean();
      if (!u) createdByUserId = null;
    }

    if (!createdByUserId) {
      const doctorUser = await User.findOne({ role: 'doctor' }).lean();
      createdByUserId = doctorUser?._id || null;
    }

    await ClinicalRecord.create({
      patientId,
      appointmentId: appt._id,
      procedures: f.procedures || [],
      consultationNotes: f.consultationNotes || undefined,
      createdByUserId,
      createdByRole: 'doctor',
      status: f.status || 'completed',
    });

    created++;
  }

  console.log(`[auto_seed_clinical_records] done. created=${created} skipped=${skipped}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error('[auto_seed_clinical_records] failed:', e);
  process.exit(1);
});

