const mongoose = require('mongoose');

// Mirrors Appointment fields but stored in the Mongo collection named `history`.
// Used to keep an immutable audit trail for completed/canceled/deleted bookings.
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

    // preserve queue ordering if present
    queuePosition: { type: Number, index: true },

    // link back to the original appointment (for clinical record lookup)
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', index: true },


    checkedInAt: { type: Date },
    completedAt: { type: Date },

    // optional bookkeeping
    historyReason: { type: String },
  },
  { timestamps: true, collection: 'history' }
);

module.exports = mongoose.model('HistoryAppointment', historyAppointmentSchema);

