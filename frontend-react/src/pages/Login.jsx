import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function Login() {
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [showDemo, setShowDemo] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await apiFetch('/auth/login', {
        method: 'POST',
        body: { identity, password },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('denthiveToken', data.token)

      if (data.role === 'patient') navigate('/bookingpage')
      else if (data.role === 'secretary') navigate('/queuemanagement')
      else if (data.role === 'admin') navigate('/adminpage')
      else navigate('/patientdashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <label>
          <div>Username or Email</div>
          <input value={identity} onChange={(e) => setIdentity(e.target.value)} required />
        </label>
        <label>
          <div>Password</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button disabled={loading} type="submit">
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={() => setShowDemo((s) => !s)}
          style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#005dac', cursor: 'pointer', padding: 0 }}
        >
          Privacy Policy (demo accounts)
        </button>

        {showDemo && (
          <div style={{ marginTop: 10, border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Password for ALL accounts: patient1</div>
            <div>Admin: <b>admin</b> (admin@denthive.local)</div>
            <div>Secretary: <b>secretary</b> (secretary@denthive.local)</div>
            <div>Doctor: <b>doctor</b> (doctor@denthive.local)</div>
            <div>Patient: <b>patient</b> (patient@denthive.local)</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={() => navigate('/signup')}>Create Patient Account</button>
      </div>
    </div>
  )
}

