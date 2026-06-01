const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

// List doctors for booking UI.
// Accessible to logged-in patients + doctors (and also secretary/admin).
// Returns only non-sensitive fields.
router.get('/', requireAuth(['patient', 'doctor', 'secretary', 'admin']), async (req, res) => {
  try {
    const includeInactive = String(req.query.includeInactive || '').toLowerCase() === 'true';

    const filter = {
      role: 'doctor',
      ...(includeInactive ? {} : { active: true }),
    };

    const users = await User.find(filter, { passwordHash: 0 })
      .sort({ createdAt: -1 })
      .limit(200);

    // Frontend expects a contract we can safely render as options.
    // Return explicit objects rather than just a string list.
    const uniqueById = new Map();
    for (const u of users) {
      if (!u) continue;
      const username = u.username || u.email;
      if (!username) continue;
      uniqueById.set(String(u._id), {
        id: String(u._id),
        username,
        role: u.role,
      });
    }

    return res.json({ users: Array.from(uniqueById.values()) });
  } catch {
    return res.status(500).json({ error: 'Failed to load doctors' });
  }
});


module.exports = { doctorsRouter: router };

