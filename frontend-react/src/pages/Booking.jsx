import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'

const TEETH = ['Upper 1', 'Upper 2', 'Upper 3', 'Upper 4', 'Upper 5', 'Upper 16', 'Upper 15', 'Upper 14', 'Upper 13', 'Upper 12', 'Upper 11', 'Upper 10', 'Upper 9', 'Upper 8', 'Upper 7', 'Upper 6', 'Lower 1', 'Lower 2', 'Lower 3', 'Lower 4', 'Lower 5', 'Lower 16', 'Lower 15', 'Lower 14', 'Lower 13', 'Lower 12', 'Lower 11', 'Lower 10', 'Lower 9', 'Lower 8', 'Lower 7', 'Lower 6']

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function getMonthMatrix(year, monthIndex) {
  // monthIndex: 0-11
  // JS getDay: 0=Sun..6=Sat
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const firstDay = first.getDay() // 0..6 (Sun..Sat)
  // convert to our column index where MON=0..SUN=6
  const offset = (firstDay + 6) % 7

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function Booking() {
  const [reason, setReason] = useState('General Checkup')
  const [doctor, setDoctor] = useState('Any Available Practitioner')

  const [time, setTime] = useState('10:30 AM')
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(4) // 0-based (May)
  const [calendarYear, setCalendarYear] = useState(2026)
  const [selectedDate, setSelectedDate] = useState({ day: 6 })

  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [loading, setLoading] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('denthiveToken') : null

  const timeSlots = useMemo(
    () => ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM', '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM'],
    []
  )

  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  const [pricePHP, setPricePHP] = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)


  function toISODate(dateNumber) {
    // Convert selectedDate.day within current calendarMonth/year to YYYY-MM-DD.
    // Note: Backend expects YYYY-MM-DD and treats it as UTC day boundaries.
    const monthIndex = calendarMonth // 0-based
    return `${calendarYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dateNumber).padStart(2, '0')}`
  }

  async function fetchPriceForReason(reasonValue) {
    try {
      setPriceLoading(true)
      const resp = await apiFetch(`/prices?serviceType=${encodeURIComponent(reasonValue || '')}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to load price')

      const price = (data.prices && data.prices[0]) || null
      setPricePHP(price?.pricePHP ?? null)
    } catch {
      // keep price as-is
    } finally {
      setPriceLoading(false)
    }
  }

  async function fetchAvailability() {
    try {

      if (!selectedDate?.day) return
      setAvailabilityLoading(true)
      const dateStr = toISODate(selectedDate.day)
      const doctorParam = doctor

      const resp = await apiFetch(`/appointments/availability?date=${encodeURIComponent(dateStr)}&doctor=${encodeURIComponent(doctorParam)}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to load availability')

      setAvailability(data.availability || [])

      // If currently selected time is no longer available, pick first available.
      const current = (data.availability || []).find((x) => x.slot === time)
      if (current && !current.available) {
        const firstAvail = (data.availability || []).find((x) => x.available)
        if (firstAvail) setTime(firstAvail.slot)
      }

      // If nothing selected at all, pick first available.
      if (!time && (data.availability || []).some((x) => x.available)) {
        const firstAvail = (data.availability || []).find((x) => x.available)
        if (firstAvail) setTime(firstAvail.slot)
      }
    } catch {
      // Keep previous UI rather than blank.
    } finally {
      setAvailabilityLoading(false)
    }
  }





  function toggleTooth(name) {
    setSelectedTeeth((cur) => (cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]))
  }

  async function confirmBooking() {
    if (!token) {
      alert('Please log in to book an appointment.')
      window.location.href = '/login'
      return
    }

    setLoading(true)
    try {
      const monthIndex = calendarMonth // 0-based
      const scheduledAt = new Date(
        `${calendarYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')} ${time}`
      ).toISOString()

      const resp = await apiFetch('/appointments', {
        method: 'POST',
        body: {
          serviceType: reason,
          preferredDoctor: doctor,
          scheduledAt,
          toothFlags: selectedTeeth,
        },
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Booking failed')

      alert('Appointment booked!')
      window.location.href = '/patientdashboard'
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load initial price
  useEffect(() => {
    fetchPriceForReason(reason)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load availability for the currently selected date/doctor.
  // Booking page uses authenticated backend endpoint.
  useEffect(() => {
    // Only try if we have a token; otherwise keep UI interactive but unauthenticated.
    if (!token) return
    fetchAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedDate?.day, calendarMonth, calendarYear, doctor])


  return (
    <div className="bg-background text-on-background overflow-x-hidden">
      <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">Book Appointment</h1>
            <p className="text-on-surface-variant font-body-md max-w-xl">
              Schedule your visit with our specialized practitioners. Please select a treatment type, date, and preferred time slot.
            </p>
          </div>
          <div className="flex gap-sm">
            <span className="bg-surface-container-high text-primary px-md py-xs rounded-full font-label-caps flex items-center gap-xs">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified_user</span>
              SECURE BOOKING
            </span>
          </div>
        </div>
      </header>

      <main className="p-margin-desktop md:p-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
            <div className="lg:col-span-8 space-y-lg">
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                <h3 className="font-label-caps text-outline mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">clinical_notes</span>
                  01. VISIT DETAILS
                </h3>

                <div className="mb-md text-on-surface-variant text-xs">
                  {priceLoading ? (
                    <span>Loading estimated price...</span>
                  ) : pricePHP != null ? (
                    <span>
                      Estimated price: <span className="font-bold">₱{Number(pricePHP).toLocaleString('en-PH')}</span>
                    </span>
                  ) : (
                    <span>Estimated price: (not available)</span>
                  )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-xs">
                    <label className="font-label-caps text-on-surface-variant block ml-xs">Reason for Visit</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface border border-outline-variant rounded-lg px-md py-lg appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        value={reason}
                        onChange={(e) => {
                          const next = e.target.value
                          setReason(next)
                          fetchPriceForReason(next)
                        }}
                      >
                        <option>General Checkup</option>
                        <option>Dental Cleaning</option>
                        <option>Tooth Extraction</option>
                        <option>Root Canal</option>
                        <option>Orthodontic Consult</option>
                        <option>Teeth Whitening</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="font-label-caps text-on-surface-variant block ml-xs">Preferred Doctor</label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface border border-outline-variant rounded-lg px-md py-lg appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                      >
                        <option>Dr. Elena Rodriguez (General)</option>
                        <option>Dr. Marcus Chen (Orthodontist)</option>
                        <option>Dr. Sarah Jenkins (Periodontist)</option>
                        <option>Any Available Practitioner</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg overflow-hidden">
                <div className="flex justify-between items-center mb-lg">
                  <h3 className="font-label-caps text-outline flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    02. SELECT DATE
                  </h3>
                <div className="flex items-center gap-md">
                    <button
                      className="material-symbols-outlined p-xs hover:bg-surface-container transition-colors rounded-lg"
                      type="button"
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11)
                          setCalendarYear((y) => y - 1)
                        } else {
                          setCalendarMonth((m) => m - 1)
                        }
                      }}
                    >
                      chevron_left
                    </button>
                    <span className="font-title-sm">{MONTH_NAMES[calendarMonth]} {calendarYear}</span>
                    <button
                      className="material-symbols-outlined p-xs hover:bg-surface-container transition-colors rounded-lg"
                      type="button"
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0)
                          setCalendarYear((y) => y + 1)
                        } else {
                          setCalendarMonth((m) => m + 1)
                        }
                      }}
                    >
                      chevron_right
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center font-label-caps text-outline mb-sm">
                  {WEEKDAYS.map((w, idx) => (
                    <div key={w} className={(w === 'SAT' || w === 'SUN') ? 'text-error/50' : ''}>
                      {w}
                    </div>
                  ))}
                </div>

                {(() => {
                  const cells = getMonthMatrix(calendarYear, calendarMonth)
                  return (
                    <div className="grid grid-cols-7 gap-xs">
                      {cells.map((d, idx) => {
                        if (!d) {
                          return <div key={`empty-${idx}`} className="h-16" />
                        }

                        // If backend marks all slots unavailable, treat the day as unavailable.
                        const dayAvail = availabilityLoading
                          ? true
                          : (() => {
                            if (!availability?.length) return true
                            return availability.some((x) => x.available)
                          })()

                        const disabled = !dayAvail
                        const isActive = selectedDate.day === d


                        return (
                          <button
                            key={d}
                            type="button"
                            disabled={disabled}
                            className={
                              'h-16 border border-outline-variant rounded-lg ' +
                              (disabled
                                ? 'text-error/40 cursor-not-allowed flex flex-col items-center justify-center bg-surface-container-low'
                                : isActive
                                  ? 'border-2 border-primary bg-primary-container text-on-primary-container font-bold rounded-lg flex flex-col items-center justify-center shadow-md relative'
                                  : 'hover:border-primary hover:bg-surface-container transition-all flex flex-col items-center justify-center')
                            }
                            onClick={() => setSelectedDate({ day: d })}
                          >
                            {d}
                            {disabled ? <span className="text-[10px]">{d === 1 || d === 2 ? 'Closed' : 'Full'}</span> : null}
                            {!disabled && isActive ? <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full" /> : null}
                          </button>
                        )
                      })}
                    </div>
                  )
                })()}
              </section>

              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg overflow-hidden">
                <h3 className="font-label-caps text-outline mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">dentistry</span>
                  02.5 SELECT TEETH (OPTIONAL)
                </h3>
                <p className="text-xs text-on-surface-variant mb-lg">Click on specific teeth to highlight areas of concern for your practitioner.</p>

                <div className="flex flex-col md:flex-row gap-lg items-center justify-center">
                  <div className="w-full max-w-[400px] bg-surface-container-low p-md rounded-xl border border-outline-variant">
                    {/* Simplified SVG: still click-to-toggle, but React-driven */}
                    <svg className="w-full h-auto select-none" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid meet">
                      {/* Oval/open-mouth teeth layout (top + bottom rows) */}
                      <g>
                        {(() => {
                          const top = TEETH.slice(0, 16)
                          const bottom = TEETH.slice(16, 32)
                          const cx = 210
                          const rx = 175
                          const topY = 120
                          const bottomY = 230

                          return (
                            <>
                              {top.map((t, idx) => {
                                // Map idx across [-1..1] and place on an arc
                                const a = (idx / (top.length - 1)) * Math.PI // 0..PI
                                const x = cx + Math.cos(Math.PI - a) * rx
                                const y = topY - Math.sin(Math.PI - a) * 28
                                return (
                                  <rect
                                    key={t}
                                    x={x - 8}
                                    y={y - 11}
                                    width={12}
                                    height={20}
                                    rx={4}

                                    fill={selectedTeeth.includes(t) ? '#1976d2' : 'transparent'}
                                    stroke={selectedTeeth.includes(t) ? '#005dac' : '#717783'}
                                    strokeWidth={1}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleTooth(t)}
                                  />
                                )
                              })}

                              {bottom.map((t, idx) => {
                                const a = (idx / (bottom.length - 1)) * Math.PI
                                const x = cx + Math.cos(Math.PI - a) * rx
                                const y = bottomY + Math.sin(Math.PI - a) * 16
                                return (
                                  <rect
                                    key={t}
                                    x={x - 8}
                                    y={y - 11}
                                    width={12}
                                    height={20}
                                    rx={4}

                                    fill={selectedTeeth.includes(t) ? '#1976d2' : 'transparent'}
                                    stroke={selectedTeeth.includes(t) ? '#005dac' : '#717783'}
                                    strokeWidth={1}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleTooth(t)}
                                  />
                                )
                              })}
                            </>
                          )
                        })()}
                      </g>
                    </svg>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="bg-surface p-md rounded-lg border border-outline-variant min-h-[120px]">
                      <p className="font-label-caps text-on-surface-variant mb-sm">Selected Teeth</p>
                      <div className="flex flex-wrap gap-xs">
                        {selectedTeeth.length === 0 ? (
                          <span className="text-xs text-outline italic">No teeth selected</span>
                        ) : (
                          selectedTeeth.map((t) => (
                            <span key={t} className="bg-primary-container text-on-primary-container px-sm py-xs rounded text-xs font-bold">
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-lg sticky top-[80px]">
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                <h3 className="font-label-caps text-outline mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">alarm</span>
                  03. SELECT TIME
                </h3>
                <p className="text-xs text-on-surface-variant mb-md">Friday, October 6th</p>

                <div className="grid grid-cols-2 gap-sm">
                  {timeSlots.map((s) => {
                    const isActive = s === time
                    const slotObj = (availability || []).find((x) => x.slot === s)
                    const disabled = availabilityLoading ? false : !!(slotObj && !slotObj.available)

                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setTime(s)}
                        className={
                          'py-sm border border-outline-variant rounded-lg transition-all text-sm font-data-mono ' +
                          (disabled
                            ? 'opacity-30 cursor-not-allowed line-through'
                            : isActive
                              ? 'bg-primary-container text-on-primary-container border-2 border-primary font-bold'
                              : 'hover:bg-primary hover:text-white')
                        }
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="bg-primary text-on-primary rounded-xl p-lg shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">calendar_add_on</span>
                </div>
                <h3 className="font-label-caps text-white/70 mb-md">APPOINTMENT SUMMARY</h3>
                <div className="space-y-md mb-lg">
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined mt-1">medical_services</span>
                    <div>
                      <p className="text-xs text-white/70 font-label-caps">TREATMENT</p>
                      <p className="font-title-sm">{reason}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined mt-1">event</span>
                    <div>
                      <p className="text-xs text-white/70 font-label-caps">WHEN</p>
                      <p className="font-title-sm">{MONTH_NAMES[calendarMonth]} {selectedDate.day}, {calendarYear} at {time}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-sm">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={confirmBooking}
                    className="w-full bg-white text-primary font-bold py-md rounded-lg flex items-center justify-center gap-sm hover:bg-surface-container-low transition-all active:scale-95 shadow-lg"
                  >
                    {loading ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>

                  <button
                    type="button"
                    className="w-full bg-primary-container/30 text-on-primary-container font-bold py-md rounded-lg flex items-center justify-center gap-sm hover:bg-primary-container/45 transition-all"
                    onClick={() => {
                      window.location.href = '/patientdashboard'
                    }}
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    Go to Patient Dashboard
                  </button>
                </div>

                <p className="text-[10px] text-center mt-md text-white/60">No cancellation fees if canceled 24h prior.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

