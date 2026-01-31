'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Plus, Search, Trash2, Pencil, FileUp, Loader2, Package, Layers, FolderTree, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditProductModal from '@/components/admin/EditProductModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCategories, useCategoryTree } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { createCategory, deleteCategory, getNextOrderNumber } from '@/lib/firebase/services/categoryService';

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
    const { toast } = useToast();

    // Product Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // Category State
    const { categories, loading: categoriesLoading } = useCategories();
    const { tree, loading: treeLoading } = useCategoryTree();
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);

    // Category Form state
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: 'none',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'products'), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
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
            toast({
                title: 'Success',
                description: 'Product deleted successfully',
                className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete product',
                variant: 'destructive',
            });
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingCategory(true);

        try {
            // Treat 'none' as no parent
            const parentId = categoryFormData.parentId === 'none' ? '' : categoryFormData.parentId;
            const level = parentId ? 1 : 0;
            const order = await getNextOrderNumber(parentId || undefined);

            await createCategory({
                name: categoryFormData.name,
                slug: categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
                description: categoryFormData.description,
                parentId: parentId || undefined,
                level,
                order,
            });

            toast({
                title: 'Success',
                description: `Category "${categoryFormData.name}" created successfully`,
                className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            });

            setIsCreateCategoryModalOpen(false);
            setCategoryFormData({ name: '', slug: '', description: '', parentId: 'none' });
            window.location.reload();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create category',
                variant: 'destructive',
            });
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
        if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

        try {
            await deleteCategory(categoryId);
            toast({
                title: 'Success',
                description: `Category "${categoryName}" deleted successfully`,
                className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            });
            window.location.reload();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete category',
                variant: 'destructive',
            });
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const mainCategories = categories.filter(c => c.level === 0);

    return (
        <div className="p-8 bg-zinc-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                        <Package className="w-8 h-8 text-amber-600" />
                        Products & Categories
                    </h1>
                    <p className="text-zinc-600 mt-1">Manage your catalog, categories, prices and stock levels</p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="products" className="w-full">
                    <TabsList className="bg-white border border-zinc-200 p-1 h-auto rounded-xl shadow-sm mb-6">
                        <TabsTrigger
                            value="products"
                            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 font-bold"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Products
                        </TabsTrigger>
                        <TabsTrigger
                            value="categories"
                            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 font-bold"
                        >
                            <Layers className="w-4 h-4 mr-2" />
                            Categories
                        </TabsTrigger>
                    </TabsList>

                    {/* Products Tab */}
                    <TabsContent value="products" className="mt-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900">Products List</h2>
                                <p className="text-zinc-500 text-sm mt-1">{products.length} products in catalog</p>
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

                        {/* Search */}
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

                        {/* Products Table */}
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
                                                                    src={product.thumbnail || '/placeholder.svg'}
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
                    </TabsContent>

                    {/* Categories Tab */}
                    <TabsContent value="categories" className="mt-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900">Category Management</h2>
                                <p className="text-zinc-500 text-sm mt-1">Organize your products with categories and subcategories</p>
                            </div>

                            <Dialog open={isCreateCategoryModalOpen} onOpenChange={setIsCreateCategoryModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 transition-all active:scale-95">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Category
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[480px] border-0 bg-gradient-to-br from-white/95 via-amber-50/90 to-orange-50/95 backdrop-blur-2xl shadow-2xl shadow-amber-500/20 p-0 overflow-hidden">
                                    {/* Gradient Header */}
                                    <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 pb-8">
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                                        <DialogHeader className="relative">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl">
                                                    <Layers className="w-5 h-5 text-white" />
                                                </div>
                                                <DialogTitle className="text-2xl font-black text-white">
                                                    Create Category
                                                </DialogTitle>
                                            </div>
                                            <DialogDescription className="text-amber-50/90 font-medium">
                                                Add a new category or subcategory to organize your products.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </div>

                                    <form onSubmit={handleCreateCategory} className="p-6 space-y-5">
                                        {/* Category Name */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                Category Name
                                            </Label>
                                            <Input
                                                placeholder="e.g., Tarpaulin"
                                                value={categoryFormData.name}
                                                onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                                required
                                                className="border-2 border-amber-200/50 bg-white/80 backdrop-blur-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl h-11 font-medium transition-all"
                                            />
                                        </div>

                                        {/* Slug */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                                                Slug (Optional)
                                            </Label>
                                            <Input
                                                placeholder="Auto-generated from name"
                                                value={categoryFormData.slug}
                                                onChange={e => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                                                className="border-2 border-zinc-200/50 bg-white/60 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl h-11 font-medium transition-all"
                                            />
                                            <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                                                Leave empty to auto-generate
                                            </p>
                                        </div>

                                        {/* Parent Category */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                                                Parent Category
                                            </Label>
                                            <Select
                                                value={categoryFormData.parentId}
                                                onValueChange={value => setCategoryFormData({ ...categoryFormData, parentId: value })}
                                            >
                                                <SelectTrigger className="border-2 border-zinc-200/50 bg-white/60 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl h-11 font-medium">
                                                    <SelectValue placeholder="None (Main Category)" />
                                                </SelectTrigger>
                                                <SelectContent className="backdrop-blur-xl bg-white/95 border-2 border-amber-200/50 rounded-xl">
                                                    <SelectItem value="none" className="font-medium">
                                                        None (Main Category)
                                                    </SelectItem>
                                                    {mainCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id} className="font-medium">
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                                                Description (Optional)
                                            </Label>
                                            <Textarea
                                                placeholder="Brief description of this category..."
                                                value={categoryFormData.description}
                                                onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                                rows={3}
                                                className="border-2 border-zinc-200/50 bg-white/60 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl font-medium resize-none transition-all"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <DialogFooter className="pt-2">
                                            <Button
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-black h-12 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 active:scale-[0.98]"
                                                disabled={creatingCategory}
                                            >
                                                {creatingCategory ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Layers className="w-5 h-5 mr-2" />
                                                        Create Category
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Category Tree View */}
                        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm mb-6">
                            <div className="flex items-center gap-2 mb-6">
                                <FolderTree className="w-5 h-5 text-amber-600" />
                                <h3 className="text-lg font-bold text-zinc-900">Category Hierarchy</h3>
                            </div>

                            {categoriesLoading || treeLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                                </div>
                            ) : tree.length === 0 ? (
                                <div className="text-center py-12">
                                    <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                                    <p className="text-zinc-500 font-medium">No categories yet</p>
                                    <p className="text-zinc-400 text-sm mt-1">
                                        Create your first category to get started
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tree.map(mainCat => (
                                        <div key={mainCat.id} className="border border-zinc-200 rounded-2xl overflow-hidden">
                                            {/* Main Category */}
                                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                                                        <Layers className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-zinc-900">{mainCat.name}</h4>
                                                        <p className="text-xs text-zinc-500">
                                                            {mainCat.children?.length || 0} subcategories
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteCategory(mainCat.id, mainCat.name)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Subcategories */}
                                            {mainCat.children && mainCat.children.length > 0 && (
                                                <div className="bg-white p-4 space-y-2">
                                                    {mainCat.children.map(subCat => (
                                                        <div
                                                            key={subCat.id}
                                                            className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                                                                <span className="font-medium text-zinc-700">
                                                                    {subCat.name}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteCategory(subCat.id, subCat.name)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* All Categories List */}
                        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-zinc-900 mb-4">All Categories ({categories.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map(category => (
                                    <div
                                        key={category.id}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all",
                                            category.level === 0
                                                ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                                                : "bg-zinc-50 border-zinc-200"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-zinc-900">{category.name}</h4>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    {category.level === 0 ? 'Main Category' : 'Subcategory'}
                                                </p>
                                                <p className="text-xs text-zinc-400 mt-1 font-mono">
                                                    /{category.slug}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Product Modal */}
            <EditProductModal
                productId={selectedProductId}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
}
