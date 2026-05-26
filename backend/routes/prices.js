const express = require('express');
const ProcedurePrice = require('../models/ProcedurePrice');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

// Public read (patients need to see before booking)
router.get('/', async (req, res) => {
  try {
    const { serviceType, common } = req.query || {};

    const filter = {};
    if (serviceType) filter.serviceType = serviceType;
    if (common === 'true') filter.isCommon = true;

    const items = await ProcedurePrice.find(filter).sort({ pricePHP: 1 }).lean();
    return res.json({ prices: items });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load prices' });
  }
});

// Doctors (and other staff) can add/update prices
router.post('/', requireAuth(['doctor', 'secretary', 'admin']), async (req, res) => {
  try {
    const { serviceType, pricePHP, description, isCommon = true } = req.body || {};

    if (!serviceType || typeof pricePHP !== 'number') {
      return res.status(400).json({ error: 'Missing serviceType/pricePHP' });
    }

    const updated = await ProcedurePrice.findOneAndUpdate(
      { serviceType },
      { $set: { serviceType, pricePHP, description, isCommon } },
      { upsert: true, new: true }
    ).lean();

    return res.status(201).json({ price: updated });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save price' });
  }
});

module.exports = { pricesRouter: router };

