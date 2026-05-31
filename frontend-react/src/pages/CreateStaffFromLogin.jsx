import React, { useState } from 'react'
import { apiFetch } from '../lib/api'

export default function CreateStaffFromLogin({ onCreated }) {
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
      if (!resp.ok) throw new Error(data?.error || 'Failed to create user')

      setForm({ email: '', username: '', password: '', role: 'doctor' })
      onCreated?.(data)
    } catch (err) {
      setError(err?.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-md">
      <div className="mt-md glass-card p-md text-left">
        <h3 className="font-headline-md text-headline-md text-on-background mb-xs">Create Staff (Admin Only)</h3>
        <p className="text-[13px] text-on-surface-variant mb-md">
          You must already be logged in as an <b>admin</b>. Then you can create doctor/secretary/admin accounts.
        </p>

        {error ? (
          <div className="bg-error/10 text-error p-sm rounded-lg text-body-sm mb-md">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
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

        <label className="block space-y-xxs mt-md">
          <span className="font-label-caps text-label-caps text-outline uppercase">Password</span>
          <input
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            className="w-full border border-outline-variant rounded-lg bg-surface-bright font-body-sm text-body-sm px-md py-xs"
            type="password"
            placeholder="Set an initial password"
            required
          />
        </label>

        <label className="block space-y-xxs mt-md">
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

        <div className="flex items-center gap-md mt-md">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-md bg-primary text-on-primary font-title-sm text-title-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm"
          >
            {submitting ? 'Creating...' : 'Create Staff'}
          </button>
        </div>
      </div>
    </form>
  )
}



