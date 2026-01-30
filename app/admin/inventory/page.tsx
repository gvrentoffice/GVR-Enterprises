'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Package, Search, AlertTriangle, RefreshCw, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    thumbnail: string;
    categoryName: string;
    inventory: {
        available: number;
        reserved: number;
        reorderLevel: number;
    };
    status: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editStock, setEditStock] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const inventoryData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryItem[];
            setItems(inventoryData);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (id: string) => {
        const adjustment = editStock[id];
        if (adjustment === undefined || adjustment === 0) return;

        setUpdatingId(id);
        try {
            const docRef = doc(db, 'products', id);
            await updateDoc(docRef, {
                'inventory.available': increment(adjustment),
                updatedAt: new Date()
            });

            // Update local state
            setItems(prev => prev.map(item =>
                item.id === id
                    ? { ...item, inventory: { ...item.inventory, available: item.inventory.available + adjustment } }
                    : item
            ));

            // Clear edit input
            setEditStock(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Failed to update stock');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockItems = items.filter(item => item.inventory.available <= item.inventory.reorderLevel);

    return (
        <div className="p-8 bg-zinc-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Inventory Management</h1>
                        <p className="text-zinc-600 mt-1">Monitor and update stock levels across all products</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchInventory}
                            className="p-2 text-zinc-600 hover:text-amber-600 hover:bg-white rounded-xl border border-zinc-200 shadow-sm transition-all"
                        >
                            <RefreshCw size={20} className={cn(loading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Total Products</p>
                                <p className="text-2xl font-bold text-zinc-900">{items.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Low Stock Alerts</p>
                                <p className="text-2xl font-bold text-zinc-900">{lowStockItems.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Out of Stock</p>
                                <p className="text-2xl font-bold text-zinc-900">{items.filter(i => i.inventory.available === 0).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Table */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-100">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-zinc-700">Product</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-zinc-700">SKU</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-zinc-700">Current Stock</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-zinc-700">Type</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-zinc-700">Adjustment</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-zinc-700 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                                            <p className="text-zinc-500 mt-2">Loading inventory...</p>
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 flex-shrink-0">
                                                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 line-clamp-1">{item.name}</p>
                                                        <p className="text-xs text-zinc-500">{item.categoryName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-zinc-600">{item.sku}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-sm font-bold",
                                                        item.inventory.available <= item.inventory.reorderLevel ? "text-red-600" : "text-zinc-900"
                                                    )}>
                                                        {item.inventory.available}
                                                    </span>
                                                    {item.inventory.available <= item.inventory.reorderLevel && (
                                                        <AlertTriangle size={14} className="text-red-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded-full font-medium">
                                                    Standard
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Qty"
                                                        value={editStock[item.id] || ''}
                                                        onChange={(e) => setEditStock({ ...editStock, [item.id]: parseInt(e.target.value) || 0 })}
                                                        className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleUpdateStock(item.id)}
                                                    disabled={updatingId === item.id || !editStock[item.id]}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm"
                                                >
                                                    {updatingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                    Update
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
        </div>
    );
}
