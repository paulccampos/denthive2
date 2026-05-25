import React, { useState } from 'react'
import { apiFetch } from '../lib/api'

export default function CreateStaff({ onCreated }) {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    role: 'doctor',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const resp = await apiFetch('/admin/users', {
        method: 'POST',
        body: {
          email: form.email || undefined,
          username: form.username || undefined,
          password: form.password,
          role: form.role,
        },
      })

      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        throw new Error(data?.error || 'Failed to create user')
      }

      setForm({ email: '', username: '', password: '', role: 'doctor' })
      onCreated?.(data)
    } catch (err) {
      setError(err?.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="flat-card rounded-xl p-md space-y-md">
      <div>
        <h3 className="font-title-sm text-title-sm text-on-surface">Add New Staff</h3>
        <p className="font-body-sm text-body-sm text-outline">Create a doctor, secretary, or admin account.</p>
      </div>

      {error ? (
        <div className="bg-error/10 text-error p-sm rounded-lg text-body-sm">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <label className="space-y-xxs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Email</span>
          <input
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            className="w-full border border-outline-variant rounded-lg bg-surface-bright font-body-sm text-body-sm px-md py-xs"
            type="email"
            placeholder="doctor@example.com"
          />
        </label>

        <label className="space-y-xxs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Username</span>
          <input
            value={form.username}
            onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
            className="w-full border border-outline-variant rounded-lg bg-surface-bright font-body-sm text-body-sm px-md py-xs"
            type="text"
            placeholder="doctor1"
          />
        </label>
      </div>

      <label className="space-y-xxs">
        <span className="font-label-caps text-label-caps text-outline uppercase">Password</span>
        <input
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          className="w-full border border-outline-variant rounded-lg bg-surface-bright font-body-sm text-body-sm px-md py-xs"
          type="password"
          placeholder="Set an initial password"
        />
      </label>

      <label className="space-y-xxs">
        <span className="font-label-caps text-label-caps text-outline uppercase">Role</span>
        <select
          value={form.role}
          onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
          className="w-full border border-outline-variant rounded-lg bg-surface-bright font-body-sm text-body-sm px-md py-xs"
        >
          <option value="doctor">doctor</option>
          <option value="secretary">secretary</option>
          <option value="admin">admin</option>
        </select>
      </label>

      <div className="flex items-center gap-md">
        <button
          type="submit"
          disabled={submitting}
          className="bg-secondary text-on-secondary px-lg py-sm rounded-lg flex items-center gap-xs font-title-sm text-title-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">person_add</span>
          {submitting ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  )
}

