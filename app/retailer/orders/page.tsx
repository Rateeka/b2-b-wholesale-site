"use client"

import { useState } from "react"
import { orders } from "@/lib/mock-data"

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState(null)

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
        <h1 className="text-3xl font-bold text-secondary">Order History</h1>
        <p className="text-gray-600">Track and manage all your orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="cursor-pointer flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-bold text-secondary">{order.id}</h3>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="text-xs font-bold text-secondary">Date</p>
                    <p>{order.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary">Items</p>
                    <p>{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary">Total</p>
                    <p className="font-bold text-secondary">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary">Action</p>
                    <p className="text-primary font-medium text-xs">
                      {expandedOrder === order.id ? "Hide Details" : "View Details"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-bold text-secondary mb-4">Items in Order</h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.productId}</span>
                      <div className="text-right">
                        <span className="font-medium">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-500">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold">
                  <span className="text-secondary">Order Total</span>
                  <span className="text-primary text-lg">${order.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
