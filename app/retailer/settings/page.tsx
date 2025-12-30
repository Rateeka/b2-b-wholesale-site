"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    storeName: "Delhi Market - Toronto",
    email: "demo@retailer.com",
    phone: "+1 (416) 555-0123",
    address: "123 Bloor Street West",
    city: "Toronto",
    province: "ON",
    postalCode: "M4W 1A8",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Account Settings</h1>
        <p className="text-gray-600">Manage your store information</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-sm flex items-center gap-2">
          <CheckCircle size={18} />
          <p className="font-medium">Your settings have been saved successfully</p>
        </div>
      )}

      <div className="max-w-2xl">
        <div className="card">
          <h2 className="text-xl font-bold text-secondary mb-6">Store Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input w-full" />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="input w-full" />
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="input w-full"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={handleSave} className="btn-primary">
                Save Changes
              </button>
              <button className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Account Tier</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-secondary">Gold Tier</p>
              <p className="text-sm text-gray-600">5% discount on all products</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">GOLD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
