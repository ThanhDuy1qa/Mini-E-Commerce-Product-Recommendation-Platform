'use client';

import { useState, useEffect } from "react";

interface User {
  _id: string;
  name?: string;
  email: string;
  role: number | string;
  createdAt?: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetch Users List
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
      } else {
        setErrorMsg(data.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setErrorMsg("Cannot connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Toggle User Role (0: Customer, 1: Admin)
  const handleToggleRole = async (user: User) => {
    const currentRoleNum = Number(user.role);
    const newRole = currentRoleNum === 1 ? 0 : 1;
    const roleLabel = newRole === 1 ? "Admin" : "Customer";

    if (!confirm(`Are you sure you want to change ${user.email}'s role to ${roleLabel}?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(users.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  // 3. Delete User
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(users.filter((user) => user._id !== id));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAdmins = users.filter((u) => Number(u.role) === 1 || u.role === "admin").length;
  const totalCustomers = users.length - totalAdmins;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Users Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user accounts and access permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">👥</div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black text-slate-900">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">🛡️</div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-black text-slate-900">{totalAdmins}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">🛍️</div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Customers</p>
            <p className="text-2xl font-black text-slate-900">{totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={fetchUsers} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer">Retry</button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-800">User List ({filteredUsers.length})</h2>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">User Profile</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = Number(user.role) === 1 || user.role === "admin";
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name || "N/A"}</p>
                          <p className="text-[10px] text-slate-400 font-normal">ID: {user._id.slice(-6)}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{user.email}</td>
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => handleToggleRole(user)}
                          title="Click to switch role"
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold border cursor-pointer hover:opacity-80 transition ${
                            isAdmin ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {isAdmin ? "🛡️ Admin" : "👤 Customer"}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 font-bold rounded-lg transition text-[11px] cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}