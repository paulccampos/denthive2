import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div style={{ padding: 24 }}>
      <h1>DentHive</h1>
      <p>Landing page (React) — hooked up to backend later.</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign up</Link>
      </div>
    </div>
  )
}

