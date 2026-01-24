"use client"

import { useState, useEffect } from "react"
import { Edit2, Save, X, AlertCircle } from "lucide-react"
import { fetchProducts, updateProduct } from "@/lib/api-client"

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [filter, setFilter] = useState("all")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [filter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = filter !== "all" ? { stock_status: filter } : {}
      const data = await fetchProducts(params)
      setProducts(data.products)
    } catch (err: any) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditingId(product.id)
    setEditData({
      name: product.name,
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      base_price: product.base_price,
      gold_price: product.gold_price,
      silver_price: product.silver_price,
      is_active: product.is_active,
    })
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      setSaving(true)
      await updateProduct(editingId, {
        name: editData.name,
        stock_quantity: editData.stock_quantity,
        base_price: editData.base_price,
        gold_price: editData.gold_price,
        silver_price: editData.silver_price,
        is_active: editData.is_active,
      })
      await loadProducts()
      setEditingId(null)
    } catch (err: any) {
      alert(`Failed to update product: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value })
  }

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      in_stock: "In Stock",
      low_stock: "Low Stock",
      out_of_stock: "Out of Stock",
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Inventory Manager</h1>
        <p className="text-gray-600">Manage stock levels, pricing, and product details</p>
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
              {status === "all" ? "All" : getStatusLabel(status)}
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
              <th className="px-4 py-3 text-left text-sm font-bold">Base Price</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Gold Price</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Silver Price</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Active</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-gray-50">
                  {editingId === product.id ? (
                    <>
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <input 
                          type="text" 
                          value={editData.sku} 
                          disabled 
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm bg-gray-100" 
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="number"
                          value={editData.stock_quantity}
                          onChange={(e) => handleChange("stock_quantity", parseInt(e.target.value))}
                          className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="number"
                          value={editData.base_price}
                          onChange={(e) => handleChange("base_price", parseFloat(e.target.value))}
                          className="border border-gray-300 rounded px-2 py-1 w-24 text-sm"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="number"
                          value={editData.gold_price || ''}
                          onChange={(e) => handleChange("gold_price", e.target.value ? parseFloat(e.target.value) : null)}
                          className="border border-gray-300 rounded px-2 py-1 w-24 text-sm"
                          step="0.01"
                          placeholder="Optional"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="number"
                          value={editData.silver_price || ''}
                          onChange={(e) => handleChange("silver_price", e.target.value ? parseFloat(e.target.value) : null)}
                          className="border border-gray-300 rounded px-2 py-1 w-24 text-sm"
                          step="0.01"
                          placeholder="Optional"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        Auto
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={editData.is_active}
                          onChange={(e) => handleChange("is_active", e.target.checked)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-primary py-1 px-2 inline-flex items-center gap-1 text-xs"
                        >
                          <Save size={14} />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={saving}
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
                      <td className="px-4 py-3 text-sm font-bold">{product.stock_quantity}</td>
                      <td className="px-4 py-3 text-sm font-bold">${parseFloat(product.base_price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.gold_price ? `$${parseFloat(product.gold_price).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.silver_price ? `$${parseFloat(product.silver_price).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${getStatusColor(product.stock_status)}`}>
                          {getStatusLabel(product.stock_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${product.is_active ? 'status-green' : 'status-red'}`}>
                          {product.is_active ? 'Yes' : 'No'}
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
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No products found for the selected filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
