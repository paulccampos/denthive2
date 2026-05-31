import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'

const TEETH = [
  'Upper 1',
  'Upper 2',
  'Upper 3',
  'Upper 4',
  'Upper 5',
  'Upper 16',
  'Upper 15',
  'Upper 14',
  'Upper 13',
  'Upper 12',
  'Upper 11',
  'Upper 10',
  'Upper 9',
  'Upper 8',
  'Upper 7',
  'Upper 6',
  'Lower 1',
  'Lower 2',
  'Lower 3',
  'Lower 4',
  'Lower 5',
  'Lower 16',
  'Lower 15',
  'Lower 14',
  'Lower 13',
  'Lower 12',
  'Lower 11',
  'Lower 10',
  'Lower 9',
  'Lower 8',
  'Lower 7',
  'Lower 6',
]

function moneyPHP(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '-'
  return `₱${Number(n).toLocaleString('en-PH')}`
}

export default function DoctorFinished() {
  // In-app only: keep this for route compatibility.
  // Doctors should use popup flow from DoctorBookings.

  // Deprecated: kept for route compatibility, use popup component instead.

  // NOTE: replaced by popup version to avoid invalid JSON issues

  const { appointmentId } = useParams()

  const [appointment, setAppointment] = useState(null)
  const [pricePHP, setPricePHP] = useState('')
  const [consultationNotes, setConsultationNotes] = useState('')

  // Load appointment details so Finish button always has required appointmentId
  useEffect(() => {
    let cancelled = false

    async function loadAppointment() {
      if (!appointmentId) return
      try {
        // Appointments details endpoint: /api/appointments/:id
        const resp = await apiFetch(`/appointments/${encodeURIComponent(appointmentId)}`)
        const data = await resp.json()
        if (cancelled) return
        if (!resp.ok) throw new Error(data.error || 'Failed to load appointment')
        setAppointment(data.appointment || data)
      } catch (e) {
        if (!cancelled) alert(e.message)
      }
    }

    loadAppointment()

    return () => {
      cancelled = true
    }
  }, [appointmentId])


  const [tooth, setTooth] = useState(TEETH[0])
  const [procedure, setProcedure] = useState('General Checkup')
  const [extracted, setExtracted] = useState(false)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    const p = Number(pricePHP)
    return appointment?._id && !Number.isNaN(p) && p > 0
  }, [pricePHP, appointment?._id])

  async function onSubmit() {
    if (!canSubmit) {
      alert('Enter valid pricePHP to finish.')
      return
    }

    const procedures = [{ tooth, procedure, extracted }]

    setLoading(true)
    try {
      const resp = await apiFetch(`/finished/${encodeURIComponent(appointment._id)}/finish`, {
        method: 'POST',
        body: {
          pricePHP: Number(pricePHP),
          consultationNotes,
          procedures,
        },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Finish failed')

      alert('Procedure finished. Secretary can mark it paid.')
      // Caller should refresh; parent decides. For now, hard redirect.
      window.location.href = '/doctorbookings'
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md">
      <div className="bg-surface border border-outline-variant rounded-xl p-lg max-w-2xl mx-auto">
        <h2 className="font-headline-md text-headline-md font-bold text-primary mb-md">Finish Procedure</h2>

        <div className="space-y-sm mb-md">
          <div className="text-xs text-on-surface-variant font-label-caps">Appointment</div>
          <div className="font-bold">{appointment?.serviceType || '-'}</div>
          <div className="text-xs text-on-surface-variant">{appointment?.patientName || appointment?.patientNameSnapshot || '-'}</div>
          <div className="text-xs text-on-surface-variant">Scheduled: {appointment?.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString() : '-'}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
          <div className="space-y-xs">
            <label className="font-label-caps text-on-surface-variant block ml-xs">Price (PHP)</label>
            <input
              className="w-full bg-surface border border-outline-variant rounded-lg px-md py-lg"
              value={pricePHP}
              type="number"
              min="0"
              onChange={(e) => setPricePHP(e.target.value)}
            />
            <div className="text-xs text-on-surface-variant">Current: {moneyPHP(Number(pricePHP))}</div>
          </div>

          <div className="space-y-xs">
            <label className="font-label-caps text-on-surface-variant block ml-xs">Tooth</label>
            <select
              className="w-full bg-surface border border-outline-variant rounded-lg px-md py-lg cursor-pointer"
              value={tooth}
              onChange={(e) => setTooth(e.target.value)}
            >
              {TEETH.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="font-label-caps text-on-surface-variant block ml-xs mt-sm">Procedure</label>
            <input
              className="w-full bg-surface border border-outline-variant rounded-lg px-md py-lg"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
            />

            <label className="flex items-center gap-xs text-xs text-on-surface-variant font-label-caps mt-sm">
              <input type="checkbox" checked={extracted} onChange={(e) => setExtracted(e.target.checked)} />
              Extracted
            </label>
          </div>
        </div>

        <div className="space-y-xs mt-lg">
          <label className="font-label-caps text-on-surface-variant block ml-xs">Doctor Notes</label>
          <textarea
            className="w-full min-h-[120px] bg-surface border border-outline-variant rounded-lg px-md py-lg"
            value={consultationNotes}
            onChange={(e) => setConsultationNotes(e.target.value)}
            placeholder="Enter doctor notes..."
          />
        </div>

        <div className="flex justify-end gap-sm mt-lg">
          <button
            type="button"
            className="px-md py-xs bg-error text-white rounded-lg font-label-caps hover:opacity-90 transition-all"
            disabled={loading}
            onClick={() => (window.location.href = '/doctorbookings')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-md py-xs bg-primary text-white rounded-lg font-label-caps hover:opacity-90 transition-all"
            disabled={!canSubmit || loading}
            onClick={() => {
              if (!confirm('Mark this procedure as FINISHED? This will move it to secretary payment queue.')) return
              onSubmit()
            }}
          >
            {loading ? 'Submitting...' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  )
}

