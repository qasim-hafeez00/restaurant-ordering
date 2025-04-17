"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { AlertCircle, CheckCircle, Edit, Plus, Trash2, Save, X, RefreshCw, FileJson, ImageIcon } from "lucide-react"

// Define the menu item interface
interface MenuItem {
  "Item Name": string
  "Price (Rs.)": number
  Description: string
  Category: string
}

// Define the restaurant menu interface
interface RestaurantMenu {
  [category: string]: MenuItem[]
}

// Default restaurants data to use as fallback
const DEFAULT_RESTAURANTS = {
  "Layers Bakeshop": "layers_bakeshop_menu.json",
  KFC: "kfc_menu.json",
  "Tariq Pulao": "tariq_pulao_menu.json",
  "Roll Bar": "rollbar_menu.json",
  "Bannu Pulao": "bannu_pulao_menu.json",
  "Cold Drinks": "coldrinks_menu.json",
  "K2 Ras & Ginger Grill": "k2_menu.json",
  "Ahmed Balochi Sajji": "balochi_sajji_menu.json",
  Brillo: "brillo_menu.json",
  "Dr. Saucy": "dr_saucy_menu.json",
  Ranchers: "ranchers_menu.json",
}

export default function RestaurantManagement() {
  // State for restaurants and their menus
  const [restaurants, setRestaurants] = useState<Record<string, string>>(DEFAULT_RESTAURANTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // New restaurant form state
  const [newRestaurantName, setNewRestaurantName] = useState("")
  const [newRestaurantMenuFile, setNewRestaurantMenuFile] = useState("")
  const [newRestaurantLogo, setNewRestaurantLogo] = useState("")
  const [isAddingRestaurant, setIsAddingRestaurant] = useState(false)
  const [restaurantNameError, setRestaurantNameError] = useState("")
  const [menuFileError, setMenuFileError] = useState("")
  const [logoError, setLogoError] = useState("")

  // Edit restaurant state
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(null)
  const [editedRestaurantName, setEditedRestaurantName] = useState("")
  const [editedRestaurantMenuFile, setEditedRestaurantMenuFile] = useState("")
  const [editedRestaurantLogo, setEditedRestaurantLogo] = useState("")

  // Menu management state
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [currentMenu, setCurrentMenu] = useState<RestaurantMenu | null>(null)
  const [menuLoading, setMenuLoading] = useState(false)
  const [isSavingMenu, setIsSavingMenu] = useState(false)

  // New category form state
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categoryNameError, setcategoryNameError] = useState("")

  // New menu item form state
  const [showNewItemForm, setShowNewItemForm] = useState(false)
  const [newItemCategory, setNewItemCategory] = useState("")
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [itemFormErrors, setItemFormErrors] = useState<Record<string, string>>({})

  // Edit menu item state
  const [editingItem, setEditingItem] = useState<{
    category: string
    index: number
    item: MenuItem
  } | null>(null)

  // Restaurant logos mapping
  const [logoMap, setLogoMap] = useState<Record<string, string>>({
    "Layers Bakeshop": "/images/layers-bakeshop-logo.png",
    KFC: "/images/kfc-logo.png",
    "Tariq Pulao": "/images/tariq-pulao-logo.png",
    "Roll Bar": "/images/rollbar-logo.png",
    "Bannu Pulao": "/images/bannu-pulao-logo.png",
    "Cold Drinks": "/images/coldrinks-logo.png",
    "K2 Ras & Ginger Grill": "/images/k2-logo.png",
    "Ahmed Balochi Sajji": "/images/balochi-sajji-logo.png",
    Brillo: "/images/brillo-logo.png",
    "Dr. Saucy": "/images/dr-saucy-logo.png",
    Ranchers: "/images/ranchers-logo.png",
  })

  // Generate a proper menu file name from restaurant name
  const generateMenuFileName = (restaurantName: string) => {
    return `${restaurantName.toLowerCase().replace(/\s+/g, "_")}_menu.json`
  }

  // Validate restaurant name
  const validateRestaurantName = (name: string): boolean => {
    if (!name.trim()) {
      setRestaurantNameError("Restaurant name is required")
      return false
    }

    if (name.trim().length < 3) {
      setRestaurantNameError("Restaurant name must be at least 3 characters")
      return false
    }

    if (restaurants[name] && !editingRestaurant) {
      setRestaurantNameError("A restaurant with this name already exists")
      return false
    }

    setRestaurantNameError("")
    return true
  }

  // Validate menu file name
  const validateMenuFileName = (fileName: string): boolean => {
    if (!fileName.trim()) {
      // If empty, we'll generate one automatically
      return true
    }

    if (!fileName.endsWith(".json")) {
      setMenuFileError("Menu file name must end with .json")
      return false
    }

    const fileNameWithoutExt = fileName.replace(/\.json$/, "")
    if (!/^[a-z0-9_-]+$/i.test(fileNameWithoutExt)) {
      setMenuFileError("Menu file name can only contain letters, numbers, underscores, and hyphens")
      return false
    }

    setMenuFileError("")
    return true
  }

  // Validate logo URL
  const validateLogoURL = (url: string): boolean => {
    if (!url.trim()) {
      // Logo is optional
      return true
    }

    if (!url.startsWith("/images/") && !url.startsWith("http")) {
      setLogoError("Logo URL must start with /images/ or http")
      return false
    }

    setLogoError("")
    return true
  }

  // Validate category name
  const validateCategoryName = (name: string): boolean => {
    if (!name.trim()) {
      setcategoryNameError("Category name is required")
      return false
    }

    if (currentMenu && currentMenu[name]) {
      setcategoryNameError("A category with this name already exists")
      return false
    }

    setcategoryNameError("")
    return true
  }

  // Validate menu item form
  const validateMenuItemForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!newItemCategory.trim()) {
      errors.category = "Category is required"
    }

    if (!newItemName.trim()) {
      errors.name = "Item name is required"
    } else if (
      currentMenu &&
      currentMenu[newItemCategory] &&
      currentMenu[newItemCategory].some(
        (item) =>
          item["Item Name"].toLowerCase() === newItemName.toLowerCase() &&
          (!editingItem || editingItem.item["Item Name"].toLowerCase() !== newItemName.toLowerCase()),
      )
    ) {
      errors.name = "An item with this name already exists in this category"
    }

    if (!newItemPrice.trim()) {
      errors.price = "Price is required"
    } else {
      const price = Number.parseFloat(newItemPrice)
      if (isNaN(price) || price <= 0) {
        errors.price = "Price must be a positive number"
      }
    }

    if (!newItemDescription.trim()) {
      errors.description = "Description is required"
    }

    setItemFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Reset and initialize restaurants in KV database
  const resetRestaurants = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccessMessage("Resetting restaurants... Please wait.")

      console.log("Calling reset-restaurants API...")
      const response = await fetch("/api/admin/reset-restaurants")

      if (!response.ok) {
        throw new Error(`Failed to reset restaurants: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log("Reset successful:", data)
        setRestaurants(data.restaurants || DEFAULT_RESTAURANTS)
        setSuccessMessage("Restaurants have been reset and initialized successfully!")
      } else {
        throw new Error(data.message || "Failed to reset restaurants")
      }
    } catch (error) {
      console.error("Error resetting restaurants:", error)
      setError(`Failed to reset restaurants: ${error instanceof Error ? error.message : String(error)}`)
      // Use default restaurants as fallback
      setRestaurants(DEFAULT_RESTAURANTS)
    } finally {
      setLoading(false)
    }
  }

  // Fetch restaurants from API
  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Fetching restaurants from API...")
      const response = await fetch("/api/admin/restaurants")

      if (!response.ok) {
        throw new Error(`Failed to fetch restaurants: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      if (data.success && data.restaurants && Object.keys(data.restaurants).length > 0) {
        console.log("Restaurants found:", data.restaurants)
        setRestaurants(data.restaurants)
      } else {
        console.log("No restaurants found in API response, using default restaurants")
        setRestaurants(DEFAULT_RESTAURANTS)
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error)
      setError(`Failed to load restaurants from API: ${error instanceof Error ? error.message : String(error)}`)
      // Use default restaurants as fallback
      setRestaurants(DEFAULT_RESTAURANTS)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch a restaurant menu
  const fetchMenu = async (restaurantName: string) => {
    try {
      setMenuLoading(true)
      setError("")
      setSuccessMessage("")

      console.log(`Fetching menu for ${restaurantName}...`)

      // First try the admin API endpoint
      const response = await fetch(`/api/admin/menu?restaurant=${encodeURIComponent(restaurantName)}&t=${Date.now()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch menu: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.menu) {
        console.log("Menu found in admin API:", data.menu)
        setCurrentMenu(data.menu)
        setSelectedRestaurant(restaurantName)
      } else {
        // If no menu found, create an empty one
        console.log("No menu found, creating empty menu")
        setCurrentMenu({})
        setSelectedRestaurant(restaurantName)
      }
    } catch (error) {
      console.error("Error fetching menu:", error)
      setError(`Failed to load menu: ${error instanceof Error ? error.message : String(error)}`)
      // Create an empty menu on error
      setCurrentMenu({})
      setSelectedRestaurant(restaurantName)
    } finally {
      setMenuLoading(false)
    }
  }

  // Add a new restaurant
  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Reset errors
      setRestaurantNameError("")
      setMenuFileError("")
      setLogoError("")
      setError("")

      // Validate inputs
      const isNameValid = validateRestaurantName(newRestaurantName)
      const isMenuFileValid = validateMenuFileName(newRestaurantMenuFile)
      const isLogoValid = validateLogoURL(newRestaurantLogo)

      if (!isNameValid || !isMenuFileValid || !isLogoValid) {
        return
      }

      setIsAddingRestaurant(true)
      setSuccessMessage("")

      // If menu file is empty, generate one based on the restaurant name
      let menuFile = newRestaurantMenuFile
      if (!menuFile) {
        menuFile = generateMenuFileName(newRestaurantName)
      }

      // Validate menu file format
      if (!menuFile.endsWith(".json")) {
        menuFile = `${menuFile}.json`
      }

      console.log(`Adding restaurant: ${newRestaurantName} with menu file: ${menuFile}`)

      // Use the dedicated add-restaurant endpoint
      const response = await fetch("/api/admin/add-restaurant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRestaurantName,
          menuFile,
          logoUrl: newRestaurantLogo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Server responded with status: ${response.status}`)
      }

      if (data.success) {
        setSuccessMessage(data.message)
        setRestaurants((prev) => ({
          ...prev,
          [newRestaurantName]: menuFile,
        }))

        // Update logo map if a logo was provided
        if (newRestaurantLogo) {
          setLogoMap((prev) => ({
            ...prev,
            [newRestaurantName]: newRestaurantLogo,
          }))
        }

        setNewRestaurantName("")
        setNewRestaurantMenuFile("")
        setNewRestaurantLogo("")
      } else {
        throw new Error(data.message || "Failed to add restaurant")
      }
    } catch (error) {
      console.error("Error adding restaurant:", error)
      setError(`Failed to add restaurant: ${error instanceof Error ? error.message : String(error)}`)

      // Add restaurant locally even if API fails
      const menuFile = newRestaurantMenuFile || generateMenuFileName(newRestaurantName)
      setRestaurants((prev) => ({
        ...prev,
        [newRestaurantName]: menuFile,
      }))

      if (newRestaurantLogo) {
        setLogoMap((prev) => ({
          ...prev,
          [newRestaurantName]: newRestaurantLogo,
        }))
      }

      setNewRestaurantName("")
      setNewRestaurantMenuFile("")
      setNewRestaurantLogo("")
    } finally {
      setIsAddingRestaurant(false)
    }
  }

  // Update a restaurant
  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingRestaurant) return

    try {
      // Reset errors
      setRestaurantNameError("")
      setMenuFileError("")
      setLogoError("")
      setError("")

      // Validate inputs
      const isNameValid = validateRestaurantName(editedRestaurantName)
      const isMenuFileValid = validateMenuFileName(editedRestaurantMenuFile)
      const isLogoValid = validateLogoURL(editedRestaurantLogo)

      if (!isNameValid || !isMenuFileValid || !isLogoValid) {
        return
      }

      setIsAddingRestaurant(true)
      setSuccessMessage("")

      // If menu file is empty, generate one based on the restaurant name
      let menuFile = editedRestaurantMenuFile
      if (!menuFile) {
        menuFile = generateMenuFileName(editedRestaurantName)
      }

      // Validate menu file format
      if (!menuFile.endsWith(".json")) {
        menuFile = `${menuFile}.json`
      }

      console.log(`Updating restaurant: ${editingRestaurant} to ${editedRestaurantName} with menu file: ${menuFile}`)

      // First delete the old restaurant
      const deleteResponse = await fetch("/api/admin/restaurants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingRestaurant }),
      })

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete old restaurant: ${deleteResponse.status}`)
      }

      // Then add the new one
      const response = await fetch("/api/admin/add-restaurant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedRestaurantName,
          menuFile,
          logoUrl: editedRestaurantLogo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Server responded with status: ${response.status}`)
      }

      if (data.success) {
        setSuccessMessage(`Restaurant "${editingRestaurant}" has been updated to "${editedRestaurantName}"`)

        // Update local state
        const updatedRestaurants = { ...restaurants }
        delete updatedRestaurants[editingRestaurant]
        updatedRestaurants[editedRestaurantName] = menuFile
        setRestaurants(updatedRestaurants)

        // Update logo map if a logo was provided
        if (editedRestaurantLogo) {
          const updatedLogoMap = { ...logoMap }
          delete updatedLogoMap[editingRestaurant]
          updatedLogoMap[editedRestaurantName] = editedRestaurantLogo
          setLogoMap(updatedLogoMap)
        }

        setEditingRestaurant(null)
        setEditedRestaurantName("")
        setEditedRestaurantMenuFile("")
        setEditedRestaurantLogo("")
      } else {
        throw new Error(data.message || "Failed to update restaurant")
      }
    } catch (error) {
      console.error("Error updating restaurant:", error)
      setError(`Failed to update restaurant: ${error instanceof Error ? error.message : String(error)}`)

      // Update restaurant locally even if API fails
      const updatedRestaurants = { ...restaurants }
      delete updatedRestaurants[editingRestaurant]
      updatedRestaurants[editedRestaurantName] = editedRestaurantMenuFile || generateMenuFileName(editedRestaurantName)
      setRestaurants(updatedRestaurants)

      if (editedRestaurantLogo) {
        const updatedLogoMap = { ...logoMap }
        delete updatedLogoMap[editingRestaurant]
        updatedLogoMap[editedRestaurantName] = editedRestaurantLogo
        setLogoMap(updatedLogoMap)
      }

      setEditingRestaurant(null)
      setEditedRestaurantName("")
      setEditedRestaurantMenuFile("")
      setEditedRestaurantLogo("")
    } finally {
      setIsAddingRestaurant(false)
    }
  }

  // Delete a restaurant
  const handleDeleteRestaurant = async (name: string) => {
    if (!confirm(`Are you sure you want to delete restaurant "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccessMessage("")

      console.log(`Deleting restaurant: ${name}`)

      const response = await fetch("/api/admin/restaurants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete restaurant: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setSuccessMessage(data.message)

        // Update local state
        const updatedRestaurants = { ...restaurants }
        delete updatedRestaurants[name]
        setRestaurants(updatedRestaurants)

        if (selectedRestaurant === name) {
          setSelectedRestaurant(null)
          setCurrentMenu(null)
        }
      } else {
        throw new Error(data.message || "Failed to delete restaurant")
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error)
      setError(`Failed to delete restaurant: ${error instanceof Error ? error.message : String(error)}`)

      // Update local state even if API fails
      const updatedRestaurants = { ...restaurants }
      delete updatedRestaurants[name]
      setRestaurants(updatedRestaurants)

      if (selectedRestaurant === name) {
        setSelectedRestaurant(null)
        setCurrentMenu(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Add a new category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRestaurant || !currentMenu) return

    try {
      // Validate category name
      if (!validateCategoryName(newCategoryName)) {
        return
      }

      // Create a copy of the current menu
      const updatedMenu = { ...currentMenu }

      // Add the new category
      updatedMenu[newCategoryName] = []

      // Update the menu
      setCurrentMenu(updatedMenu)
      setSuccessMessage(`Category "${newCategoryName}" has been added`)

      // Clear form
      setNewCategoryName("")
      setShowNewCategoryForm(false)

      // Save the menu to the server
      saveMenu(updatedMenu)
    } catch (error) {
      console.error("Error adding category:", error)
      setError(`Failed to add category: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Save the entire menu
  const saveMenu = async (menuToSave = currentMenu) => {
    if (!selectedRestaurant || !menuToSave) return

    try {
      setIsSavingMenu(true)
      setError("")
      setSuccessMessage("")

      console.log(`Saving menu for ${selectedRestaurant}:`, menuToSave)

      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantName: selectedRestaurant,
          menu: menuToSave,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save menu: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setSuccessMessage(`Menu for "${selectedRestaurant}" has been saved successfully`)
      } else {
        throw new Error(data.message || "Failed to save menu")
      }
    } catch (error) {
      console.error("Error saving menu:", error)
      setError(`Failed to save menu: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSavingMenu(false)
    }
  }

  // Add a new menu item
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRestaurant || !currentMenu) return

    try {
      setError("")

      // Validate form
      if (!validateMenuItemForm()) {
        return
      }

      // Create a copy of the current menu
      const updatedMenu = { ...currentMenu }

      // Create the new item
      const newItem: MenuItem = {
        "Item Name": newItemName,
        "Price (Rs.)": Number.parseFloat(newItemPrice),
        Description: newItemDescription,
        Category: newItemCategory,
      }

      // Add the item to the category
      if (!updatedMenu[newItemCategory]) {
        updatedMenu[newItemCategory] = []
      }
      updatedMenu[newItemCategory].push(newItem)

      // Update the menu
      setCurrentMenu(updatedMenu)
      setSuccessMessage(`Item "${newItemName}" has been added to category "${newItemCategory}"`)

      // Clear form
      setNewItemCategory("")
      setNewItemName("")
      setNewItemPrice("")
      setNewItemDescription("")
      setShowNewItemForm(false)
      setItemFormErrors({})

      // Save the menu to the server
      saveMenu(updatedMenu)
    } catch (error) {
      console.error("Error adding menu item:", error)
      setError(`Failed to add menu item: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Update a menu item
  const handleUpdateMenuItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRestaurant || !currentMenu || !editingItem) return

    try {
      setError("")

      // Validate form
      if (!validateMenuItemForm()) {
        return
      }

      // Create a copy of the current menu
      const updatedMenu = { ...currentMenu }

      // Remove the item from its original category
      const originalCategory = editingItem.category
      if (updatedMenu[originalCategory]) {
        updatedMenu[originalCategory] = updatedMenu[originalCategory].filter(
          (item) => item["Item Name"] !== editingItem.item["Item Name"],
        )
      }

      // If the original category is now empty, remove it
      if (updatedMenu[originalCategory] && updatedMenu[originalCategory].length === 0) {
        delete updatedMenu[originalCategory]
      }

      // Create the updated item
      const updatedItem: MenuItem = {
        "Item Name": newItemName,
        "Price (Rs.)": Number.parseFloat(newItemPrice),
        Description: newItemDescription,
        Category: newItemCategory,
      }

      // Add the item to its new category
      if (!updatedMenu[newItemCategory]) {
        updatedMenu[newItemCategory] = []
      }
      updatedMenu[newItemCategory].push(updatedItem)

      // Update the menu
      setCurrentMenu(updatedMenu)
      setSuccessMessage(`Item "${updatedItem["Item Name"]}" has been updated`)

      // Clear form
      setEditingItem(null)
      setNewItemCategory("")
      setNewItemName("")
      setNewItemPrice("")
      setNewItemDescription("")
      setItemFormErrors({})

      // Save the menu to the server
      saveMenu(updatedMenu)
    } catch (error) {
      console.error("Error updating menu item:", error)
      setError(`Failed to update menu item: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Delete a menu item
  const handleDeleteMenuItem = (category: string, itemName: string) => {
    if (!selectedRestaurant || !currentMenu) return

    if (
      !confirm(
        `Are you sure you want to delete item "${itemName}" from category "${category}"? This action cannot be undone.`,
      )
    ) {
      return
    }

    try {
      setError("")

      // Create a copy of the current menu
      const updatedMenu = { ...currentMenu }

      // Remove the item from the category
      if (updatedMenu[category]) {
        updatedMenu[category] = updatedMenu[category].filter((item) => item["Item Name"] !== itemName)

        // If the category is now empty, remove it
        if (updatedMenu[category].length === 0) {
          delete updatedMenu[category]
        }

        // Update the menu
        setCurrentMenu(updatedMenu)
        setSuccessMessage(`Item "${itemName}" has been deleted from category "${category}"`)

        // Save the menu to the server
        saveMenu(updatedMenu)
      }
    } catch (error) {
      console.error("Error deleting menu item:", error)
      setError(`Failed to delete menu item: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Delete a category
  const handleDeleteCategory = (category: string) => {
    if (!selectedRestaurant || !currentMenu) return

    if (
      !confirm(
        `Are you sure you want to delete category "${category}" and all its items? This action cannot be undone.`,
      )
    ) {
      return
    }

    try {
      setError("")

      // Create a copy of the current menu
      const updatedMenu = { ...currentMenu }

      // Remove the category
      if (updatedMenu[category]) {
        delete updatedMenu[category]

        // Update the menu
        setCurrentMenu(updatedMenu)
        setSuccessMessage(`Category "${category}" has been deleted`)

        // Save the menu to the server
        saveMenu(updatedMenu)
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      setError(`Failed to delete category: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Start editing a restaurant
  const startEditingRestaurant = (name: string, menuFile: string) => {
    setEditingRestaurant(name)
    setEditedRestaurantName(name)
    setEditedRestaurantMenuFile(menuFile)
    setEditedRestaurantLogo(logoMap[name] || "")
    setRestaurantNameError("")
    setMenuFileError("")
    setLogoError("")
  }

  // Cancel editing a restaurant
  const cancelEditingRestaurant = () => {
    setEditingRestaurant(null)
    setEditedRestaurantName("")
    setEditedRestaurantMenuFile("")
    setEditedRestaurantLogo("")
    setRestaurantNameError("")
    setMenuFileError("")
    setLogoError("")
  }

  // Start editing a menu item
  const startEditingMenuItem = (category: string, index: number, item: MenuItem) => {
    setEditingItem({ category, index, item })
    setNewItemCategory(item.Category)
    setNewItemName(item["Item Name"])
    setNewItemPrice(item["Price (Rs.)"].toString())
    setNewItemDescription(item.Description)
    setItemFormErrors({})
  }

  // Cancel editing a menu item
  const cancelEditingMenuItem = () => {
    setEditingItem(null)
    setNewItemCategory("")
    setNewItemName("")
    setNewItemPrice("")
    setNewItemDescription("")
    setItemFormErrors({})
  }

  // Refresh restaurants
  const handleRefreshRestaurants = () => {
    resetRestaurants()
  }

  // Initialize on component mount
  useEffect(() => {
    console.log("Restaurant Management component mounted")
    // Start with default restaurants to ensure we have data
    setRestaurants(DEFAULT_RESTAURANTS)
    // Then try to fetch from API
    fetchRestaurants()
  }, [fetchRestaurants])

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Restaurant Management</h2>
        <button
          onClick={handleRefreshRestaurants}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          title="Reset restaurants"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{successMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Restaurants</h3>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {Object.entries(restaurants).length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {Object.entries(restaurants).map(([name, menuFile]) => (
                    <div key={name} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <h4 className="font-medium">{name}</h4>
                          {!menuFile && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">New</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingRestaurant(name, menuFile)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit restaurant"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRestaurant(name)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete restaurant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FileJson className="h-4 w-4 mr-1" />
                        <span>{menuFile || "Not set"}</span>
                      </div>
                      {logoMap[name] && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <ImageIcon className="h-4 w-4 mr-1" />
                          <span>{logoMap[name]}</span>
                        </div>
                      )}
                      <button
                        onClick={() => fetchMenu(name)}
                        className={`text-sm ${
                          selectedRestaurant === name
                            ? "bg-blue-700 hover:bg-blue-800"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white px-3 py-1 rounded transition-colors`}
                      >
                        {selectedRestaurant === name ? "Currently Managing" : "Manage Menu"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 border rounded-md">
                  <p>No restaurants found. Add a restaurant to get started.</p>
                </div>
              )}

              {/* Add Restaurant Form */}
              {!editingRestaurant && (
                <form onSubmit={handleAddRestaurant} className="mt-6 border-t pt-4">
                  <h4 className="font-medium mb-3">Add New Restaurant</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="newRestaurantName" className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="newRestaurantName"
                        value={newRestaurantName}
                        onChange={(e) => {
                          setNewRestaurantName(e.target.value)
                          if (restaurantNameError) validateRestaurantName(e.target.value)
                        }}
                        className={`w-full px-3 py-2 border ${
                          restaurantNameError ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                      />
                      {restaurantNameError && <p className="text-red-500 text-xs mt-1">{restaurantNameError}</p>}
                    </div>
                    <div>
                      <label htmlFor="newRestaurantMenuFile" className="block text-sm font-medium text-gray-700 mb-1">
                        Menu File Name
                      </label>
                      <input
                        type="text"
                        id="newRestaurantMenuFile"
                        value={newRestaurantMenuFile}
                        onChange={(e) => {
                          setNewRestaurantMenuFile(e.target.value)
                          if (menuFileError) validateMenuFileName(e.target.value)
                        }}
                        className={`w-full px-3 py-2 border ${
                          menuFileError ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        placeholder="e.g., restaurant_menu.json"
                      />
                      {menuFileError ? (
                        <p className="text-red-500 text-xs mt-1">{menuFileError}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          Optional - will be generated automatically if empty
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="newRestaurantLogo" className="block text-sm font-medium text-gray-700 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        id="newRestaurantLogo"
                        value={newRestaurantLogo}
                        onChange={(e) => {
                          setNewRestaurantLogo(e.target.value)
                          if (logoError) validateLogoURL(e.target.value)
                        }}
                        className={`w-full px-3 py-2 border ${
                          logoError ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        placeholder="e.g., /images/restaurant-logo.png"
                      />
                      {logoError ? (
                        <p className="text-red-500 text-xs mt-1">{logoError}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Optional - path to restaurant logo image</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full flex items-center justify-center"
                      disabled={isAddingRestaurant}
                    >
                      {isAddingRestaurant ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Restaurant
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Restaurant Form */}
              {editingRestaurant && (
                <form onSubmit={handleUpdateRestaurant} className="mt-6 border-t pt-4">
                  <h4 className="font-medium mb-3">Edit Restaurant</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="editedRestaurantName" className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="editedRestaurantName"
                        value={editedRestaurantName}
                        onChange={(e) => {
                          setEditedRestaurantName(e.target.value)
                          if (restaurantNameError) validateRestaurantName(e.target.value)
                        }}
                        className={`w-full px-3 py-2 border ${
                          restaurantNameError ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                      />
                      {restaurantNameError && <p className="text-red-500 text-xs mt-1">{restaurantNameError}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="editedRestaurantMenuFile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Menu File Name
                      </label>
                      <input
                        type="text"
                        id="editedRestaurantMenuFile"
                        value={editedRestaurantMenuFile}
                        onChange={(e) => {
                          setEditedRestaurantMenuFile(e.target.value)
                          if (menuFileError) validateMenuFileName(e.target.value)
                        }}
                        className={`w-full px-3 py-2 border ${
                          menuFileError ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        placeholder="e.g., restaurant_menu.json"
                      />
                      {menuFileError ? (
                        <p className="text-red-500 text-xs mt-1">{menuFileError}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Will be updated for all menu references</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="editedRestaurantLogo" className="block text-sm font-medium text-gray-700 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        id="editedRestaurantLogo"
                        value={editedRestaurantLogo}
                        onChange={(e) => {
                          setEditedRestaurantLogo(e.target.value)
                          if (logoError) validateLogoURL(e.target.value)
                        }}
                        className={`w-full px-3 py-2 border ${
                          logoError ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        placeholder="e.g., /images/restaurant-logo.png"
                      />
                      {logoError ? (
                        <p className="text-red-500 text-xs mt-1">{logoError}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Path to restaurant logo image</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex-1 flex items-center justify-center"
                        disabled={isAddingRestaurant}
                      >
                        {isAddingRestaurant ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Update Restaurant
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingRestaurant}
                        className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Menu Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {selectedRestaurant ? `Menu for ${selectedRestaurant}` : "Menu Management"}
          </h3>

          {!selectedRestaurant ? (
            <div className="text-gray-500 text-center py-8 border rounded-md">
              <p>Select a restaurant to manage its menu.</p>
            </div>
          ) : menuLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !currentMenu ? (
            <div className="text-gray-500 text-center py-8 border rounded-md">
              <p>No menu found for this restaurant.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Menu Categories and Items */}
              <div className="max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(currentMenu).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(currentMenu).map(([category, items]) => (
                      <div key={category} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{category}</h4>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {items.map((item, index) => (
                            <div key={index} className="border-t pt-3 first:border-t-0 first:pt-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{item["Item Name"]}</p>
                                  <p className="text-sm text-gray-600">{item.Description}</p>
                                  <p className="text-sm font-medium mt-1">Rs. {item["Price (Rs.)"]}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEditingMenuItem(category, index, item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit item"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMenuItem(category, item["Item Name"])}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4 border rounded-md">
                    <p>No categories or items in this menu yet.</p>
                  </div>
                )}
              </div>

              {/* Save Menu Button */}
              <button
                onClick={() => saveMenu()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
                disabled={isSavingMenu}
              >
                {isSavingMenu ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving Menu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Menu
                  </>
                )}
              </button>

              {/* Add New Category Button */}
              {!showNewCategoryForm && !showNewItemForm && !editingItem && (
                <button
                  onClick={() => setShowNewCategoryForm(true)}
                  className="flex items-center justify-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add New Category
                </button>
              )}

              {/* Add New Category Form */}
              {showNewCategoryForm && (
                <form onSubmit={handleAddCategory} className="border rounded-md p-4 mt-4">
                  <h4 className="font-medium mb-3">Add New Category</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="newCategoryName"
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value)
                          if (categoryNameError) validateCategoryName(e.target.value)
                        }}
                        className={`w-full px-3 py-2 border ${
                          categoryNameError ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                      />
                      {categoryNameError && <p className="text-red-500 text-xs mt-1">{categoryNameError}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex-1 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Category
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryForm(false)
                          setNewCategoryName("")
                          setcategoryNameError("")
                        }}
                        className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Add New Item Button */}
              {!showNewItemForm && !editingItem && !showNewCategoryForm && (
                <button
                  onClick={() => setShowNewItemForm(true)}
                  className="flex items-center justify-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add New Menu Item
                </button>
              )}

              {/* Add New Item Form */}
              {showNewItemForm && !editingItem && (
                <form onSubmit={handleAddMenuItem} className="border rounded-md p-4 mt-4">
                  <h4 className="font-medium mb-3">Add New Menu Item</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="newItemCategory" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="newItemCategory"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.category ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                        list="categories"
                      />
                      <datalist id="categories">
                        {Object.keys(currentMenu).map((category) => (
                          <option key={category} value={category} />
                        ))}
                      </datalist>
                      {itemFormErrors.category && (
                        <p className="text-red-500 text-xs mt-1">{itemFormErrors.category}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="newItemName" className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="newItemName"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.name ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                      />
                      {itemFormErrors.name && <p className="text-red-500 text-xs mt-1">{itemFormErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="newItemPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (Rs.) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="newItemPrice"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.price ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                        min="0"
                        step="0.01"
                      />
                      {itemFormErrors.price && <p className="text-red-500 text-xs mt-1">{itemFormErrors.price}</p>}
                    </div>
                    <div>
                      <label htmlFor="newItemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="newItemDescription"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.description ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                        rows={3}
                      />
                      {itemFormErrors.description && (
                        <p className="text-red-500 text-xs mt-1">{itemFormErrors.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex-1 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewItemForm(false)
                          setNewItemCategory("")
                          setNewItemName("")
                          setNewItemPrice("")
                          setNewItemDescription("")
                          setItemFormErrors({})
                        }}
                        className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Edit Item Form */}
              {editingItem && (
                <form onSubmit={handleUpdateMenuItem} className="border rounded-md p-4 mt-4">
                  <h4 className="font-medium mb-3">Edit Menu Item</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="editItemCategory" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="editItemCategory"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.category ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                        list="categories"
                      />
                      <datalist id="categories">
                        {Object.keys(currentMenu).map((category) => (
                          <option key={category} value={category} />
                        ))}
                      </datalist>
                      {itemFormErrors.category && (
                        <p className="text-red-500 text-xs mt-1">{itemFormErrors.category}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="editItemName" className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="editItemName"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.name ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                      />
                      {itemFormErrors.name && <p className="text-red-500 text-xs mt-1">{itemFormErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="editItemPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (Rs.) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="editItemPrice"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.price ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                        min="0"
                        step="0.01"
                      />
                      {itemFormErrors.price && <p className="text-red-500 text-xs mt-1">{itemFormErrors.price}</p>}
                    </div>
                    <div>
                      <label htmlFor="editItemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="editItemDescription"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          itemFormErrors.description ? "border-red-500" : "border-gray-300"
                        } rounded-md`}
                        required
                        rows={3}
                      />
                      {itemFormErrors.description && (
                        <p className="text-red-500 text-xs mt-1">{itemFormErrors.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex-1 flex items-center justify-center"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Update Item
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingMenuItem}
                        className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
