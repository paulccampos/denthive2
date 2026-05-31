import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch, logout } from '../lib/api'


function formatDateTime(dt) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString()
}

function statusBadge(status) {
  const s = (status || '').toUpperCase()
  const badgeClass =
    status === 'completed'
      ? 'bg-secondary text-on-secondary'
      : status === 'canceled'
        ? 'bg-error text-on-error'
        : 'bg-primary-container text-on-primary-container'

  return <span className={`px-sm py-xs rounded-full font-label-caps text-[10px] ${badgeClass}`}>{s}</span>
}

export default function SecretaryBookings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('waiting')
  const [selected, setSelected] = useState(null)



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

  async function onDeleteAppointment(id) {
    if (!confirm('Delete this booking?')) return
    setLoading(true)
    try {
      const resp = await apiFetch(`/appointments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Delete failed')
      setSelected(null)
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
    <div className="app-page min-h-screen overflow-x-hidden">
      {/* Left sidebar */}
      <aside className="app-sidebar flex flex-col h-screen w-64 fixed left-0 top-0 z-50">
        <div className="p-lg">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">dentistry</span>
          </div>
          <h1 className="mt-sm font-headline-md text-headline-md font-bold text-primary">DentHive</h1>
          <p className="font-label-caps text-label-caps text-outline">Secretary Portal</p>
        </div>
        <nav className="flex-1 mt-md space-y-xs px-sm overflow-y-auto no-scrollbar">
          <a className="bg-primary-container text-on-primary-container font-bold px-md py-sm flex items-center gap-sm rounded-lg border-r-4 border-primary transition-all" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <span className="font-label-caps text-label-caps">Bookings</span>
          </a>

          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/secretaryfinished">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>paid</span>
            <span className="font-label-caps text-label-caps">Finished & Payment</span>
          </a>

          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/registry">
            <span className="material-symbols-outlined">folder_shared</span>
            <span className="font-label-caps text-label-caps">Patients</span>
          </a>

          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/secretaryfinished">
            <span className="material-symbols-outlined">paid</span>
            <span className="font-label-caps text-label-caps">Payments</span>
          </a>

          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/history">
            <span className="material-symbols-outlined">history</span>
            <span className="font-label-caps text-label-caps">History</span>
          </a>

          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/queuemanagement">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <span className="font-label-caps text-label-caps">Queue</span>
          </a>

          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/bookingpage">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-caps text-label-caps">Schedule</span>
          </a>

        </nav>
        <div className="p-md border-t border-outline-variant mt-auto">
          <button
            type="button"
            className="w-full bg-error/10 text-error py-sm rounded-lg font-title-sm flex items-center justify-center gap-xs hover:bg-error/15 transition-all active:scale-95"
            onClick={() => {
              logout()
              window.location.href = '/'
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>


      <main className="ml-64 p-margin-desktop">
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm app-header sticky top-0 z-40">
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
              <option value="archived">archived</option>
              {/* completed/canceled moved to History */}

              {/* <option value="completed">completed</option> */}
              {/* <option value="canceled">canceled</option> */}

            </select>
            <button type="button" className="px-md py-sm bg-primary text-on-primary rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all" onClick={load} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="space-y-lg mt-lg">
          {selected ? (
            <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-md" role="dialog" aria-modal="true">
              <div className="w-full max-w-2xl bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
                  <h3 className="font-title-sm text-title-sm text-primary">Booking Details</h3>
                  <button
                    type="button"
                    className="px-sm py-xs border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(null)
                    }}
                  >
                    Close
                  </button>
                </div>
                <div className="px-md py-md space-y-sm text-body-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Patient</div>
                      <div className="font-bold">{selected.patientName || '-'}</div>
                      <div className="text-xs text-on-surface-variant">DentHive ID: {selected.patientDentId || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Appointment</div>
                      <div className="font-bold">{selected.serviceType || '-'}</div>
                      <div className="text-xs text-on-surface-variant">{formatDateTime(selected.scheduledAt)}</div>
                    </div>
                  </div>

                  <div className="pt-sm border-t border-outline-variant" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Contact</div>
                      <div>Email: {selected.patient?.email || '-'}</div>
                      <div>Phone: {selected.patient?.phone || '-'}</div>
                      <div>Address: {selected.patient?.address || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Medical</div>
                      <div>Gender: {selected.patient?.gender || '-'}</div>
                      <div>
                        DOB: {selected.patient?.dob ? new Date(selected.patient.dob).toLocaleDateString() : '-'}
                      </div>
                      <div>Allergies: {(selected.patient?.allergies || []).join(', ') || '-'}</div>
                      <div>Medications: {(selected.patient?.medications || []).join(', ') || '-'}</div>
                      <div>Conditions: {(selected.patient?.chronicConditions || []).join(', ') || '-'}</div>
                    </div>
                  </div>

                  <div className="pt-sm flex justify-end gap-sm">
                    <button
                      type="button"
                      className="px-md py-xs bg-error text-on-error rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                      disabled={loading}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteAppointment(selected._id)
                      }}
                    >
                      Delete booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

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
                      onDelete={async (id) => {
                        // prevent row click from immediately reopening
                        await onDelete(id)
                      }}
                      loading={loading}
                      onOpenDetails={setSelected}
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

function SecretaryRow({ appointment, statusBadge, timeLabels, todayISO, onSetStatus, onReschedule, onDelete, loading, onOpenDetails }) {
  const a = appointment
  const [newDate, setNewDate] = useState(todayISO)
  const [newTime, setNewTime] = useState(timeLabels[2])

  return (
    <tr
      className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
      onClick={() => onOpenDetails(a)}
    >

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
            className="px-sm py-xs bg-secondary text-on-secondary rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
            disabled={loading}
            onClick={() => {
              if (!confirm('Confirm this booking?')) return
              onSetStatus(a._id, 'scheduled')
            }}
            title="Confirm booking"

          >
            Confirm
          </button>
          <button
            type="button"
            className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded-lg font-label-caps text-label-caps hover:bg-surface-container transition-all"
            disabled={loading}
            onClick={() => {
              const wantsFinished = window.confirm('Reject booking? Click OK to mark as FINISHED (move to secretary payment queue), or Cancel to cancel instead.')
              if (wantsFinished) {
                // Secretary “finished” is not a doctor finish; it’s handled via the finished queue (doctor creates it).
                // So we confirm cancel instead.
              }
              if (!confirm('Cancel this booking?')) return
              onSetStatus(a._id, 'canceled')
            }}
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
              className="px-sm py-xs bg-primary text-on-primary rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
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

