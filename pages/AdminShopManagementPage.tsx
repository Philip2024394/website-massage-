import React, { useState, useEffect } from 'react';
import { ShopItem, ShopOrder } from '../types';
import { shopItemService, shopOrderService } from '../lib/appwriteService';

interface AdminShopManagementPageProps {
    onNavigate?: (page: string) => void;
}

const AdminShopManagementPage: React.FC<AdminShopManagementPageProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'items' | 'orders'>('items');
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [showAddItem, setShowAddItem] = useState(false);
    const [editingItem, setEditingItem] = useState<ShopItem | null>(null);

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
    }, []);

    const loadShopData = async () => {
        try {
            // Fetch real data from Appwrite
            const items = await shopItemService.getAllItems();
            const orders = await shopOrderService.getAllOrders();
            
            setShopItems(items);
            setOrders(orders);
        } catch (error) {
            console.error('Error loading shop data:', error);
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
            } else if (error.code === 401) {
                errorMessage += 'Authentication error. Please log in again.';
            } else {
                errorMessage += 'Please check the console for details.';
            }
            
            alert(errorMessage);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await shopItemService.deleteItem(itemId);
                await loadShopData();
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error deleting item. Please try again.');
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => onNavigate?.('admin-dashboard')}
                                className="text-orange-500 hover:text-orange-600"
                            >
                                ← Back to Dashboard
                            </button>
                            <h1 className="text-2xl font-bold">
                                <span className="text-orange-500">Shop Management</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-4 border-b mb-6">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-6 py-3 font-bold transition-colors ${
                            activeTab === 'items'
                                ? 'border-b-4 border-orange-500 text-orange-500'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        🛍️ Shop Items ({shopItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 font-bold transition-colors ${
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Shop Items</h2>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowAddItem(true);
                                }}
                                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-bold"
                            >
                                + Add New Item
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {shopItems.map(item => (
                                <div key={item.$id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex gap-6">
                                        <img 
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                                    <p className="text-gray-600 text-sm">{item.description}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.$id || '')}
                                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 mt-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Price</p>
                                                    <p className="font-bold text-orange-500">🪙 {item.coinPrice.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Stock</p>
                                                    <p className="font-bold">{item.stockQuantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Category</p>
                                                    <p className="font-bold capitalize">{item.category.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Status</p>
                                                    <p className={`font-bold ${item.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.isActive ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Customer Orders</h2>
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.$id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">Order #{order.orderNumber}</h3>
                                            <p className="text-sm text-gray-600">
                                                {order.userName} ({order.userType}) • {new Date(order.createdAt || '').toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full font-bold ${getStatusColor(order.status)}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <h4 className="font-bold mb-2">Items</h4>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 mb-2">
                                                    <img src={item.itemImage} alt={item.itemName} className="w-12 h-12 object-cover rounded" />
                                                    <div>
                                                        <p className="font-medium">{item.itemName}</p>
                                                        <p className="text-sm text-gray-600">Qty: {item.quantity} × 🪙 {item.coinPrice.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="font-bold text-orange-500 mt-2">
                                                Total: 🪙 {order.totalCoins.toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold mb-2">Shipping Address</h4>
                                            <p className="text-sm">{order.shippingAddress.fullName}</p>
                                            <p className="text-sm">{order.shippingAddress.phone}</p>
                                            <p className="text-sm">{order.shippingAddress.addressLine1}</p>
                                            {order.shippingAddress.addressLine2 && (
                                                <p className="text-sm">{order.shippingAddress.addressLine2}</p>
                                            )}
                                            <p className="text-sm">
                                                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                                            </p>
                                            <p className="text-sm">{order.shippingAddress.country}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'processing')}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            disabled={order.status !== 'pending'}
                                        >
                                            Mark Processing
                                        </button>
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'shipped')}
                                            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            Mark Shipped
                                        </button>
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'delivered')}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            Mark Delivered
                                        </button>
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.$id || '', 'cancelled')}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-auto"
                                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            Cancel Order
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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                                <button
                                    onClick={() => {
                                        setShowAddItem(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block font-bold mb-2">Item Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., Wireless Earbuds"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    rows={3}
                                    placeholder="Describe the item..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-2">Coin Price *</label>
                                    <input
                                        type="number"
                                        value={formData.coinPrice}
                                        onChange={(e) => setFormData({ ...formData, coinPrice: Number(e.target.value) })}
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ShopItem['category'] })}
                                    className="w-full p-3 border rounded-lg"
                                >
                                    <option value="electronics">Electronics</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="wellness">Wellness</option>
                                    <option value="home">Home</option>
                                    <option value="gift_cards">Gift Cards</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-2">Image URL *</label>
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">Estimated Delivery</label>
                                <input
                                    type="text"
                                    value={formData.estimatedDelivery}
                                    onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="6-10 days"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">Disclaimer</label>
                                <input
                                    type="text"
                                    value={formData.disclaimer}
                                    onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Design may vary..."
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5"
                                />
                                <label className="font-bold">Active (visible in shop)</label>
                            </div>

                            <button
                                onClick={handleSaveItem}
                                className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold hover:bg-orange-600"
                            >
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopManagementPage;
