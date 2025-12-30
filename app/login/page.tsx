"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("retailer")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Mock authentication
    if (!email || !password) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      // Store auth info in localStorage for this demo
      localStorage.setItem("auth", JSON.stringify({ email, userType, isAuthenticated: true }))

      if (userType === "retailer") {
        router.push("/retailer/dashboard")
      } else {
        router.push("/admin/dashboard")
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold">
              B2B
            </div>
            <h1 className="text-2xl font-bold text-secondary">Wholesale OMS</h1>
          </div>

          <h2 className="text-2xl font-bold text-secondary mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-sm mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Account Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="retailer"
                    checked={userType === "retailer"}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Retailer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={userType === "admin"}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Admin</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-secondary mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-sm text-xs text-gray-600">
            <p className="font-bold mb-2">Demo Credentials:</p>
            <p>Email: demo@retailer.com | Password: demo123</p>
            <p>Email: admin@example.com | Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
