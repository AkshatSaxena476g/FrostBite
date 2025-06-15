"use client"

import { ArrowLeft, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Orders({ onBack }) {
  const router = useRouter()
  const [ordersData, setOrdersData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrdersData()
    const interval = setInterval(fetchOrdersData, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrdersData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/orders/list")
      if (!response.ok) throw new Error("Failed to fetch orders data")
      const data = await response.json()
      setOrdersData(data)
    } catch (err) {
      setError("Failed to load orders data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const formData = new FormData()
      formData.append("status", newStatus)

      const response = await fetch(`http://localhost:8000/api/orders/update-status/${orderId}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to update order status")
      }

      setOrdersData((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, order_status: newStatus } : order)),
      )
    } catch (err) {
      setError(err.message || "Failed to update order status")
    }
  }

  const handleDelete = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return

    try {
      const response = await fetch(`http://localhost:8000/api/orders/delete/${orderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to delete order")
      }

      setOrdersData((prev) => prev.filter((order) => order.id !== orderId))
    } catch (err) {
      setError(err.message || "Failed to delete order")
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
            <h1 className="text-xl font-semibold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-800">Track customer orders</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Customer Orders</h2>
          <p className="text-gray-800">Monitor order status and delivery</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}

        <div className="bg-white rounded border">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-gray-800 text-center">
                    Loading...
                  </td>
                </tr>
              ) : ordersData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-800">
                    No orders found
                  </td>
                </tr>
              ) : (
                ordersData.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{order.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.customer_name}</p>
                        <p className="text-sm text-gray-800">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm">
                      {order.item_name} x{order.quantity}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">₹{order.total_price}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 border rounded text-xs text-gray-900 bg-white"
                      >
                        <option value="pending" className="text-gray-900">
                          Pending
                        </option>
                        <option value="completed" className="text-gray-900">
                          Completed
                        </option>
                        <option value="shipped" className="text-gray-900">
                          Shipped
                        </option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm">
                      {new Date(order.order_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:bg-red-100 px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}