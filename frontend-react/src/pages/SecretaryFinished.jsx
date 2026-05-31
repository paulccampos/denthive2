import React, { useEffect, useState } from 'react'
import { apiFetch, logout } from '../lib/api'

function formatDateTime(dt) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString()
}

function moneyPHP(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '-'
  return `₱${Number(n).toLocaleString('en-PH')}`
}

function statusBadge(status) {
  const s = (status || '').toUpperCase()
  const badgeClass =
    status === 'paid' ? 'bg-secondary text-white' : 'bg-primary-container text-on-primary-container'
  return (
    <span className={`px-sm py-xs rounded-full font-label-caps text-[10px] ${badgeClass}`}>{s}</span>
  )
}

export default function SecretaryFinished() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const resp = await apiFetch('/finished')
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to load finished')
      setItems(data.finished || [])
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function pay(id) {
    const recordId = id ?? selected?._id ?? selected?.id

    if (!recordId) {
      alert('Missing record id.')
      return
    }

    if (!confirm('Mark this as PAID and move to history?')) return

    setLoading(true)
    try {
      const resp = await apiFetch(`/finished/${encodeURIComponent(recordId)}/pay`, { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Pay failed')
      setSelected(null)
      await load()
      alert('Payment recorded. Moved to history.')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

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
          <a
            className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
            href="/queuemanagement"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              group
            </span>
            <span className="font-label-caps text-label-caps">Queue</span>
          </a>
          <a
            className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
            href="/registry"
          >
            <span className="material-symbols-outlined">folder_shared</span>
            <span className="font-label-caps text-label-caps">Patients</span>
          </a>

          <a
            className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
            href="/bookingpage"
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-caps text-label-caps">Schedule</span>
          </a>

          <a
            className="bg-primary-container text-on-primary-container font-bold px-md py-sm flex items-center gap-sm rounded-lg border-r-4 border-primary transition-all"
            href="#"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              paid
            </span>
            <span className="font-label-caps text-label-caps">Finished & Payment</span>
          </a>

          <a
            className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
            href="/history"
          >
            <span className="material-symbols-outlined">history</span>
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
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Finished & Payment Queue</h2>
          </div>
          <div className="flex items-center gap-sm">
            <button
              type="button"
              className="px-md py-sm bg-primary text-white rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all"
              onClick={load}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="space-y-lg mt-lg">
          {selected ? (
            <div
              className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-md"
              role="dialog"
              aria-modal="true"
            >
              <div className="w-full max-w-2xl bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
                  <h3 className="font-title-sm text-title-sm text-primary">Finished Details</h3>
                  <button
                    type="button"
                    className="px-sm py-xs border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-all"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="px-md py-md space-y-sm text-body-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Patient</div>
                      <div className="font-bold">
                        {selected.patientName || selected.patientNameSnapshot || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">When</div>
                      <div className="font-bold">{formatDateTime(selected.scheduledAt)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-sm">
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Price</div>
                      <div className="mt-xs font-bold">{moneyPHP(selected.pricePHP)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Status</div>
                      <div className="mt-xs">{statusBadge(selected.status)}</div>
                    </div>
                  </div>

                  <div className="pt-sm border-t border-outline-variant" />

                  <div>
                    <div className="text-xs text-on-surface-variant font-label-caps">Doctor Notes</div>
                    <div className="mt-xs">{selected.consultationNotes || '-'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-on-surface-variant font-label-caps">Procedures</div>
                    <div className="mt-xs">
                      {(selected.procedures || []).length ? (
                        (selected.procedures || []).map((p, idx) => (
                          <div key={`${idx}-${p.tooth || ''}`}>
                            • {p.procedure || '-'} ({p.tooth || '-'})
                          </div>
                        ))
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-sm flex justify-end gap-sm">
                    <button
                      type="button"
                      className="px-md py-xs bg-primary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                      disabled={loading}
                      onClick={() => pay(selected?._id ?? selected?.id)}
                    >
                      Mark Paid → History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
              <h3 className="font-title-sm text-title-sm text-primary">Finished Records</h3>
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
                    <td colSpan={5} className="px-md py-md text-on-surface-variant">
                      No finished items.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr
                      key={it._id}
                      className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
                      onClick={() => setSelected(it)}
                    >
                      <td className="px-md py-md">{formatDateTime(it.scheduledAt)}</td>
                      <td className="px-md py-md">{it.patientName || it.patientNameSnapshot || '-'}</td>
                      <td className="px-md py-md">{it.serviceType || '-'}</td>
                      <td className="px-md py-md">{statusBadge(it.status)}</td>
                      <td className="px-md py-md text-right">
                        <span className="text-xs text-on-surface-variant">Open</span>
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

