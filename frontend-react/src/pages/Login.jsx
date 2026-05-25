import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import CreateStaffFromLogin from './CreateStaffFromLogin'

export default function Login() {

  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [showDemo, setShowDemo] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(e) {

    e.preventDefault()
    setLoading(true)
    try {
      const resp = await apiFetch('/auth/login', {
        method: 'POST',
        body: { identity, password },
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('denthiveToken', data.token)

      if (data.role === 'patient') navigate('/bookingpage')
      else if (data.role === 'secretary') navigate('/queuemanagement')
      else if (data.role === 'admin') navigate('/adminpage')
      else navigate('/patientdashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const demoBlock = useMemo(
    () => (
      <div className="mt-4 bg-white/70 backdrop-blur-md border border-outline-variant rounded-xl p-md text-left">
        <p className="font-label-caps text-label-caps text-outline mb-xs">Demo Accounts</p>
        <p className="text-[13px] text-on-surface-variant mb-md">
          Password for ALL accounts: <span className="font-mono font-bold">patient1</span>
        </p>
        <div className="space-y-xs text-[13px]">
          <div>
            <span className="font-bold">Admin</span> — username: <span className="font-mono">admin</span> (admin@denthive.local)
          </div>
          <div>
            <span className="font-bold">Secretary</span> — username: <span className="font-mono">secretary</span> (secretary@denthive.local)
          </div>
          <div>
            <span className="font-bold">Doctor</span> — username: <span className="font-mono">doctor</span> (doctor@denthive.local)
          </div>
          <div>
            <span className="font-bold">Patient</span> — username: <span className="font-mono">patient</span> (patient@denthive.local)
          </div>
        </div>
      </div>
    ),
    []
  )

  return (
    <div className="bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-hidden min-h-screen">
      <main className="flex h-screen w-full">
        <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center px-margin-mobile md:px-xl relative z-10 bg-surface">
          <div className="w-full max-w-[400px]">
            <header className="mb-lg">
              <div className="flex items-center gap-sm mb-md">
                <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    dentistry
                  </span>
                </div>
                <h1 className="font-headline-md text-headline-md text-primary tracking-tight">DentHive</h1>
              </div>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-xs">Welcome back</h2>
              <p className="text-on-surface-variant font-body-md">Precision management for the modern practice.</p>
            </header>

            <form className="space-y-md" id="loginForm" onSubmit={onSubmit}>

              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-outline block" htmlFor="identity">
                  USERNAME OR EMAIL
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                  <input
                    className="w-full pl-[48px] pr-md py-md bg-white border border-outline-variant rounded-lg font-body-md transition-all focus:border-primary"
                    id="identity"
                    name="identity"
                    placeholder="dr.smith@denthive.com"
                    type="text"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-label-caps text-outline block" htmlFor="password">
                    PASSWORD
                  </label>
                  <a className="font-label-caps text-label-caps text-primary hover:underline" href="#">
                    FORGOT PASSWORD?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  <input
                    className="w-full pl-[48px] pr-md py-md bg-white border border-outline-variant rounded-lg font-body-md transition-all focus:border-primary"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-sm space-y-md">
                <button className="w-full py-md bg-primary text-on-primary font-title-sm text-title-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm" type="submit" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <div className="flex items-center gap-md py-sm">
                  <div className="h-px w-full bg-outline-variant"></div>
                  <span className="font-label-caps text-label-caps text-outline whitespace-nowrap">OR JOIN US</span>
                  <div className="h-px w-full bg-outline-variant"></div>
                </div>

                <button
                  className="w-full py-md border border-primary text-primary font-title-sm text-title-sm rounded-lg hover:bg-surface-container-high transition-all flex items-center justify-center gap-sm"
                  type="button"
                  onClick={() => navigate('/signup')}
                >
                  Create Patient Account
                </button>

                {/* Removed staff creation-from-login UI */}

              </div>
            </form>

            <footer className="mt-xl">
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center">

                Securely managed by DentHive Systems © 2024.
                <br />
                <button id="privacyPolicyLink" className="text-primary underline" type="button" onClick={() => setShowDemo((s) => !s)}>
                  Privacy Policy
                </button>
                {' '}•{' '}
                <a className="text-primary underline" href="#">
                  Terms of Service
                </a>
              </p>
            </footer>

            {showDemo ? demoBlock : null}
          </div>


        </section>


        <section className="hidden md:block md:w-1/2 lg:w-3/5 bg-surface-container relative overflow-hidden">

          <img
            className="w-full h-full object-cover"
            alt="Dental clinic"
            data-alt="A high-end modern dental clinic treatment room featuring a minimalist aesthetic."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZWVJn0ssW7xEzKaPalNskeYwzXItDL0SmiacTcq3WvbrFLniaF5deW1EHbd9BCHFmfOzC_1bnbMdwNypRLl7qmqvGe-VOCuRQmUqaV4S0tqdSgw7qPUEznv8V8Lei6xAy8Nq-FftvqrPDGbzd32gohL320E8E1Z_0T6kxAi1uwhphf8T25fYcUgrN05hTSuopHZD-vhAlUClMeVxSUChUD1ELChhdlpj4xQ0O03KKMLgdzMM_eI8MZYd1QLJqYrHcMVZcml5Ata8w"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent flex items-end p-xl">
            <div className="bg-white/80 backdrop-blur-md p-lg rounded-xl border border-white/20 max-w-md login-card-shadow">
              <div className="flex gap-xs mb-sm">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="font-title-sm text-title-sm text-on-surface mb-sm italic">
                "The most intuitive patient records system we've ever used. The dental map clarity is unmatched."
              </p>
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold overflow-hidden">
                  <img
                    alt="Dr. Sarah"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9TlSofbkni3FgAx8o5uQfVHfkSxF8BU11Zb_gfE3TUQH2KDSH1XWcDFBEUmFPJSp5IbzX8PDA-Q4w-3Uva2aavpraA6GC7reLLXTVP1QyvDxNNZowcT2IQbyEEolS5yMJTT8QkEYom6qH9G0Yiqh7rnGXzQ3_rdPAA0EKaZ4ME40Hw4olXxLzw_gg8L2W1NQvW7E2CfXya2G95JitXWWrzd0Dp9k6w6U-ee4uKRMWlg6-Drlt7GV9QL-vwlnE23FojqLXtyaxlmwj"
                  />
                </div>
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface">DR. SARAH CHEN</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Chief of Orthodontics</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-margin-desktop right-margin-desktop space-y-md">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="material-symbols-outlined text-white">monitoring</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>
              <span className="material-symbols-outlined text-white">calendar_today</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>
              <span className="material-symbols-outlined text-white">shield_with_heart</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


