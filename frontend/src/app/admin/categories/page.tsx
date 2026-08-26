"use client";

import { useState, useEffect } from "react";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
      else if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset Form
  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  // 2. Select Category to Edit
  const handleEditClick = (cat: Category) => {
    const cId = cat._id || cat.id;
    if (!cId) return;
    setEditingId(cId);
    setName(cat.name);
    setDescription(cat.description || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Save (Add or Update) Category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        resetForm();
        fetchCategories();
      } else {
        alert(isEdit ? "Failed to update category!" : "Failed to add category!");
      }
    } catch (err) {
      console.error("Error submitting category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Delete Category
  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (editingId === id) resetForm();
        fetchCategories();
      } else {
        alert("Failed to delete category!");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories Management</h1>
          <p className="text-base text-slate-500 mt-1.5 font-medium">Add, update, and manage product categories</p>
        </div>
        <button
          onClick={() => {
            if (showForm && editingId) resetForm();
            setShowForm(!showForm);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          {showForm ? "Hide Form" : "➕ Add New Category"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">🏷️</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Categories</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">{categories.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold">📝</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">With Description</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">{categories.filter((c) => c.description).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold">⚡</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status</p>
            <p className="text-3xl font-black text-emerald-600 mt-0.5">Active</p>
          </div>
        </div>
      </div>

      {/* Standardized Form (Add / Edit) */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${editingId ? "bg-amber-500" : "bg-blue-600"}`}></span>
              <h2 className="text-base font-bold text-slate-800">
                {editingId ? "Edit Category Details" : "Add New Category"}
              </h2>
            </div>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Electronics..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Short description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 ${
                  editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Saving..." : editingId ? "💾 Update Category" : "➕ Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Categories List ({filteredCategories.length})</h2>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
            />
            <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {filteredCategories.map((cat, index) => {
                const cId = cat._id || cat.id;
                return (
                  <tr key={cId || index} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">{cat.name}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-normal">{cat.description || "N/A"}</td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cId)}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}