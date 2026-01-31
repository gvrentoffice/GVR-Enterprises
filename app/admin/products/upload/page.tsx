'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { nanoid } from 'nanoid';
import { getCategoryTree, createCategory, getNextOrderNumber } from '@/lib/firebase/services/categoryService';
import type { Category } from '@/lib/firebase/schema';

// Validation schema
const productSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    categoryId: z.string().min(1, 'Please select a category'),
    subCategoryId: z.string().optional(),
    brand: z.string().optional(),
    size: z.string().optional(),

    // Pricing
    mrp: z.number().min(0, 'MRP must be positive'),
    dealerPrice: z.number().min(0, 'Dealer price must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    moq: z.number().min(1, 'MOQ must be at least 1'),
});

type ProductFormData = z.infer<typeof productSchema>;

// Extend Category type to include children
type CategoryWithChildren = Category & { children?: Category[] };

export default function ProductUploadPage() {
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    // Categories state
    const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddSubCategory, setShowAddSubCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [generatedSKU, setGeneratedSKU] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    const productName = watch('name');

    // Load categories from Service
    useEffect(() => {
        loadCategories();
    }, []);

    // Auto-generate SKU when product name changes
    useEffect(() => {
        if (productName) {
            // Allow only alphanumeric characters
            const cleanName = productName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

            // Ensure specific length (8-15 chars)
            // We'll take a prefix from the name and add a random suffix
            let prefix = cleanName.substring(0, 10); // Take up to 10 chars
            if (prefix.length < 3) prefix = prefix.padEnd(3, 'X');

            const randomLen = Math.max(4, 15 - prefix.length);
            const suffix = nanoid(randomLen).replace(/[^a-zA-Z0-9]/g, '0').substring(0, randomLen).toUpperCase();

            let sku = (prefix + suffix).substring(0, 15);

            // Ensure minimum 8 chars
            if (sku.length < 8) {
                sku = sku.padEnd(8, '0');
            }

            setGeneratedSKU(sku);
        }
    }, [productName]);

    const loadCategories = async () => {
        setCategoryLoading(true);
        try {
            const tree = await getCategoryTree();
            setCategories(tree);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (newCategoryName.trim()) {
            const tempSlug = newCategoryName.toLowerCase().replace(/\s+/g, '-');

            // Check if already exists locally (by name or slug)
            if (categories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
                alert('Category already exists');
                return;
            }

            try {
                setCategoryLoading(true);
                const order = await getNextOrderNumber();
                const newId = await createCategory({
                    name: newCategoryName,
                    slug: tempSlug,
                    level: 0,
                    order,
                    parentId: undefined
                });

                setNewCategoryName('');
                setShowAddCategory(false);

                // Refresh categories and select the new one
                await loadCategories();
                setSelectedCategory(newId);
                setValue('categoryId', newId, { shouldValidate: true });
                setUploadStatus('Category created successfully!');
                setTimeout(() => setUploadStatus(''), 3000);

            } catch (err) {
                console.error("Failed to save category", err);
                alert("Failed to save category to database.");
            } finally {
                setCategoryLoading(false);
            }
        }
    };

    const handleAddSubCategory = async () => {
        if (newSubCategoryName.trim() && selectedCategory) {
            const parentCat = categories.find(c => c.id === selectedCategory);

            if (parentCat?.children?.some(sc => sc.name.toLowerCase() === newSubCategoryName.toLowerCase())) {
                alert('Sub-category already exists');
                return;
            }

            try {
                setCategoryLoading(true);
                const tempSlug = newSubCategoryName.toLowerCase().replace(/\s+/g, '-');
                const order = await getNextOrderNumber(selectedCategory);

                const newId = await createCategory({
                    name: newSubCategoryName,
                    slug: tempSlug,
                    level: 1,
                    parentId: selectedCategory,
                    order
                });

                setNewSubCategoryName('');
                setShowAddSubCategory(false);

                // Refresh categories and select the new subcategory
                await loadCategories();
                setValue('subCategoryId', newId, { shouldValidate: true });
                setUploadStatus('Sub-category created successfully!');
                setTimeout(() => setUploadStatus(''), 3000);

            } catch (error) {
                console.error("Failed to create sub-category", error);
                alert("Failed to create sub-category");
            } finally {
                setCategoryLoading(false);
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (e.target.files && e.target.files.length > 0) {
                const newFiles = Array.from(e.target.files);
                setImages(prev => [...prev, ...newFiles]);

                // Create previews
                const newPreviews = newFiles.map(file => URL.createObjectURL(file));
                setImagePreviews(prev => [...prev, ...newPreviews]);

                // Clear the input value so the same file can be selected again
                e.target.value = '';
            }
        } catch (error) {
            console.error('Error handling image selection:', error);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (productId: string): Promise<string[]> => {
        const imageUrls: string[] = [];

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const fileName = `products/${productId}/${nanoid()}-${file.name}`;
            const storageRef = ref(storage, fileName);

            try {
                // Wrap upload in a timeout to prevent hanging on CORS/Network errors
                const uploadPromise = uploadBytes(storageRef, file);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Upload timed out (likely CORS or Storage not enabled)')), 15000)
                );

                await Promise.race([uploadPromise, timeoutPromise]);
                const url = await getDownloadURL(storageRef);
                imageUrls.push(url);
            } catch (error) {
                console.warn('Image upload failed, skipping:', error);
                // Don't break the loop, just skip this image
            }
        }

        return imageUrls;
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            setUploading(true);
            setUploadStatus('Creating product...');

            // Create product ID
            const productId = nanoid();

            // Upload images if any (skip if storage not configured)
            let imageUrls: string[] = [];
            if (images.length > 0) {
                setUploadStatus('Uploading images...');
                try {
                    imageUrls = await uploadImages(productId);
                } catch (error) {
                    console.warn('Image upload failed, continuing without images');
                    imageUrls = [];
                }
            }

            // Get category and subcategory names
            const category = categories.find(c => c.id === data.categoryId);
            const categoryName = category?.name || '';
            const subCategory = category?.children?.find(sc => sc.id === data.subCategoryId);
            const subCategoryName = subCategory?.name || '';

            // Prepare product data
            const productData = {
                id: productId,
                tenantId: 'ryth-bazar',
                name: data.name,
                description: data.name, // Use name as description
                longDescription: '',
                categoryId: data.categoryId,
                categoryName: categoryName,
                subCategoryId: data.subCategoryId || null,
                subCategoryName: subCategoryName,
                brand: data.brand || '',
                sku: generatedSKU,
                size: data.size || '',
                hsn: '',

                // Images
                images: imageUrls.map((url, index) => ({
                    url,
                    alt: data.name,
                    isPrimary: index === 0,
                    order: index,
                })),
                thumbnail: imageUrls[0] || '/placeholder.svg',

                // Pricing
                pricing: {
                    mrp: data.mrp,
                    dealerPrice: data.dealerPrice,
                    unit: data.unit,
                    moq: data.moq,
                    wholesalePrice: null,
                    maxOrderQuantity: null,
                    tiers: [],
                },

                // Inventory (auto-managed)
                inventory: {
                    available: 999999, // Unlimited for MVP
                    reserved: 0,
                    reorderLevel: 0,
                    reorderQuantity: 0,
                    trackInventory: false,
                },

                // SEO
                seo: {
                    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
                    metaTitle: data.name,
                    metaDescription: data.name,
                    keywords: [],
                },

                // Additional fields
                specifications: {},
                tags: [],
                featured: false,
                newArrival: true,
                bestSeller: false,
                onSale: false,
                hasVariants: false,
                variants: [],

                // Visibility
                status: 'active',
                visibility: 'public',
                showPriceToPublic: false, // Hide MRP from public
                showDealerPriceToRegistered: true,

                // Audit
                createdBy: 'admin',
                updatedBy: 'admin',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),

                // Analytics
                views: 0,
                orders: 0,
                revenue: 0,
            };

            // Save to Firestore
            setUploadStatus('Saving to database...');
            await addDoc(collection(db, 'products'), productData);

            setUploadStatus('✅ Product created successfully! SKU: ' + generatedSKU);

            // Reset form
            reset();
            setImages([]);
            setImagePreviews([]);
            setSelectedCategory('');
            setGeneratedSKU('');

            // Clear status after 5 seconds
            setTimeout(() => setUploadStatus(''), 5000);

        } catch (error: any) {
            console.error('Error creating product:', error);
            setUploadStatus(`❌ Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Helper to get register props and properly compose onChange
    const categoryField = register('categoryId');
    const subCategoryField = register('subCategoryId');

    // Get subcategories for selected category
    const currentSubCategories = selectedCategory ? categories.find(c => c.id === selectedCategory)?.children || [] : [];

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900">Upload New Product</h1>
                    <p className="text-zinc-600 mt-2">Add a new product to the catalog</p>
                </div>

                {/* Status Message */}
                {uploadStatus && (
                    <div className={`mb-6 p-4 rounded-xl ${uploadStatus.startsWith('✅')
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : uploadStatus.startsWith('❌')
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                        {uploadStatus}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-zinc-200 p-8 space-y-6">

                    {/* IMAGES SECTION - MOVED TO TOP */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-zinc-900">Product Images</h2>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Upload Images (Max 5)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <p className="text-zinc-500 text-sm mt-1">
                                {images.length} image(s) selected
                            </p>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-1 left-1 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                                                Main
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4 pt-6 border-t border-zinc-200">
                        <h2 className="text-xl font-bold text-zinc-900">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                {...register('name')}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Premium Basmati Rice"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Auto-generated SKU Display */}
                        {generatedSKU && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-800">
                                    <strong>Auto-generated SKU:</strong> {generatedSKU}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Category with Add New */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-zinc-900">Category</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Main Category *
                                </label>
                                <select
                                    {...categoryField}
                                    onChange={(e) => {
                                        categoryField.onChange(e); // Call original register onChange
                                        setSelectedCategory(e.target.value);
                                        if (e.target.value === '__add_new__') {
                                            setShowAddCategory(true);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                    <option value="__add_new__" className="font-bold text-amber-600">
                                        + Add New Category
                                    </option>
                                </select>
                                {errors.categoryId && (
                                    <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
                                )}

                                {/* Add New Category Inline */}
                                {showAddCategory && (
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            disabled={categoryLoading}
                                            placeholder="New category name"
                                            className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={categoryLoading}
                                            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
                                        >
                                            {categoryLoading ? 'Adding...' : 'Add'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddCategory(false)}
                                            className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg text-sm hover:bg-zinc-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Sub-Category (Optional)
                                </label>
                                <select
                                    {...subCategoryField}
                                    disabled={!selectedCategory}
                                    onChange={(e) => {
                                        subCategoryField.onChange(e); // Call original register onChange
                                        if (e.target.value === '__add_new__') {
                                            setShowAddSubCategory(true);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">No sub-category</option>
                                    {currentSubCategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                    {selectedCategory && (
                                        <option value="__add_new__" className="font-bold text-amber-600">
                                            + Add New Sub-Category
                                        </option>
                                    )}
                                </select>

                                {/* Add New Sub-Category Inline */}
                                {showAddSubCategory && (
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="text"
                                            value={newSubCategoryName}
                                            onChange={(e) => setNewSubCategoryName(e.target.value)}
                                            disabled={categoryLoading}
                                            placeholder="New sub-category"
                                            className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSubCategory}
                                            disabled={categoryLoading}
                                            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
                                        >
                                            {categoryLoading ? 'Adding...' : 'Add'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddSubCategory(false)}
                                            className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg text-sm hover:bg-zinc-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-zinc-900">Product Details</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Brand (Optional)
                                </label>
                                <input
                                    type="text"
                                    {...register('brand')}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Brand name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Size (Optional)
                                </label>
                                <input
                                    type="text"
                                    {...register('size')}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="1kg, 5kg, 500g, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-zinc-900">Pricing</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    MRP (Public Price) * ₹
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('mrp', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="150.00"
                                />
                                {errors.mrp && (
                                    <p className="text-red-600 text-sm mt-1">{errors.mrp.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Dealer Price (Registered Only) * ₹
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('dealerPrice', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="120.00"
                                />
                                {errors.dealerPrice && (
                                    <p className="text-red-600 text-sm mt-1">{errors.dealerPrice.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Unit *
                                </label>
                                <select
                                    {...register('unit')}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">Select unit</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="gm">Gram (gm)</option>
                                    <option value="piece">Piece</option>
                                    <option value="box">Box</option>
                                    <option value="liter">Liter (L)</option>
                                    <option value="ml">Milliliter (ml)</option>
                                    <option value="packet">Packet</option>
                                </select>
                                {errors.unit && (
                                    <p className="text-red-600 text-sm mt-1">{errors.unit.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Minimum Order Quantity (MOQ) *
                                </label>
                                <input
                                    type="number"
                                    {...register('moq', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="10"
                                />
                                {errors.moq && (
                                    <p className="text-red-600 text-sm mt-1">{errors.moq.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-zinc-200">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-gradient-to-r from-zinc-900 to-zinc-800 text-white py-3 px-6 rounded-xl font-medium hover:from-zinc-800 hover:to-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {uploading ? 'Uploading...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
