import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import SecretarySidebar from '../components/SecretarySidebar.jsx'

export default function Registry() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await apiFetch('/patients')
        const data = await resp.json()
        if (resp.ok) setPatients(data.patients || data)
      } catch {
        // ignore
      }
    })()
  }, [])

  const currentPathname = typeof window !== 'undefined' ? window.location.pathname : '/'

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen">
      <SecretarySidebar currentPathname={currentPathname} />

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

      <main className="ml-64 p-margin-desktop pt-[120px]">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-md flex justify-between items-center border-b border-outline-variant">
            <div className="flex items-center gap-md">
              <h4 className="font-headline-md text-headline-md">Patient Database</h4>
              <div className="flex gap-xs">
                <span className="px-sm py-xs bg-surface-container-high rounded-lg text-body-sm text-primary font-bold">
                  All ({patients.length})
                </span>
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
                        <span className="font-title-sm text-title-sm">
                          {p.firstName} {p.lastName}
                        </span>
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

