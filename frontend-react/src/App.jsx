import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Booking from './pages/Booking.jsx'
import PatientDashboard from './pages/PatientDashboard.jsx'
import QueueManagement from './pages/QueueManagement.jsx'
import Registry from './pages/Registry.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/bookingpage" element={<Booking />} />
      <Route path="/patientdashboard" element={<PatientDashboard />} />
      <Route path="/queuemanagement" element={<QueueManagement />} />
      <Route path="/registry" element={<Registry />} />
      <Route path="/adminpage" element={<AdminPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

