"use client"

import { signOut } from "next-auth/react"
import { Bell, Search, Menu, LogOut, User, Check, Trash2, ShieldCheck, FileText, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
    image?: string | null
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
     fetchNotifications()
     
     // Close dropdown on outside click
     const handleClickOutside = (event: MouseEvent) => {
       if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
         setShowNotifs(false)
       }
     }
     document.addEventListener("mousedown", handleClickOutside)
     return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
     try {
        const res = await fetch('/api/notifications')
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : [])
     } catch (err) {
        console.error(err)
     }
  }

  const handleMarkAsRead = async (ids: string[]) => {
     try {
       await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationIds: ids })
       })
       // Optimistic update
       setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n))
     } catch (err) {
       console.error(err)
     }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  
  const getNotifIcon = (type: string) => {
      switch(type) {
          case 'SUCCESS': return <Check className="w-4 h-4 text-emerald-500" />
          case 'WARNING': return <AlertCircle className="w-4 h-4 text-amber-500" />
          case 'ALERT': return <ShieldCheck className="w-4 h-4 text-red-500" />
          default: return <Clock className="w-4 h-4 text-blue-500" />
      }
  }

  return (
    <header className="h-20 flex items-center justify-between px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 relative z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search projects, workers..."
            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button 
             onClick={() => setShowNotifs(!showNotifs)}
             className={`relative p-2 rounded-full transition ${showNotifs ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
            )}
          </button>

          {showNotifs && (
             <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top-right">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                   <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Notifications {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs">{unreadCount}</span>}
                   </h3>
                   {unreadCount > 0 && (
                      <button onClick={() => handleMarkAsRead(notifications.filter(n => !n.isRead).map(n => n.id))} className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition">Mark all read</button>
                   )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                   {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                         {notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              onClick={() => !notif.isRead && handleMarkAsRead([notif.id])}
                              className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-orange-50/50 dark:bg-orange-500/5' : ''}`}
                            >
                               <div className="mt-0.5 shrink-0">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-white dark:bg-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    {getNotifIcon(notif.type)}
                                 </div>
                               </div>
                               <div>
                                  <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                     {notif.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-2">
                                     {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                                  </p>
                               </div>
                               {!notif.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 ml-auto shrink-0"></div>}
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                         <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                         <p className="text-sm font-medium text-slate-500">You're all caught up!</p>
                      </div>
                   )}
                </div>
             </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3 relative group cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {user.name || "System User"}
            </span>
            <span className="text-xs text-orange-500 font-medium">
              {user.role}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-sm border-2 border-white dark:border-slate-800">
            <User className="w-5 h-5" />
          </div>

          {/* Dropdown Menu - Simple hover Implementation */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            <Link href="/dashboard/settings" className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left">
              <User className="w-4 h-4" /> My Profile
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition text-left"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
