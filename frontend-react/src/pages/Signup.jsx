import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await apiFetch('/auth/register', {
        method: 'POST',
        body: { firstName, lastName, email, phone, username, password },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Signup failed')
      localStorage.setItem('denthiveToken', data.token)

      // after signup, send to booking
      navigate('/bookingpage')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
      <h2>Sign up</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <label><div>First name</div><input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></label>
        <label><div>Last name</div><input value={lastName} onChange={(e) => setLastName(e.target.value)} required /></label>
        <label><div>Email</div><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label>
        <label><div>Phone</div><input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <label><div>Username (optional)</div><input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label><div>Password</div><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></label>
        <button disabled={loading} type="submit">{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
    </div>
  )
}

