const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
    patientNameSnapshot: { type: String },

    serviceType: { type: String, required: true },
    preferredDoctor: { type: String },

    scheduledAt: { type: Date, required: true },
    toothFlags: [{ type: String }], // e.g. ['Upper 1','Lower 3']

    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    status: {
      type: String,
      enum: ['scheduled', 'waiting', 'calling', 'in_progress', 'completed', 'canceled', 'archived'],
      default: 'waiting',
      index: true,
    },

    // Queue ordering (optional). Used by QueueManagement drag/drop.
    queuePosition: { type: Number, index: true },

    checkedInAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

