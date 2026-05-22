import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch('/patients/me')
        const data = await resp.json()
        if (resp.ok) setPatient(data)
      } catch {}
    })()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>Patient Dashboard</h2>
      {patient ? (
        <pre style={{ background: '#f5f5f5', padding: 12 }}>{JSON.stringify(patient, null, 2)}</pre>
      ) : (
        <p>Loading patient data...</p>
      )}
    </div>
  )
}

