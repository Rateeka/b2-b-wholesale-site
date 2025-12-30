"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, ShoppingCart, AlertCircle } from "lucide-react"
import { orders, invoices, products } from "@/lib/mock-data"

export default function RetailerDashboard() {
  const [recentOrders, setRecentOrders] = useState([])
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeOrders: 0,
    lowStockAlerts: 0,
  })

  useEffect(() => {
    const recent = orders.slice(0, 3)
    setRecentOrders(recent)

    const totalSpent = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const activeOrders = orders.filter((o) => o.status === "processing" || o.status === "out_for_delivery").length
    const lowStockAlerts = products.filter((p) => p.status === "low_stock" || p.status === "out_of_stock").length

    setStats({ totalSpent, activeOrders, lowStockAlerts })
  }, [])

  const statCards = [
    { label: "Total Spent", value: `$${stats.totalSpent.toFixed(2)}`, icon: TrendingUp },
    { label: "Active Orders", value: stats.activeOrders, icon: ShoppingCart },
    { label: "Stock Alerts", value: stats.lowStockAlerts, icon: AlertCircle },
  ]

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
        <h1 className="text-3xl font-bold text-secondary mb-2">Welcome Back</h1>
        <p className="text-gray-600">Manage your orders and track inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-secondary mt-2">{stat.value}</p>
                </div>
                <Icon className="text-primary opacity-20" size={40} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-border rounded-sm p-6">
        <h2 className="text-xl font-bold text-secondary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/retailer/catalog" className="btn-primary w-full text-center">
            Browse Catalog
          </Link>
          <Link href="/retailer/orders" className="btn-secondary w-full text-center">
            View All Orders
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">Recent Orders</h2>
          <Link href="/retailer/orders" className="text-primary font-medium text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-4 py-3 text-left text-sm font-bold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Items</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Total</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{order.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} items</td>
                  <td className="px-4 py-3 text-sm font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
