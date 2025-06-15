"use client"

import { ArrowLeft, Package, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"
import OrderForm from "./order_form"

export default function InventoryView({ onBack }) {
  const [inventoryData, setInventoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartItems, setCartItems] = useState([])
  const [showOrderForm, setShowOrderForm] = useState(false)

  useEffect(() => {
    fetchInventoryData()
    const interval = setInterval(fetchInventoryData, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchInventoryData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/inventory/list")
      if (!response.ok) throw new Error("Failed to fetch inventory data")
      const data = await response.json()
      setInventoryData(data)
    } catch (err) {
      setError("Failed to load inventory data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        ),
      )
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
  }

  const handleGoToCart = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!")
      return
    }
    setShowOrderForm(true)
  }

  const handleBackFromOrder = () => {
    setShowOrderForm(false)
  }

  if (showOrderForm) {
    return <OrderForm onBack={handleBackFromOrder} initialCartItems={cartItems} />
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
            <h1 className="text-xl font-semibold text-gray-900">Ice Cream Co.</h1>
            <p className="text-sm text-gray-800">Available products</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Available Ice Cream</h2>
            <p className="text-gray-800 mt-1">Fresh products updated in real-time</p>
          </div>
          <button
            onClick={handleGoToCart}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart ({cartItems.length})
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}

        <div className="bg-white rounded border">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Item Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Add to Cart</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-gray-800 text-center">
                    Loading...
                  </td>
                </tr>
              ) : inventoryData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-800">
                    No items available
                  </td>
                </tr>
              ) : (
                inventoryData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.item_name}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {item.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-600">₹{item.price}</span>
                          <span className="font-semibold">₹{(item.price * (1 - item.discount / 100)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span>₹{item.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${item.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.stock > 0 ? `${item.stock} available` : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{item.tags}</td>
                    <td className="px-4 py-3">
                      {item.discount > 0 ? (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{item.discount}% OFF</span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stock === 0}
                        className={`px-3 py-1 rounded text-sm ${
                          item.stock > 0 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {item.stock > 0 ? "Add to Cart" : "Out of Stock"}
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