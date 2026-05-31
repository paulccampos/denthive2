import React from 'react'
import HtmlLikeShell from './HtmlLikeShell'

/**
 * Keeps the patient portal frame (sidebar + topbar) mounted while swapping content.
 */
export default function PatientPortalShell({ children, pageTitle, userName }) {
  return (
    <HtmlLikeShell variant="patient" pageTitle={pageTitle} userName={userName}>
      {children}
    </HtmlLikeShell>
  )
}
