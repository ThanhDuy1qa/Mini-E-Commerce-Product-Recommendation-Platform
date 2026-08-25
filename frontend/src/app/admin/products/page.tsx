"use client";

import { useState, useEffect } from "react";

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number | string;
  category: string;
  image: string;
  description?: string;
}

interface Category {
  _id?: string;
  id?: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(true);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Products & Categories
  const fetchProducts = async () => {
    try {
      // Truyền thêm query limit=1000 để lấy toàn bộ danh sách thay vì mặc định 20
      const res = await fetch("http://localhost:5000/api/products?limit=1000");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalProducts(data.length);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalProducts(data.total || data.totalProducts || data.products.length);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

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
    fetchProducts();
    fetchCategories();
  }, []);

  // Reset Form
  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("");
    setImage("");
    setDescription("");
    setEditingId(null);
  };

  // 2. Select Product to Edit
  const handleEditClick = (product: Product) => {
    const pId = product._id || product.id;
    if (!pId) return;
    setEditingId(pId);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);
    setImage(product.image);
    setDescription(product.description || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Save (Add or Update) Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      alert("Please select a category!");
      return;
    }
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          image,
          description,
        }),
      });

      if (res.ok) {
        resetForm();
        fetchProducts();
      } else {
        alert(isEdit ? "Failed to update product!" : "Failed to add product!");
      }
    } catch (err) {
      console.error("Error submitting product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Delete Product
  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (editingId === id) resetForm();
        fetchProducts();
      } else {
        alert("Failed to delete product!");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Product Management</h1>
          <p className="text-xs text-slate-500 mt-1">Add, update, and manage your inventory</p>
        </div>
        <button
          onClick={() => {
            if (showForm && editingId) resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
        >
          {showForm ? "Hide Form" : "➕ Add New Product"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">📦</div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Products</p>
            <p className="text-2xl font-black text-slate-800">{totalProducts || products.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl">🏷️</div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Active Categories</p>
            <p className="text-2xl font-black text-slate-800">{new Set(products.map((p) => p.category)).size}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">⚡</div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Status</p>
            <p className="text-2xl font-black text-emerald-600">Active</p>
          </div>
        </div>
      </div>

      {/* Form (Add / Edit) */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${editingId ? "bg-amber-500" : "bg-blue-600"}`}></span>
              <h2 className="text-sm font-bold text-slate-800">
                {editingId ? "Edit Product Details" : "Add New Product"}
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Product Name</label>
              <input
                type="text"
                required
                placeholder="Wireless Mouse..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="45.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Category</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none cursor-pointer"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat, idx) => (
                  <option key={cat._id || cat.id || idx} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Image URL</label>
              <input
                type="text"
                required
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Description</label>
              <textarea
                rows={3}
                required
                placeholder="Enter detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none resize-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 ${
                  editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Saving..." : editingId ? "💾 Update Product" : "➕ Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <span className="font-bold text-slate-800 text-xs">Inventory List ({filteredProducts.length})</span>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase bg-slate-50/80">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((item, index) => {
                const prodId = item._id || item.id;
                return (
                  <tr key={prodId || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-6 flex items-center gap-3">
                      <img
                        src={item.image || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200/60 bg-slate-100 shrink-0"
                      />
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="font-black text-emerald-600 text-sm">
                        ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-500 max-w-xs truncate">{item.description || "N/A"}</td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-bold text-xs transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prodId)}
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
    </div>
  );
}