"use client"

import { useState, useEffect } from "react"
import { Package, ArrowLeft } from "lucide-react"

export default function InventoryForm({ onBack, itemId }) {
  const isEditMode = !!itemId
  const [itemName, setItemName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [tags, setTags] = useState("")
  const [discount, setDiscount] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isEditMode) {
      fetchItemData()
    }
  }, [itemId])

  const fetchItemData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/inventory/list`)
      if (!response.ok) throw new Error("Failed to fetch item data")
      const data = await response.json()
      const item = data.find((i) => i.id === itemId)
      if (item) {
        setItemName(item.item_name)
        setPrice(item.price.toString())
        setStock(item.stock.toString())
        setTags(item.tags || "")
        setDiscount(item.discount?.toString() || "")
      }
    } catch (err) {
      setError("Failed to load item data")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult("")
    setError("")

    try {
      const formData = new FormData()
      formData.append("itemName", itemName)
      formData.append("price", price)
      formData.append("stock", stock)
      formData.append("tags", tags)
      formData.append("discount", discount)

      const url = isEditMode
        ? `http://localhost:8000/api/inventory/update/${itemId}`
        : "http://localhost:8000/api/inventory/add"

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(isEditMode ? "Item updated successfully!" : "Item added successfully!")
        setTimeout(() => onBack(), 1500)
      } else {
        setError(data.detail || `Failed to ${isEditMode ? "update" : "add"} item`)
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">{isEditMode ? "Edit Item" : "Add New Item"}</h1>
            </div>
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500"
                placeholder="Comma separated"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Processing..." : isEditMode ? "Update Item" : "Add Item"}
            </button>

            {result && <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700">{result}</div>}

            {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}