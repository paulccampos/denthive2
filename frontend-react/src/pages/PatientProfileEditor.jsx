import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'

function normalizeListInput(v) {
  if (typeof v !== 'string') return []
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function toInputString(list) {
  if (!Array.isArray(list)) return ''
  return list.filter(Boolean).join(', ')
}

export default function PatientProfileEditor({ patient, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dob: '', // YYYY-MM-DD for <input type="date">
    gender: '',
    allergiesText: '',
    medicationsText: '',
    chronicConditionsText: '',
  })

  useEffect(() => {
    if (!patient) return

    const dobValue = patient?.dob ? new Date(patient.dob).toISOString().slice(0, 10) : ''

    setForm({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      address: patient.address || '',
      dob: dobValue,
      gender: patient.gender || '',
      allergiesText: toInputString(patient.allergies),
      medicationsText: toInputString(patient.medications),
      chronicConditionsText: toInputString(patient.chronicConditions),
    })
  }, [patient])

  const canSave = useMemo(() => {
    // Immutable fields (createdAt/dateCreated/IDs) are not part of this form.
    return !!form.firstName && !!form.lastName
  }, [form.firstName, form.lastName])

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        dob: form.dob || null,
        gender: form.gender || null,
        allergies: normalizeListInput(form.allergiesText),
        medications: normalizeListInput(form.medicationsText),
        chronicConditions: normalizeListInput(form.chronicConditionsText),
      }

      const resp = await apiFetch('/patients/me', {
        method: 'PUT',
        body: payload,
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Failed to save profile')

      onSaved?.(data)
      setError(null)
    } catch (e) {
      setError(e.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="glass-card rounded-xl p-lg">
      <div className="flex items-start justify-between gap-sm mb-md">
        <div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">person</span>
            <h4 className="font-headline-md text-headline-md">Patient Profile</h4>
          </div>
          <p className="text-xs text-on-surface-variant mt-xs">
            DentHive ID: <span className="font-bold text-on-surface">{patient?.denthivePatientId || '-'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <label className="space-y-xs">
          <span className="font-label-caps text-on-surface-variant">First Name</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          />
        </label>
        <label className="space-y-xs">
          <span className="font-label-caps text-on-surface-variant">Last Name</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          />
        </label>

        <label className="space-y-xs">
          <span className="font-label-caps text-on-surface-variant">Email</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label className="space-y-xs">
          <span className="font-label-caps text-on-surface-variant">Phone</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </label>

        <label className="space-y-xs sm:col-span-2">
          <span className="font-label-caps text-on-surface-variant">Address</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </label>

        <label className="space-y-xs">
          <span className="font-label-caps text-on-surface-variant">Date of Birth</span>
          <input
            type="date"
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.dob}
            onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
          />
        </label>
        <label className="space-y-xs">
          <span className="font-label-caps text-on-surface-variant">Gender</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
            placeholder="e.g., Male/Female/Other"
          />
        </label>

        <label className="space-y-xs sm:col-span-2">
          <span className="font-label-caps text-on-surface-variant">Allergies (comma-separated)</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.allergiesText}
            onChange={(e) => setForm((f) => ({ ...f, allergiesText: e.target.value }))}
          />
        </label>

        <label className="space-y-xs sm:col-span-2">
          <span className="font-label-caps text-on-surface-variant">Medications (comma-separated)</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.medicationsText}
            onChange={(e) => setForm((f) => ({ ...f, medicationsText: e.target.value }))}
          />
        </label>

        <label className="space-y-xs sm:col-span-2">
          <span className="font-label-caps text-on-surface-variant">Chronic Conditions (comma-separated)</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-md py-xs"
            value={form.chronicConditionsText}
            onChange={(e) => setForm((f) => ({ ...f, chronicConditionsText: e.target.value }))}
          />
        </label>
      </div>

      {error ? (
        <div className="mt-md px-md py-xs bg-error/10 text-error rounded-lg text-sm">{error}</div>
      ) : null}

      <div className="mt-lg flex items-center justify-end gap-sm">
        <button
          type="button"
          className="px-md py-sm border border-outline-variant rounded-lg font-title-sm hover:bg-surface-container transition-all"
          onClick={() => {
            // Reset back to server data (patient prop)
            setForm({
              firstName: patient.firstName || '',
              lastName: patient.lastName || '',
              email: patient.email || '',
              phone: patient.phone || '',
              address: patient.address || '',
              dob: patient?.dob ? new Date(patient.dob).toISOString().slice(0, 10) : '',
              gender: patient.gender || '',
              allergiesText: toInputString(patient.allergies),
              medicationsText: toInputString(patient.medications),
              chronicConditionsText: toInputString(patient.chronicConditions),
            })
            setError(null)
          }}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !canSave}
          className="px-md py-sm bg-primary text-white rounded-lg font-title-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </section>
  )
}

