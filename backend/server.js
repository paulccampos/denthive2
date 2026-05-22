const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const { authRouter } = require('./routes/auth');
const { patientsRouter } = require('./routes/patients');
const { appointmentsRouter } = require('./routes/appointments');
const { queueRouter } = require('./routes/queue');
const { clinicalRouter } = require('./routes/clinical');
const { adminRouter } = require('./routes/admin');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const PORT = process.env.PORT || 3000;
// MongoDB should be listening on localhost:27017 (Mongo default). Your original spec had 270127; keep env override support.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

const DB_NAME = process.env.MONGO_DB || 'denthive';


async function start() {
  await mongoose.connect(MONGO_URI, {
    dbName: DB_NAME,
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Serve frontend (local run, no bundler)
  const path = require('path');
  const frontendRoot = path.join(__dirname, '..', 'frontend');

  // Serve HTML pages so /login works, /signup works, etc.
  app.use(express.static(frontendRoot));
  app.get('/', (_req, res) => res.sendFile(path.join(frontendRoot, 'landingpage.html')));

  // Convenience routes
  app.get('/login', (_req, res) => res.sendFile(path.join(frontendRoot, 'login.html')));
  app.get('/signup', (_req, res) => res.sendFile(path.join(frontendRoot, 'signup.html')));
  app.get('/bookingpage', (_req, res) => res.sendFile(path.join(frontendRoot, 'bookingpage.html')));
  app.get('/patientdashboard', (_req, res) => res.sendFile(path.join(frontendRoot, 'patientdashboard.html')));
  app.get('/queuemanagement', (_req, res) => res.sendFile(path.join(frontendRoot, 'queuemanagement.html')));
  app.get('/registry', (_req, res) => res.sendFile(path.join(frontendRoot, 'registry.html')));
  app.get('/adminpage', (_req, res) => res.sendFile(path.join(frontendRoot, 'adminpage.html')));


  app.use('/api/auth', authRouter);
  app.use('/api/patients', patientsRouter);
  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/queue', queueRouter);
  app.use('/api/clinical-records', clinicalRouter);
  app.use('/api/admin', adminRouter);

  // seed default users
  const { seedDefaults } = require('./seed');
  await seedDefaults();

  app.listen(PORT, () => {
    console.log(`[DentHive] API running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[DentHive] Failed to start:', err);
  process.exit(1);
});

