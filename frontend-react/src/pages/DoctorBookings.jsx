import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

function statusBadge(status) {
  const s = (status || '').toUpperCase()
  const badgeClass =
    status === 'completed'
      ? 'bg-secondary text-white'
      : status === 'canceled'
        ? 'bg-error text-white'
        : 'bg-primary-container text-on-primary-container'

  return (
    <span className={`px-sm py-xs rounded-full font-label-caps text-[10px] ${badgeClass}`}>{s}</span>
  )
}

export default function DoctorBookings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const resp = await apiFetch('/appointments')
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
  }, [])

  async function updateStatus(id, status) {
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

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      <div className="hidden md:block md:ml-0" />

      {/* Left sidebar (simple) */}
      <aside className="flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-50">
        <div className="p-lg">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white">dentistry</span>
          </div>
          <h1 className="mt-sm font-headline-md text-headline-md font-bold text-primary">DentHive</h1>
          <p className="font-label-caps text-label-caps text-outline">Doctor Portal</p>
        </div>
        <nav className="flex-1 mt-md space-y-xs px-sm overflow-y-auto no-scrollbar">
          <a className="bg-primary-container text-on-primary-container font-bold px-md py-sm flex items-center gap-sm rounded-lg border-r-4 border-primary transition-all" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>folder_shared</span>
            <span className="font-label-caps text-label-caps">Bookings</span>
          </a>
          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/queueManagement">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-caps text-label-caps">Queue</span>
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
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Doctor Bookings</h2>
          </div>
          <div className="flex gap-sm">
            <button type="button" className="px-md py-sm bg-primary text-white rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all" onClick={load} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="space-y-lg mt-lg">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
              <h3 className="font-title-sm text-title-sm text-primary">All appointments</h3>
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
                    <tr key={a._id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                      <td className="px-md py-md">{a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : '-'}</td>
                      <td className="px-md py-md">
                        <div>{a.patientName || a.patientNameSnapshot || '-'}</div>
                        <div className="text-xs text-on-surface-variant">ID: {a.patientDentId || '-'}</div>
                      </td>
                      <td className="px-md py-md">{a.serviceType || '-'}</td>
                      <td className="px-md py-md">{statusBadge(a.status)}</td>
                      <td className="px-md py-md text-right">
                        <div className="flex justify-end gap-xs">
                          <button
                            type="button"
                            className="px-sm py-xs bg-secondary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                            disabled={loading}
                            onClick={() => updateStatus(a._id, 'completed')}
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded-lg font-label-caps text-label-caps hover:bg-surface-container transition-all"
                            disabled={loading}
                            onClick={() => updateStatus(a._id, 'canceled')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
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

