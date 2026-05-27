import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

function formatScheduledAt(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '-'
  }
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await apiFetch('/patients/me')
        const data = await resp.json()
        if (resp.ok) setPatient(data)
      } catch {}
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await apiFetch('/appointments/me')
        const data = await resp.json()
        if (resp.ok) setAppointments(data.appointments || [])
      } catch {}
    })()
  }, [])

  const selectedStatus = (selectedAppointment?.status || '').toUpperCase()
  const selectedBadgeClass =
    selectedAppointment?.status === 'completed'
      ? 'bg-secondary text-white'
      : selectedAppointment?.status === 'canceled'
        ? 'bg-error text-white'
        : 'bg-primary-container text-on-primary-container'

  return (
    <div className="bg-background text-on-background">
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-50">
        <div className="p-lg flex items-center gap-sm">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white">dentistry</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">DentaCare</h1>
            <p className="font-label-caps text-label-caps text-outline">Dental Management</p>
          </div>
        </div>
        <nav className="flex-1 mt-md space-y-xs px-sm">
          <a className="bg-primary-container text-on-primary-container font-bold px-md py-sm flex items-center gap-sm rounded-lg border-r-4 border-primary transition-all" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              dashboard
            </span>
            <span className="font-label-caps text-label-caps">Bookings</span>
          </a>
          <a className="px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all" href="/bookingpage">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-caps text-label-caps">Book Appointment</span>
          </a>
        </nav>
        <div className="mt-auto border-t border-outline-variant px-sm py-md">
          <button
            className="w-full bg-error/10 text-error py-sm rounded-lg font-title-sm flex items-center justify-center gap-xs hover:bg-error/15 transition-all active:scale-95 mt-sm"
            type="button"
            onClick={() => {
              localStorage.removeItem('denthiveToken')
              navigate('/')
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="md:ml-64 flex flex-col min-h-screen">
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Patient Record</h2>
            <div className="hidden lg:flex items-center bg-surface-container-lowest border border-outline-variant rounded-full px-md py-xs ml-xl">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body-sm w-64"
                placeholder="Search patient ID or name..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:bg-surface-container-high p-sm rounded-full transition-colors relative" type="button">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <button className="text-on-surface-variant hover:bg-surface-container-high p-sm rounded-full transition-colors" type="button">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <button className="text-on-surface-variant hover:bg-surface-container-high p-sm rounded-full transition-colors" type="button">
              <span className="material-symbols-outlined">schedule</span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-xs" />
            <div className="flex items-center gap-sm">
              <div className="text-right">
                <p className="font-title-sm text-on-surface">Dr. Julian Vance</p>
                <p className="font-label-caps text-label-caps text-outline">Senior Orthodontist</p>
              </div>
              <img
                alt="User Profile"
                className="w-10 h-10 rounded-full border border-primary object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpulhUwXCyQCVdFDUpZj31RdXJsMUxCWve3jjjFbZfvsvh4Unx5uGaSiE9yno86WkTTiId8KtooDcPXpmu8gLLn9D-ylPc3NPl4-nvC-kMyj4_4NcftRA7HmyI8yg-3CTBHWN5EUId79n6p48B0GQzZkfiUSuWxg1MNyNqLrQrA-TFNdRDYtUb5SDsmwhUbiCq92FfKbSqbSARoVrRHsTM5n8kGOEnFyfNL4W2El3Zc8jMOLekNINt0pZgZ2zWWwC8aOF351-exbrp"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 p-margin-desktop space-y-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-4 space-y-gutter">
              <div className="glass-card rounded-xl p-lg overflow-hidden">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="font-headline-md text-headline-md">Medical Record</h3>
                  <button className="text-primary font-title-sm" type="button">
                    Edit
                  </button>
                </div>
                <div className="space-y-md">
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-error">warning</span>
                    <div>
                      <p className="font-title-sm text-on-surface">Allergies</p>
                      <p className="font-body-md text-body-md text-outline">Penicillin, Latex (Low sensitivity)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-primary">pill</span>
                    <div>
                      <p className="font-title-sm text-on-surface">Current Medications</p>
                      <p className="font-body-md text-body-md text-outline">None reported</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-secondary">medical_information</span>
                    <div>
                      <p className="font-title-sm text-on-surface">Chronic Conditions</p>
                      <p className="font-body-md text-body-md text-outline">Type 2 Diabetes (Managed)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-lg">
                <h3 className="font-headline-md text-headline-md mb-md">Dental Map</h3>
                <div className="bg-surface-container-low rounded-lg p-md flex flex-col items-center justify-center min-h-[200px] border border-dashed border-outline-variant">
                  <div className="text-center">
                    <p className="font-body-sm text-on-surface-variant">(Placeholder) Interactive dental map from Appointments/SVG data goes here.</p>
                  </div>
                </div>
                <button type="button" className="w-full mt-lg border border-primary text-primary py-sm rounded-lg font-title-sm hover:bg-primary hover:text-white transition-all">
                  Open Interactive Chart
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 glass-card rounded-xl p-lg">
              <div className="flex items-center justify-between mb-lg">
                <h3 className="font-headline-md text-headline-md">Treatment History & Queue</h3>
                <div className="flex gap-sm">
                  {(() => {
                    const completedCount = appointments.filter((a) => a.status === 'completed').length
                    const pendingCount = appointments.filter((a) => a.status === 'waiting' || a.status === 'scheduled' || a.status === 'calling' || a.status === 'in_progress').length
                    return (
                      <>
                        <span className="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full font-label-caps text-label-caps">COMPLETED: {completedCount}</span>
                        <span className="px-sm py-xs bg-primary-fixed text-primary rounded-full font-label-caps text-label-caps">PENDING: {pendingCount}</span>
                      </>
                    )
                  })()}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-primary">
                      <th className="py-md font-label-caps text-label-caps text-outline px-sm">DATE</th>
                      <th className="py-md font-label-caps text-label-caps text-outline px-sm">PROCEDURE</th>
                      <th className="py-md font-label-caps text-label-caps text-outline px-sm">DOCTOR</th>
                      <th className="py-md font-label-caps text-label-caps text-outline px-sm">STATUS</th>
                      <th className="py-md font-label-caps text-label-caps text-outline px-sm text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md">
                    {appointments.length === 0 ? (
                      <tr>
                        <td className="py-md px-sm border-b border-outline-variant" colSpan="5">
                          No appointments yet.
                        </td>
                      </tr>
                    ) : (
                      appointments.map((a) => {
                        const dateStr = a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : ''
                        const status = (a.status || '').toUpperCase()
                        const badgeClass =
                          a.status === 'completed'
                            ? 'bg-secondary text-white'
                            : a.status === 'canceled'
                              ? 'bg-error text-white'
                              : 'bg-primary-container text-on-primary-container'

                        return (
                          <tr key={a._id || a.scheduledAt} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-md px-sm border-b border-outline-variant">{dateStr}</td>
                            <td className="py-md px-sm border-b border-outline-variant">{a.serviceType || '-'}</td>
                            <td className="py-md px-sm border-b border-outline-variant">{a.preferredDoctor || '-'}</td>
                            <td className="py-md px-sm border-b border-outline-variant">
                              <span className={`px-sm py-xs rounded-full font-label-caps text-[10px] ${badgeClass}`}>{status}</span>
                            </td>
                            <td className="py-md px-sm border-b border-outline-variant text-right">
                              <button
                                type="button"
                                className="text-primary hover:bg-primary-fixed p-xs rounded"
                                onClick={() => setSelectedAppointment(a)}
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {selectedAppointment ? (
                <div className="mt-lg border border-outline-variant rounded-xl p-md bg-surface-container-lowest">
                  <div className="flex items-start justify-between gap-sm mb-md">
                    <div>
                      <div className="flex items-center gap-sm mb-xs">
                        <span className="material-symbols-outlined text-primary">medical_services</span>
                        <h4 className="font-headline-md text-headline-md">Appointment Details</h4>
                      </div>
                      <p className="text-on-surface-variant text-xs">Selected appointment from your bookings list.</p>
                    </div>
                    <button
                      type="button"
                      className="px-md py-xs border border-outline-variant rounded-lg font-title-sm hover:bg-surface-container transition-all"
                      onClick={() => setSelectedAppointment(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="space-y-xs">
                      <p className="text-xs text-on-surface-variant font-label-caps">TREATMENT</p>
                      <p className="font-title-sm text-on-surface">{selectedAppointment.serviceType || '-'}</p>
                    </div>
                    <div className="space-y-xs">
                      <p className="text-xs text-on-surface-variant font-label-caps">DOCTOR</p>
                      <p className="font-title-sm text-on-surface">{selectedAppointment.preferredDoctor || '-'}</p>
                    </div>
                    <div className="space-y-xs">
                      <p className="text-xs text-on-surface-variant font-label-caps">SCHEDULED</p>
                      <p className="font-title-sm text-on-surface">{formatScheduledAt(selectedAppointment.scheduledAt)}</p>
                    </div>
                    <div className="space-y-xs">
                      <p className="text-xs text-on-surface-variant font-label-caps">STATUS</p>
                      <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-caps text-[10px] ${selectedBadgeClass}`}>
                        {selectedStatus || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-lg border border-outline-variant rounded-xl p-md bg-surface-container-lowest">
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-outline">info</span>
                    <div>
                      <p className="font-title-sm text-on-surface">Select an appointment</p>
                      <p className="text-xs text-on-surface-variant">Click the visibility icon on a row to view more details.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-lg flex justify-between items-center">
                <button type="button" className="font-body-sm text-outline hover:text-on-surface transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download Full Medical Report (PDF)
                </button>
                <div className="flex gap-sm">
                  <button type="button" className="px-md py-sm border border-outline-variant rounded-lg font-title-sm hover:bg-surface-container transition-all">
                    Archive Record
                  </button>
                  <button
                    type="button"
                    className="px-md py-sm bg-primary text-white rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all"
                    onClick={() => (window.location.href = '/bookingpage')}
                  >
                    New Booking
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-headline-md text-headline-md">Your profile</h3>
            {patient ? (
              <pre className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">{JSON.stringify(patient, null, 2)}</pre>
            ) : (
              <p>Loading patient data...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

