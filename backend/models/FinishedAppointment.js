const mongoose = require('mongoose');

// Represents a doctor-finished procedure that has not yet been paid.
// After payment, secretary moves the record into the immutable `history` collection.
const finishedAppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
    patientNameSnapshot: { type: String },

    serviceType: { type: String, required: true },
    preferredDoctor: { type: String },

    // The appointment time the procedure was finished for (doctor completion time workflow).
    scheduledAt: { type: Date, required: true },
    toothFlags: [{ type: String }],

    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Link back to original appointment (optional, but helpful for debugging)
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', index: true },

    // Procedure details
    consultationNotes: { type: String },
    procedures: [
      {
        tooth: { type: String },
        procedure: { type: String },
        extracted: { type: Boolean, default: false },
      },
    ],

    // Payment status
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

module.exports = mongoose.model('FinishedAppointment', finishedAppointmentSchema);

