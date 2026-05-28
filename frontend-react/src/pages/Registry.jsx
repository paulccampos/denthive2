import React, { useEffect, useState } from 'react'
import { apiFetch, logout } from '../lib/api'


export default function Registry() {
  const [patients, setPatients] = useState([])


  useEffect(() => {
    ;(async () => {
      try {
        const resp = await apiFetch('/patients')
        const data = await resp.json()
        if (resp.ok) setPatients(data.patients || data)
      } catch {}
    })()
  }, [])

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen">
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col border-r border-outline-variant bg-surface-container-low z-50">

        <div className="px-md py-lg flex flex-col gap-xs">
          <div className="flex items-center gap-sm mb-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>dentistry</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary">DentaCare</h1>
              <p className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Dental Management</p>
            </div>
          </div>
          <nav className="flex flex-col gap-xs">
            <a className="text-on-surface-variant px-md py-sm flex items-center gap-sm hover:bg-surface-container-highest transition-all duration-200" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-caps text-label-caps">Dashboard</span>
            </a>
            <a className="text-on-surface-variant px-md py-sm flex items-center gap-sm hover:bg-surface-container-highest transition-all duration-200" href="#">
              <span className="material-symbols-outlined">group</span>
              <span className="font-label-caps text-label-caps">Queue</span>
            </a>
            <a className="bg-primary-container text-on-primary-container font-bold border-r-4 border-primary px-md py-sm flex items-center gap-sm rounded-l-lg" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>folder_shared</span>
              <span className="font-label-caps text-label-caps">Patients</span>
            </a>
          </nav>
        </div>
        <div className="mt-auto border-t border-outline-variant p-md">
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


      <header className="flex justify-between items-center w-[calc(100%-16rem)] ml-64 px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-primary">Patient Registry</h2>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative group">
            <input
              className="bg-surface-container-low border-none rounded-full px-xl py-xs w-80 text-body-md focus:ring-2 focus:ring-primary transition-all"
              placeholder="Search by name, ID or phone..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
          </div>
        </div>
      </header>

      <main className="ml-64 p-margin-desktop">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-md flex justify-between items-center border-b border-outline-variant">
            <div className="flex items-center gap-md">
              <h4 className="font-headline-md text-headline-md">Patient Database</h4>
              <div className="flex gap-xs">
                <span className="px-sm py-xs bg-surface-container-high rounded-lg text-body-sm text-primary font-bold">All ({patients.length})</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b-2 border-primary z-10">
                <tr>
                  <th className="p-md font-label-caps text-label-caps text-outline uppercase tracking-wider">Patient ID</th>
                  <th className="p-md font-label-caps text-label-caps text-outline uppercase tracking-wider">Patient Name</th>
                  <th className="p-md font-label-caps text-label-caps text-outline uppercase tracking-wider">Contact Details</th>
                  <th className="p-md font-label-caps text-label-caps text-outline uppercase tracking-wider">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 20).map((p, idx) => (
                  <tr key={p._id || idx} className="hover:bg-surface-container transition-colors cursor-pointer">
                    <td className="p-md font-data-mono text-data-mono text-primary">{p.denthivePatientId || '-'}</td>
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <span className="font-title-sm text-title-sm">{p.firstName} {p.lastName}</span>
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="flex flex-col">
                        <span className="text-body-md">{p.phone || '-'}</span>
                        <span className="text-body-sm text-outline">{p.email || '-'}</span>
                      </div>
                    </td>
                    <td className="p-md text-body-md">—</td>
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

