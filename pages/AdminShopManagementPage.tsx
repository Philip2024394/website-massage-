import React, { useState, useEffect } from 'react';
import { ShopItem, ShopOrder } from '../types';
import { shopItemService, shopOrderService } from '../lib/appwriteService';

interface AdminShopManagementPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const AdminShopManagementPage: React.FC<AdminShopManagementPageProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'items' | 'orders'>('items');
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [showAddItem, setShowAddItem] = useState(false);
    const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    
    // Default categories + custom categories from localStorage
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    const [formData, setFormData] = useState<Partial<ShopItem>>({
        name: '',
        description: '',
        coinPrice: 0,
        imageUrl: '',
        category: 'other',
        stockQuantity: 0,
        isActive: true,
        estimatedDelivery: '6-10 days',
        disclaimer: 'Design may vary slightly from displayed image'
    });

    useEffect(() => {
        loadShopData();
        loadCustomCategories();
    }, []);

    // Reload data when switching tabs
    useEffect(() => {
        if (activeTab === 'items' || activeTab === 'orders') {
            loadShopData();
        }
    }, [activeTab]);

    const loadCustomCategories = () => {
        try {
            const saved = localStorage.getItem('shopCustomCategories');
            if (saved) {
                setCustomCategories(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading custom categories:', error);
        }
    };

    const saveCustomCategories = (categories: string[]) => {
        try {
            localStorage.setItem('shopCustomCategories', JSON.stringify(categories));
            setCustomCategories(categories);
        } catch (error) {
            console.error('Error saving custom categories:', error);
        }
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            alert('Please enter a category name');
            return;
        }

        const categoryValue = newCategoryName.trim().toLowerCase().replace(/\s+/g, '_');
        
        // Check if category already exists
        if (customCategories.includes(categoryValue)) {
            alert('This category already exists');
            return;
        }

        const updated = [...customCategories, categoryValue];
        saveCustomCategories(updated);
        setNewCategoryName('');
        alert(`Category "${newCategoryName}" added successfully!`);
    };

    const handleDeleteCategory = (categoryToDelete: string) => {
        if (confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`)) {
            const updated = customCategories.filter(cat => cat !== categoryToDelete);
            saveCustomCategories(updated);
        }
    };

    const loadShopData = async () => {
        try {
            console.log('Loading shop data...');
            // Fetch real data from Appwrite
            const items = await shopItemService.getAllItems();
            const orders = await shopOrderService.getAllOrders();
            
            console.log('Loaded items:', items);
            console.log('Loaded orders:', orders);
            
            setShopItems(items);
            setOrders(orders);
        } catch (error) {
            console.error('Error loading shop data:', error);
            // Set empty arrays on error to clear any stale data
            setShopItems([]);
            setOrders([]);
        }
    };

    const handleSaveItem = async () => {
        try {
            // Validate required fields
            if (!formData.name || !formData.description || !formData.coinPrice) {
                alert('Please fill in all required fields (name, description, and coin price)');
                return;
            }

            console.log('Saving shop item:', formData);

            if (editingItem) {
                // Update existing item
                console.log('Updating item:', editingItem.$id);
                await shopItemService.updateItem(editingItem.$id || '', formData);
            } else {
                // Add new item
                console.log('Creating new item');
                await shopItemService.createItem(formData);
            }
            
            // Reload data
            await loadShopData();
            
            setShowAddItem(false);
            setEditingItem(null);
            resetForm();
            alert('Shop item saved successfully!');
        } catch (error: any) {
            console.error('Error saving item:', error);
            
            // Provide more detailed error message
            let errorMessage = 'Error saving item. ';
            if (error.message) {
                errorMessage += error.message;
            } else if (error.code === 404) {
                errorMessage += 'Shop items collection not found. Please create the "shopitems" collection in Appwrite.';
            } else if (error.code === 401 || error.message?.includes('not authorized')) {
                errorMessage += 'Permission denied.\n\n';
                errorMessage += 'Please go to Appwrite Console:\n';
                errorMessage += '1. Open your database (68f76ee1000e64ca8d05)\n';
                errorMessage += '2. Click "shopitems" collection\n';
                errorMessage += '3. Go to Settings → Permissions\n';
                errorMessage += '4. Add "Create" and "Update" permissions for "Any" or "Users"';
            } else {
                errorMessage += 'Please check the console for details.';
            }
            
            alert(errorMessage);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!itemId) {
            alert('Invalid item ID');
            return;
        }

        if (confirm('Are you sure you want to delete this item?')) {
            try {
                console.log('Deleting item with ID:', itemId);
                await shopItemService.deleteItem(itemId);
                console.log('Item deleted successfully');
                await loadShopData();
                alert('Item deleted successfully!');
            } catch (error: any) {
                console.error('Error deleting item:', error);
                
                let errorMessage = 'Error deleting item. ';
                if (error.message) {
                    errorMessage += error.message;
                } else if (error.code === 404) {
                    errorMessage += 'Item not found.';
                } else if (error.code === 401 || error.message?.includes('not authorized')) {
                    errorMessage += 'Permission denied.\n\n';
                    errorMessage += 'Please go to Appwrite Console:\n';
                    errorMessage += '1. Open your database (68f76ee1000e64ca8d05)\n';
                    errorMessage += '2. Click "shopitems" collection\n';
                    errorMessage += '3. Go to Settings → Permissions\n';
                    errorMessage += '4. Add "Delete" permission for "Any" or "Users"';
                } else {
                    errorMessage += 'Please check the console for details.';
                }
                
                alert(errorMessage);
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: ShopOrder['status']) => {
        try {
            await shopOrderService.updateOrderStatus(orderId, newStatus);
            await loadShopData();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error updating order status. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            coinPrice: 0,
            imageUrl: '',
            category: 'other',
            stockQuantity: 0,
            isActive: true,
            estimatedDelivery: '6-10 days',
            disclaimer: 'Design may vary slightly from displayed image'
        });
    };

    const startEdit = (item: ShopItem) => {
        setEditingItem(item);
        setFormData(item);
        setShowAddItem(true);
    };

    const getStatusColor = (status: ShopOrder['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status];
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button 
                                onClick={() => onNavigate?.('admin-dashboard')}
                                className="text-orange-500 hover:text-orange-600 text-sm sm:text-base"
                            >
                                ← Back
                            </button>
                            <h1 className="text-lg sm:text-2xl font-bold">
                                <span className="text-orange-500">Shop</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
                <div className="flex gap-2 sm:gap-4 border-b mb-4 sm:mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-3 sm:px-6 py-2 sm:py-3 font-bold transition-colors whitespace-nowrap text-sm sm:text-base ${
                            activeTab === 'items'
                                ? 'border-b-4 border-orange-500 text-orange-500'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        🛍️ Items ({shopItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-3 sm:px-6 py-2 sm:py-3 font-bold transition-colors whitespace-nowrap text-sm sm:text-base ${
                            activeTab === 'orders'
                                ? 'border-b-4 border-orange-500 text-orange-500'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📦 Orders ({orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})
                    </button>
                </div>

                {/* Items Tab */}
                {activeTab === 'items' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg sm:text-xl font-bold">Shop Items</h2>
                                <button
                                    onClick={loadShopData}
                                    className="text-orange-500 hover:text-orange-600 font-bold text-sm"
                                    title="Refresh items"
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowAddItem(true);
                                }}
                                className="bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-orange-600 font-bold text-sm sm:text-base w-full sm:w-auto"
                            >
                                + Add New Item
                            </button>
                        </div>

                        {shopItems.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-gray-500 text-lg mb-4">No shop items yet</p>
                                <p className="text-gray-400 text-sm">Click "Add New Item" to create your first product</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">{shopItems.map(item => (
                                <div key={item.$id} className="bg-white rounded-lg shadow p-3 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                        <img 
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full sm:w-32 h-32 object-cover rounded"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                                                <div>
                                                    <h3 className="font-bold text-base sm:text-lg">{item.name}</h3>
                                                    <p className="text-gray-600 text-xs sm:text-sm">{item.description}</p>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className="bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-blue-600 text-sm flex-1 sm:flex-none"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.$id || '')}
                                                        className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-red-600 text-sm flex-1 sm:flex-none"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-600">Price</p>
                                                    <p className="font-bold text-orange-500 text-sm sm:text-base">🪙 {item.coinPrice.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-600">Stock</p>
                                                    <p className="font-bold text-sm sm:text-base">{item.stockQuantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-600">Category</p>
                                                    <p className="font-bold capitalize text-sm sm:text-base">{item.category.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-600">Status</p>
                                                    <p className={`font-bold text-sm sm:text-base ${item.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.isActive ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}</div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Customer Orders</h2>
                        <div className="space-y-3 sm:space-y-4">
                            {orders.map(order => (
                                <div key={order.$id} className="bg-white rounded-lg shadow p-3 sm:p-6">
                                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-2">
                                        <div>
                                            <h3 className="font-bold text-base sm:text-lg">Order #{order.orderNumber}</h3>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                {order.userName} ({order.userType}) • {new Date(order.createdAt || '').toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm ${getStatusColor(order.status)}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-3 sm:mb-4">
                                        <div>
                                            <h4 className="font-bold mb-2 text-sm sm:text-base">Items</h4>
                                            {(() => {
                                                try {
                                                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                                    return items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 sm:gap-3 mb-2">
                                                            <img src={item.itemImage} alt={item.itemName} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded" />
                                                            <div>
                                                                <p className="font-medium text-sm sm:text-base">{item.itemName}</p>
                                                                <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity} × 🪙 {item.coinPrice.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    ));
                                                } catch {
                                                    return <p className="text-red-500 text-xs">Error loading items</p>;
                                                }
                                            })()}
                                            <p className="font-bold text-orange-500 mt-2 text-sm sm:text-base">
                                                Total: 🪙 {order.totalCoins.toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold mb-2 text-sm sm:text-base">Shipping Address</h4>
                                            {(() => {
                                                try {
                                                    const address = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
                                                    return (
                                                        <>
                                                            <p className="text-xs sm:text-sm">{address.fullName}</p>
                                                            <p className="text-xs sm:text-sm">{address.phone}</p>
                                                            <p className="text-xs sm:text-sm">{address.addressLine1}</p>
                                                            {address.addressLine2 && (
                                                                <p className="text-xs sm:text-sm">{address.addressLine2}</p>
                                                            )}
                                                            <p className="text-xs sm:text-sm">
                                                                {address.city}, {address.province} {address.postalCode}
                                                            </p>
                                                            <p className="text-xs sm:text-sm">{address.country}</p>
                                                        </>
                                                    );
                                                } catch {
                                                    return <p className="text-red-500 text-xs">Error loading address</p>;
                                                }
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t">
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'processing')}
                                            className="bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-blue-600 text-xs sm:text-sm"
                                            disabled={order.status !== 'pending'}
                                        >
                                            Processing
                                        </button>
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'shipped')}
                                            className="bg-purple-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-purple-600 text-xs sm:text-sm"
                                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            Shipped
                                        </button>
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'delivered')}
                                            className="bg-green-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-green-600 text-xs sm:text-sm"
                                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            Delivered
                                        </button>
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'cancelled')}
                                            className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-red-600 text-xs sm:text-sm"
                                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Item Modal */}
            {showAddItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg sm:text-2xl font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                                <button
                                    onClick={() => {
                                        setShowAddItem(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block font-bold mb-2 text-sm sm:text-base">Item Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                    placeholder="e.g., Wireless Earbuds"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2 text-sm sm:text-base">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                    rows={3}
                                    placeholder="Describe the item..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block font-bold mb-2 text-sm sm:text-base">Coin Price *</label>
                                    <input
                                        type="number"
                                        value={formData.coinPrice}
                                        onChange={(e) => setFormData({ ...formData, coinPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm sm:text-base">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-2 text-sm sm:text-base">Category *</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ShopItem['category'] })}
                                        className="flex-1 p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                    >
                                        <option value="electronics">Electronics</option>
                                        <option value="fashion">Fashion</option>
                                        <option value="wellness">Wellness</option>
                                        <option value="home">Home</option>
                                        <option value="gift_cards">Gift Cards</option>
                                        <option value="other">Other</option>
                                        {customCategories.map(category => (
                                            <option key={category} value={category}>
                                                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryManager(true)}
                                        className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold whitespace-nowrap text-sm sm:text-base"
                                    >
                                        + Category
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-2 text-sm sm:text-base">Image URL *</label>
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2 text-sm sm:text-base">Estimated Delivery</label>
                                <input
                                    type="text"
                                    value={formData.estimatedDelivery}
                                    onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                                    className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                    placeholder="6-10 days"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2 text-sm sm:text-base">Disclaimer</label>
                                <input
                                    type="text"
                                    value={formData.disclaimer}
                                    onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                                    className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                    placeholder="Design may vary..."
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                />
                                <label className="font-bold text-sm sm:text-base">Active (visible in shop)</label>
                            </div>

                            <button
                                onClick={handleSaveItem}
                                className="w-full bg-orange-500 text-white py-3 sm:py-4 rounded-lg font-bold hover:bg-orange-600 text-sm sm:text-base"
                            >
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Manager Modal */}
            {showCategoryManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg sm:text-2xl font-bold">Manage Categories</h2>
                                <button
                                    onClick={() => setShowCategoryManager(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Add New Category */}
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                                <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Add New Category</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                        className="flex-1 p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                                        placeholder="Enter category name..."
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-sm sm:text-base whitespace-nowrap"
                                    >
                                        Add
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Category names will be converted to lowercase with underscores
                                </p>
                            </div>

                            {/* Default Categories */}
                            <div>
                                <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Default Categories</h3>
                                <div className="space-y-2">
                                    {['electronics', 'fashion', 'wellness', 'home', 'gift_cards', 'other'].map(category => (
                                        <div key={category} className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 rounded-lg">
                                            <span className="font-medium capitalize text-sm sm:text-base">{category.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 sm:px-3 py-1 rounded-full">Default</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Categories */}
                            {customCategories.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Custom Categories</h3>
                                    <div className="space-y-2">
                                        {customCategories.map(category => (
                                            <div key={category} className="flex items-center justify-between p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <span className="font-medium capitalize text-sm sm:text-base">{category.replace(/_/g, ' ')}</span>
                                                <button
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="text-red-600 hover:text-red-800 font-bold px-2 sm:px-3 py-1 hover:bg-red-100 rounded text-xs sm:text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {customCategories.length === 0 && (
                                <div className="text-center py-6 sm:py-8 text-gray-500">
                                    <p className="text-xs sm:text-sm">No custom categories yet. Add one above!</p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowCategoryManager(false)}
                                className="w-full bg-gray-200 text-gray-700 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-300 text-sm sm:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopManagementPage;
