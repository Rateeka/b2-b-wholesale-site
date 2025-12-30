"use client"

import { useState } from "react"
import { products } from "@/lib/mock-data"
import { Edit2, Save, X } from "lucide-react"

export default function InventoryPage() {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [filter, setFilter] = useState("all")

  const filtered = filter === "all" ? products : products.filter((p) => p.status === filter)

  const handleEdit = (product) => {
    setEditingId(product.id)
    setEditData({ ...product })
  }

  const handleSave = () => {
    setEditingId(null)
  }

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "in_stock":
        return "status-green"
      case "low_stock":
        return "status-yellow"
      case "out_of_stock":
        return "status-red"
      default:
        return "status-gray"
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return "out_of_stock"
    if (stock <= 50) return "low_stock"
    return "in_stock"
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Inventory Manager</h1>
        <p className="text-gray-600">Manage stock levels, pricing, and expiry dates</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-sm p-4">
        <label className="block text-sm font-bold text-secondary mb-3">Filter by Status</label>
        <div className="flex flex-wrap gap-2">
          {["all", "in_stock", "low_stock", "out_of_stock"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                filter === status ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"
              }`}
            >
              {status === "all"
                ? "All"
                : status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary text-white">
              <th className="px-4 py-3 text-left text-sm font-bold">Product</th>
              <th className="px-4 py-3 text-left text-sm font-bold">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Price</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-gray-50">
                {editingId === product.id ? (
                  <>
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="input w-full text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <input type="text" value={editData.sku} disabled className="input w-full text-sm bg-gray-100" />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="number"
                        value={editData.stock}
                        onChange={(e) => handleChange("stock", Number.parseInt(e.target.value))}
                        className="input w-full text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) => handleChange("price", Number.parseFloat(e.target.value))}
                        className="input w-full text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={editData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="input text-sm"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={handleSave}
                        className="btn-primary py-1 px-2 inline-flex items-center gap-1 text-xs"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-secondary py-1 px-2 inline-flex items-center gap-1 text-xs"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm font-bold">{product.stock}</td>
                    <td className="px-4 py-3 text-sm font-bold">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${getStatusColor(product.status)}`}>
                        {product.status.replace("_", " ").charAt(0).toUpperCase() +
                          product.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn-ghost py-1 px-2 inline-flex items-center gap-1 text-xs"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
