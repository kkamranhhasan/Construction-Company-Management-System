"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, Shield } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const ROLES = ["OWNER", "ADMIN", "SUB_MANAGER", "WORKER"]

export default function UsersManagementPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "WORKER"
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus({ type: "error", message: err.message })
      } else {
        setStatus({ type: "error", message: "Failed to fetch users" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setModalMode("CREATE")
    setFormData({ name: "", email: "", password: "", role: "WORKER" })
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setModalMode("EDIT")
    setSelectedUser(user)
    setFormData({ name: user.name, email: user.email, password: "", role: user.role })
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    try {
      const url = modalMode === "CREATE" ? "/api/users" : `/api/users/${selectedUser?.id}`
      const method = modalMode === "CREATE" ? "POST" : "PUT"
      
      const payload: Record<string, string> = { ...formData }
      if (modalMode === "EDIT" && !payload.password) {
        delete payload.password // Don't send empty password on edit
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save user")

      setStatus({ type: "success", message: `User ${modalMode === "CREATE" ? "created" : "updated"} successfully` })
      setIsModalOpen(false)
      fetchUsers()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus({ type: "error", message: err.message })
      } else {
        setStatus({ type: "error", message: "Failed to save user" })
      }
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to delete user")
      
      setStatus({ type: "success", message: "User deleted successfully" })
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus({ type: "error", message: err.message })
      } else {
        setStatus({ type: "error", message: "Failed to delete user" })
      }
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (session?.user?.role !== "OWNER" && session?.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Access Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage system access roles and user accounts</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
        >
          <Plus className="w-5 h-5" /> Add New User
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium ${
          status.type === 'error' 
            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        }`}>
          <div className="flex items-center gap-3">
            {status.type === 'error' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {status.message}
          </div>
          <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all dark:text-white"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" /> 
            <span>{users.length} Total Users</span>
          </div>
        </div>

        <div className="overflow-x-auto space-y-8 p-6">
          {isLoading ? (
            <div className="px-6 py-8 text-center text-slate-500">
              <div className="flex justify-center mb-2">
                 <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              No users found matching your search.
            </div>
          ) : (
            ROLES.filter(role => filteredUsers.some(u => u.role === role)).map(role => {
              const usersInRole = filteredUsers.filter(u => u.role === role);
              return (
                <div key={role} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    {role === 'OWNER' || role === 'ADMIN' ? <Shield className="w-5 h-5 text-orange-500" /> : <Users className="w-5 h-5 text-slate-400" />}
                    {role.replace("_", " ")}
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">{usersInRole.length}</span>
                  </h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-3">User</th>
                          <th className="px-6 py-3">Joined Date</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {usersInRole.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-xs">
                                  {user.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                                  <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-slate-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => openEditModal(user)}
                                  className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition"
                                  title="Edit User"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  disabled={user.id === session?.user?.id || (user.role === 'OWNER' && session?.user?.role !== 'OWNER')}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-xl font-bold">{modalMode === "CREATE" ? "Add New User" : "Edit User Profile"}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {modalMode === "CREATE" ? "Create an account and assign roles." : "Update details and modify access levels."}
                </p>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {modalMode === "CREATE" ? "Password" : "New Password (Optional)"}
                  </label>
                  <input
                    type="password"
                    required={modalMode === "CREATE"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={modalMode === "EDIT" ? "Leave blank to keep current" : ""}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Access Level (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    disabled={modalMode === "EDIT" && selectedUser?.role === "OWNER" && session?.user?.role !== "OWNER"}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
                  >
                    {ROLES
                      .filter(role => {
                         // Owner can assign anything. Admin can only assign SUB_MANAGER or WORKER.
                         if (session?.user?.role === "OWNER") return true;
                         if (session?.user?.role === "ADMIN") return ["SUB_MANAGER", "WORKER"].includes(role);
                         return false; 
                      })
                      .map(role => (
                      <option key={role} value={role}>{role.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition"
                  >
                    {modalMode === "CREATE" ? "Create User" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
