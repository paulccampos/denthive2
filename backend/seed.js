const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Patient = require('./models/Patient');

async function seedDefaults() {
  const defaults = [
    // Password for ALL seeded accounts is: patient1
    { role: 'admin', email: 'admin@denthive.local', password: 'patient1', username: 'admin' },
    { role: 'secretary', email: 'secretary@denthive.local', password: 'patient1', username: 'secretary' },
    { role: 'doctor', email: 'doctor@denthive.local', password: 'patient1', username: 'doctor' },
  ];

  const hashPw = async (pw) => bcrypt.hash(pw, 10);

  // Ensure staff accounts always exist (even if patients already exist)
  for (const d of defaults) {
    // Avoid slow $or with two unique indexes: try email first, then username.
    const existsByEmail = await User.findOne({ email: d.email }).lean();
    const existsByUsername = !existsByEmail ? await User.findOne({ username: d.username }).lean() : null;

    const exists = existsByEmail || existsByUsername;

    if (exists && exists._id) {
      await User.updateOne(
        { _id: exists._id },
        {
          $set: {
            role: d.role,
            active: true,
            passwordHash: await hashPw(d.password),
          },
        }
      );
      continue;
    }

    await User.create({
      email: d.email,
      username: d.username,
      passwordHash: await hashPw(d.password),
      role: d.role,
      active: true,
    });
  }

  // Ensure demo patient + user exist
  const patient = await Patient.findOne({ denthivePatientId: 'DC-0001' });
  if (!patient) {
    const created = await Patient.create({
      denthivePatientId: 'DC-0001',
      firstName: 'Demo',
      lastName: 'Patient',
      email: 'patient@denthive.local',
      phone: '+1 555 000 0000',
      status: 'active',
    });

    const user = await User.create({
      email: created.email,
      username: 'patient',
      passwordHash: await hashPw('patient1'),
      role: 'patient',
      active: true,
      patientId: created._id,
    });

    created.userId = user._id;
    await created.save();
  } else {
    // Ensure patient user exists
    if (!patient.userId) {
      const existingUser = await User.findOne({ role: 'patient', patientId: patient._id });
      if (!existingUser) {
        const user = await User.create({
          email: patient.email,
          username: 'patient',
          passwordHash: await hashPw('patient1'),
          role: 'patient',
          active: true,
          patientId: patient._id,
        });
        patient.userId = user._id;
        await patient.save();
      }
    } else {
      // Keep password stable for demo
      await User.updateOne(
        { _id: patient.userId },
        { $set: { passwordHash: await hashPw('patient1'), active: true } }
      );
    }
  }

  const seeded = {
    password: 'patient1',
    accounts: [
      { role: 'admin', username: 'admin', email: 'admin@denthive.local' },
      { role: 'secretary', username: 'secretary', email: 'secretary@denthive.local' },
      { role: 'doctor', username: 'doctor', email: 'doctor@denthive.local' },
      { role: 'patient', username: 'patient', email: 'patient@denthive.local', denthivePatientId: 'DC-0001' },
    ],
  };

  // eslint-disable-next-line no-console
  console.log('[DentHive] Seeded login accounts (all password: patient1)');
  console.log(JSON.stringify(seeded, null, 2));
}

module.exports = { seedDefaults };



