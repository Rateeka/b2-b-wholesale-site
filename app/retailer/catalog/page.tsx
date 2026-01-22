"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, AlertCircle, Loader2 } from "lucide-react"
import { fetchProducts, fetchCategories, ApiError } from "@/lib/api-client"
import { useUser } from "@/hooks/use-user"

export default function CatalogPage() {
  const { user, store } = useUser()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [cart, setCart] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadData() {
      if (!store) return

      try {
        setIsLoading(true)
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ])
        setProducts(productsData)
        setCategories(categoriesData)
        setError(null)
      } catch (err) {
        console.error("Failed to load catalog:", err)
        setError(err instanceof ApiError ? err.message : "Failed to load catalog")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [store])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-l-4 border-l-red-500">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-secondary">Error Loading Catalog</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Filter products based on category and search
  const filtered = products.filter((product) => {
    const matchesCategory = !filter || product.category_id === filter
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleQuantityChange = (productId: string, qty: number) => {
    setQuantities({ ...quantities, [productId]: Math.max(0, qty) })
  }

  const handleAddToCart = (product: any) => {
    const quantity = quantities[product.product_id] || 0
    if (quantity === 0) return

    const existingItem = cart.find((item) => item.product_id === product.product_id)
    if (existingItem) {
      setCart(cart.map((item) => 
        item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity, selectedPrice: product.effective_price }])
    }
    setQuantities({ ...quantities, [product.product_id]: 0 })
  }

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) {
      return { label: "Out of Stock", badge: "status-red" }
    } else if (stock <= reorderLevel) {
      return { label: "Low Stock", badge: "status-yellow" }
    } else {
      return { label: "In Stock", badge: "status-green" }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Product Catalog</h1>
          {store?.tier && (
            <p className="text-gray-600 text-sm mt-1">
              {store.tier.charAt(0).toUpperCase() + store.tier.slice(1)} tier pricing applied
            </p>
          )}
        </div>
        {cart.length > 0 && (
          <a href="/retailer/checkout" className="btn-primary inline-flex items-center gap-2">
            <ShoppingCart size={18} />
            Checkout ({cart.length})
          </a>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-border rounded-sm p-4 space-y-4">
        <div>
          <label className="block text-sm font-bold text-secondary mb-2">Search Products</label>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full max-w-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-secondary mb-3">Filter by Category</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                filter === null ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setFilter(cat.category_id)}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                  filter === cat.category_id ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => {
          const status = getStockStatus(product.stock_quantity, product.reorder_level)
          const isDisabled = product.stock_quantity === 0

          return (
            <div key={product.product_id} className={`card flex flex-col ${isDisabled ? "opacity-60" : ""}`}>
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-secondary">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                  </div>
                  <span className={`status-badge ${status.badge}`}>{status.label}</span>
                </div>
                <p className="text-xs text-gray-600">{product.unit}</p>
                {product.category_name && (
                  <p className="text-xs text-gray-500 mt-1">{product.category_name}</p>
                )}
              </div>

              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-2xl font-bold text-primary">${product.effective_price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">per {product.unit.toLowerCase()}</p>
                {product.base_price !== product.effective_price && (
                  <p className="text-xs text-gray-400 line-through">
                    Base: ${product.base_price.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(product.product_id, (quantities[product.product_id] || 0) - 1)}
                      disabled={isDisabled}
                      className="btn-ghost px-2 py-1 text-sm disabled:opacity-50"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantities[product.product_id] || 0}
                      onChange={(e) => handleQuantityChange(product.product_id, Number.parseInt(e.target.value) || 0)}
                      disabled={isDisabled}
                      className="input w-12 text-center text-sm disabled:opacity-50"
                      min="0"
                    />
                    <button
                      onClick={() => handleQuantityChange(product.product_id, (quantities[product.product_id] || 0) + 1)}
                      disabled={isDisabled}
                      className="btn-ghost px-2 py-1 text-sm disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isDisabled || (quantities[product.product_id] || 0) === 0}
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
          <p className="text-gray-600">
            {searchTerm || filter ? "No products found matching your criteria" : "No products available"}
          </p>
        </div>
      )}
    </div>
  )
}
