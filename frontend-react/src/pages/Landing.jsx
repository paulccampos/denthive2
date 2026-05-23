import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>
      <header className="flex justify-between items-center w-full px-margin-desktop py-sm sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary text-3xl">hive</span>
          <span className="font-headline-md font-extrabold text-primary tracking-tight">DentHive</span>
        </div>
        <div className="hidden md:flex items-center gap-lg">
          <a className="text-primary font-bold font-label-caps text-label-caps tracking-widest" href="#">
            HOME
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-caps text-label-caps px-sm py-xs rounded" href="#services">
            SERVICES
          </a>
        </div>
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined">notifications</span>
          <span className="material-symbols-outlined">help_outline</span>
          <Link
            to="/login"
            className="bg-primary text-on-primary px-lg py-sm rounded-lg font-title-sm text-title-sm hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center"
          >
            Book Appointment
          </Link>
        </div>
      </header>

      <main>
        <section className="relative w-full min-h-[819px] flex items-center px-margin-desktop bg-surface-bright overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-xl items-center w-full max-w-7xl mx-auto">
            <div className="md:col-span-6 z-10">
              <div className="inline-flex items-center gap-sm bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full mb-md">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="font-label-caps text-label-caps">CLINICAL EXCELLENCE SINCE 1998</span>
              </div>
              <h1 className="font-display-lg text-display-lg md:text-6xl text-on-surface leading-tight mb-md">
                Precision Care for Your <span className="text-primary">Perfect Smile</span>
              </h1>
              <p className="font-body-md text-on-surface-variant max-w-md mb-xl">
                Experience advanced dentistry where clinical expertise meets modern technology. DentHive provides a structured, stress-free environment for all your dental needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-md">
                <Link
                  to="/signup"
                  className="bg-primary text-on-primary px-xl py-md rounded-lg font-title-sm text-title-sm flex items-center justify-center gap-sm shadow-lg shadow-primary/10 hover:shadow-xl transition-all"
                >
                  Book Appointment
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a className="border border-primary text-primary px-xl py-md rounded-lg font-title-sm text-title-sm hover:bg-primary-container/10 transition-all">View Case Studies</a>
              </div>
            </div>

            <div className="md:col-span-6 relative h-[500px] w-full hidden md:block">
              <div className="absolute inset-0 bg-surface-container-highest rounded-xl border border-outline-variant" />
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-md">
                <div className="col-span-1 row-span-2 bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm group" />
                <div className="col-span-1 row-span-1 bg-primary-container text-on-primary-container p-lg rounded-xl flex flex-col justify-end gap-sm" />
                <div className="col-span-1 row-span-1 bg-secondary p-lg rounded-xl flex flex-col justify-end gap-sm" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-inverse-surface text-inverse-on-surface py-xl px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <div className="pt-lg border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-md">
            <p className="text-on-tertiary-fixed-variant text-body-sm">© 2024 DentHive Clinical Systems. All rights reserved.</p>
            <div className="flex gap-lg">
              <a className="text-on-tertiary-fixed-variant hover:text-white transition-colors" href="#">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="text-on-tertiary-fixed-variant hover:text-white transition-colors" href="#">
                <span className="material-symbols-outlined">mail</span>
              </a>
              <a className="text-on-tertiary-fixed-variant hover:text-white transition-colors" href="#">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

