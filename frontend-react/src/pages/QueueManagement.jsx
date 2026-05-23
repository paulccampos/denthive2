import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function QueueManagement() {
  const [queue, setQueue] = useState([])


  useEffect(() => {
    ;(async () => {
      try {
        const resp = await apiFetch('/queue?status=waiting')
        const data = await resp.json()
        if (resp.ok) setQueue(data.queue || data)
      } catch {}
    })()
  }, [])

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className="flex flex-col h-full border-r border-outline-variant bg-surface-container-low h-screen w-64 fixed left-0 top-0 z-50">
        <div className="px-md py-lg flex flex-col gap-xs">
          <div className="flex items-center gap-sm mb-lg">
            <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>dentistry</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary">DentaCare</h1>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Dental Management</p>
            </div>
          </div>
          <nav className="flex flex-col gap-xs">
            <a className="text-on-surface-variant px-md py-sm flex items-center gap-sm hover:bg-surface-container-highest transition-all duration-200" href="#">
              <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              <span className="font-label-caps text-label-caps">Dashboard</span>
            </a>
            <a className="bg-primary-container text-on-primary-container font-bold border-r-4 border-primary px-md py-sm flex items-center gap-sm transition-all duration-200" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
              <span className="font-label-caps text-label-caps">Queue</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Queue Management</h2>
            <div className="flex items-center gap-xs px-sm py-xs bg-surface-container-high rounded-full">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Live View</span>
            </div>
          </div>
          <div className="flex items-center gap-lg">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-sm text-outline">search</span>
              <input
                className="pl-xl pr-md py-xs bg-surface-container-low border border-outline-variant rounded-lg font-body-sm w-64"
                placeholder="Search patients in registry..."
                type="text"
              />
            </div>
          </div>
        </header>

        <div className="p-margin-desktop space-y-lg">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm bg-surface-container flex justify-between items-center border-b-2 border-primary">
              <h3 className="font-title-sm text-title-sm text-primary">Active Queue</h3>
              <div className="flex gap-sm">
                <button className="flex items-center gap-xs px-sm py-xs bg-white border border-outline-variant rounded hover:bg-surface-container-low transition-colors font-label-caps text-label-caps" type="button">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                  Filter
                </button>
                <button className="flex items-center gap-xs px-sm py-xs bg-primary text-white rounded hover:opacity-90 transition-all font-label-caps text-label-caps" type="button">
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Queue Patient
                </button>
              </div>
            </div>

            <table className="w-full text-left zebra-table">
              <thead className="bg-surface font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-md py-sm">#</th>
                  <th className="px-md py-sm">Patient Name</th>
                  <th className="px-md py-sm">Service Type</th>
                  <th className="px-md py-sm">Check-in Time</th>
                  <th className="px-md py-sm">Assigned To</th>
                  <th className="px-md py-sm">Status</th>
                  <th className="px-md py-sm text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="font-body-md">
                {(queue || []).slice(0, 20).map((a, idx) => (
                  <tr key={a._id || idx} className="transition-colors hover:bg-surface-container-lowest">
                    <td className="px-md py-md font-data-mono">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-xs">{(a.patientName || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('')}</div>
                        <div>
                          <p className="font-bold">{a.patientName}</p>
                          <p className="text-[11px] text-on-surface-variant">ID: {a.patientDentId || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-md">{a.serviceType}</td>
                    <td className="px-md py-md font-data-mono">{a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-md py-md">{a.assignedTo}</td>
                    <td className="px-md py-md">
                      <span className="px-sm py-xs bg-primary text-white text-[11px] font-bold rounded-full uppercase tracking-tight flex items-center gap-xs w-fit">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-md py-md text-right">
                      <div className="flex justify-end gap-xs">
                        <button type="button" className="p-xs hover:bg-surface-container-high rounded text-primary transition-colors" title="Check-in">
                          <span className="material-symbols-outlined">login</span>
                        </button>
                        <button type="button" className="p-xs hover:bg-error-container hover:text-error rounded transition-colors" title="Delete">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

