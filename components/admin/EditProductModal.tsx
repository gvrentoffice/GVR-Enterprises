'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { nanoid } from 'nanoid';
import { Loader2, Save, X, Image as ImageIcon, Package, Info, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema
const productSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    categoryId: z.string().min(1, 'Please select a category'),
    subCategoryId: z.string().optional(),
    brand: z.string().optional(),
    size: z.string().optional(),
    status: z.enum(['active', 'inactive', 'out_of_stock']),
    visibility: z.enum(['public', 'registered_only', 'b2b_only']),
    mrp: z.number().min(0, 'MRP must be positive'),
    dealerPrice: z.number().min(0, 'Dealer price must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    moq: z.number().min(1, 'MOQ must be at least 1'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductModalProps {
    productId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditProductModal({ productId, isOpen, onClose, onSuccess }: EditProductModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string>('');

    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'images'>('basic');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    useEffect(() => {
        if (isOpen && productId) {
            loadInitialData();
        } else {
            // Reset state when closing
            setLoading(true);
            setStatus('');
            setImages([]);
            setExistingImages([]);
            setImagePreviews([]);
            setActiveTab('basic');
        }
    }, [isOpen, productId]);

    const loadInitialData = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            // Load categories
            const catSnapshot = await getDocs(collection(db, 'categories'));
            const loadedCats = catSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
            }));
            setCategories(loadedCats);

            // Load product
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
                const data = productDoc.data();
                reset({
                    name: data.name,
                    categoryId: data.categoryId,
                    subCategoryId: data.subCategoryId || '',
                    brand: data.brand || '',
                    size: data.size || '',
                    status: data.status,
                    visibility: data.visibility || 'public',
                    mrp: data.pricing.mrp,
                    dealerPrice: data.pricing.dealerPrice,
                    unit: data.pricing.unit,
                    moq: data.pricing.moq,
                });
                setExistingImages(data.images || []);
            } else {
                setStatus('❌ Product not found');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setStatus('❌ Error loading product');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...previews]);
        }
    };

    const handleRemoveNewImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ProductFormData) => {
        if (!productId) return;
        try {
            setSaving(true);
            setStatus('Updating product...');

            let newImageUrls: string[] = [];
            // Upload new images if any
            if (images.length > 0) {
                for (const file of images) {
                    const fileName = `products/${productId}/${nanoid()}-${file.name}`;
                    const storageRef = ref(storage, fileName);
                    await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(storageRef);
                    newImageUrls.push(url);
                }
            }

            // Combine existing and new images
            const combinedImages = [
                ...existingImages,
                ...newImageUrls.map((url, index) => ({
                    url,
                    alt: data.name,
                    isPrimary: existingImages.length === 0 && index === 0,
                    order: existingImages.length + index,
                }))
            ];

            const category = categories.find(c => c.id === data.categoryId);

            const updateData = {
                name: data.name,
                tenantId: 'ryth-bazar',
                categoryId: data.categoryId,
                categoryName: category?.name || '',
                subCategoryId: data.subCategoryId || null,
                brand: data.brand || '',
                size: data.size || '',
                status: data.status,
                visibility: data.visibility,
                images: combinedImages,
                thumbnail: combinedImages[0]?.url || '/placeholder.jpg',
                'pricing.mrp': data.mrp,
                'pricing.dealerPrice': data.dealerPrice,
                'pricing.unit': data.unit,
                'pricing.moq': data.moq,
                updatedAt: serverTimestamp(),
            };

            const { updateProduct } = await import('@/lib/firebase/services/productService');
            await updateProduct(productId, updateData as any);

            setStatus('✅ Product updated successfully!');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);

        } catch (error: any) {
            console.error('Error updating product:', error);
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 text-zinc-800">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-white/95 via-amber-50/90 to-orange-50/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header with Glassmorphism Gradient */}
                <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl shadow-inner border border-white/10">
                                <Package className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    Edit Product
                                </h2>
                                <p className="text-amber-100 text-xs font-medium uppercase tracking-wider opacity-90">Refine product details & settings</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-amber-100/50 bg-white/40">
                    {[
                        { id: 'basic', label: 'Basic Info', icon: Info },
                        { id: 'pricing', label: 'Pricing & Stock', icon: DollarSign },
                        { id: 'images', label: 'Images', icon: ImageIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 relative z-10",
                                activeTab === tab.id
                                    ? "text-amber-700 border-amber-600 bg-gradient-to-t from-amber-100/50 to-transparent"
                                    : "text-zinc-500 border-transparent hover:text-zinc-800 hover:bg-white/50"
                            )}
                        >
                            <tab.icon size={16} className={cn(activeTab === tab.id ? "text-amber-600" : "text-zinc-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                                <Loader2 className="relative w-12 h-12 animate-spin text-amber-600 mb-4" />
                            </div>
                            <p className="text-amber-700 font-bold text-sm tracking-wider">LOADING DATA...</p>
                        </div>
                    ) : (
                        <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {status && (
                                <div className={cn(
                                    "p-4 rounded-xl border text-sm font-bold animate-in slide-in-from-top-2 flex items-center gap-2 shadow-sm",
                                    status.startsWith('✅')
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : status.startsWith('Updating')
                                            ? "bg-blue-50 text-blue-800 border-blue-200"
                                            : "bg-red-50 text-red-800 border-red-200"
                                )}>
                                    {status.startsWith('Updating') && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {status}
                                </div>
                            )}

                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-amber-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('name')}
                                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-amber-100/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-bold text-zinc-800 placeholder:font-normal"
                                            placeholder="e.g. Premium Basmati Rice"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-600 mb-2 uppercase tracking-wider">Category</label>
                                        <div className="relative">
                                            <select
                                                {...register('categoryId')}
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-zinc-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-zinc-800 appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-600 mb-2 uppercase tracking-wider">Brand</label>
                                        <input
                                            type="text"
                                            {...register('brand')}
                                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-zinc-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-zinc-800"
                                            placeholder="e.g. TATA"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-600 mb-2 uppercase tracking-wider">Status</label>
                                        <div className="relative">
                                            <select
                                                {...register('status')}
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-zinc-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-zinc-800 appearance-none cursor-pointer"
                                            >
                                                <option value="active">🟢 Active</option>
                                                <option value="inactive">⚫ Inactive</option>
                                                <option value="out_of_stock">🔴 Out of Stock</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-600 mb-2 uppercase tracking-wider">Visibility</label>
                                        <div className="relative">
                                            <select
                                                {...register('visibility')}
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-zinc-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-zinc-800 appearance-none cursor-pointer"
                                            >
                                                <option value="public">🌐 Public</option>
                                                <option value="registered_only">🔒 Registered Only</option>
                                                <option value="b2b_only">🏢 B2B Only</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pricing Tab */}
                            {activeTab === 'pricing' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                    <div>
                                        <label className="block text-xs font-black text-amber-900 mb-2 uppercase tracking-wider">MRP (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('mrp', { valueAsNumber: true })}
                                                className="w-full pl-8 pr-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-amber-100/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-black text-zinc-800"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-emerald-700 mb-2 uppercase tracking-wider">Dealer Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('dealerPrice', { valueAsNumber: true })}
                                                className="w-full pl-8 pr-4 py-3 bg-emerald-50/50 backdrop-blur-sm border-2 border-emerald-100/50 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-black text-emerald-700"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-600 mb-2 uppercase tracking-wider">Unit</label>
                                        <div className="relative">
                                            <select
                                                {...register('unit')}
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-zinc-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-zinc-800 appearance-none pointer-events-auto cursor-pointer"
                                            >
                                                <option value="kg">kilogram (kg)</option>
                                                <option value="gm">gram (gm)</option>
                                                <option value="piece">piece (pc)</option>
                                                <option value="liter">liter (L)</option>
                                                <option value="packet">packet (pkt)</option>
                                                <option value="box">box</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-600 mb-2 uppercase tracking-wider">MOQ</label>
                                        <input
                                            type="number"
                                            {...register('moq', { valueAsNumber: true })}
                                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-zinc-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-bold text-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-600 mb-2 uppercase tracking-wider">Size / Weight Info</label>
                                        <input
                                            type="text"
                                            {...register('size')}
                                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-zinc-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-zinc-800"
                                            placeholder="e.g. 500gm, 1kg pack"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Images Tab */}
                            {activeTab === 'images' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    {/* Existing */}
                                    {existingImages.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-black text-zinc-500 mb-3 uppercase tracking-wider">Current Gallery</label>
                                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                                {existingImages.map((img, idx) => (
                                                    <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
                                                        <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExistingImage(idx)}
                                                                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform scale-90 group-hover:scale-100 shadow-lg"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                        {idx === 0 && (
                                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500/90 backdrop-blur-sm text-white text-[8px] font-black rounded uppercase shadow-sm">Primary</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload */}
                                    <div className="p-8 border-2 border-dashed border-amber-200/50 rounded-3xl bg-amber-50/20 hover:bg-amber-50/40 hover:border-amber-300 transition-all text-center group cursor-pointer">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 group-hover:scale-110 transition-transform text-amber-500 group-hover:text-amber-600">
                                                <ImageIcon size={32} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900">Upload New Assets</p>
                                                <p className="text-xs text-zinc-500 mt-1 font-medium">Drag and drop or click to browse</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-black text-amber-600 mb-3 uppercase tracking-wider">New Assets to Upload</label>
                                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                                {imagePreviews.map((preview, idx) => (
                                                    <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-amber-200 bg-white shadow-lg shadow-amber-500/5">
                                                        <img src={preview} className="w-full h-full object-cover" alt="" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveNewImage(idx)}
                                                            className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 text-white rounded-lg hover:bg-zinc-900 transition-all backdrop-blur-sm shadow-lg"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-amber-100/50 bg-white/40 flex items-center justify-between backdrop-blur-md">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 hover:bg-white/50 rounded-2xl transition-all"
                    >
                        Cancel Changes
                    </button>
                    <button
                        type="submit"
                        form="edit-product-form"
                        disabled={saving || loading}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl font-black hover:shadow-xl hover:shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'UPDATING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </div>
        </div>
    );
}
