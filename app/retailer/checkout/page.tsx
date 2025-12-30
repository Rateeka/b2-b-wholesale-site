"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState("")

  const handlePlaceOrder = async () => {
    // Simulate order placement
    const newOrderId = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()
    setOrderId(newOrderId)
    setOrderPlaced(true)

    setTimeout(() => {
      router.push("/retailer/orders")
    }, 3000)
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your order <span className="font-bold text-primary">{orderId}</span> has been submitted for processing.
          </p>
          <p className="text-sm text-gray-500">Redirecting to orders page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Link href="/retailer/catalog" className="btn-ghost inline-flex items-center gap-2">
        <ArrowLeft size={18} />
        Back to Catalog
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-secondary">Checkout</h1>
        <p className="text-gray-600 mt-1">Review and confirm your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold text-secondary mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6 pb-6 border-b border-border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-secondary">Fresh Paneer (Case)</p>
                <p className="text-xs text-gray-500">SKU: PNR-001</p>
              </div>
              <div className="text-right">
                <p className="font-bold">10 × $81.00</p>
                <p className="text-sm text-gray-600">$810.00</p>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-secondary">Vegetable Samosa (Case)</p>
                <p className="text-xs text-gray-500">SKU: SAM-001</p>
              </div>
              <div className="text-right">
                <p className="font-bold">5 × $30.40</p>
                <p className="text-sm text-gray-600">$152.00</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">$962.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">$50.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (estimated)</span>
              <span className="font-medium">$131.04</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between">
              <span className="font-bold text-secondary">Total</span>
              <span className="text-2xl font-bold text-primary">$1,143.04</span>
            </div>
          </div>
        </div>

        {/* Order Details Form */}
        <div className="card">
          <h2 className="text-xl font-bold text-secondary mb-6">Order Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Delivery Address</label>
              <input type="text" defaultValue="Delhi Market - Toronto" disabled className="input w-full bg-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Preferred Delivery Date</label>
              <input type="date" className="input w-full" />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Special Instructions</label>
              <textarea placeholder="Any special handling instructions..." className="input w-full resize-none h-24" />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-sm text-xs text-blue-800">
              <p className="font-bold mb-1">Gold Tier Benefits</p>
              <p>5% discount applied to all products</p>
            </div>

            <button onClick={handlePlaceOrder} className="btn-primary w-full mt-6">
              Place Order
            </button>

            <button onClick={() => router.push("/retailer/catalog")} className="btn-secondary w-full">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
