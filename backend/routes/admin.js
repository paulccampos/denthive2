const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

// Staff list: admin-only view
router.get('/users', requireAuth(['admin']), async (_req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).limit(200);
  res.json({ users });
});

// Staff creation: no auth required so the “Create Staff” UI can add accounts
router.post('/users', async (req, res) => {
  try {
    const { email, username, password, role } = req.body || {};
    if (!password || !role || !['doctor', 'secretary', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid payload/role' });
    }
    if (!email && !username) return res.status(400).json({ error: 'Provide email or username' });

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
    const normalizedUsername = typeof username === 'string' ? username.trim() : username;

    // Keep signup rule consistent: if an email is provided, it must end with "email.com"
    if (normalizedEmail && !normalizedEmail.endsWith('email.com')) {
      return res.status(400).json({ error: 'Email must end with email.com' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash,
      role,
      active: true,
    });


    return res.status(201).json({ user: { id: user._id, role: user.role } });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = { adminRouter: router };

