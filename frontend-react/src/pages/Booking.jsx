import React, { useState } from 'react'
import { apiFetch } from '../lib/api'

export default function Booking() {
  const [reason, setReason] = useState('General Checkup')
  const [time, setTime] = useState('10:30 AM')
  const [loading, setLoading] = useState(false)
  const [teeth, setTeeth] = useState([])

  async function confirmBooking() {
    setLoading(true)
    try {
      const resp = await apiFetch('/appointments', {
        method: 'POST',
        body: {
          serviceType: reason,
          scheduledAt: time,
          selectedTeeth: teeth,
          notes: '',
        },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Booking failed')
      alert('Booking confirmed (queue updated).')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h2>Book Appointment</h2>

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <label>
          Reason
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>General Checkup</option>
            <option>Dental Cleaning</option>
            <option>Tooth Extraction</option>
            <option>Root Canal</option>
            <option>Orthodontic Consult</option>
            <option>Teeth Whitening</option>
          </select>
        </label>

        <label>
          Time
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option>09:00 AM</option>
            <option>09:45 AM</option>
            <option>10:30 AM</option>
            <option>11:15 AM</option>
            <option>01:45 PM</option>
            <option>02:30 PM</option>
            <option>03:15 PM</option>
          </select>
        </label>

        <label>
          Teeth (simple demo):
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {['Upper 1', 'Upper 2', 'Upper 3', 'Lower 1', 'Lower 2', 'Lower 3'].map((t) => {
              const on = teeth.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTeeth((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))}
                  style={{
                    border: '1px solid #aaa',
                    borderRadius: 999,
                    padding: '6px 10px',
                    background: on ? '#1976d2' : 'transparent',
                    color: on ? 'white' : '#071e27',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </label>

        <button disabled={loading} onClick={confirmBooking} style={{ marginTop: 6 }}>
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}

