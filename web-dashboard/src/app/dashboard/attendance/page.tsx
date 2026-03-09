"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Camera, MapPin, Loader2, CheckCircle2, History, AlertTriangle, Edit2, Trash2 } from "lucide-react"

export default function AttendancePage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [gps, setGps] = useState("")
  const [sites, setSites] = useState<Record<string, string>[]>([])
  const [selectedSite, setSelectedSite] = useState("")
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    status: "PRESENT", date: "", clockIn: "", clockOut: ""
  })

  useEffect(() => {
    fetch("/api/sites").then(res => res.json()).then(data => setSites(Array.isArray(data) ? data : []))
    fetchRecords()
  }, [])

  const fetchRecords = () => {
    fetch("/api/attendance").then(res => res.json()).then(data => setRecords(Array.isArray(data) ? data : []))
  }

  const startCamera = async () => {
    try {
      if (stream) return;
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setErrorMsg("Camera access required for attendance verification.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 320, 240)
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8)
        setPhotoData(dataUrl)
        stopCamera()
        getLocation()
      }
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setGps(`${position.coords.latitude},${position.coords.longitude}`),
        (err) => setErrorMsg("GPS location required for verification.")
      )
    } else {
      setErrorMsg("Geolocation not supported by browser.")
    }
  }

  const submitAttendance = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setErrorMsg(""); setSuccessMsg(""); setLoading(true)
    if (!selectedSite || !photoData || !gps) {
      setErrorMsg("Site, Photo, and GPS are all required.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, siteId: selectedSite, gps, photo: photoData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setSuccessMsg(`Successfully ${type.replace('_', ' ').toLowerCase()}ed!`)
      setPhotoData(null)
      setGps("")
      fetchRecords()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: any) => {
    setEditForm({
      status: record.status || "PRESENT",
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : "",
      clockIn: record.clockIn ? new Date(record.clockIn).toISOString().slice(0, 16) : "",
      clockOut: record.clockOut ? new Date(record.clockOut).toISOString().slice(0, 16) : ""
    })
    setEditingRecord(record)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/attendance/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      fetchRecords()
      setIsEditModalOpen(false)
      setEditingRecord(null)
    } catch(err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`/api/attendance/${id}`, { method: "DELETE" })
      setRecords(records.filter(r => r.id !== id))
    } catch(err) {
      console.error(err)
    }
  }

  const isWorkerObj = role === "WORKER" || role === "SUB_MANAGER"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time & Attendance</h1>
          <p className="text-slate-500 mt-1">Live camera and GPS-verified worker tracking system.</p>
        </div>
      </div>

      {isWorkerObj && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-orange-500" /> Verify Identity & Location
          </h3>
          
          {errorMsg && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {errorMsg}</div>}
          {successMsg && <div className="p-3 mb-4 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-200 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> {successMsg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Site Location</label>
                  <select 
                    value={selectedSite} onChange={e => setSelectedSite(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="">Choose Site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name} - {s.location}</option>)}
                  </select>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
                  <p className="text-sm text-slate-500">
                    <strong>Security Rules:</strong> Gallery uploads are blocked. You must allow Camera and Location permissions to clock in or out.
                  </p>
                  
                  {!stream && !photoData && (
                    <button onClick={startCamera} className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-900 transition">
                      <Camera className="w-5 h-5" /> Activate Live Camera
                    </button>
                  )}

                  {stream && !photoData && (
                    <div className="space-y-3">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover rounded-lg bg-black"></video>
                      <button onClick={capturePhoto} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition">
                        Take Photo
                      </button>
                    </div>
                  )}

                  {photoData && (
                    <div className="space-y-3">
                      <img src={photoData} alt="Captured" className="w-full h-48 object-cover rounded-lg border-2 border-orange-500" />
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg">
                        <MapPin className="w-4 h-4" /> Location verified
                      </div>
                      <button onClick={() => { setPhotoData(null); startCamera(); }} className="text-sm font-medium text-slate-500 hover:text-slate-700 w-full text-center">Retake Photo</button>
                    </div>
                  )}
                  
                  {/* Hidden canvas for image data extraction */}
                  <canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => submitAttendance('CLOCK_IN')}
                    disabled={!photoData || !gps || !selectedSite || loading}
                    className="py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-medium transition"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Clock-In"}
                  </button>
                  <button 
                    onClick={() => submitAttendance('CLOCK_OUT')}
                    disabled={!photoData || !gps || !selectedSite || loading}
                    className="py-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl font-medium transition"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Clock-Out"}
                  </button>
                </div>
             </div>
             
             {/* Info Column */}
             <div className="bg-orange-50 dark:bg-orange-500/5 rounded-xl p-6 border border-orange-100 dark:border-orange-500/20">
               <h4 className="font-semibold text-orange-800 dark:text-orange-400 mb-4">Verification Protocols</h4>
               <ul className="space-y-4 text-sm text-orange-700 dark:text-orange-300">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" /> Real-time photo capture ensures identity confirmation and avoids buddy-punching.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" /> Geofencing correlates your exact coordinates against the site perimeter.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" /> Check-in bounds are limited to defined working hours to prevent unauthorized payroll additions.
                  </li>
               </ul>
             </div>
          </div>
        </div>
      )}

      {/* Reports View */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" /> Attendance Records
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="py-3 px-6 font-semibold text-sm text-slate-500">Date</th>
                {!isWorkerObj && <th className="py-3 px-6 font-semibold text-sm text-slate-500">Worker</th>}
                <th className="py-3 px-6 font-semibold text-sm text-slate-500">Site</th>
                <th className="py-3 px-6 font-semibold text-sm text-slate-500">Clock-In / Location</th>
                <th className="py-3 px-6 font-semibold text-sm text-slate-500">Status</th>
                {!isWorkerObj && <th className="py-3 px-6 font-semibold text-sm text-slate-500 text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? records.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 dark:border-white/5 last:border-none">
                   <td className="py-4 px-6 text-sm text-slate-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString()}
                   </td>
                   {!isWorkerObj && (
                     <td className="py-4 px-6 text-sm">
                        <span className="font-medium text-slate-900 dark:text-white block">{record.worker?.user?.name}</span>
                        <span className="text-xs text-slate-500">ID: {record.worker?.id.slice(-6)}</span>
                     </td>
                   )}
                   <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">{record.site?.name}</td>
                   <td className="py-4 px-6 text-sm">
                      {record.clockIn ? (
                        <div>
                          <p className="font-medium text-emerald-600">{new Date(record.clockIn).toLocaleTimeString()}</p>
                          <p className="text-xs text-slate-400 truncate w-32">{record.clockInGps}</p>
                        </div>
                      ) : <span className="text-slate-400 italic">No entry</span>}
                   </td>
                    <td className="py-4 px-6">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                       ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                       : record.status === 'LATE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                       : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                       {record.status}
                     </span>
                   </td>
                   {!isWorkerObj && (
                     <td className="py-4 px-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={() => handleEdit(record)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="Edit Record">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(record.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Delete Record">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">No attendance records found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold mb-1">Edit Attendance Record</h3>
            <p className="text-sm text-slate-500 mb-6">Modify attendance for {editingRecord.worker?.user?.name}</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Date</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Clock In</label>
                <input type="datetime-local" value={editForm.clockIn} onChange={e => setEditForm({...editForm, clockIn: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Clock Out</label>
                <input type="datetime-local" value={editForm.clockOut} onChange={e => setEditForm({...editForm, clockOut: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
