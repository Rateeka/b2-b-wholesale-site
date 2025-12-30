"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessType: "",
    city: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.storeName || !formData.email || !formData.password || !formData.businessType || !formData.city) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem(
        "auth",
        JSON.stringify({ email: formData.email, userType: "retailer", isAuthenticated: true }),
      )
      router.push("/retailer/dashboard")
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold">
              B2B
            </div>
            <h1 className="text-2xl font-bold text-secondary">Wholesale OMS</h1>
          </div>

          <h2 className="text-2xl font-bold text-secondary mb-2">Register Your Store</h2>
          <p className="text-sm text-gray-600 mb-6">Join verified retailers across Canada</p>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-sm mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Store Name *</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                placeholder="Your Store Name"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Business Type *</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Select a type</option>
                <option value="grocery">Grocery Store</option>
                <option value="restaurant">Restaurant</option>
                <option value="caterer">Catering Service</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Your City"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="input w-full"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-6">
              {loading ? "Registering..." : "Register Store"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already registered?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
