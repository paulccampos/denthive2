import React from 'react'
import HtmlLikeShell from './HtmlLikeShell'

/**
 * Keeps the patient portal frame (sidebar + topbar) mounted while swapping content.
 */
export default function PatientPortalShell({ children }) {
  return (
    <HtmlLikeShell variant="patient">
      {children}
    </HtmlLikeShell>
  )
}

