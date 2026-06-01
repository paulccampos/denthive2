import React from 'react'
import { logout } from '../lib/api'

const SECRETARY_NAV = [
  // Requested order: Queue, History, Patients, Payments
  {
    label: 'Queue',
    icon: 'group',
    href: '/queuemanagement',
  },
  {
    label: 'History',
    icon: 'history',
    href: '/history',
  },
  {
    label: 'Patients',
    icon: 'folder_shared',
    href: '/registry',
  },
  {
    label: 'Payments',
    icon: 'paid',
    href: '/secretaryfinished',
  },
]




function isActive(href, currentPathname) {
  return href === currentPathname
}

export default function SecretarySidebar({ currentPathname }) {
  return (
    <aside className="app-sidebar flex flex-col h-screen w-64 fixed left-0 top-0 z-50">
      <div className="p-lg">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary">dentistry</span>
        </div>
        <h1 className="mt-sm font-headline-md text-headline-md font-bold text-primary">DentaCare</h1>
        <p className="font-label-caps text-label-caps text-outline">Secretary Portal</p>

      </div>

      <nav className="flex-1 mt-md space-y-xs px-sm overflow-y-auto no-scrollbar">
        {SECRETARY_NAV.map((item) => {
          const active = isActive(item.href, currentPathname)

          return (
            <a
              key={item.href}
              className={
                active
                  ? 'bg-primary-container text-on-primary-container font-bold px-md py-sm flex items-center gap-sm rounded-lg border-r-4 border-primary transition-all'
                  : 'px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all'
              }
              href={item.href}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}>
                {item.icon}
              </span>
              <span className="font-label-caps text-label-caps">{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="p-md border-t border-outline-variant mt-auto">
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
  )
}

