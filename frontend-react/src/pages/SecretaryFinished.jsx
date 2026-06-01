import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import SecretarySidebar from '../components/SecretarySidebar.jsx'

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
    status === 'paid' ? 'bg-secondary text-on-secondary' : 'bg-primary-container text-on-primary-container'
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
    <div className="app-page min-h-screen overflow-x-hidden">
      <SecretarySidebar currentPathname={window.location.pathname} />

      <main className="ml-64 p-margin-desktop">
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm app-header sticky top-0 z-40">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Finished & Payment Queue</h2>
          </div>
          <div className="flex items-center gap-sm">
            <button
              type="button"
              className="px-md py-sm bg-primary text-on-primary rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all"
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
              className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-md"
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
                      className="px-md py-xs bg-primary text-on-primary rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
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

