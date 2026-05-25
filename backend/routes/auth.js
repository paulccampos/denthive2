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

    // Normalize email: users should be able to login reliably using email.
    // Also prevents “email.com” / casing / whitespace issues.
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
    const normalizedUsername = typeof username === 'string' ? username.trim() : username;

    // Enforce your current rule: emails must end with "email.com" (if email provided)
    if (normalizedEmail && !normalizedEmail.endsWith('email.com')) {
      return res.status(400).json({ error: 'Email must end with email.com' });
    }

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
    const { identity, password, role } = req.body || {};
    if (!identity || !password) return res.status(400).json({ error: 'Missing identity/password' });

    const normalizedIdentity = typeof identity === 'string' ? identity.trim() : identity;
    const identityEmail = typeof normalizedIdentity === 'string' ? normalizedIdentity.toLowerCase() : normalizedIdentity;
    const identityUsername = typeof normalizedIdentity === 'string' ? normalizedIdentity : normalizedIdentity;

    const q = { active: true };
    const user =
      (await User.findOne({ ...q, email: identityEmail })) ||
      (await User.findOne({ ...q, username: identityUsername }));

    if (!user) {
      // If client provides a staff role, auto-create the staff user (signup-like) and then sign in.
      const allowedRoles = ['doctor', 'secretary', 'admin'];
      if (role && allowedRoles.includes(role)) {
        const normalizedEmail = typeof identityEmail === 'string' ? identityEmail.trim().toLowerCase() : identityEmail;
        const normalizedUsername = typeof identityUsername === 'string' ? identityUsername.trim() : identityUsername;

        // Keep signup rule consistent: if login value looks like an email, enforce it.
        if (typeof normalizedEmail === 'string' && normalizedEmail.includes('@') && !normalizedEmail.endsWith('email.com')) {
          return res.status(400).json({ error: 'Email must end with email.com' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
          email: typeof normalizedEmail === 'string' && normalizedEmail.includes('@') ? normalizedEmail : undefined,
          username: typeof normalizedUsername === 'string' ? normalizedUsername : undefined,
          passwordHash,
          role,
          active: true,
        });

        return res.json({ token: signToken(newUser), role: newUser.role, userId: newUser._id });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Support both bcrypt hashes and plain-text passwords (for cases where DB was edited manually)
    let ok = false;
    const stored = user.passwordHash || '';
    const looksLikeBcryptHash = typeof stored === 'string' && stored.startsWith('$2');

    if (looksLikeBcryptHash) {
      ok = await bcrypt.compare(password, stored);
    } else {
      ok = password === stored;
    }

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    return res.json({ token: signToken(user), role: user.role, userId: user._id });
  } catch (e) {
    if (String(e).includes('duplicate key')) {
      return res.status(409).json({ error: 'User already exists' });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = { authRouter: router };

