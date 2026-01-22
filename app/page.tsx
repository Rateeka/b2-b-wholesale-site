"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, BarChart3, Zap } from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <>
      <header className="border-b border-border sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold">
              T
            </div>
            <h1 className="text-lg font-bold text-secondary">Teetoz</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="btn-ghost">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold text-secondary mb-6 text-balance">
                Streamlined Ordering for Indian Food Distribution
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Real-time inventory, tiered pricing, and order tracking for
                verified retailers across Canada. Bulk pricing, streamlined
                logistics, and analytics—all in one platform.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/register"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Get Started <ChevronRight size={18} />
                </Link>
                <Link href="/login" className="btn-secondary inline-block">
                  Existing Users
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-3xl font-bold text-secondary mb-16 text-center">
              Platform Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Quick Reorder",
                  desc: 'Reorder in 3 clicks with "Buy it Again" from your last invoices',
                },
                {
                  icon: Lock,
                  title: "Verified Access",
                  desc: "Secure authentication restricted to approved retailers",
                },
                {
                  icon: BarChart3,
                  title: "Live Inventory",
                  desc: "Real-time stock status with green/yellow/red indicators",
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="card">
                    <Icon className="text-primary mb-4" size={32} />
                    <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* For Retailers Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-secondary mb-6">
                  For Retailers
                </h3>
                <ul className="space-y-4">
                  {[
                    "Browse pricing instantly",
                    "Track orders in real-time",
                    "Access tiered discounts automatically",
                    "Manage bulk orders effortlessly",
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <span className="text-primary font-bold text-xl">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-100 h-80 rounded-sm flex items-center justify-center">
                <p className="text-gray-500">Retailer Dashboard Preview</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Admins Section */}
        <section className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-100 h-80 rounded-sm flex items-center justify-center order-2 md:order-1">
                <p className="text-gray-500">Admin Dashboard Preview</p>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-3xl font-bold text-secondary mb-6">
                  For Admins
                </h3>
                <ul className="space-y-4">
                  {[
                    "Manage inventory and pricing",
                    "Process orders from central queue",
                    "Track sales & revenue trends",
                    "Approve store accounts & credit limits",
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <span className="text-primary font-bold text-xl">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary text-white py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Operations?
            </h3>
            <p className="text-lg mb-8">
              Join verified retailers across Canada managing their orders
              efficiently.
            </p>
            <Link href="/register" className="btn-primary">
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-secondary mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-secondary mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-secondary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-secondary mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-primary">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact Sales
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-gray-600">
            <p>&copy; 2025 Teetoz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
