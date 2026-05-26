import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'

function formatDateTime(dt) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString()
}

function statusBadge(status) {
  const s = (status || '').toUpperCase()
  const badgeClass =
    status === 'completed'
      ? 'bg-secondary text-white'
      : status === 'canceled'
        ? 'bg-error text-white'
        : 'bg-primary-container text-on-primary-container'

  return <span className={`px-sm py-xs rounded-full font-label-caps text-[10px] ${badgeClass}`}>{s}</span>
}

export default function SecretaryBookings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('waiting')

  async function load() {
    setLoading(true)
    try {
      const resp = await apiFetch(`/appointments?status=${encodeURIComponent(statusFilter)}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to load bookings')
      setItems(data.appointments || [])
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function setStatus(id, status) {
    setLoading(true)
    try {
      const resp = await apiFetch(`/appointments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { status },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Update failed')
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function reschedule(id, dateISO, timeLabel) {
    setLoading(true)
    try {
      // Backend expects full ISO timestamp parseable by `new Date(...)`.
      const scheduledAt = new Date(`${dateISO} ${timeLabel}`).toISOString()

      const resp = await apiFetch(`/appointments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { scheduledAt },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Reschedule failed')
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const timeLabels = useMemo(
    () => ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM', '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM'],
    []
  )

  const todayISO = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      {/* Left sidebar */}
      <aside className="flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-50">
        <div className="p-lg">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white">dentistry</span>
          </div>
          <h1 className="mt-sm font-headline-md text-headline-md font-bold text-primary">DentHive</h1>
          <p className="font-label-caps text-label-caps text-outline">Secretary Portal</p>
        </div>
        <nav className="flex-1 mt-md space-y-xs px-sm overflow-y-auto no-scrollbar">
          <a className="bg-primary-container text-on-primary-container font-bold px-md py-sm flex items-center gap-sm rounded-lg border-r-4 border-primary transition-all" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <span className="font-label-caps text-label-caps">Bookings</span>
          </a>
          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/registry">
            <span className="material-symbols-outlined">folder_shared</span>
            <span className="font-label-caps text-label-caps">Patients</span>
          </a>
          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/bookingpage">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-caps text-label-caps">Schedule</span>
          </a>
        </nav>
      </aside>

      <main className="ml-64 p-margin-desktop">
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Secretary Bookings</h2>
          </div>
          <div className="flex items-center gap-sm">
            <label className="text-xs text-on-surface-variant font-label-caps">Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-md"
            >
              <option value="waiting">waiting</option>
              <option value="scheduled">scheduled</option>
              <option value="calling">calling</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
              <option value="canceled">canceled</option>
            </select>
            <button type="button" className="px-md py-sm bg-primary text-white rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all" onClick={load} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="space-y-lg mt-lg">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
              <h3 className="font-title-sm text-title-sm text-primary">Bookings</h3>
              <span className="text-xs text-on-surface-variant">Total: {items.length}</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-surface font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-md py-sm">Date</th>
                  <th className="px-md py-sm">Patient</th>
                  <th className="px-md py-sm">Service</th>
                  <th className="px-md py-sm">Status</th>
                  <th className="px-md py-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-md py-md text-on-surface-variant">No bookings found.</td>
                  </tr>
                ) : (
                  items.map((a) => (
                    <SecretaryRow
                      key={a._id}
                      appointment={a}
                      statusBadge={statusBadge}
                      timeLabels={timeLabels}
                      todayISO={todayISO}
                      onSetStatus={setStatus}
                      onReschedule={reschedule}
                      loading={loading}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function SecretaryRow({ appointment, statusBadge, timeLabels, todayISO, onSetStatus, onReschedule, loading }) {
  const a = appointment
  const [newDate, setNewDate] = useState(todayISO)
  const [newTime, setNewTime] = useState(timeLabels[2])

  return (
    <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
      <td className="px-md py-md">{formatDateTime(a.scheduledAt)}</td>
      <td className="px-md py-md">
        <div>{a.patientName || a.patientNameSnapshot || '-'}</div>
        <div className="text-xs text-on-surface-variant">ID: {a.patientDentId || '-'}</div>
      </td>
      <td className="px-md py-md">{a.serviceType || '-'}</td>
      <td className="px-md py-md">{statusBadge(a.status)}</td>
      <td className="px-md py-md text-right">
        <div className="flex flex-wrap justify-end gap-xs">
          <button
            type="button"
            className="px-sm py-xs bg-secondary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
            disabled={loading}
            onClick={() => onSetStatus(a._id, 'scheduled')}
            title="Confirm booking"
          >
            Confirm
          </button>
          <button
            type="button"
            className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded-lg font-label-caps text-label-caps hover:bg-surface-container transition-all"
            disabled={loading}
            onClick={() => onSetStatus(a._id, 'canceled')}
            title="Reject booking"
          >
            Reject
          </button>

          <div className="flex items-center gap-xs ml-sm">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-xs py-xs text-body-md"
              disabled={loading}
            />
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-xs py-xs text-body-md"
              disabled={loading}
            >
              {timeLabels.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="px-sm py-xs bg-primary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
              disabled={loading}
              onClick={() => onReschedule(a._id, newDate, newTime)}
              title="Change time/date"
            >
              Reschedule
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

