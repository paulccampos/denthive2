import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import CreateStaff from './CreateStaff'

export default function AdminPage() {
  const [users, setUsers] = useState([])

  async function loadUsers() {
    try {
      const resp = await apiFetch('/admin/users')
      const data = await resp.json()
      if (resp.ok) setUsers(data.users || data)
    } catch {}
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      <aside className="flex flex-col h-full border-r border-outline-variant bg-surface-container-low h-screen w-64 fixed left-0 top-0 z-50">
        <div className="p-lg flex items-center gap-sm">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">health_metrics</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">DentHive</h1>
            <p className="font-label-caps text-label-caps text-outline uppercase">Dental Management</p>
          </div>
        </div>
        <nav className="mt-md flex-grow overflow-y-auto">
          <div className="space-y-1 px-sm">
            <a className="bg-primary-container text-on-primary-container font-bold border-r-4 border-primary px-md py-sm flex items-center gap-sm transition-all duration-200" href="#">
              <span className="material-symbols-outlined">folder_shared</span>
              <span className="font-label-caps text-label-caps uppercase">Patients</span>
            </a>
          </div>
        </nav>
        <div className="mt-auto border-t border-outline-variant p-sm space-y-1">
          <button
            type="button"
            className="w-full bg-secondary text-on-secondary py-sm rounded-lg font-title-sm flex items-center justify-center gap-xs hover:opacity-90 transition-all active:scale-95"
            onClick={() => {
              const el = document.getElementById('create-staff-section')
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <span className="material-symbols-outlined">person_add</span>
            Create Staff
          </button>
          <a className="text-on-surface-variant px-md py-sm flex items-center gap-sm hover:bg-surface-container-highest transition-all duration-200" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-caps text-label-caps uppercase">Settings</span>
          </a>
        </div>

      </aside>

      <main className="ml-64 flex-grow min-h-screen">
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">User Management</h2>
          </div>
          <div className="flex items-center gap-lg">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-sm text-outline">search</span>
              <input
                className="pl-xl pr-md py-xs border border-outline-variant rounded-lg bg-surface-bright font-body-sm text-body-sm w-64"
                placeholder="Search staff records..."
                type="text"
              />
            </div>
          </div>
        </header>

        <div className="p-margin-desktop space-y-lg">
          <section className="grid grid-cols-1 md:grid-cols-5 gap-gutter">
            <div className="flat-card p-md rounded-xl flex flex-col justify-between">
              <span className="font-label-caps text-label-caps text-outline uppercase">Total Staff</span>
              <div className="flex items-end justify-between mt-xs">
                <span className="font-display-lg text-display-lg text-on-surface">{users.length}</span>
                <span className="material-symbols-outlined text-primary bg-surface-container-low p-xs rounded-lg">groups</span>
              </div>
            </div>
          </section>

          <section className="flex justify-between items-center">
            <div>
              <h3 className="font-title-sm text-title-sm text-on-surface">Staff Directory</h3>
              <p className="font-body-sm text-body-sm text-outline">Manage roles and permissions for clinic members.</p>
            </div>
            <div className="text-on-surface-variant font-body-sm">Only visible to admins.</div>
          </section>

          <section id="create-staff-section">
            <CreateStaff onCreated={loadUsers} />
          </section>



          <section className="flat-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse zebra-table">
                <thead>
                  <tr className="bg-surface sticky top-0 border-b-2 border-primary">
                    <th className="px-lg py-md font-label-caps text-label-caps text-outline uppercase">Name</th>
                    <th className="px-lg py-md font-label-caps text-label-caps text-outline uppercase">Role</th>
                    <th className="px-lg py-md font-label-caps text-label-caps text-outline uppercase">Username</th>
                    <th className="px-lg py-md font-label-caps text-label-caps text-outline uppercase">Last Login</th>
                    <th className="px-lg py-md font-label-caps text-label-caps text-outline uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {users.slice(0, 10).map((u, idx) => (
                    <tr key={u._id || idx} className="hover:bg-surface-container transition-colors group">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-md">
                          <div className="h-10 w-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary">{(u.username || u.email || 'U').slice(0,2).toUpperCase()}</div>
                          <div>
                            <p className="font-title-sm text-title-sm text-on-surface">{u.email || 'User'}</p>
                            <p className="font-body-sm text-body-sm text-outline">{u.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <span className="px-sm py-xs bg-primary-container text-on-primary-container text-label-caps font-bold rounded-full uppercase">{u.role || '—'}</span>
                      </td>
                      <td className="px-lg py-md font-data-mono text-data-mono">{u.username || '-'}</td>
                      <td className="px-lg py-md font-body-sm text-body-sm text-outline">—</td>
                      <td className="px-lg py-md text-right space-x-xs">
                        <button type="button" className="material-symbols-outlined text-outline hover:text-primary transition-colors" title="Change Password">lock_reset</button>
                        <button type="button" className="material-symbols-outlined text-outline hover:text-secondary transition-colors" title="Edit Role">edit_square</button>
                        <button type="button" className="material-symbols-outlined text-outline hover:text-error transition-colors" title="Deactivate">person_off</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

