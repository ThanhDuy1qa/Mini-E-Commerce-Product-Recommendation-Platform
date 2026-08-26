"use client";

import { useState, useEffect } from "react";

interface Category {
  _id?: string;
  id?: string;
  name: string;
}

interface Product {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price: number;
  stock?: number;
  quantity?: number;
  category?: any;
  image_url?: string;
  image?: string;
  description?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (Array.isArray(prodData)) setProducts(prodData);
      else if (prodData.products && Array.isArray(prodData.products)) setProducts(prodData.products);

      if (Array.isArray(catData)) setCategories(catData);
      else if (catData.categories && Array.isArray(catData.categories)) setCategories(catData.categories);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setStock("");
    setCategoryId("");
    setImageUrl("");
    setDescription("");
    setEditingId(null);
  };

  const handleEditClick = (prod: Product) => {
    const pId = prod._id || prod.id;
    if (!pId) return;
    setEditingId(pId);
    setTitle(prod.title || prod.name || "");
    setPrice(prod.price ? String(prod.price) : "");
    setStock(prod.stock !== undefined ? String(prod.stock) : prod.quantity !== undefined ? String(prod.quantity) : "");
    
    const catVal = typeof prod.category === "object" ? prod.category?._id || prod.category?.id : prod.category;
    setCategoryId(catVal || "");
    setImageUrl(prod.image_url || prod.image || "");
    setDescription(prod.description || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title,
      price: Number(price),
      stock: Number(stock),
      category: categoryId,
      image_url: imageUrl,
      description,
    };

    try {
      const token = localStorage.getItem("token");
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchData();
      } else {
        alert(isEdit ? "Failed to update product!" : "Failed to add product!");
      }
    } catch (err) {
      console.error("Error submitting product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (editingId === id) resetForm();
        fetchData();
      } else {
        alert("Failed to delete product!");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = p.title || p.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Management</h1>
          <p className="text-base text-slate-500 mt-1.5 font-medium">Add, update, and manage your inventory</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          {showForm ? "Hide Form" : "➕ Add Product"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">📦</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Products</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold">🏷️</div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Categories</p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">{categories.length}</p>
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

      {/* Standardized Product Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${editingId ? "bg-amber-500" : "bg-blue-600"}`}></span>
              <h2 className="text-base font-bold text-slate-800">
                {editingId ? "Edit Product Details" : "Add New Product"}
              </h2>
            </div>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Wireless Mouse..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="45.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  required
                  placeholder="100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition cursor-pointer"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => {
                    const cId = c._id || c.id;
                    return (
                      <option key={cId} value={cId}>
                        {c.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Image URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Enter detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 ${
                  editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Saving..." : editingId ? "💾 Update Product" : "➕ Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">All Products ({filteredProducts.length})</h2>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search product..."
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
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod, index) => {
                  const pId = prod._id || prod.id;
                  const pName = prod.title || prod.name || "Untitled";
                  const pPrice = prod.price || 0;
                  const pStock = prod.stock !== undefined ? prod.stock : prod.quantity !== undefined ? prod.quantity : 0;
                  const catObj = typeof prod.category === "object" ? prod.category?.name : "General";
                  const img = prod.image_url || prod.image || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=150&q=80";

                  return (
                    <tr key={pId || index} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={img} alt={pName} className="w-10 h-10 object-cover rounded-xl border border-slate-200/80 bg-white" />
                          <span className="font-bold text-slate-900">{pName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-500">{catObj}</td>
                      <td className="py-4 px-6 font-black text-emerald-600">${Number(pPrice).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pStock > 0 ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"}`}>
                          {pStock} 
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs transition cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pId)}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}