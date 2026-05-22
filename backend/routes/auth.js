const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { signToken } = require('../utils/auth');

const router = express.Router();

function createPatientId(counter) {
  // DC-9821 style but deterministic
  const n = String(counter).padStart(4, '0');
  return `DC-${n}`;
}

router.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, phone, dob, gender } = req.body || {};
    if (!password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!email && !username) return res.status(400).json({ error: 'Provide email or username' });

    const passwordHash = await bcrypt.hash(password, 10);

    // generate denthivePatientId using count of patients
    const total = await Patient.countDocuments();
    const denthivePatientId = createPatientId(total + 1);

    const patient = await Patient.create({
      denthivePatientId,
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      status: 'active',
    });

    const user = await User.create({
      email,
      username,
      passwordHash,
      role: 'patient',
      patientId: patient._id,
      active: true,
    });

    patient.userId = user._id;
    await patient.save();

    return res.status(201).json({ token: signToken(user), role: user.role });
  } catch (e) {
    if (String(e).includes('duplicate key')) {
      return res.status(409).json({ error: 'User already exists' });
    }
    return res.status(500).json({ error: 'Register failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identity, password } = req.body || {};
    if (!identity || !password) return res.status(400).json({ error: 'Missing identity/password' });

    const q = { active: true };
    const user =
      (await User.findOne({ ...q, email: identity })) ||
      (await User.findOne({ ...q, username: identity }));

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    return res.json({ token: signToken(user), role: user.role, userId: user._id });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = { authRouter: router };

