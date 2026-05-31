import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import ToothMap from '../components/ToothMap'

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
  const [clinicalRecords, setClinicalRecords] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const navigate = useNavigate()


  const dentalFlags = useMemo(() => {
    // Prefer selected appointment's tooth flags; fallback to the most recent appointment.
    if (selectedAppointment?.toothFlags?.length) return selectedAppointment.toothFlags
    const latest = appointments?.[0]
    return latest?.toothFlags || []
  }, [appointments, selectedAppointment])


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

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await apiFetch('/clinical-records/me')
        const data = await resp.json()
        if (resp.ok) setClinicalRecords(data.clinicalRecords || [])
      } catch {}
    })()
  }, [])


  const selectedStatus = (selectedAppointment?.status || '').toUpperCase()
  const selectedBadgeClass =
    selectedAppointment?.status === 'completed'
      ? 'bg-secondary text-on-secondary'
      : selectedAppointment?.status === 'canceled'
        ? 'bg-error text-on-error'
        : 'bg-primary-container text-on-primary-container'

  const patientName = patient?.fullName || patient?.name || patient?.username || ''

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">My Records</h1>
          <p className="text-on-surface-variant font-body-md mt-xs">
            {patientName ? `Welcome back, ${patientName.split(' ')[0]}` : 'View your treatment history and medical records'}
          </p>
        </div>
        <button
          type="button"
          className="px-md py-sm bg-primary text-on-primary rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all inline-flex items-center gap-sm self-start"
          onClick={() => navigate('/bookingpage')}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Booking
        </button>
      </div>

      <div className="space-y-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-4 space-y-gutter">
              <div className="glass-card rounded-xl p-lg overflow-hidden">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="font-headline-md text-headline-md">Medical Record</h3>
                  <button
                    className="text-primary font-title-sm"
                    type="button"
                    onClick={() => alert('Clinical notes are managed by your dentist/doctor.')} // read-only for patients
                  >
                    Edit
                  </button>
                </div>
                  <div className="space-y-md">
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-error">warning</span>
                    <div>
                      <p className="font-title-sm text-on-surface">Allergies</p>
                      <p className="font-body-md text-body-md text-outline">{(patient?.allergies || []).join(', ') || 'None reported'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-primary">pill</span>
                    <div>
                      <p className="font-title-sm text-on-surface">Current Medications</p>
                      <p className="font-body-md text-body-md text-outline">{(patient?.medications || []).join(', ') || 'None reported'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-secondary">medical_information</span>
                    <div>
                      <p className="font-title-sm text-on-surface">Chronic Conditions</p>
                      <p className="font-body-md text-body-md text-outline">{(patient?.chronicConditions || []).join(', ') || 'None reported'}</p>
                    </div>
                  </div>

                  <div className="pt-md border-t border-outline-variant">
                    <p className="font-title-sm text-on-surface mb-xs">Clinical Notes</p>
                    {clinicalRecords.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No clinical records yet.</p>
                    ) : (
                      <div className="space-y-sm">
                        {clinicalRecords.slice(0, 3).map((r) => (
                          <div key={r._id || r.appointmentId} className="rounded-lg border border-outline-variant p-sm">
                            <p className="text-[10px] text-on-surface-variant font-label-caps mb-[2px]">
                              {r.appointmentId ? `Appointment: ${r.appointmentId}` : 'Visit'} • {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}
                            </p>
                            {r.consultationNotes ? (
                              <p className="text-xs text-on-surface">{r.consultationNotes}</p>
                            ) : (
                              <>
                                <p className="text-xs text-on-surface-variant">No consultation notes yet.</p>
                                {/* Fallback: show medical history captured at booking time */}
                                <div className="mt-xs space-y-[2px]">
                                  <p className="text-[10px] text-on-surface-variant">
                                    Allergies: {(Array.isArray(selectedAppointment?.allergies)
                                      ? selectedAppointment.allergies
                                      : Array.isArray(patient?.allergies)
                                        ? patient.allergies
                                        : [])
                                      .filter(Boolean)
                                      .join(', ') || 'None reported'}
                                  </p>
                                  <p className="text-[10px] text-on-surface-variant">
                                    Medications: {(Array.isArray(selectedAppointment?.medications)
                                      ? selectedAppointment.medications
                                      : Array.isArray(patient?.medications)
                                        ? patient.medications
                                        : [])
                                      .filter(Boolean)
                                      .join(', ') || 'None reported'}
                                  </p>
                                  <p className="text-[10px] text-on-surface-variant">
                                    Chronic Conditions: {(Array.isArray(selectedAppointment?.chronicConditions)
                                      ? selectedAppointment.chronicConditions
                                      : Array.isArray(patient?.chronicConditions)
                                        ? patient.chronicConditions
                                        : [])
                                      .filter(Boolean)
                                      .join(', ') || 'None reported'}
                                  </p>
                                </div>
                              </>
                            )}




                            {Array.isArray(r.procedures) && r.procedures.length > 0 ? (
                              <p className="text-[10px] text-on-surface-variant mt-xs">
                                Procedures: {r.procedures
                                  .slice(0, 5)
                                  .map((p) => `${p.tooth || '-'} (${p.procedure || '-'})`)
                                  .join(', ')}{r.procedures.length > 5 ? '…' : ''}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>


              <div className="glass-card rounded-xl p-lg">
                <h3 className="font-headline-md text-headline-md mb-md">Dental Map</h3>
                <div className="bg-surface-container-low rounded-lg p-md flex flex-col items-center justify-center min-h-[200px] border border-dashed border-outline-variant">
                  <ToothMap selected={dentalFlags} readOnly />
                </div>
                <button
                  type="button"
                  className="w-full mt-lg border border-primary text-primary py-sm rounded-lg font-title-sm hover:bg-primary hover:text-on-primary transition-all"
                  onClick={() => {
                    alert('Dental map is read-only on Patient Dashboard. Select an appointment to preview its tooth flags.');
                  }}
                >
                  Preview Dental Map
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

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse dental-table">
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
                            ? 'bg-secondary text-on-secondary'
                            : a.status === 'canceled'
                              ? 'bg-error text-on-error'
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
                    className="px-md py-sm bg-primary text-on-primary rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all"
                    onClick={() => (window.location.href = '/bookingpage')}
                  >
                    New Booking
                  </button>
                </div>
              </div>
            </div>
          </div>

          {patient ? (
            <div className="glass-card rounded-xl p-lg">
              <h3 className="font-headline-md text-headline-md mb-lg">Your Profile</h3>
              <div className="space-y-md">
                <div className="flex items-center justify-between gap-md">
                  <div>
                    <p className="font-label-caps text-label-caps text-outline">PATIENT</p>
                    <p className="font-title-sm text-on-surface">
                      {(patient?.name && String(patient.name)) || (patient?.fullName && String(patient.fullName)) || '—'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Patient ID: {patient?._id || patient?.patientId || '—'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-primary bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
                  <div className="space-y-xs">
                    <p className="font-label-caps text-label-caps text-outline">PHONE</p>
                    <p className="font-title-sm text-on-surface">{patient?.phone || patient?.contactNumber || '—'}</p>
                  </div>
                  <div className="space-y-xs">
                    <p className="font-label-caps text-label-caps text-outline">EMAIL</p>
                    <p className="font-title-sm text-on-surface">{patient?.email || '—'}</p>
                  </div>
                  <div className="space-y-xs">
                    <p className="font-label-caps text-label-caps text-outline">DOB</p>
                    <p className="font-title-sm text-on-surface">
                      {patient?.dob ? new Date(patient.dob).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="space-y-xs">
                    <p className="font-label-caps text-label-caps text-outline">GENDER</p>
                    <p className="font-title-sm text-on-surface">{patient?.gender || '—'}</p>
                  </div>
                </div>

                <div className="pt-md border-t border-outline-variant">
                  <p className="text-xs text-on-surface-variant">
                    This section is a compact view of your patient record. Clinical notes are managed by your dentist/doctor.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-lg animate-pulse">
              <div className="h-6 bg-surface-container-high rounded w-32 mb-md" />
              <div className="grid grid-cols-4 gap-md">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-10 bg-surface-container-high rounded" />
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  )
}

