"use client"

import { useState } from "react"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { products } from "@/lib/mock-data"

export default function CatalogPage() {
  const [quantities, setQuantities] = useState({})
  const [cart, setCart] = useState([])
  const [filter, setFilter] = useState("all")
  const [userTier] = useState("gold")

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter)

  const categories = ["all", ...new Set(products.map((p) => p.category))]

  const handleQuantityChange = (productId, qty) => {
    setQuantities({ ...quantities, [productId]: Math.max(0, qty) })
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 0
    if (quantity === 0) return

    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)))
    } else {
      setCart([...cart, { ...product, quantity, selectedPrice: product.pricing[userTier] }])
    }
    setQuantities({ ...quantities, [product.id]: 0 })
  }

  const getStockStatus = (status) => {
    switch (status) {
      case "in_stock":
        return { label: "In Stock", badge: "status-green" }
      case "low_stock":
        return { label: "Low Stock", badge: "status-yellow" }
      case "out_of_stock":
        return { label: "Out of Stock", badge: "status-red" }
      default:
        return { label: "Unknown", badge: "status-gray" }
    }
  }

  const getPrice = (product) => {
    return product.pricing[userTier] || product.price
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Product Catalog</h1>
          <p className="text-gray-600 text-sm mt-1">Gold tier pricing applied</p>
        </div>
        {cart.length > 0 && (
          <a href="/retailer/checkout" className="btn-primary inline-flex items-center gap-2">
            <ShoppingCart size={18} />
            Checkout ({cart.length})
          </a>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-sm p-4">
        <label className="block text-sm font-bold text-secondary mb-3">Filter by Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                filter === cat ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => {
          const status = getStockStatus(product.status)
          const price = getPrice(product)
          const isDisabled = product.status === "out_of_stock"

          return (
            <div key={product.id} className={`card flex flex-col ${isDisabled ? "opacity-60" : ""}`}>
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-secondary">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                  </div>
                  <span className={`status-badge ${status.badge}`}>{status.label}</span>
                </div>
                <p className="text-xs text-gray-600">{product.unit}</p>
              </div>

              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-2xl font-bold text-primary">${price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">per {product.unit.split("(")[0].trim().toLowerCase()}</p>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 0) - 1)}
                      disabled={isDisabled}
                      className="btn-ghost px-2 py-1 text-sm disabled:opacity-50"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantities[product.id] || 0}
                      onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 0)}
                      disabled={isDisabled}
                      className="input w-12 text-center text-sm disabled:opacity-50"
                      min="0"
                    />
                    <button
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 0) + 1)}
                      disabled={isDisabled}
                      className="btn-ghost px-2 py-1 text-sm disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isDisabled || (quantities[product.id] || 0) === 0}
                  className="btn-primary w-full disabled:opacity-50 mt-auto"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-600">No products found in this category</p>
        </div>
      )}
    </div>
  )
}
