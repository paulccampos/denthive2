const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Patient = require('./models/Patient');

async function seedDefaults() {
  // create default staff accounts if missing
  const defaults = [
    // Password for ALL seeded accounts is: patient1
    { role: 'admin', email: 'admin@denthive.local', password: 'patient1', username: 'admin' },
    { role: 'secretary', email: 'secretary@denthive.local', password: 'patient1', username: 'secretary' },
    { role: 'doctor', email: 'doctor@denthive.local', password: 'patient1', username: 'doctor' },
  ];



  for (const d of defaults) {
    const exists = await User.findOne({ $or: [{ email: d.email }, { username: d.username }] });
    if (exists) {
      // keep role in sync and ensure password matches the seeded credentials
      if (exists.role !== d.role) exists.role = d.role;
      exists.active = true;
      exists.passwordHash = await bcrypt.hash(d.password, 10);
      await exists.save();
      continue;
    }

    const passwordHash = await bcrypt.hash(d.password, 10);
    await User.create({ email: d.email, username: d.username, passwordHash, role: d.role, active: true });

  }

  // create a demo patient if none exists
  const patientCount = await Patient.countDocuments();
  // Only seed demo patient when database is empty (keeps credentials stable for testing)
  if (patientCount > 0) {
    return;
  }


  const patient = await Patient.create({
    denthivePatientId: 'DC-0001',
    firstName: 'Demo',
    lastName: 'Patient',
    email: 'patient@denthive.local',
    phone: '+1 555 000 0000',
    status: 'active',
  });

  const passwordHash = await bcrypt.hash('patient1', 10);

  const user = await User.create({
    email: patient.email,
    username: 'patient',
    passwordHash,
    role: 'patient',
    active: true,
    patientId: patient._id,
  });

  patient.userId = user._id;
  await patient.save();

  // Print seeded credentials once per server startup (useful for local testing)
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


