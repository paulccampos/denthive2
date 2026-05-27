import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function Signup() {
  const [firstName, setFirstName] = useState('')

  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemoHint, setShowDemoHint] = useState(false)

  const navigate = useNavigate()

  const demoBlock = useMemo(
    () => (
      <div className="mt-4 bg-white/70 backdrop-blur-md border border-outline-variant rounded-xl p-md text-left">
        <p className="font-label-caps text-label-caps text-outline mb-xs">Demo note</p>
        <p className="text-[13px] text-on-surface-variant">
          This is the HTML-like Signup layout. Use your own info (or create a new patient).
        </p>
      </div>
    ),
    []
  )

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await apiFetch('/auth/register', {
        method: 'POST',
        body: { firstName, lastName, email, phone, username, password },
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Signup failed')

      localStorage.setItem('denthiveToken', data.token)
      // Notify other tabs (like AdminPage) to refresh the users list from MongoDB.
      localStorage.setItem('denthiveUsersRefreshAt', String(Date.now()))
      navigate('/bookingpage')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md overflow-x-hidden">
      <main className="flex-grow flex flex-col md:flex-row">
        <section className="hidden md:flex md:w-1/2 bg-surface-container-low p-xl flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="z-10 max-w-md">
            <div className="flex items-center justify-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary text-4xl">dentistry</span>
              <h1 className="font-headline-md text-display-lg text-primary tracking-tight">DentHive</h1>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Precision Care Starts Here.</h2>
            <p className="font-body-md text-on-surface-variant mb-xl">
              Join thousands of patients who trust DentHive for their clinical records, interactive dental mapping, and seamless appointment management.
            </p>
            <div className="grid grid-cols-2 gap-md">
              <div className="flat-card p-md rounded-lg text-left">
                <span className="material-symbols-outlined text-secondary mb-xs">verified_user</span>
                <p className="font-label-caps text-label-caps text-secondary mb-xs">SECURE</p>
                <p className="font-body-sm text-body-sm">HIPAA-compliant data encryption.</p>
              </div>
              <div className="flat-card p-md rounded-lg text-left">
                <span className="material-symbols-outlined text-primary mb-xs">database</span>
                <p className="font-label-caps text-label-caps text-primary mb-xs">PRECISION</p>
                <p className="font-body-sm text-body-sm">Real-time dental history access.</p>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <img
              className="w-full h-full object-cover"
              alt="Clinical background"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt_0aDvnTysXIpPLJNNMnm8AsJZXypuJV7U1AjznuazJr5mpUt0GPdiiAr8cPDES0z0LQp1iGWIp5xlaGiL36K_KQmaltWMTUxIJ7bbAZ_IjshmuHac5paDj0osDZi-OFbGUgR0yDDWxkiLKd7tMhaou4egi2_DDQMdeN7bqNp-tvQ20SnNjHmzOehSEOcqkC2H8v7p1KzTmpNtavAqZxLkXiiDw2FPrU6qL2iSmHgiWasm7A8iVkQiYKCVhaQQbusRFhn9eEJseHq"
            />
          </div>
        </section>

        <section className="w-full md:w-1/2 flex flex-col justify-center px-margin-mobile md:px-xl py-xl bg-surface">
          <div className="max-w-md w-full mx-auto">
            <div className="md:hidden flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary text-3xl">dentistry</span>
              <h1 className="font-headline-md text-headline-md text-primary font-bold">DentHive</h1>
            </div>
            <div className="mb-lg">
              <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Create your account</h2>
              <p className="font-body-md text-on-surface-variant mt-xs">Sign up to begin your personalized dental journey.</p>
            </div>

            <form className="space-y-md" id="signupForm" onSubmit={onSubmit}>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">FULL NAME</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">person</span>
                  <input
                    className="w-full pl-xl pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md input-focus-ring transition-all"
                    placeholder="Dr. Jane Smith"
                    type="text"
                    value={`${firstName} ${lastName}`.trim()}
                    onChange={(e) => {
                      const parts = e.target.value.split(/\s+/).filter(Boolean)
                      const first = parts[0] || ''
                      const last = parts.length > 1 ? parts.slice(1).join(' ') : first
                      setFirstName(first)
                      setLastName(last)
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input
                    className="w-full pl-xl pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md input-focus-ring transition-all"
                    placeholder="jane@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">PHONE NUMBER</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">call</span>
                  <input
                    className="w-full pl-xl pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md input-focus-ring transition-all"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">PASSWORD</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input
                    className="w-full pl-xl pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md input-focus-ring transition-all"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    onClick={() => setShowDemoHint((s) => !s)}
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Must be at least 8 characters long.</p>
              </div>

              <div className="flex items-start gap-sm py-sm">
                <div className="flex items-center h-5">
                  <input className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary-container" type="checkbox" required />
                </div>
                <label className="font-body-sm text-body-sm text-on-surface-variant">
                  I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms of Service</a> and{' '}
                  <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a>.
                </label>
              </div>

              <button
                className="w-full bg-primary text-on-primary font-headline-md text-title-sm py-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-sm"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="mt-xl text-center space-y-md">
              <p className="font-body-md text-on-surface-variant">
                Already have an account?{' '}
                <a className="text-primary font-bold hover:underline" href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
                  Log in
                </a>
              </p>
              <div className="flex items-center justify-center gap-md pt-md border-t border-outline-variant">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-secondary text-sm">health_and_safety</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">CLINICAL PRECISION</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-secondary text-sm">lock</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">ENCRYPTED</span>
                </div>
              </div>
            </div>

            {showDemoHint ? demoBlock : null}
          </div>
        </section>
      </main>
    </div>
  )
}

