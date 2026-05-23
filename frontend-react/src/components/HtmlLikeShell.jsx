import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

function TopIcon({ children }) {
  return <span className="material-symbols-outlined">{children}</span>
}

export default function HtmlLikeShell({ variant, userName, children }) {
  const location = useLocation()

  const navItems = {
    admin: [
      { to: '/patientdashboard', icon: 'dashboard', label: 'Dashboard', exact: false },
      { to: '/queuemanagement', icon: 'group', label: 'Queue', exact: false },
      { to: '/registry', icon: 'folder_shared', label: 'Patients', exact: false },
      { to: '/bookingpage', icon: 'calendar_month', label: 'Schedule', exact: false },
      { to: '/queue', icon: 'inventory_2', label: 'Inventory', exact: false },
    ],
    secretary: [
      { to: '/queuemanagement', icon: 'group', label: 'Queue', exact: true },
      { to: '/registry', icon: 'folder_shared', label: 'Patients', exact: false },
      { to: '/bookingpage', icon: 'calendar_month', label: 'Schedule', exact: false },
      { to: '/patientdashboard', icon: 'dashboard', label: 'Dashboard', exact: false },
    ],
    patient: [
      { to: '/bookingpage', icon: 'calendar_month', label: 'Book Appointment', exact: true },
      { to: '/patientdashboard', icon: 'dashboard', label: 'Dashboard', exact: false },
      { to: '/registry', icon: 'folder_shared', label: 'Records', exact: false },
    ],
  }

  const items = navItems[variant] || []

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-50">
        <div className="p-lg flex items-center gap-sm">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <TopIcon>dentistry</TopIcon>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">DentHive</h1>
            <p className="font-label-caps text-label-caps text-outline">Dental Management</p>
          </div>
        </div>
        <nav className="flex-1 mt-md space-y-xs px-sm overflow-y-auto no-scrollbar">
          {items.map((it) => (
            <NavLink
              key={it.to + it.label}
              to={it.to}
              className={({ isActive }) =>
                'px-md py-sm flex items-center gap-sm text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200 ease-in-out' +
                (isActive
                  ? ' bg-primary-container text-on-primary-container font-bold border-r-4 border-primary'
                  : '')
              }
            >
              <span className="material-symbols-outlined">{it.icon}</span>
              <span className="font-label-caps text-label-caps">{it.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-md border-t border-outline-variant">
          <button className="w-full bg-secondary text-on-secondary py-sm rounded-lg font-title-sm flex items-center justify-center gap-sm hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined">add</span>
            Add New Patient
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <h2 className="font-headline-md text-headline-md font-bold text-primary">
            {variant === 'patient'
              ? 'Patient Portal'
              : variant === 'secretary'
                ? 'Queue Management'
                : 'User Management'}
          </h2>
        </div>
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined hover:bg-surface-container-high p-sm rounded-full transition-colors">
            notifications
          </span>
          <span className="material-symbols-outlined hover:bg-surface-container-high p-sm rounded-full transition-colors">
            help_outline
          </span>
          <span className="material-symbols-outlined hover:bg-surface-container-high p-sm rounded-full transition-colors">
            schedule
          </span>
          <img
            alt="User Profile"
            className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_srj4M-Dez6F1shmpEB2L08Ni-fpKQiG4umnCzDfsDzBw7JApeHB9E6kdHP7H7IedQZjWxsEFv9fBnZBt8tiYde2V490-i5zEECtlAOCuz_OqSSxQ4Zm2wxvCkIwf00bX_aEcVE6saTsvLaDYPLpblgOlTIYL22S0SSgBF-v_w7spnQqW8uQ0ChnQW1R-LWP2Dx7ThxZGQXey_k08agDuAKd3C-rXZTUr1A6ORsnQybTzQRHgmgbeOhdgTAhO4fvAKYP5GcAaBPms"
          />
        </div>
      </header>

      {/* Content */}
      <main className="md:ml-64 flex-1 pt-4">{children}</main>
    </div>
  )
}

