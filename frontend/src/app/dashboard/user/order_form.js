"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"

export default function OrderForm({ onBack, initialCartItems = [] }) {
  const [customerName, setCustomerName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const finalPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
      return total + finalPrice * item.quantity
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (cartItems.length === 0) {
      setError("Please add items to your cart before placing order.")
      setLoading(false)
      return
    }

    try {
      const orderPromises = cartItems.map(async (item) => {
        const formData = new FormData()
        formData.append("item_id", item.id)
        formData.append("item_name", item.item_name)
        formData.append("quantity", item.quantity)
        formData.append("total_price", (item.price * item.quantity).toString())
        formData.append("customer_name", customerName)
        formData.append("customer_phone", phone)
        formData.append("delivery_address", address)

        const response = await fetch("http://localhost:8000/api/orders/add", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || "Failed to place order")
        }

        return response.json()
      })

      await Promise.all(orderPromises)

      setCustomerName("")
      setAddress("")
      setPhone("")
      setCartItems([])
      onBack()
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded border p-6">
          <div className="text-center mb-6">
            <ShoppingCart className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Your Order</h1>
            <p className="text-gray-800">Review your cart and complete your order</p>
          </div>

          {cartItems.length > 0 ? (
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => {
                const finalPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                      <div className="text-sm text-gray-800">
                        {item.discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="line-through text-gray-600">₹{item.price}</span>
                            <span>₹{finalPrice.toFixed(2)} each</span>
                            <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs">
                              {item.discount}% OFF
                            </span>
                          </div>
                        ) : (
                          <span>₹{item.price} each</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-900 font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-medium text-gray-900">₹{(finalPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}

              <div className="bg-gray-100 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-800">Your cart is empty.</p>
              <button onClick={onBack} className="mt-2 text-green-600 font-medium">
                Go back to add items
              </button>
            </div>
          )}

          {cartItems.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 text-black bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 text-black bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 text-black bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? "Placing Order..." : `Place Order - ₹${calculateTotal().toFixed(2)}`}
              </button>

              {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}
            </form>
          )}
        </div>

        {onBack && (
          <div className="text-center mt-4">
            <button onClick={onBack} className="text-green-600 font-medium">
              ← Back to Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}