"use client"

import { useState, useEffect } from "react"
import { SceneContainer } from "@/components/scene/SceneContainer"
import { motion } from "framer-motion"
import { ArrowRight, Building2, HardHat, ShieldCheck, Activity, MapPin, Phone, Mail, Clock } from "lucide-react"
import Link from "next/link"

const navItems = [
  { name: "Updates", href: "#updates" },
  { name: "Contact", href: "#contact" },
]

export default function Home() {
  const [publicData, setPublicData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
     fetch("/api/public")
       .then(res => res.json())
       .then(data => setPublicData(data))
       .catch(err => console.error("Error fetching public data:", err))
       .finally(() => setLoading(false))
  }, [])
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden selection:bg-orange-500/30">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <SceneContainer />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold tracking-tight">{publicData?.company?.name || "BuildCore"}<span className="text-orange-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {item.name}
              </Link>
            ))}
            <div className="h-4 w-px bg-white/20"></div>
            <Link href="/login" className="text-sm font-medium hover:text-orange-400 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-5 py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
              Client Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-32 px-6 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Next-Gen Construction Management
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Manage <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                {publicData?.company?.name || "Construction"}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed">
              Enterprise-grade workforce, site, and payroll management platform designed specifically for modern construction companies.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login" className="group flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                Access Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-full font-medium backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                Explore Features
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            {/* Glassmorphism abstract cards for visual flair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/20 blur-[120px] rounded-full point-events-none"></div>
            
            <div className="relative z-10 backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-2xl p-6 shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-semibold">Active Project: Skyline Tower</h3>
                  <p className="text-sm text-slate-400">Downtown District</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-slate-400">Overall Progress</span>
                  <span className="text-2xl font-bold text-orange-400">68%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <HardHat className="w-5 h-5 text-slate-400 mb-2" />
                  <div className="text-2xl font-bold">{publicData?.stats?.totalSites || "0"}</div>
                  <div className="text-xs text-slate-400">Total Active Sites</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs text-slate-400">Safety Compliance</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Dynamic Project Updates Timeline */}
      <section id="updates" className="relative z-10 py-24 px-6 bg-slate-900/50 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                 <Activity className="text-orange-500" /> Public Project Pipeline
              </h2>
              <p className="text-slate-400">Live operational updates and project tracking milestones directly from the database.</p>
           </div>
           
           <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              {loading ? (
                 <div className="text-center text-slate-500 animate-pulse">Loading updates...</div>
              ) : publicData?.updates?.length > 0 ? (
                 publicData.updates.map((project: any, index: number) => (
                    <div key={project.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                       <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                          <Clock className="w-4 h-4" />
                       </div>
                       
                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                             <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${project.status === 'ACTIVE' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                               {project.status}
                             </span>
                             <span className="text-slate-500 text-xs font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">{project.name}</h4>
                          <p className="text-sm text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {project.location}</p>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="text-center text-slate-500 bg-slate-900/50 p-8 rounded-2xl border border-white/5">No public projects visible at this time.</div>
              )}
           </div>
        </div>
      </section>

      {/* Dynamic Public Contact Section */}
      <section id="contact" className="relative z-10 py-24 px-6 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
           <div>
              <h2 className="text-3xl font-bold mb-6">Connect with <span className="text-orange-500">{publicData?.company?.name || "Us"}</span></h2>
              <p className="text-slate-400 mb-10 leading-relaxed">
                Whether you're looking to start a new commercial project, request tender documents, or join our growing workforce system—reach out to our main office today.
              </p>
              
              <div className="space-y-6">
                 {loading ? (
                    <div className="space-y-4 animate-pulse">
                       <div className="h-12 bg-slate-900 rounded-xl"></div>
                       <div className="h-12 bg-slate-900 rounded-xl"></div>
                       <div className="h-12 bg-slate-900 rounded-xl"></div>
                    </div>
                 ) : (
                    <>
                       <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                          <MapPin className="text-orange-500 shrink-0 mt-1" />
                          <div>
                             <h4 className="font-semibold text-white">Headquarters Location</h4>
                             <p className="text-slate-400 text-sm mt-1">{publicData?.company?.address || "Address not registered"}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                          <Phone className="text-orange-500 shrink-0 mt-1" />
                          <div>
                             <h4 className="font-semibold text-white">Direct Phone</h4>
                             <p className="text-slate-400 text-sm mt-1">{publicData?.company?.contactPhone || 'Phone unavailable'}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                          <Mail className="text-orange-500 shrink-0 mt-1" />
                          <div>
                             <h4 className="font-semibold text-white">General Inquiries</h4>
                             <p className="text-slate-400 text-sm mt-1">{publicData?.company?.contactEmail || 'Email unavailable'}</p>
                          </div>
                       </div>
                    </>
                 )}
              </div>
           </div>
           
           <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full"></div>
              <form className="space-y-5 relative z-10" onSubmit={e => e.preventDefault()}>
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">First Name</label>
                       <input type="text" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50" />
                    </div>
                    <div>
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Last Name</label>
                       <input type="text" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50" />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                    <input type="email" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50" />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Message</label>
                    <textarea rows={4} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 resize-none"></textarea>
                 </div>
                 <button type="button" className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition shadow-lg mt-2">
                    Send Inquiry
                 </button>
              </form>
           </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 text-center text-sm text-slate-600 border-t border-white/5 relative z-10 bg-slate-950">
         <p>&copy; {new Date().getFullYear()} {publicData?.company?.name || "BuildCore System"}. All rights reserved.</p>
         {publicData?.company?.tradeLicense && (
            <p className="mt-2 text-xs">Trade License Compliant: #{publicData.company.tradeLicense}</p>
         )}
      </footer>
    </main>
  )
}
