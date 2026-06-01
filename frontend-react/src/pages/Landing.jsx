import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const SERVICES = [
  {
    icon: 'dentistry',
    title: 'General Dentistry',
    description: 'Routine checkups, hygiene treatments, and preventive care designed to maintain long-term oral health.',
    items: ['Professional Cleaning', 'Cavity Treatment', 'X-Ray Diagnostics'],
  },
  {
    icon: 'straighten',
    title: 'Orthodontics',
    description: 'Specialized alignment treatments including traditional braces and modern clear aligner solutions.',
    items: ['Invisible Aligners', 'Traditional Braces', 'Retainer Services'],
  },
  {
    icon: 'biotech',
    title: 'Dental Implants',
    description: 'Restore your smile with durable, natural-looking implants using precision 3D mapping technology.',
    items: ['Single Tooth Implants', 'Full Arch Restoration', 'Bone Grafting'],
  },
]

const DOCTORS = [
  {
    name: 'Dr. Aris Thorne',
    role: 'CHIEF SURGEON',
    bio: 'Specialist in advanced dental implants and maxillofacial reconstruction.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMdNuVLwAphwrZQlpjrDiptuVV2HsxjgYyyeqy805RJnle10UsvLKVYJqK2WHwEwHde43m5ZKpWNaQ7PnBamNbrLW_b4kZDrDNxTSfG22pgQ-Mlsc6zv4gQLwTtaUIuUcBcWK0X_MW9mVhD1w8mrForBkNCMnjEmO8c0PQEhevkX4aV0ZtniDzPf_djZIufer3uhunF9jVNvPwdPjZR5HDYyc6q-uY0utCwHwWRjCYOv_DJkei5xcy6L_jl5Z11808QSVj0IpJoosu',
  },
  {
    name: 'Dr. Elena Vance',
    role: 'ORTHODONTIST',
    bio: 'Expert in invisible aligner technology and adolescent corrective therapy.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYOvyW2hBor7g_HQv7b6Z6oO6Ct7BNrfytA9P6qzFP7sfCsx-wWrrFeATIjX_kMnYKxrT4K8v1fSBP2vWPG5Y8AvuM43WDy9CYeQSIxIwbKdQCvS3Lp-3JuNFIZbO4CQYqHhrXeK5ErpOZvM0YqOPKR03cxm6I-s8GgG5H4pKN_hF94EY-3arN8ARPCDWoD7sGP6L3ya7eC6OhJRHlXw6kWdrAVPbvToTWEEE_0fXk6wLOhfi8Zaqw1geG20qsIX85V2ErF10P5M8y',
  },
  {
    name: 'Dr. Marcus Chen',
    role: 'GENERAL DENTIST',
    bio: 'Focuses on preventative care and state-of-the-art diagnostic screening.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmrUFIcLbSJTPTw96z_OhAlnCG22QtyvyfIcEsl9UWBFqmcgimsh9RVuH_x3qRLP3i5wMnXnYF0sTS-I7JrAdIyHZDqDYy0nBWdIKvCfUW4RENRCVhQNB5XmoK5OEWj8DadSkBtTlpEbOscXhpunb43VzOBAcQbx39eOTZs-M1Utm9nZFlh9IVLde676JGpQF9_o2yIU1_T1_aCN1FUH9vMl2SigwywECbu3lPjURQQpTL10aZJ7FrjjxTAefkcz4JlKMmdPWryN9a',
  },
  {
    name: 'Dr. Sarah Miller',
    role: 'HYGIENE SPECIALIST',
    bio: 'Committed to patient education and advanced hygiene treatments.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpQdwpMKjfBu3EwJ16hPFyTanbC6zu-HMRrhM6EJmnQFo2pCnZgvs0HdNu3rxGdrIxyHYGeUFJShXpnmIumhUvksO2BmNZC5WcCCzbQqi87K_Ntn-fqLAsM9czgkx9-HuLaP-LV5In3nXmQsLyM2QhubYaVOU4YXUIYwSf5836sfKZnGeXNsX1TXP_nuGrFJEmi7kdFmKzr8iABvsp5w0cxCKexo39fNwDvjUQKgujeHG99OKooM7IPc_PDyV9i93JC1-kuJ_raku4',
  },
]

function ServiceCard({ icon, title, description, items }) {
  return (
    <div className="p-lg bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary hover:shadow-card-hover transition-all duration-300 group">
      <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center mb-lg shadow-sm">
        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">{title}</h3>
      <p className="text-on-surface-variant text-body-md mb-lg">{description}</p>
      <ul className="space-y-sm mb-lg">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            {item}
          </li>
        ))}
      </ul>
      <span className="text-primary font-title-sm text-title-sm inline-flex items-center gap-xs group-hover:gap-sm transition-all cursor-pointer">
        Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </span>
    </div>
  )
}

function DoctorCard({ name, role, bio, img }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden group hover:shadow-card-hover transition-all duration-300">
      <div className="h-64 overflow-hidden">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={name} src={img} />
      </div>
      <div className="p-md">
        <h4 className="font-title-sm text-title-sm text-on-surface">{name}</h4>
        <p className="text-secondary font-label-caps text-label-caps mb-sm">{role}</p>
        <p className="text-on-surface-variant text-body-sm">{bio}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed')
        })
      },
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app-page font-body-md overflow-x-hidden">
      <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-sm sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-sm md:gap-md">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>hive</span>
          <span className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">DentHive</span>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <a className="text-primary font-bold font-label-caps text-label-caps tracking-widest" href="#">HOME</a>
          <a className="text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-caps text-label-caps px-sm py-xs rounded" href="#services">SERVICES</a>
          <a className="text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-caps text-label-caps px-sm py-xs rounded" href="#doctors">DOCTORS</a>
          <a className="text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-caps text-label-caps px-sm py-xs rounded" href="#location">LOCATION</a>
        </nav>
        <div className="flex items-center gap-sm md:gap-md">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-sm rounded-full transition-all hidden sm:block" type="button">notifications</button>
          <Link
            to="/login"
            className="bg-primary text-on-primary px-md md:px-lg py-sm rounded-lg font-title-sm text-title-sm hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center"
          >
            Book Appointment
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="reveal-section relative w-full min-h-[600px] md:min-h-[819px] flex items-center px-margin-mobile md:px-margin-desktop bg-surface-bright overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-xl items-center w-full max-w-7xl mx-auto relative z-10">
            <div className="md:col-span-6">
              <div className="inline-flex items-center gap-sm bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full mb-md">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="font-label-caps text-label-caps">CLINICAL EXCELLENCE SINCE 1998</span>
              </div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg lg:text-6xl text-on-surface leading-tight mb-md">
                Precision Care for Your <span className="text-primary">Perfect Smile</span>
              </h1>
              <p className="font-body-md text-on-surface-variant max-w-md mb-xl">
                Experience advanced dentistry where clinical expertise meets modern technology. DentHive provides a structured, stress-free environment for all your dental needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-md">
                <Link
                  to="/signup"
                  className="bg-primary text-on-primary px-xl py-md rounded-lg font-title-sm text-title-sm flex items-center justify-center gap-sm shadow-lg shadow-primary/10 hover:shadow-xl hover:opacity-95 transition-all"
                >
                  Book Appointment
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a className="border border-primary text-primary px-xl py-md rounded-lg font-title-sm text-title-sm hover:bg-primary-container/10 transition-all text-center" href="#services">
                  View Services
                </a>
              </div>
              <div className="mt-xl flex items-center gap-lg">
                <div className="flex -space-x-3">
                  <img className="w-12 h-12 rounded-full border-4 border-white object-cover" alt="Dentist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIsFYIibC9NGVz-JbXOMEVw1L70WSffgIUKTrmq0nzTfPm27xCG2jlcZMkxyDMh1Wfuj5hI4bZvsjv0wqhBrLc1VWHBL6ocnvbBhd_u0cF-CUkZw6w2YnivoVoh7dQ2LgdnruOgohKhrDdSqa_qDtk6yzYy4qwyIOtpAAF-BIJzHif_31Qu9sW12vt7QroXHJs979bbCdZ_nbeDF4mdz5CYTZVUvaS1pUTVdk76jOg0BNc_HEv08GBlmW5QgxvBecRFJhesYmOEKLp" />
                  <img className="w-12 h-12 rounded-full border-4 border-white object-cover" alt="Orthodontist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhbDQa4aOJf7DkovgJmLicO3OL4drW3pDHb1Klv4_6TB7ynPPpGUJJ4LwcXpf8xL89JHFNNGxmoFFpMOzTfEKm7DGoFcylkf8DN0fWHW4cZhBaG6dGn-vojm69Dnnf8cl6LvKk7l25caRiqmL-aQwATPs4bcYKJ-MXcJZJ6oG-1HgZMd--u7-VP8U1BmND-if4LHYFu5JDKxC039SCGnGucJsPtVgZKaH-FLNWOhhyKcJ44Ne0336KLVqV8ADZsGdbGbc8kzKFcKeK" />
                  <div className="w-12 h-12 rounded-full border-4 border-white bg-surface-container-highest flex items-center justify-center font-label-caps text-label-caps text-on-surface-variant font-bold">+2k</div>
                </div>
                <p className="text-on-surface-variant text-body-sm font-body-sm">
                  Trusted by <span className="font-bold text-on-surface">2,400+</span> regular patients
                </p>
              </div>
            </div>

            <div className="md:col-span-6 relative h-[400px] md:h-[500px] w-full hidden md:block">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-md">
                <div className="col-span-1 row-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt="Modern dental clinic"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnUa6_Rd02CgAwM4qcpliKMuys0-wYdMxmj_SUnlM0FmEzrZ2pNeiG21vDze1SCD6sRlNGl6d4E-BjV2-1OSJzd6HdvG_cghJEZX7e4uBW9e3F7YbNULXx0bRq_dA1lm_Nn3gDid386GlHSIr6fw3xgyPXbwSBwo7JZ2iD0JDUkb55cyhIoBek2IVEnq_e81EtiYGCCMYsyf4xhHM60_SwT_jRmaGv5DnDtYGNehWM-zhS6YzSyKllmKMqyHaUvnFTMxqnfWKEwubl"
                  />
                </div>
                <div className="col-span-1 row-span-1 bg-primary-container text-on-primary-container p-lg rounded-xl flex flex-col justify-end gap-sm">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                  <h3 className="font-headline-md text-headline-md leading-tight">State of the Art Equipment</h3>
                </div>
                <div className="col-span-1 row-span-1 bg-secondary p-lg rounded-xl flex flex-col justify-end gap-sm">
                  <div className="flex items-center gap-xs">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-on-secondary font-body-sm italic">"The most professional care I've ever received."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="reveal-section py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest" id="services">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-xl">
              <span className="text-primary font-label-caps text-label-caps tracking-widest">OUR EXPERTISE</span>
              <h2 className="font-display-lg text-display-lg text-on-surface mt-sm">Comprehensive Dental Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {SERVICES.map((s) => (
                <ServiceCard key={s.title} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* Doctors */}
        <section className="reveal-section py-xl px-margin-mobile md:px-margin-desktop bg-surface-bright" id="doctors">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-xl gap-lg">
              <div className="max-w-xl">
                <span className="text-primary font-label-caps text-label-caps tracking-widest">OUR MEDICAL TEAM</span>
                <h2 className="font-display-lg text-display-lg text-on-surface mt-sm">Meet Our Senior Practitioners</h2>
              </div>
              <button className="border border-outline text-on-surface px-lg py-sm rounded-lg font-title-sm text-title-sm hover:bg-surface-container-highest transition-all" type="button">
                View All Staff
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-lg">
              {DOCTORS.map((d) => (
                <DoctorCard key={d.name} {...d} />
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="reveal-section py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest" id="location">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-xl items-stretch">
            <div className="flex flex-col justify-center">
              <span className="text-primary font-label-caps text-label-caps tracking-widest">VISIT US</span>
              <h2 className="font-display-lg text-display-lg text-on-surface mt-sm mb-lg">Clinic Location & Hours</h2>
              <div className="space-y-lg">
                <div className="flex gap-md">
                  <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-title-sm text-title-sm text-on-surface">Address</h4>
                    <p className="text-on-surface-variant text-body-md">1200 Precision Way, Medical Plaza<br />Suite 405, Downtown Metro 44012</p>
                  </div>
                </div>
                <div className="flex gap-md">
                  <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-title-sm text-title-sm text-on-surface">Operating Hours</h4>
                    <div className="grid grid-cols-2 mt-sm gap-y-xs">
                      <span className="text-body-sm text-on-surface-variant">Mon - Fri:</span>
                      <span className="text-body-sm font-bold text-on-surface">08:00 AM - 07:00 PM</span>
                      <span className="text-body-sm text-on-surface-variant">Saturday:</span>
                      <span className="text-body-sm font-bold text-on-surface">09:00 AM - 03:00 PM</span>
                      <span className="text-body-sm text-on-surface-variant">Sunday:</span>
                      <span className="text-body-sm font-bold text-error">Closed</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-md">
                  <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">call</span>
                  </div>
                  <div>
                    <h4 className="font-title-sm text-title-sm text-on-surface">Emergency Contact</h4>
                    <p className="text-primary font-headline-md text-headline-md font-bold">+1 (555) DENT-HIV</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-outline-variant h-[350px] md:h-[450px] relative shadow-lg">
              <img
                className="w-full h-full object-cover"
                alt="Clinic location map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcTPJRZNLzwuUaWNihkwpHLiOzlGxvAibnY7kQZ5nv0zJcO7Aek-1nbhJ6eEpZvnTXv0KvGZZMQO_I-U1GQ5Qv3TUWcttrQF4igdLbdmfNLJb37Yv6f5e6Ux4DYTlFpOD7vwuy6kiz-Zm4R31JdXaSFonIAA7KHzTWt_WV_nUi2vV6JVLCRKvmAG-vVqVoPBfbAMeQTJLBFIRl6WtSKOO92Hud3afWv8oZkJLYa-b1Lxfwim1hu752ab2Wi8m_EjidgnrI9Mv3xePH"
              />
              <div className="absolute bottom-md left-md right-md bg-surface-container-lowest p-md rounded-xl shadow-xl flex items-center justify-between border border-outline-variant">
                <div>
                  <p className="font-label-caps text-label-caps text-secondary">CLINIC STATUS</p>
                  <p className="font-title-sm text-title-sm text-on-surface">Currently Open</p>
                </div>
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-title-sm text-title-sm hover:opacity-90 transition-all" type="button">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="reveal-section py-xl px-margin-mobile md:px-margin-desktop bg-primary text-on-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display-lg text-display-lg mb-md">Ready for Your Next Visit?</h2>
            <p className="font-body-md opacity-90 mb-xl">Book online in minutes. Our team is ready to provide the care you deserve.</p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-sm bg-surface-container-lowest text-primary px-xl py-md rounded-lg font-title-sm text-title-sm hover:shadow-lg transition-all"
            >
              Schedule Now
              <span className="material-symbols-outlined">calendar_month</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-inverse-surface text-inverse-on-surface py-xl px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-xl">
            <div className="md:col-span-1">
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-primary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>hive</span>
                <span className="font-headline-md text-headline-md font-extrabold text-primary-fixed tracking-tight">DentHive</span>
              </div>
              <p className="text-on-tertiary-fixed-variant text-body-sm">Providing clinical excellence and hygienic dental management since 1998.</p>
            </div>
            <div>
              <h4 className="font-title-sm text-title-sm mb-lg">Services</h4>
              <ul className="space-y-sm">
                {['General Hygiene', 'Cosmetic Dentistry', 'Oral Surgery', 'Orthodontics'].map((item) => (
                  <li key={item}><a className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors text-body-sm" href="#services">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-title-sm text-title-sm mb-lg">Quick Links</h4>
              <ul className="space-y-sm">
                <li><Link className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors text-body-sm" to="/login">Patient Portal</Link></li>
                <li><a className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors text-body-sm" href="#">Privacy Policy</a></li>
                <li><a className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors text-body-sm" href="#location">Emergency Info</a></li>
                <li><a className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors text-body-sm" href="#">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-title-sm text-title-sm mb-lg">Newsletter</h4>
              <p className="text-on-tertiary-fixed-variant text-body-sm mb-md">Stay updated on clinical hours and oral health tips.</p>
              <div className="flex gap-xs">
                <input className="bg-inverse-on-surface/10 border-none rounded-lg text-inverse-on-surface font-body-sm placeholder:text-inverse-on-surface/40 focus:ring-2 focus:ring-primary-fixed flex-1 px-md py-sm" placeholder="Email address" type="email" />
                <button className="bg-primary-fixed text-on-primary-fixed p-sm rounded-lg flex items-center justify-center hover:opacity-90 transition-all" type="button">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
          <div className="pt-lg border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-md">
            <p className="text-on-tertiary-fixed-variant text-body-sm">© 2024 DentHive Clinical Systems. All rights reserved.</p>
            <div className="flex gap-lg">
              <a className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
              <a className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors" href="#"><span className="material-symbols-outlined">mail</span></a>
              <a className="text-on-tertiary-fixed-variant hover:text-inverse-on-surface transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
