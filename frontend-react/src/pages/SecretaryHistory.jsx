import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch, logout } from '../lib/api'


function moneyPHP(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '-'
  return `₱${Number(n).toLocaleString('en-PH')}`
}

function formatDateTime(dt) {

  if (!dt) return '-'
  return new Date(dt).toLocaleString()
}

function statusBadge(status) {
  const s = (status || '').toUpperCase()
  const badgeClass =
    status === 'completed'
      ? 'bg-secondary text-white'
      : status === 'canceled' || status === 'archived'
        ? 'bg-error text-white'
        : 'bg-primary-container text-on-primary-container'

  return (
    <span className={`px-sm py-xs rounded-full font-label-caps text-[10px] ${badgeClass}`}>{s}</span>
  )
}

export default function SecretaryHistory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [clinicalLoading, setClinicalLoading] = useState(false)
  const [clinicalRecords, setClinicalRecords] = useState([])


  async function load() {
    setLoading(true)
    try {
      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''
      const resp = await apiFetch(`/history${qs}`)

      const contentType = resp.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await resp.text()
        throw new Error(text || `Failed to load history (non-JSON response)`)
      }

      const data = await resp.json()
      if (!resp.ok) {
        const msg = data?.error || `Failed to load history (HTTP ${resp.status})`
        throw new Error(msg)
      }
      setItems(data.history || data.items || [])

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

  async function loadClinicalRecordsForSelected(selectedItem) {
    if (!selectedItem) {
      setClinicalRecords([])
      return
    }

    // Depends on HistoryAppointment.appointmentId linkage.
    const appointmentId = selectedItem.appointmentId
    if (!appointmentId) {
      setClinicalRecords([])
      return
    }

    setClinicalLoading(true)
    try {
      const resp = await apiFetch(
        `/clinical/by-appointment/${encodeURIComponent(appointmentId)}`
      )
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to load clinical records')
      setClinicalRecords(data.clinicalRecords || [])
    } catch (e) {
      alert(e.message)
      setClinicalRecords([])
    } finally {
      setClinicalLoading(false)
    }
  }

  useEffect(() => {
    if (!selected) return
    loadClinicalRecordsForSelected(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  async function permanentlyDelete(id) {

    if (!confirm('Permanently delete this record?')) return
    setLoading(true)
    try {
      const resp = await apiFetch(`/history/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const contentType = resp.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await resp.json() : { error: await resp.text() }
      if (!resp.ok) throw new Error(data.error || 'Delete failed')

      setSelected(null)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Move back to appointments as a reschedulable booking.
  async function restoreToAppointments(id) {
    if (!confirm('Move this history record back to appointments?')) return
    setLoading(true)
    try {
      const resp = await apiFetch(`/history/${encodeURIComponent(id)}/restore`, { method: 'POST' })
      const contentType = resp.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await resp.json() : { error: await resp.text() }
      if (!resp.ok) throw new Error(data.error || 'Restore failed')

      setSelected(null)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const statuses = useMemo(
    () => ['', 'waiting', 'scheduled', 'calling', 'in_progress', 'completed', 'canceled', 'archived'],
    []
  )

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      <aside className="flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-50">

        <div className="p-lg">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white">dentistry</span>
          </div>
          <h1 className="mt-sm font-headline-md text-headline-md font-bold text-primary">DentHive</h1>

          <p className="font-label-caps text-label-caps text-outline">Secretary Portal</p>
        </div>
        <nav className="flex-1 mt-md space-y-xs px-sm overflow-y-auto no-scrollbar">
          {/* Secretary fixed navbar options */}
          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/queuemanagement">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <span className="font-label-caps text-label-caps">Queue</span>
          </a>

          {/* (Intentionally no Patients/Schedule shortcuts here to keep role-fixed navigation) */}

          <a className="bg-primary-container text-on-primary-container font-bold px-md py-sm flex items-center gap-sm rounded-lg border-r-4 border-primary transition-all" href="/history">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            <span className="font-label-caps text-label-caps">History</span>
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
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Appointment History</h2>
          </div>
          <div className="flex items-center gap-sm">
            <label className="text-xs text-on-surface-variant font-label-caps">Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-md"
              disabled={loading}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === '' ? 'All' : s}</option>
              ))}
            </select>
            <button type="button" className="px-md py-sm bg-primary text-white rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all" onClick={load} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="space-y-lg mt-lg">
          {selected ? (
            <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-md" role="dialog" aria-modal="true">
              <div className="w-full max-w-2xl bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
                  <h3 className="font-title-sm text-title-sm text-primary">Record Details</h3>
                  <button
                    type="button"
                    className="px-sm py-xs border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-all"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="px-md py-md space-y-sm text-body-md">
                  {/* Clinical Records (procedure + pricePHP) */}
                  <div className="bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-on-surface-variant font-label-caps">Clinical Records</div>
                        <div className="font-bold mt-xs">{clinicalLoading ? 'Loading…' : clinicalRecords.length ? `${clinicalRecords.length} record(s)` : 'No clinical record'}</div>
                      </div>
                      <div>
                        {clinicalRecords.length ? (
                          <div className="text-xs text-on-surface-variant font-label-caps text-right">Price</div>
                        ) : null}
                        {clinicalRecords.length ? (
                          <div className="font-bold text-right">{moneyPHP(clinicalRecords[0].pricePHP)}</div>
                        ) : (
                          <div className="font-bold text-right">-</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-sm space-y-xs">
                      {clinicalRecords.length ? (
                        clinicalRecords[0].procedures?.length ? (
                          clinicalRecords[0].procedures.map((p, idx) => (
                            <div key={`${clinicalRecords[0]._id || 'rec'}-${idx}`} className="text-body-md">
                              <div className="text-xs text-on-surface-variant font-label-caps">Procedure {idx + 1}</div>
                              <div className="font-bold">{p.procedure || '-'}</div>
                              <div className="text-xs text-on-surface-variant">Tooth: {p.tooth || '-'}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-on-surface-variant">No procedures found.</div>
                        )
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">

                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Patient</div>
                      <div className="font-bold">{selected.patientName || selected.patientNameSnapshot || '-'}</div>
                      <div className="text-xs text-on-surface-variant">DentHive ID: {selected.patientDentId || selected.patientId || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Appointment</div>
                      <div className="font-bold">{selected.serviceType || '-'}</div>
                      <div className="text-xs text-on-surface-variant">{formatDateTime(selected.scheduledAt)}</div>
                    </div>
                  </div>

                  <div className="pt-sm border-t border-outline-variant" />

                  <div className="flex items-center gap-sm">
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Status</div>
                      <div className="mt-xs">{statusBadge(selected.status)}</div>
                    </div>
                    {selected.historyReason ? (
                      <div>
                        <div className="text-xs text-on-surface-variant font-label-caps">Reason</div>
                        <div className="mt-xs">{selected.historyReason}</div>
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-sm flex justify-end gap-sm">
                    <button
                      type="button"
                      className="px-md py-xs bg-primary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                      disabled={loading}
                      onClick={() => restoreToAppointments(selected._id)}
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      className="px-md py-xs bg-error text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                      disabled={loading}
                      onClick={() => permanentlyDelete(selected._id)}
                    >
                      Permanently delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
              <h3 className="font-title-sm text-title-sm text-primary">History Records</h3>
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
                    <td colSpan={5} className="px-md py-md text-on-surface-variant">No history found.</td>
                  </tr>
                ) : (
                  items.map((a) => (
                    <tr
                      key={a._id}
                      className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
                      onClick={() => setSelected(a)}
                    >
                      <td className="px-md py-md">{formatDateTime(a.scheduledAt)}</td>
                      <td className="px-md py-md">
                        <div>{a.patientNameSnapshot || a.patientName || '-'}</div>
                      </td>
                      <td className="px-md py-md">{a.serviceType || '-'}</td>
                      <td className="px-md py-md">{statusBadge(a.status)}</td>
                      <td className="px-md py-md text-right">
                        <div className="flex justify-end gap-xs">
                          <button
                            type="button"
                            className="px-sm py-xs bg-primary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                            disabled={loading}
                            onClick={(e) => {
                              e.stopPropagation()
                              restoreToAppointments(a._id)
                            }}
                          >
                            Restore
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

