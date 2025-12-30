"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LogOut, Menu, X } from "lucide-react"

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    if (!auth || JSON.parse(auth).userType !== "admin") {
      router.push("/login")
      return
    }
    setUser(JSON.parse(auth))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("auth")
    router.push("/")
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Inventory", href: "/admin/inventory" },
    { label: "Stores", href: "/admin/stores" },
    { label: "Reports", href: "/admin/reports" },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold text-sm">
                B2B
              </div>
              <span className="font-bold text-secondary text-lg">Admin</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary flex items-center gap-2" title="Sign out">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <button className="md:hidden btn-ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-6 py-3 border-b border-border text-sm font-medium hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>
    </div>
  )
}
