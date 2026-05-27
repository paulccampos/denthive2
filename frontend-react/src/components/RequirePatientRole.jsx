import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function getJwtRole(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(payloadB64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    const payload = JSON.parse(json)
    return payload?.role ?? null
  } catch {
    return null
  }
}

export default function RequirePatientRole({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('denthiveToken')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const role = getJwtRole(token)
    if (role !== 'patient') {
      // route back to the role-appropriate page
      if (role === 'secretary') navigate('/queuemanagement', { replace: true })
      else if (role === 'admin') navigate('/adminpage', { replace: true })
      else if (role === 'doctor') navigate('/doctorbookings', { replace: true })
      else navigate('/', { replace: true })
    }
  }, [navigate])

  return <>{children}</>
}

