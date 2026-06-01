import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch, getToken } from '../lib/api'


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

export default function DoctorFinishPopup({ appointment, onClose, onFinished }) {
  const [pricePHP, setPricePHP] = useState('')
  const [consultationNotes, setConsultationNotes] = useState('')

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

    const token = getToken()
    if (!token) {
      alert('Missing login session. Please login again.')
      return
    }

    const procedures = [{ tooth, procedure, extracted }]

    setLoading(true)
    try {
      // Backend route is mounted at: /api/finished (see server.js)
      const resp = await apiFetch(`/finished/${encodeURIComponent(appointment._id)}/finish`, {
        method: 'POST',
        body: {
          pricePHP: Number(pricePHP),
          consultationNotes,
          procedures,
        },
      })


      // If server returned HTML (often SPA fallback / wrong route), don't try to parse JSON.
      const text = await resp.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = null
      }
      if (!resp.ok) {
        const errMsg = data?.error || text || 'Finish failed'
        throw new Error(errMsg)
      }


      alert('Procedure finished. Secretary can mark it paid.')
      onFinished?.(data?.finished)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!appointment) return null

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-md" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden">
        <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
          <h3 className="font-title-sm text-title-sm text-primary">Finish Procedure</h3>
          <button
            type="button"
            className="px-sm py-xs border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-all"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>

        <div className="px-md py-md space-y-sm text-body-md">
          <div className="space-y-sm">
            <div className="text-xs text-on-surface-variant font-label-caps">Appointment</div>
            <div className="font-bold">{appointment?.serviceType || '-'}</div>
            <div className="text-xs text-on-surface-variant">{appointment?.patientName || appointment?.patientNameSnapshot || '-'}</div>
            <div className="text-xs text-on-surface-variant">
              Scheduled:{' '}
              {appointment?.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString() : '-'}
            </div>
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
              className="px-md py-xs bg-error text-on-error rounded-lg font-label-caps hover:opacity-90 transition-all"
              disabled={loading}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-md py-xs bg-primary text-on-primary rounded-lg font-label-caps hover:opacity-90 transition-all"
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
    </div>
  )
}

