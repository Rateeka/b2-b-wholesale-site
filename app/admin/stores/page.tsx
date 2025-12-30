"use client"

import { useState } from "react"
import { stores } from "@/lib/mock-data"
import { Check, X, Clock } from "lucide-react"

export default function StoresPage() {
  const [selectedStore, setSelectedStore] = useState(null)
  const [storeFilter, setStoreFilter] = useState("all")

  const filtered = storeFilter === "all" ? stores : stores.filter((s) => s.status === storeFilter)

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Check className="text-green-600" size={18} />
      case "pending":
        return <Clock className="text-yellow-600" size={18} />
      case "inactive":
        return <X className="text-red-600" size={18} />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "status-green"
      case "pending":
        return "status-yellow"
      case "inactive":
        return "status-red"
      default:
        return "status-gray"
    }
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
          {["all", "active", "pending", "inactive"].map((status) => (
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
        {filtered.map((store) => (
          <div
            key={store.id}
            onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
            className="card cursor-pointer hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-secondary">{store.name}</h3>
                <p className="text-sm text-gray-600">{store.type}</p>
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
                  <p className="text-xs font-bold text-secondary">Account Manager</p>
                  <p className="text-sm">{store.accountManager}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-sm">
                  <p className="text-xs font-bold text-secondary mb-2">Credit Limit</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">
                      ${store.creditUsed.toLocaleString()} / ${store.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded h-2">
                    <div
                      className="bg-primary rounded h-2"
                      style={{ width: `${(store.creditUsed / store.creditLimit) * 100}%` }}
                    />
                  </div>
                </div>

                {store.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button className="btn-primary flex-1">Approve</button>
                    <button className="btn-secondary flex-1">Reject</button>
                  </div>
                )}

                {store.status === "active" && <button className="btn-secondary w-full mt-4">Manage Account</button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
