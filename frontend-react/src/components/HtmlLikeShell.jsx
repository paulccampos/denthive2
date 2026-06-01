import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

function TopIcon({ children, filled }) {
  return (
    <span className="material-symbols-outlined" style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}>
      {children}
    </span>
  )
}

function getInitials(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] || ''
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1] || ''
  return (a + b).toUpperCase()
}

export default function HtmlLikeShell({ variant, userName, pageTitle, children }) {
  const navigate = useNavigate()

  const navItems = {
    admin: [
      { to: '/patientdashboard', icon: 'dashboard', label: 'Dashboard' },
      { to: '/queuemanagement', icon: 'group', label: 'Queue' },
      { to: '/registry', icon: 'folder_shared', label: 'Patients' },
      { to: '/bookingpage', icon: 'calendar_month', label: 'Schedule' },
      { to: '/doctorbookings', icon: 'event_note', label: 'Bookings' },
    ],
    secretary: [
      { to: '/secretarybookings', icon: 'folder_shared', label: 'Bookings' },
      { to: '/queuemanagement', icon: 'group', label: 'Queue' },
      { to: '/registry', icon: 'folder_shared', label: 'Patients' },
      { to: '/bookingpage', icon: 'calendar_month', label: 'Schedule' },
    ],
    patient: [
      { to: '/bookingpage', icon: 'calendar_month', label: 'Book Appointment' },
      { to: '/patientdashboard', icon: 'dashboard', label: 'My Records' },
    ],
  }

  const defaultTitles = {
    admin: 'Admin Dashboard',
    secretary: 'Secretary Portal',
    patient: 'Patient Portal',
  }

  const items = navItems[variant] || []
  const title = pageTitle || defaultTitles[variant] || 'DentHive'

  function logout() {
    localStorage.removeItem('denthiveToken')
    navigate('/login')
  }

  return (
    <div className="app-page min-h-screen overflow-x-hidden">
      <aside className="app-sidebar hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-50">
        <div className="p-lg flex items-center gap-sm">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
            <TopIcon filled>dentistry</TopIcon>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary leading-tight">DentHive</h1>
            <p className="font-label-caps text-label-caps text-outline">Dental Management</p>
          </div>
        </div>

        <nav className="flex-1 mt-md space-y-xs px-sm overflow-y-auto custom-scrollbar">
          {items.map((it) => (
            <NavLink
              key={it.to + it.label}
              to={it.to}
              end={it.to === '/patientdashboard'}
              className={({ isActive }) =>
                `px-md py-sm flex items-center gap-sm rounded-lg transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold border-r-4 border-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`
              }
            >
              <TopIcon>{it.icon}</TopIcon>
              <span className="font-label-caps text-label-caps">{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-md border-t border-outline-variant space-y-sm">
          {variant !== 'patient' ? (
            <button
              className="w-full bg-secondary text-on-secondary py-sm rounded-lg font-title-sm flex items-center justify-center gap-sm hover:opacity-90 transition-all active:scale-95"
              type="button"
            >
              <TopIcon>add</TopIcon>
              Add New Patient
            </button>
          ) : null}
          <button
            className="w-full border border-outline-variant text-on-surface-variant py-sm rounded-lg font-title-sm flex items-center justify-center gap-sm hover:bg-surface-container-high transition-all"
            type="button"
            onClick={logout}
          >
            <TopIcon>logout</TopIcon>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area — offset for sidebar */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <header className="app-header flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-sm sticky top-0 z-40">
          <h2 className="font-headline-md text-headline-md font-bold text-primary">{title}</h2>
          <div className="flex items-center gap-sm md:gap-md">
            <button className="material-symbols-outlined hover:bg-surface-container-high p-sm rounded-full transition-colors text-on-surface-variant" type="button" aria-label="Notifications">
              notifications
            </button>
            <button className="material-symbols-outlined hover:bg-surface-container-high p-sm rounded-full transition-colors text-on-surface-variant hidden sm:block" type="button" aria-label="Help">
              help_outline
            </button>
            <div
              className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container border border-outline-variant flex items-center justify-center font-bold text-xs"
              aria-label="User initials"
              title={userName || 'User'}
            >
              {getInitials(userName)}
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
