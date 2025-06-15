"use client"

import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import InventoryForm from "./inventory_form"

export default function Inventory({ onBack }) {
  const router = useRouter()
  const [inventoryData, setInventoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    if (!showForm) {
      fetchInventoryData()
    }
  }, [showForm])

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

  const handleAddNewItem = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      const response = await fetch(`http://localhost:8000/api/inventory/delete/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete item")
      await fetchInventoryData()
    } catch (err) {
      setError("Failed to delete item")
    }
  }

  const handleEdit = (id) => {
    setEditingItem(id)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  if (showForm) {
    return <InventoryForm onBack={handleFormClose} itemId={editingItem} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 text-gray-700 hover:bg-gray-400 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Package className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-800">Manage your products</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
          <button
            onClick={handleAddNewItem}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}

        <div className="bg-white rounded border">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
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
                    No items found
                  </td>
                </tr>
              ) : (
                inventoryData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.item_name}</td>
                    <td className="px-4 py-3 text-gray-900">₹{item.price}</td>
                    <td className="px-4 py-3 text-gray-900">{item.stock}</td>
                    <td className="px-4 py-3 text-gray-900">{item.tags}</td>
                    <td className="px-4 py-3 text-gray-900">{item.discount}%</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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