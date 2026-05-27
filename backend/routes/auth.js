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

    // Debug (no password logging): verify identity received + what lookup matched
    console.log('[DentHive][Auth] login identity:', {
      identity: normalizedIdentity,
      emailLookup: identityEmail,
      usernameLookup: identityUsername,
    });

    const user =
      (await User.findOne({ ...q, email: identityEmail })) ||
      (await User.findOne({ ...q, username: identityUsername }));

    console.log('[DentHive][Auth] user found:', !!user, user ? { id: user._id.toString(), role: user.role, active: user.active } : null);


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

    // Password acceptance rules for this app:
    // 1) If DB stores a bcrypt hash => bcrypt.compare(plainProvided, storedHash)
    // 2) If DB stores plain text => plain compare
    // 3) If the provided password itself is a bcrypt hash, we ALSO allow:
    //    - bcrypt.compare(providedHash, storedHash) (best-effort)
    //    - direct equality (in case someone inserted hashes as plain strings)
    let ok = false;
    const stored = user.passwordHash || '';
    const provided = typeof password === 'string' ? password : '';

    const storedLooksLikeBcrypt = typeof stored === 'string' && stored.startsWith('$2');
    const providedLooksLikeBcrypt = typeof provided === 'string' && provided.startsWith('$2');

    if (storedLooksLikeBcrypt) {
      // Normal case: plain password against bcrypt hash
      ok = await bcrypt.compare(provided, stored);

      // If caller provided a bcrypt hash string, try to match hash-to-hash.
      if (!ok && providedLooksLikeBcrypt) {
        // Common case: stored hash equals provided hash.
        if (provided === stored) ok = true;
        // Best-effort fallback: bcrypt.compare(hashString, storedHash)
        if (!ok) ok = await bcrypt.compare(provided, stored);
      }
    } else {
      // Plain-text password stored
      ok = provided === stored;

      // If stored was plain text but someone inserted a bcrypt hash as the plaintext,
      // allow direct equality already covered above.
      if (!ok && providedLooksLikeBcrypt && storedLooksLikeBcrypt) {
        ok = await bcrypt.compare(provided, stored);
      }
    }

    // Extra safe-guard diagnostics (without leaking passwords)
    // eslint-disable-next-line no-console
    console.log('[DentHive][Auth] password check:', {
      storedLooksLikeBcrypt,
      providedLooksLikeBcrypt,
      ok,
      userId: user._id.toString(),
      role: user.role,
    });



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

