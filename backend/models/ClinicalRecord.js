const mongoose = require('mongoose');

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

    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByRole: { type: String, enum: ['doctor'], default: 'doctor' },

    status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicalRecord', clinicalRecordSchema);

