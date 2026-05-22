const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
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

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);

