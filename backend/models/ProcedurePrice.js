const mongoose = require('mongoose');

const procedurePriceSchema = new mongoose.Schema(
  {
    // Tied to Appointment.serviceType (Reason for visit / visit category)
    serviceType: { type: String, required: true, index: true, unique: true },

    // Peso pricing
    pricePHP: { type: Number, required: true },

    // Optional metadata
    description: { type: String },
    isCommon: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProcedurePrice', procedurePriceSchema);

