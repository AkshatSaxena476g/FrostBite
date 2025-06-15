"use client"

import { useState } from "react"
import { Package, FileText, Shield, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import Inventory from "./inventory"
import Orders from "./order"

export default function AdminDashboard() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState("dashboard")

  const dashboardOptions = [
    {
      id: "inventory",
      title: "Inventory",
      description: "Manage products and stock levels",
      icon: Package,
      color: "blue",
    },
    {
      id: "orders",
      title: "Track Orders",
      description: "Monitor and manage customer orders",
      icon: FileText,
      color: "green",
    },
  ]

  const handleCardClick = (optionId) => {
    setCurrentPage(optionId)
  }

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
  }

  if (currentPage === "inventory") {
    return <Inventory onBack={handleBackToDashboard} />
  }

  if (currentPage === "orders") {
    return <Orders onBack={handleBackToDashboard} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-800">Manage your business operations</p>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back, Admin</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardOptions.map((option) => {
            const IconComponent = option.icon
            const bgColor = option.color === "blue" ? "bg-blue-600" : "bg-green-600"

            return (
              <div
                key={option.id}
                onClick={() => handleCardClick(option.id)}
                className="bg-white border rounded p-6 cursor-pointer hover:shadow-md"
              >
                <div className={`${bgColor} w-12 h-12 rounded flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-800 text-sm mb-4">{option.description}</p>

                <div className="text-blue-600 text-sm font-medium">Access {option.title} →</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}