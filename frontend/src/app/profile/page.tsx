'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || parsedUser.username || "",
          email: parsedUser.email || "",
        });
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    setLoading(false);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = user?.token || localStorage.getItem("token");

      // Make sure this URL matches your backend setup exactly!
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name: formData.name,
          email: formData.email 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        window.dispatchEvent(new Event("userLogin"));
        
        alert("Profile updated successfully!");
      } else {
        alert("Server Error: " + (data.message || "Failed to update profile"));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Cannot connect to the Backend server! Please check if the Backend is running on port 5000.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center text-gray-500 font-semibold">
        Loading profile information...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm text-center border border-gray-100 space-y-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-900">Authentication Required</h2>
        <p className="text-sm text-gray-500">Please login to view and manage your account.</p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm"
        >
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header Avatar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-extrabold text-2xl border-4 border-blue-50 shrink-0">
          {(formData.name || user.username || "U").charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-2xl font-extrabold text-gray-900">{formData.name || user.username}</h1>
          <p className="text-sm font-medium text-gray-500">{formData.email}</p>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md mt-2">
            Member Account
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            {isEditing ? "Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Full Name</p>
              <p className="font-bold text-gray-800 mt-1">{formData.name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
              <p className="font-bold text-gray-800 mt-1">{formData.email || "Not provided"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}