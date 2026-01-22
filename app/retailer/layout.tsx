"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { LogOut, Menu, X } from "lucide-react"
import { signOut } from "@/lib/auth"
import { UserProvider, useUser } from "@/hooks/use-user"

function RetailerLayoutContent({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, store, isLoading: loading } = useUser()

  const handleLogout = async () => {
    try {
      console.log('[RETAILER LAYOUT] Logging out...')
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error('[RETAILER LAYOUT] Logout error:', error)
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/retailer/dashboard" },
    { label: "Catalog", href: "/retailer/catalog" },
    { label: "Orders", href: "/retailer/orders" },
    { label: "Settings", href: "/retailer/settings" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold text-sm">
                T
              </div>
              <span className="font-bold text-secondary text-lg">Teetoz</span>
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

export default function RetailerLayout({ children }) {
  return (
    <UserProvider>
      <RetailerLayoutContent>{children}</RetailerLayoutContent>
    </UserProvider>
  )
}
