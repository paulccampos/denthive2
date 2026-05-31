import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import SecretarySidebar from '../components/SecretarySidebar.jsx'


export default function QueueManagement() {
  const [queue, setQueue] = useState([])

  // initial load handled by refresh() effect below



  async function deleteAppointment(id) {
    if (!confirm('Delete this queue booking?')) return
    setQueue((prev) => prev.filter((x) => x._id !== id))
    try {
      const resp = await apiFetch(`/appointments/${encodeURIComponent(id)}`, { method: 'DELETE' })
      // some responses may be HTML (SPA fallback) if backend route is missing
      const text = await resp.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = { error: text }
      }
      if (!resp.ok) throw new Error(data?.error || 'Delete failed')
    } catch (e) {
      alert(e.message)
      // reload on failure to avoid mismatch
      await refresh()
    }
  }

  async function refresh() {
    try {
      // Load default active queue (backend defaults to waiting/calling when status is omitted)
      const resp = await apiFetch('/queue')
      const data = await resp.json()
      if (resp.ok) setQueue(data.queue || data)

    } catch (e) {}
  }

  async function reorder(ids) {
    // backend only supports /api/queue/reorder when queueRouter is mounted.
    // If patch fails, return a useful error.
    const resp = await apiFetch('/queue/reorder', { method: 'PATCH', body: { ids } })

    const contentType = resp.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await resp.text()
      throw new Error(text && text.includes('<!DOCTYPE') ? 'Backend error (HTML) while reordering queue' : text || 'Reorder failed')
    }

    const data = await resp.json()
    if (!resp.ok) throw new Error(data?.error || 'Reorder failed')

  }



  function getIdxInQueue(n){
    // queue table uses slice(0,20), so idx is already correct for the first 20 items.
    return n
  }

  async function moveUp(idx) {
    if (idx <= 0) return
    const next = [...queue]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setQueue(next)
    try {
      await reorder(next.map((x) => x._id))
      await refresh()
    } catch (e) {
      alert(e.message)
      await refresh()
    }
  }

  async function moveDown(idx) {
    if (idx >= queue.length - 1) return
    const next = [...queue]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setQueue(next)
    try {
      await reorder(next.map((x) => x._id))
      await refresh()
    } catch (e) {
      alert(e.message)
      await refresh()
    }
  }


  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">

      <SecretarySidebar currentPathname={window.location.pathname} />


      {/* Main Content */}
      <main className="ml-64 flex-1">
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">

          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Queue Management</h2>
            <div className="flex items-center gap-xs px-sm py-xs bg-surface-container-high rounded-full">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Live View</span>
            </div>
          </div>
          <div className="flex items-center gap-lg">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-sm text-outline">search</span>
              <input
                className="pl-xl pr-md py-xs bg-surface-container-low border border-outline-variant rounded-lg font-body-sm w-64"
                placeholder="Search patients in registry..."
                type="text"
              />
            </div>
          </div>
        </header>

        <div className="p-margin-desktop space-y-lg">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b-2 border-primary">
              <h3 className="font-title-sm text-title-sm text-primary">Active Queue</h3>
              <div className="flex gap-sm">
                <button className="flex items-center gap-xs px-sm py-xs bg-white border border-outline-variant rounded hover:bg-surface-container-low transition-colors font-label-caps text-label-caps" type="button">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                  Filter
                </button>
              </div>
            </div>

            <table className="w-full text-left zebra-table">
              <thead className="bg-surface font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-md py-sm">#</th>
                  <th className="px-md py-sm">Patient Name</th>
                  <th className="px-md py-sm">Service Type</th>
                  <th className="px-md py-sm">Check-in Time</th>
                  <th className="px-md py-sm">Assigned To</th>
                  <th className="px-md py-sm">Status</th>
                  <th className="px-md py-sm text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="font-body-md">
                {(queue || []).slice(0, 20).map((a, idx) => (
                  <tr
                    key={a._id || idx}
                    className="transition-colors hover:bg-surface-container-lowest"
                    
                  >

                    <td className="px-md py-md font-data-mono">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-xs">{(a.patientName || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('')}</div>
                        <div>
                          <p className="font-bold">{a.patientName}</p>
                          <p className="text-[11px] text-on-surface-variant">ID: {a.patientDentId || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-md">{a.serviceType}</td>
                    <td className="px-md py-md font-data-mono">{a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-md py-md">{a.assignedTo}</td>
                    <td className="px-md py-md">
                      <span className="px-sm py-xs bg-primary text-white text-[11px] font-bold rounded-full uppercase tracking-tight flex items-center gap-xs w-fit">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-md py-md text-right">
                      <div className="flex justify-end gap-xs">
                        <button type="button" className="p-xs hover:bg-surface-container-high rounded text-primary transition-colors" title="Check-in">
                          <span className="material-symbols-outlined">login</span>
                        </button>

                        {/* queue move controls */}
                        <button
                          type="button"
                          className="p-xs hover:bg-surface-container-high rounded text-primary transition-colors"
                          title="Move up"
                          onClick={() => moveUp(idx)}
                        >
                          <span className="material-symbols-outlined">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          className="p-xs hover:bg-surface-container-high rounded text-primary transition-colors"
                          title="Move down"
                          onClick={() => moveDown(idx)}
                        >
                          <span className="material-symbols-outlined">arrow_downward</span>
                        </button>

                        <button
                          type="button"
                          className="p-xs hover:bg-error-container hover:text-error rounded transition-colors"
                          title="Delete"
                          onClick={() => deleteAppointment(a._id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

