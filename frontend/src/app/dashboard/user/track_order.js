"use client"

import { useState } from "react"
import { ArrowLeft, Package, Clock, CheckCircle, Truck } from "lucide-react"

export default function TrackOrder({ onBack }) {
  const [phone, setPhone] = useState("")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!phone) {
      setError("Please enter your phone number")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:8000/api/orders/track-by-phone/${phone}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err.message || "Failed to track orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-orange-600" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 text-gray-700 hover:bg-gray-400 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Package className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Track Your Orders</h1>
            <p className="text-sm text-gray-800">Check the status of your orders</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white border rounded p-4 mb-6">
          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="flex-1">
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 text-black bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Tracking..." : "Track Orders"}
            </button>
          </form>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border rounded p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{order.item_name}</h3>
                    <p className="text-sm text-gray-800">Order ID: {order.id}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(order.order_status)}`}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-700">Quantity: {order.quantity}</p>
                    <p className="text-gray-700">Amount: ₹{order.total_price}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Order Time: {new Date(order.order_time).toLocaleString()}</p>
                    <p className="text-gray-700">Delivery: {order.estimated_delivery}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  {getStatusIcon(order.order_status)}
                  <p className="text-sm text-gray-800">
                    {order.order_status === "pending"
                      ? "Your order is being prepared"
                      : order.order_status === "shipped"
                        ? "Your order is on the way"
                        : "Your order has been delivered"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <p className="text-gray-800">No orders found. Enter your phone number to track your orders.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}