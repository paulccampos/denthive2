const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    // DentHive unique id (human)
    denthivePatientId: { type: String, index: true, unique: true },

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

module.exports = mongoose.model('Patient', patientSchema);

