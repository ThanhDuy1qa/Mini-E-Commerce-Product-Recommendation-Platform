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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories");
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

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleEditClick = (cat: Category) => {
    const cId = cat._id || cat.id;
    if (!cId) return;
    setEditingId(cId);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `http://localhost:5000/api/categories/${editingId}`
        : "http://localhost:5000/api/categories";

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

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Categories Management</h1>
        <p className="text-xs text-slate-500 mt-1">Add and modify product categories</p>
      </div>

      {/* Form Add / Edit Category */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            {editingId ? "Edit Category" : "Add New Category"}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Category Name</label>
            <input
              type="text"
              required
              placeholder="Electronics..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Description (Optional)</label>
            <input
              type="text"
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 ${
                editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Saving..." : editingId ? "💾 Update Category" : "➕ Save Category"}
            </button>
          </div>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <span className="font-bold text-slate-800 text-xs">Categories ({filteredCategories.length})</span>
          <input
            type="text"
            placeholder="🔍 Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase bg-slate-50/80">
              <th className="py-3.5 px-6">Name</th>
              <th className="py-3.5 px-6">Description</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredCategories.map((cat, index) => {
              const cId = cat._id || cat.id;
              return (
                <tr key={cId || index} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-6 font-bold text-slate-800">{cat.name}</td>
                  <td className="py-3 px-6 text-slate-500">{cat.description || "N/A"}</td>
                  <td className="py-3 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-bold text-xs transition cursor-pointer"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cId)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg font-bold text-xs transition cursor-pointer"
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
  );
}