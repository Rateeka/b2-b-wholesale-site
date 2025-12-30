"use client"

import { useState } from "react"
import { orders } from "@/lib/mock-data"
import { Printer } from "lucide-react"

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedOrder, setExpandedOrder] = useState(null)

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)

  const statuses = ["all", "processing", "out_for_delivery", "delivered"]

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "status-green"
      case "out_for_delivery":
        return "status-yellow"
      case "processing":
        return "status-yellow"
      default:
        return "status-gray"
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      delivered: "Delivered",
      out_for_delivery: "Out for Delivery",
      processing: "Processing",
      pending: "Pending",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Order Fulfillment</h1>
        <p className="text-gray-600">Central queue of all incoming orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-sm p-4">
        <label className="block text-sm font-bold text-secondary mb-3">Filter by Status</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                statusFilter === status ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary text-white">
              <th className="px-4 py-3 text-left text-sm font-bold">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Store</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Items</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Total</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-primary">{order.id}</td>
                <td className="px-4 py-3 text-sm">{order.storeName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{order.date}</td>
                <td className="px-4 py-3 text-sm">{order.items.length}</td>
                <td className="px-4 py-3 text-sm font-bold">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="btn-ghost text-xs flex items-center gap-1"
                  >
                    <Printer size={14} />
                    {expandedOrder === order.id ? "Hide" : "Slip"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded Order Details */}
      {expandedOrder && (
        <div className="card bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-secondary">Packing Slip - {expandedOrder}</h3>
            <button onClick={() => window.print()} className="btn-primary inline-flex items-center gap-2">
              <Printer size={16} />
              Print
            </button>
          </div>

          {orders
            .filter((o) => o.id === expandedOrder)
            .map((order) => (
              <div key={order.id} className="space-y-4">
                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs font-bold text-secondary">STORE</p>
                    <p className="font-bold">{order.storeName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary">ORDER ID</p>
                    <p className="font-bold text-primary">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary">DATE</p>
                    <p>{order.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary">TOTAL</p>
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-secondary mb-3">ITEMS</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm pb-2 border-b border-gray-300">
                        <span>{item.productId}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
