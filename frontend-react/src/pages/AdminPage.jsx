import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function AdminPage() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch('/admin/users')
        const data = await resp.json()
        if (resp.ok) setUsers(data)
      } catch {}
    })()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin - Staff Users</h2>
      <pre style={{ background: '#f5f5f5', padding: 12 }}>{JSON.stringify(users, null, 2)}</pre>
    </div>
  )
}

