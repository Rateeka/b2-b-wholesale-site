"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock, AlertCircle } from "lucide-react"
import { fetchStores, updateStore as updateStoreAPI } from "@/lib/api-client"

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [storeFilter, setStoreFilter] = useState("all")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadStores()
  }, [storeFilter])

  const loadStores = async () => {
    try {
      setLoading(true)
      const params = storeFilter !== "all" ? { status: storeFilter } : {}
      const data = await fetchStores(params)
      setStores(data.stores)
    } catch (err: any) {
      setError(err.message || 'Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (storeId: string, newStatus: string) => {
    try {
      setUpdating(true)
      await updateStoreAPI(storeId, { status: newStatus })
      await loadStores() // Refresh list
      setSelectedStore(null)
    } catch (err: any) {
      alert(`Failed to update store: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="text-green-600" size={18} />
      case "pending":
        return <Clock className="text-yellow-600" size={18} />
      case "inactive":
      case "suspended":
        return <X className="text-red-600" size={18} />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-green"
      case "pending":
        return "status-yellow"
      case "inactive":
      case "suspended":
        return "status-red"
      default:
        return "status-gray"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading stores...</p>
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
        <h1 className="text-3xl font-bold text-secondary">Store Database</h1>
        <p className="text-gray-600">Manage retailer accounts and credit limits</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-sm p-4">
        <label className="block text-sm font-bold text-secondary mb-3">Filter by Status</label>
        <div className="flex flex-wrap gap-2">
          {["all", "active", "pending", "inactive", "suspended"].map((status) => (
            <button
              key={status}
              onClick={() => setStoreFilter(status)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                storeFilter === status ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stores.length > 0 ? (
          stores.map((store) => (
            <div
              key={store.id}
              onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
              className="card cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary">{store.name}</h3>
                  <p className="text-sm text-gray-600">{store.store_type}</p>
                </div>
                <span className={`status-badge ${getStatusColor(store.status)} flex items-center gap-1`}>
                  {getStatusIcon(store.status)}
                  {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs font-bold text-secondary">City</p>
                  <p className="text-sm">{store.city}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary">Tier</p>
                  <p className="text-sm font-bold text-primary">{store.tier.toUpperCase()}</p>
                </div>
              </div>

              {selectedStore === store.id && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-secondary">Email</p>
                    <p className="text-sm">{store.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-secondary">Phone</p>
                    <p className="text-sm">{store.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-secondary">Address</p>
                    <p className="text-sm">{store.address}, {store.city}, {store.province} {store.postal_code}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-sm">
                    <p className="text-xs font-bold text-secondary mb-2">Credit Limit</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">
                        ${parseFloat(store.credit_used || 0).toLocaleString()} / ${parseFloat(store.credit_limit).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded h-2">
                      <div
                        className="bg-primary rounded h-2"
                        style={{ width: `${Math.min(((store.credit_used || 0) / store.credit_limit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Available: ${(parseFloat(store.credit_limit) - parseFloat(store.credit_used || 0)).toLocaleString()}
                    </p>
                  </div>

                  {store.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="btn-primary flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(store.id, 'active')
                        }}
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Approve'}
                      </button>
                      <button 
                        className="btn-secondary flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(store.id, 'inactive')
                        }}
                        disabled={updating}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {store.status === "active" && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="btn-secondary flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(store.id, 'suspended')
                        }}
                        disabled={updating}
                      >
                        Suspend
                      </button>
                    </div>
                  )}

                  {store.status === "suspended" && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="btn-primary flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(store.id, 'active')
                        }}
                        disabled={updating}
                      >
                        Reactivate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 card text-center py-8 text-gray-500">
            No stores found for the selected filter
          </div>
        )}
      </div>
    </div>
  )
}
