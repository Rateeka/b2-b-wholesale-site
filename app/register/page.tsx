"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp, createStore } from "@/lib/auth"
import type { StoreType } from "@/lib/types"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    storeName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessType: "" as StoreType | "",
    city: "",
    phone: "",
    address: "",
    province: "",
    postalCode: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validation
      if (!formData.storeName || !formData.fullName || !formData.email || !formData.password || !formData.businessType || !formData.city) {
        throw new Error("Please fill in all required fields")
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Create user account
      console.log('[REGISTER PAGE] Calling signUp...')
      const { user, session } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone || undefined,
      })
      console.log('[REGISTER PAGE] signUp completed:', { 
        hasUser: !!user, 
        hasSession: !!session,
        userId: user?.id 
      })

      // If session exists, user is auto-confirmed (email confirmation disabled)
      if (session) {
        console.log('[REGISTER PAGE] Session exists, redirecting to dashboard...')
        router.refresh()
        window.location.href = "/retailer/dashboard"
      } else {
        console.log('[REGISTER PAGE] No session, email confirmation required')
        // Email confirmation is enabled
        alert('Registration successful! Please check your email to confirm your account.')
        router.push("/login")
      }
    } catch (err: any) {
      setError(err.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold">
              T
            </div>
            <h1 className="text-2xl font-bold text-secondary">Teetoz</h1>
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="input w-full"
                required
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Business Type *</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="">Select a type</option>
                <option value="grocery_store">Grocery Store</option>
                <option value="restaurant">Restaurant</option>
                <option value="distributor">Distributor</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Toronto"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St"
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="ON"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="M5V 3A8"
                  className="input w-full"
                />
              </div>
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
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
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
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-6">
              {loading ? "Creating Account..." : "Register Store"}
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
