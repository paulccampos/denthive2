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
      ? 'bg-secondary text-white'
      : status === 'canceled'
        ? 'bg-error text-white'
        : status === 'archived'
          ? 'bg-error text-white'
          : status === 'next'
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-primary-container text-on-primary-container'

  return <span className={`px-sm py-xs rounded-full font-label-caps text-[10px] ${badgeClass}`}>{s}</span>
}

function moneyPHP(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '-'
  return `₱${Number(n).toLocaleString('en-PH')}`
}

export default function DoctorBookings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  // workflow sub-state
  const [hasNextCheckup, setHasNextCheckup] = useState(false)
  const [nextDate, setNextDate] = useState('')
  const [nextTimeLabel, setNextTimeLabel] = useState('')

  const [price, setPrice] = useState('')
  const [pricePresetType, setPricePresetType] = useState('manual')
  const [pricePresets, setPricePresets] = useState([])

  const [procedureSelection, setProcedureSelection] = useState([])
  const [notes, setNotes] = useState('')

  const timeLabels = useMemo(
    () => ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM', '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM'],
    []
  )

  const todayISODate = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

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

  useEffect(() => {
    if (!selected) return
    // defaults
    setHasNextCheckup(false)
    setNextDate(todayISODate)
    setNextTimeLabel(timeLabels[2])
    setPrice('')
    setPricePresetType('manual')
    setProcedureSelection([])
    setNotes('')
  }, [selected, todayISODate, timeLabels])

  async function loadPricePresets() {
    try {
      // Pull all prices (could be filtered by doctor role; endpoint is public for GET)
      const resp = await apiFetch('/prices')
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to load price presets')
      setPricePresets(data.prices || [])
    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => {
    loadPricePresets()
  }, [])

  async function markNext(id) {
    setLoading(true)
    try {
      const resp = await apiFetch(`/doctor-appointments/${encodeURIComponent(id)}/next`, {
        method: 'PATCH',
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Mark next failed')
      setSelected(null)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  function toISODateTime(nextDateValue, timeLabel) {
    // timeLabel format matches Booking.jsx UI
    const scheduledAt = new Date(`${nextDateValue} ${timeLabel}`).toISOString()
    return scheduledAt
  }

  async function finishFlow() {
    if (!selected) return
    const p = Number(price)
    if (!Number.isFinite(p) || p <= 0) {
      alert('Enter a valid pricePHP')
      return
    }

    let nextISO = null
    if (hasNextCheckup) {
      if (!nextDate || !nextTimeLabel) {
        alert('Select next checkup date/time')
        return
      }
      nextISO = toISODateTime(nextDate, nextTimeLabel)
    }

    setLoading(true)
    try {
      const resp = await apiFetch(`/doctor-appointments/${encodeURIComponent(selected._id)}/finish`, {
        method: 'POST',
        body: {
          hasNextCheckup,
          nextScheduledAtISO: nextISO,
          pricePHP: p,
          procedures: procedureSelection,
          consultationNotes: notes,
        },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Finish failed')

      setSelected(null)
      await load()
      alert('Appointment marked finished. Clinical record created.')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  function onPickPricePreset(serviceType) {
    const found = pricePresets.find((x) => x.serviceType === serviceType)
    if (!found) return
    setPricePresetType(serviceType)
    setPrice(String(found.pricePHP ?? ''))
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      <div className="hidden md:block md:ml-0" />

      {/* Left sidebar */}
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
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
          <div className="space-y-1">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Doctor POV</h2>
            <p className="text-xs text-on-surface-variant">
              Select an appointment. Use <b>Next</b> or <b>Finish</b> to complete the visit workflow.
            </p>
          </div>
          <div className="flex gap-sm">
            <button
              type="button"
              className="px-md py-sm bg-primary text-white rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all"
              onClick={load}
              disabled={loading}
              aria-label="Refresh doctor appointments"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="space-y-lg mt-lg">
          {selected ? (
            <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-md" role="dialog" aria-modal="true">
              <div className="w-full max-w-2xl bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b border-outline-variant">
                  <h3 className="font-title-sm text-title-sm text-primary">Appointment Details</h3>
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

                  <div className="flex items-center gap-sm">
                    <div>
                      <div className="text-xs text-on-surface-variant font-label-caps">Status</div>
                      <div className="mt-xs">{statusBadge(selected.status)}</div>
                    </div>
                  </div>

                  {/* workflow */}
                  <div className="pt-sm border-t border-outline-variant" />

                  <div className="space-y-sm">
                    <div className="flex justify-end gap-sm">
                      {selected.status === 'waiting' ? (
                        <button
                          type="button"
                          className="px-md py-xs border border-outline-variant text-on-surface-variant rounded-lg font-label-caps text-label-caps hover:bg-surface-container transition-all"
                          disabled={loading}
                          onClick={() => markNext(selected._id)}
                        >
                          Next
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="px-md py-xs bg-secondary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                        disabled={loading}
                        onClick={finishFlow}
                      >
                        Finish
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      <label className="flex items-center gap-xs">
                        <input
                          type="checkbox"
                          checked={hasNextCheckup}
                          onChange={(e) => setHasNextCheckup(e.target.checked)}
                          disabled={loading}
                        />
                        <span className="text-xs text-on-surface-variant font-label-caps">Patient has next checkup</span>
                      </label>

                      {hasNextCheckup ? (
                        <div className="grid grid-cols-2 gap-sm">
                          <div>
                            <div className="text-xs text-on-surface-variant font-label-caps">Date</div>
                            <input
                              type="date"
                              value={nextDate}
                              onChange={(e) => setNextDate(e.target.value)}
                              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-xs py-xs text-body-md"
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <div className="text-xs text-on-surface-variant font-label-caps">Time</div>
                            <select
                              value={nextTimeLabel}
                              onChange={(e) => setNextTimeLabel(e.target.value)}
                              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-xs py-xs text-body-md"
                              disabled={loading}
                            >
                              {timeLabels.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      <div>
                        <div className="text-xs text-on-surface-variant font-label-caps">Price (PHP)</div>
                        <div className="mt-xs flex items-center gap-sm">
                          <select
                            value={pricePresetType}
                            onChange={(e) => {
                              const v = e.target.value
                              setPricePresetType(v)
                              if (v === 'manual') {
                                setPrice('')
                              } else {
                                onPickPricePreset(v)
                              }
                            }}
                            className="bg-surface-container-low border border-outline-variant rounded-lg px-xs py-xs text-body-md"
                            disabled={loading}
                          >
                            <option value="manual">Manual insert</option>
                            {pricePresets.map((p) => (
                              <option key={p.serviceType} value={p.serviceType}>
                                {p.serviceType} ({moneyPHP(p.pricePHP)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={price}
                          onChange={(e) => {
                            setPrice(e.target.value)
                            setPricePresetType('manual')
                          }}
                          placeholder="Enter pricePHP"
                          className="mt-xs w-full bg-surface-container-low border border-outline-variant rounded-lg px-xs py-xs text-body-md"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <div className="text-xs text-on-surface-variant font-label-caps">Consultation notes (optional)</div>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add doctor notes..."
                          className="mt-xs w-full min-h-[92px] bg-surface-container-low border border-outline-variant rounded-lg px-xs py-xs text-body-md"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* optional: procedures selection could be added later */}
                </div>
              </div>
            </div>
          ) : null}

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
                    <tr
                      key={a._id}
                      className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
                      onClick={() => setSelected(a)}
                    >
                      <td className="px-md py-md">{a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : '-'}</td>
                      <td className="px-md py-md">
                        <div>{a.patientName || a.patientNameSnapshot || '-'}</div>
                        <div className="text-xs text-on-surface-variant">ID: {a.patientDentId || '-'}</div>
                      </td>
                      <td className="px-md py-md">{a.serviceType || '-'}</td>
                      <td className="px-md py-md">{statusBadge(a.status)}</td>
                      <td className="px-md py-md text-right">
                        <button
                          type="button"
                          className="px-sm py-xs bg-primary text-white rounded-lg font-label-caps text-label-caps hover:opacity-90 transition-all"
                          disabled={loading}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelected(a)
                          }}
                        >
                          Open
                        </button>
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

