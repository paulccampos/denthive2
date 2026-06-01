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
const { pricesRouter } = require('./routes/prices');
const { historyRouter } = require('./routes/history');
const { doctorAppointmentsRouter } = require('./routes/doctorAppointments');
const { finishedRouter } = require('./routes/finished');
const { doctorsRouter } = require('./routes/doctors');








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

const PORT = process.env.PORT || 5000;
// MongoDB should be listening on localhost:27017 (Mongo default). Your original spec had 270127; keep env override support.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

const DB_NAME = process.env.MONGO_DB || 'denthive';


async function start() {
  await mongoose.connect(MONGO_URI, {
    dbName: DB_NAME,
  });

  // Debug: confirm which MongoDB + database the API is actually connected to.
  // This helps diagnose "invalid credentials" when editing users in a different DB.
  const resolvedMongoUri = mongoose.connection.client?.s?.url || MONGO_URI;
  const actualDbName = mongoose.connection?.db?.databaseName;
  console.log('[DentHive][Mongo] MONGO_URI:', resolvedMongoUri);
  console.log('[DentHive][Mongo] MONGO_DB (env):', DB_NAME);
  console.log('[DentHive][Mongo] connected databaseName:', actualDbName);


  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Serve React frontend build instead of plain HTML pages
  const path = require('path');
  const frontendRoot = path.join(__dirname, '..', 'frontend-react', 'dist');

  app.use(express.static(frontendRoot));

  // SPA fallback: let React Router handle /login, /signup, etc.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(frontendRoot, 'index.html'));
  });

  app.use('/api/auth', authRouter);
  app.use('/api/patients', patientsRouter);
  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/queue', queueRouter);
  app.use('/api/clinical-records', clinicalRouter);
  app.use('/api/prices', pricesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/history', historyRouter);
app.use('/api/doctor-appointments', doctorAppointmentsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/finished', finishedRouter);





// NOTE: Seeding disabled by default.



  // Login relies only on existing DB records.

  app.listen(PORT, () => {

    console.log(`[DentHive] API running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[DentHive] Failed to start:', err);
  process.exit(1);
});

