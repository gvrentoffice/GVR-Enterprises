'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Plus, Search, Trash2, Pencil, FileUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditProductModal from '@/components/admin/EditProductModal';

interface Product {
    id: string;
    name: string;
    sku: string;
    categoryName: string;
    brand?: string;
    thumbnail?: string;
    pricing: {
        mrp: number;
        dealerPrice: number;
        unit: string;
    };
    inventory: {
        available: number;
        reorderLevel: number;
    };
    status: 'active' | 'inactive' | 'out_of_stock';
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'products'), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        setSelectedProductId(id);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteDoc(doc(db, 'products', id));
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-zinc-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Products List</h1>
                        <p className="text-zinc-600 mt-1">Manage your catalog, prices and stock levels</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/products/upload"
                            className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-xl hover:bg-zinc-200 transition-all font-medium border border-zinc-200"
                        >
                            <FileUp size={20} />
                            Bulk Upload
                        </Link>
                        <Link
                            href="/admin/products/upload"
                            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl hover:bg-zinc-800 transition-all font-medium shadow-lg shadow-zinc-200"
                        >
                            <Plus size={20} />
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search name, SKU, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Price (MRP)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                                            <p className="text-zinc-500 mt-2">Loading products...</p>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200 flex-shrink-0">
                                                        <img
                                                            src={product.thumbnail || '/placeholder.jpg'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="max-w-[200px]">
                                                        <div className="text-sm font-bold text-zinc-900 truncate" title={product.name}>{product.name}</div>
                                                        <div className="text-xs text-zinc-500 truncate">{product.brand || 'No Brand'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg">
                                                    {product.sku}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                                {product.categoryName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                                                ₹{product.pricing.mrp.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "text-sm font-bold",
                                                        product.inventory?.available <= product.inventory?.reorderLevel ? "text-red-600" : "text-emerald-600"
                                                    )}>
                                                        {product.inventory?.available ?? 0} {product.pricing.unit}
                                                    </span>
                                                    <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                product.inventory?.available <= product.inventory?.reorderLevel ? "bg-red-500" : "bg-emerald-500"
                                                            )}
                                                            style={{ width: `${Math.min(100, ((product.inventory?.available ?? 0) / (Math.max(1, product.inventory?.reorderLevel ?? 0) * 2)) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                    product.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        product.status === 'out_of_stock' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-zinc-100 text-zinc-700 border-zinc-200'
                                                )}>
                                                    {product.status?.replace('_', ' ') || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2 text-zinc-400">
                                                    <button
                                                        onClick={() => handleEdit(product.id)}
                                                        className="p-2 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Edit Product"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={18} />
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

            {/* Edit Modal */}
            <EditProductModal
                productId={selectedProductId}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
}
