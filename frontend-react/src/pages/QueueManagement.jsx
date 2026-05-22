import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function QueueManagement() {
  const [queue, setQueue] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch('/queue?status=waiting')
        const data = await resp.json()
        if (resp.ok) setQueue(data)
      } catch {}
    })()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>Queue Management</h2>
      <pre style={{ background: '#f5f5f5', padding: 12 }}>{JSON.stringify(queue, null, 2)}</pre>
    </div>
  )
}

