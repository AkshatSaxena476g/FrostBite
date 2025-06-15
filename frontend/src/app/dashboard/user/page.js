"use client"

import { useState } from "react"
import { Store, MapPin, Star, ArrowLeft } from "lucide-react"
import OrderForm from "./order_form"
import InventoryView from "./view"
import TrackOrder from "./track_order"
import { useRouter } from "next/navigation"

export default function UserDashboard() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [showTrackOrder, setShowTrackOrder] = useState(false)

  const companies = [
    {
      id: "ice-cream-co",
      name: "Ice Cream Co.",
      description: "Premium handcrafted ice cream with natural ingredients",
      location: "Mumbai, Maharashtra",
      rating: 4.8,
      isActive: true,
    },
  ]

  const handleCompanyClick = (companyId) => {
    if (companyId === "ice-cream-co") {
      setCurrentPage("inventory")
    }
  }

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
  }

  const handleBack = () => {
    setShowTrackOrder(false)
  }

  if (currentPage === "inventory") {
    return <InventoryView onBack={handleBackToDashboard} />
  }

  if (currentPage === "order") {
    return <OrderForm onBack={handleBackToDashboard} />
  }

  if (showTrackOrder) {
    return <TrackOrder onBack={handleBack} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Ice Cream Marketplace</h1>
              <p className="text-sm text-gray-800">Choose from our partner companies</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Available Companies</h2>
          <p className="text-gray-800">Select a company to place your order</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => {
            const isClickable = company.id === "ice-cream-co"

            return (
              <div
                key={company.id}
                onClick={() => handleCompanyClick(company.id)}
                className={`bg-white border rounded p-6 ${
                  isClickable ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-60"
                }`}
              >
                <div
                  className={`${isClickable ? "bg-green-600" : "bg-gray-400"} w-12 h-12 rounded flex items-center justify-center mb-4`}
                >
                  <Store className="w-6 h-6 text-white" />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-800">{company.rating}</span>
                  </div>
                </div>

                <p className="text-gray-800 text-sm mb-4">{company.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-800">{company.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${company.isActive ? "text-green-600" : "text-gray-600"}`}>
                    {company.isActive ? "Available" : "Coming Soon"}
                  </span>
                  {isClickable && <div className="text-green-600 text-sm font-medium">View Products →</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <button onClick={() => setShowTrackOrder(true)} className="bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          Track Orders
        </button>
      </div>
    </div>
  )
}