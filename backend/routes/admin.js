const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.get('/users', requireAuth(['admin']), async (_req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).limit(200);
  res.json({ users });
});

router.post('/users', requireAuth(['admin']), async (req, res) => {
  try {
    const { email, username, password, role } = req.body || {};
    if (!password || !role || !['doctor', 'secretary', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid payload/role' });
    }
    if (!email && !username) return res.status(400).json({ error: 'Provide email or username' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
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

