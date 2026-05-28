const mongoose = require('mongoose');

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

// IMPORTANT: do NOT create unique indexes on email/username.
// Also, do not add any .index({ email: 1 }) / .index({ username: 1 }).

userSchema.set('autoIndex', false);

module.exports = mongoose.model('User', userSchema);




