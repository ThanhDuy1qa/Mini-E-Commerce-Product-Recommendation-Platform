'use client';

import { useState, useEffect } from "react";

interface User {
  _id: string;
  name?: string;
  email: string;
  role: number | string;
  status?: string;
  createdAt?: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
    actionType: "block" | "unblock" | "role";
    title: string;
    message: string;
  }>({
    isOpen: false,
    user: null,
    actionType: "block",
    title: "",
    message: ""
  });

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

      if (!res.ok) {
        setErrorMsg(`Error ${res.status}: Failed to fetch users`);
        return;
      }

      const data = await res.json();
      if (data.success) {
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

  // 2. Prepare Modal for Toggle Role
  const openRoleModal = (user: User) => {
    const currentRoleNum = Number(user.role);
    const newRole = currentRoleNum === 1 ? 0 : 1;
    const roleLabel = newRole === 1 ? "Admin" : "Customer";

    setConfirmModal({
      isOpen: true,
      user,
      actionType: "role",
      title: "Change User Role",
      message: `Are you sure you want to change ${user.email}'s role to ${roleLabel}?`
    });
  };

  // Logic to execute Toggle Role
  const executeToggleRole = async (user: User) => {
    const currentRoleNum = Number(user.role);
    const newRole = currentRoleNum === 1 ? 0 : 1;
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
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Failed to update role");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server");
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false, user: null }));
    }
  };

  // 3. Prepare Modal for Block / Unblock User
  const openBlockModal = (user: User) => {
    const isAdmin = Number(user.role) === 1 || String(user.role).toLowerCase() === "admin";
    if (isAdmin) {
      setErrorMsg("Action denied: Cannot block an Administrator account!");
      return;
    }

    const isBlocked = user.status === "Blocked";
    const actionText = isBlocked ? "Unblock" : "Block";

    setConfirmModal({
      isOpen: true,
      user,
      actionType: "block",
      title: `${actionText} User Account`,
      message: `Are you sure you want to ${actionText.toLowerCase()} this account (${user.email})?`
    });
  };

  // Logic to execute Block / Unblock
  const executeBlockUser = async (user: User) => {
    const isBlocked = user.status === "Blocked";
    const newStatus = isBlocked ? "Active" : "Blocked";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) { 
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, status: newStatus } : u));
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Failed to update status");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server");
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false, user: null }));
    }
  };

  const handleModalConfirm = () => {
    if (!confirmModal.user) return;
    if (confirmModal.actionType === "role") {
      executeToggleRole(confirmModal.user);
    } else {
      executeBlockUser(confirmModal.user);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAdmins = users.filter((u) => Number(u.role) === 1 || String(u.role).toLowerCase() === "admin").length;
  const totalCustomers = users.length - totalAdmins;

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Users Management</h1>
        <p className="text-base text-slate-500 mt-1.5 font-medium">Manage user accounts and access permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">👥</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold">🛡️</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Admins</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">{totalAdmins}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold">🛍️</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Customers</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">{totalCustomers}</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={fetchUsers} className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-red-700 transition">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">All Users ({filteredUsers.length})</h2>
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
            <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">User Profile</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold text-base">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold text-base">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = Number(user.role) === 1 || String(user.role).toLowerCase() === "admin";
                  const isBlocked = user.status === "Blocked";

                  return (
                    <tr key={user._id} className={`hover:bg-slate-50/60 transition ${isBlocked ? 'opacity-60 bg-slate-50/30' : ''}`}>
                      <td className="py-4 px-6 flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full font-black flex items-center justify-center text-sm ${isBlocked ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {user.name || "N/A"} {isBlocked && <span className="text-red-500 ml-1 font-semibold">(Blocked)</span>}
                          </p>
                          <p className="text-xs text-slate-400 font-normal mt-0.5">ID: {user._id.slice(-6)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{user.email}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openRoleModal(user)}
                          title="Click to switch role"
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80 transition ${
                            isAdmin ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {isAdmin ? "🛡️ Admin" : "👤 Customer"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isAdmin ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl text-xs cursor-not-allowed opacity-70"
                          >
                            Protected
                          </button>
                        ) : (
                          <button
                            onClick={() => openBlockModal(user)}
                            className={`px-4 py-2 font-bold rounded-xl transition text-xs cursor-pointer border ${
                              isBlocked 
                                ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white" 
                                : "bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-200 hover:border-red-200"
                            }`}
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false, user: null })} 
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition font-bold"
            >
              &times;
            </button>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              confirmModal.actionType === 'role' ? 'bg-purple-100 text-purple-600' :
              confirmModal.user?.status === 'Blocked' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {confirmModal.actionType === 'role' ? '🛡️' : confirmModal.user?.status === 'Blocked' ? '✅' : '🚫'}
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false, user: null })}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleModalConfirm}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition cursor-pointer ${
                  confirmModal.actionType === 'role' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' :
                  confirmModal.user?.status === 'Blocked' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}