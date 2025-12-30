"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Package, DollarSign } from "lucide-react"
import { orders } from "@/lib/mock-data"

export default function AdminDashboard() {
  const salesData = [
    { month: "Jan", revenue: 15000, orders: 24 },
    { month: "Feb", revenue: 18500, orders: 28 },
    { month: "Mar", revenue: 22000, orders: 35 },
    { month: "Apr", revenue: 19500, orders: 31 },
    { month: "May", revenue: 24000, orders: 40 },
    { month: "Jun", revenue: 28500, orders: 45 },
  ]

  const categoryData = [
    { name: "Dairy", value: 35 },
    { name: "Snacks", value: 25 },
    { name: "Grains", value: 20 },
    { name: "Breads", value: 12 },
    { name: "Beverages", value: 8 },
  ]

  const COLORS = ["#D35400", "#2C3E50", "#27AE60", "#F39C12", "#E74C3C"]

  const stats = [
    { label: "Total Revenue", value: "$165,500", change: "+12.5%", icon: DollarSign },
    { label: "Orders This Month", value: "145", change: "+8.2%", icon: TrendingUp },
    { label: "Active Stores", value: "3", change: "+1", icon: Users },
    { label: "Products in Stock", value: "6", change: "-1", icon: Package },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of platform operations and sales metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-secondary mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <Icon className="text-primary opacity-20" size={40} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold text-secondary mb-6">Revenue Trend (6 months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="month" stroke="#2C3E50" />
              <YAxis stroke="#2C3E50" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#D35400" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-secondary mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-secondary mb-6">Orders Per Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="month" stroke="#2C3E50" />
            <YAxis stroke="#2C3E50" />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#D35400" name="Order Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-secondary mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-4 py-3 text-left text-sm font-bold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Store</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{order.id}</td>
                  <td className="px-4 py-3 text-sm">{order.storeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.date}</td>
                  <td className="px-4 py-3 text-sm font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${order.status === "delivered" ? "status-green" : "status-yellow"}`}>
                      {order.status === "delivered" ? "Delivered" : "In Transit"}
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
