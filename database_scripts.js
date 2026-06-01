/**
 * Database scripts for DentHive (MongoDB/Mongoose)
 * ---------------------------------------------------
 * This file collects all schema/model definitions (as Mongoose code)
 * and provides helper scripts to initialize indexes and seed defaults.
 *
 * Usage:
 *   1) Make sure MongoDB is running and set env MONGO_URI / MONGO_DB
 *   2) Run with node:
 *        node backend/database_scripts.js init-indexes
 *        node backend/database_scripts.js seed-defaults
 *
 * Notes:
 * - The app itself uses Mongoose models in backend/models/*.js.
 * - This file is meant as a consolidated “all database scripts” artifact.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ------------------------------
// Connection helper
// ------------------------------

async function connect({ mongoUri, dbName } = {}) {
  const MONGO_URI = mongoUri || process.env.MONGO_URI || 'mongodb://localhost:27017';
  const DB_NAME = dbName || process.env.MONGO_DB || 'denthive';
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  return mongoose.connection;
}

// ----
// NOTE FOR DOCUMENTATION PURPOSES
// ----
// This file is intended primarily to document the database shape.
// It defines the Mongoose schemas/models, but you can skip any DB interaction.
// The CLI commands below only run when you explicitly call them:
//   node backend/database_scripts.js init-indexes
//   node backend/database_scripts.js seed-defaults
// They are NOT executed on import.


// ------------------------------
// Schemas (mirrors backend/models/*)
// ------------------------------

function buildModels() {
  // Avoid model overwrite when requiring repeatedly
  // eslint-disable-next-line no-unused-vars
  const existing = (name) => mongoose.models[name];

  const userSchema = new mongoose.Schema(
    {
      // email/username are NOT unique in this system so multiple patient accounts can be created.
      // sparse keeps Mongo from indexing missing values.
      email: { type: String, sparse: true },
      username: { type: String, sparse: true },

      passwordHash: { type: String, required: true },
      role: {
        type: String,
        enum: ['patient', 'doctor', 'secretary', 'admin'],
        default: 'patient',
        index: true,
      },
      active: { type: Boolean, default: true },

      // link to patient record (for patient users)
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    },
    { timestamps: true }
  );

  // Important: do not auto-create indexes for email/username
  userSchema.set('autoIndex', false);

  const patientSchema = new mongoose.Schema(
    {
      // DentHive id (human)
      denthivePatientId: { type: String, index: true },

      firstName: { type: String, required: true },
      lastName: { type: String, required: true },

      email: { type: String },
      phone: { type: String },
      address: { type: String },
      dob: { type: Date },
      gender: { type: String },

      allergies: [{ type: String }],
      medications: [{ type: String }],
      chronicConditions: [{ type: String }],

      outstandingBalance: { type: Number, default: 0 },

      status: {
        type: String,
        enum: ['active', 'pending', 'archived'],
        default: 'active',
        index: true,
      },

      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
  );

  const appointmentSchema = new mongoose.Schema(
    {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
      patientNameSnapshot: { type: String },

      serviceType: { type: String, required: true },
      preferredDoctor: { type: String },

      scheduledAt: { type: Date, required: true },
      toothFlags: [{ type: String }],

      createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

      status: {
        type: String,
        enum: [
          'scheduled',
          'waiting',
          'calling',
          'in_progress',
          'next',
          'completed',
          'canceled',
          'archived',
        ],
        default: 'waiting',
        index: true,
      },

      queuePosition: { type: Number, index: true },

      checkedInAt: { type: Date },
      completedAt: { type: Date },
    },
    { timestamps: true }
  );

  const clinicalRecordSchema = new mongoose.Schema(
    {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', index: true },

      // tooth procedure markers
      procedures: [
        {
          tooth: { type: String },
          procedure: { type: String },
          extracted: { type: Boolean, default: false },
        },
      ],

      consultationNotes: { type: String },
      pricePHP: { type: Number },

      createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdByRole: { type: String, enum: ['doctor'], default: 'doctor' },

      status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
    },
    { timestamps: true }
  );

  const procedurePriceSchema = new mongoose.Schema(
    {
      serviceType: { type: String, required: true, index: true, unique: true },
      pricePHP: { type: Number, required: true },
      description: { type: String },
      isCommon: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  const finishedAppointmentSchema = new mongoose.Schema(
    {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
      patientNameSnapshot: { type: String },

      serviceType: { type: String, required: true },
      preferredDoctor: { type: String },

      scheduledAt: { type: Date, required: true },
      toothFlags: [{ type: String }],

      createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', index: true },

      consultationNotes: { type: String },
      procedures: [
        {
          tooth: { type: String },
          procedure: { type: String },
          extracted: { type: Boolean, default: false },
        },
      ],

      pricePHP: { type: Number, required: true },

      status: {
        type: String,
        enum: ['finished', 'paid', 'archived'],
        index: true,
        default: 'finished',
      },

      finishedAt: { type: Date, default: () => new Date() },
      paidAt: { type: Date },

      createdByRole: { type: String, enum: ['doctor'], default: 'doctor' },
    },
    { timestamps: true, collection: 'finished' }
  );

  const historyAppointmentSchema = new mongoose.Schema(
    {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
      patientNameSnapshot: { type: String },

      serviceType: { type: String, required: true },
      preferredDoctor: { type: String },

      scheduledAt: { type: Date, required: true },
      toothFlags: [{ type: String }],

      createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

      status: {
        type: String,
        enum: ['scheduled', 'waiting', 'calling', 'in_progress', 'next', 'completed', 'canceled', 'archived'],
        index: true,
      },

      queuePosition: { type: Number, index: true },

      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', index: true },

      checkedInAt: { type: Date },
      completedAt: { type: Date },
      historyReason: { type: String },
    },
    { timestamps: true, collection: 'history' }
  );

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
  const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
  const ClinicalRecord = mongoose.models.ClinicalRecord || mongoose.model('ClinicalRecord', clinicalRecordSchema);
  const ProcedurePrice = mongoose.models.ProcedurePrice || mongoose.model('ProcedurePrice', procedurePriceSchema);
  const FinishedAppointment =
    mongoose.models.FinishedAppointment || mongoose.model('FinishedAppointment', finishedAppointmentSchema);
  const HistoryAppointment =
    mongoose.models.HistoryAppointment || mongoose.model('HistoryAppointment', historyAppointmentSchema);

  return { User, Patient, Appointment, ClinicalRecord, ProcedurePrice, FinishedAppointment, HistoryAppointment };
}

// ------------------------------
// Scripts
// ------------------------------

async function initIndexes() {
  const models = buildModels();

  // NOTE: In MongoDB, re-creating indexes can fail if the same index name
  // already exists with a different definition. To keep this script safe to
  // run repeatedly, we attempt index creation and ignore conflicts.

  await Promise.all([
    models.Patient.init(),
    models.Appointment.init(),
    models.ClinicalRecord.init(),
    models.ProcedurePrice.init(),
    models.FinishedAppointment.init(),
    models.HistoryAppointment.init(),
  ]);

  const safeCreate = async (collection, createFn) => {
    try {
      await createFn();
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      if (
        msg.includes('IndexKeySpecsConflict') ||
        msg.includes('already exists') ||
        msg.includes('same name as the requested index')
      ) {
        // eslint-disable-next-line no-console
        console.warn('[DentHive][DB] Index already exists/conflict; skipping.');
        return;
      }
      throw e;
    }
  };

  await safeCreate(models.Patient.collection, () => models.Patient.collection.createIndexes());
  await safeCreate(models.Appointment.collection, () => models.Appointment.collection.createIndexes());
  await safeCreate(models.ClinicalRecord.collection, () => models.ClinicalRecord.collection.createIndexes());
  await safeCreate(models.ProcedurePrice.collection, () => models.ProcedurePrice.collection.createIndexes());
  await safeCreate(models.FinishedAppointment.collection, () => models.FinishedAppointment.collection.createIndexes());
  await safeCreate(models.HistoryAppointment.collection, () => models.HistoryAppointment.collection.createIndexes());

  console.log('[DentHive][DB] Indexes init complete (best-effort)');
}



async function seedDefaults() {
  const { User, ProcedurePrice, Patient } = buildModels();

  const hashPw = async (pw) => bcrypt.hash(pw, 10);

  // In app seed.js currently seeds procedure prices and prints demo staff skeletons removed.
  // Here we mirror the currently active behavior in backend/seed.js.
  const priceSeed = [
    { serviceType: 'General Checkup', pricePHP: 800, description: 'Initial consultation and basic exam', isCommon: true },
    { serviceType: 'Dental Cleaning', pricePHP: 1200, description: 'Scaling, polishing, and oral hygiene session', isCommon: true },
    { serviceType: 'Tooth Extraction', pricePHP: 2500, description: 'Simple extraction estimate', isCommon: false },
    { serviceType: 'Root Canal', pricePHP: 5500, description: 'Per tooth estimate (varies by complexity)', isCommon: false },
    { serviceType: 'Orthodontic Consult', pricePHP: 1500, description: 'Assessment for braces/aligners', isCommon: true },
    { serviceType: 'Teeth Whitening', pricePHP: 4500, description: 'In-office whitening estimate', isCommon: false },
  ];

  for (const p of priceSeed) {
    await ProcedurePrice.findOneAndUpdate({ serviceType: p.serviceType }, { $set: p }, { upsert: true, new: true });
  }

  // Seed login accounts (disabled demo staff, but in backend/seed.js it prints seeded login accounts).
  // The current seed.js has an empty defaults array and therefore does NOT create staff users.
  // We keep that same logic.

  console.log('[DentHive] Seeded procedure prices');

  // If you need a patient account, create it via /api/auth/register.
  // (This script intentionally does not create demo patient records.)

  // Small sanity output
  const totalPatients = await Patient.estimatedDocumentCount();
  console.log('[DentHive] Current patient count:', totalPatients);
}

// ------------------------------
// CLI
// ------------------------------

async function main() {
  const cmd = process.argv[2] || 'help';

  await connect();

  try {
    if (cmd === 'init-indexes') {
      await initIndexes();
    } else if (cmd === 'seed-defaults') {
      await seedDefaults();
    } else {
      console.log(`Usage:
  node backend/database_scripts.js init-indexes
  node backend/database_scripts.js seed-defaults
`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('[DentHive][DB] Failed:', err);
  process.exit(1);
});

