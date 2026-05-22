import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function Registry() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch('/patients')
        const data = await resp.json()
        if (resp.ok) setPatients(data)
      } catch {}
    })()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>Patient Registry</h2>
      <pre style={{ background: '#f5f5f5', padding: 12 }}>{JSON.stringify(patients, null, 2)}</pre>
    </div>
  )
}

