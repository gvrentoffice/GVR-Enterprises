'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Filter, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import type { Lead } from '@/lib/firebase/schema';

export default function ShopPage() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [customer, setCustomer] = useState<Lead | null>(null);

    // Check if customer is logged in and approved
    useEffect(() => {
        const customerData = localStorage.getItem('customer');
        if (customerData) {
            setCustomer(JSON.parse(customerData));
        }
    }, []);

    const isApproved = customer?.priceAccessApproved || false;

    // Fetch all products
    const { products: allProducts, loading: productsLoading, error: productsError } = useProducts({
        isRegistered: isApproved,
    });

    // Fetch categories
    const { categories: allCategories, loading: categoriesLoading, error: categoriesError } = useCategories();

    // Use all fetched categories
    const categories = allCategories;

    const isLoading = productsLoading || categoriesLoading;
    const hasError = productsError || categoriesError;

    // Filter products
    const filteredProducts = allProducts.filter((product) => {
        // Category filter
        if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
            return false;
        }

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(term) ||
                product.sku.toLowerCase().includes(term) ||
                product.categoryName.toLowerCase().includes(term)
            );
        }

        return true;
    });


    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-red-50/50">
            {/* Customer Status Banner (Subtle) */}
            {!customer ? (
                <div className="bg-gradient-to-r from-amber-100/40 to-orange-100/40 backdrop-blur-sm border-b border-amber-200/50">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-amber-900 font-medium">
                                <span className="font-semibold uppercase tracking-tighter mr-2">Welcome</span> Login to view dealer prices and place orders
                            </p>
                            <Link href="/login">
                                <Button size="sm" variant="ghost" className="text-amber-800 hover:text-amber-900 hover:bg-amber-100/50 h-7 text-[10px] font-semibold uppercase tracking-widest">
                                    Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : !isApproved ? (
                <div className="bg-gradient-to-r from-blue-100/40 to-indigo-100/40 backdrop-blur-sm border-b border-blue-200/50">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <p className="text-xs text-blue-900 font-medium">
                            <span className="font-semibold uppercase tracking-tighter mr-2">Pending Approval</span> Your account is under review for dealer pricing.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-sm border-b border-gray-700">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-amber-400 font-medium">
                                <span className="font-semibold uppercase tracking-tighter mr-2 text-white">Dealer Mode</span> Prices unlocked for {customer.shopName}.
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Content with Glassmorphism */}
            <div className="backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-lg">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tight uppercase">
                        Product Catalog
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mt-2 uppercase tracking-widest">
                        {filteredProducts.length} Premium Collection{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
                <div className="flex gap-6">
                    {/* Filters Sidebar - Desktop */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-24 backdrop-blur-xl bg-white/70 rounded-[2rem] border border-white/50 shadow-2xl shadow-orange-500/10 p-6">
                            <ProductFilters
                                categories={categories}
                                selectedCategoryId={selectedCategoryId}
                                searchTerm={searchTerm}
                                onCategoryChange={(id) => setSelectedCategoryId(id)}
                                onSearchChange={setSearchTerm}
                            />
                        </div>
                    </div>

                    {/* Mobile Filter Sidebar */}
                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />
                            <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 backdrop-blur-xl shadow-2xl z-50 lg:hidden overflow-y-auto">
                                <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Filters</h2>
                                        <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)} className="h-8 w-8 p-0 rounded-full">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">Refine your search</p>
                                </div>
                                <div className="p-6">
                                    <ProductFilters
                                        categories={categories}
                                        selectedCategoryId={selectedCategoryId}
                                        searchTerm={searchTerm}
                                        onCategoryChange={(id) => {
                                            setSelectedCategoryId(id);
                                            setIsFilterOpen(false);
                                        }}
                                        onSearchChange={setSearchTerm}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Mobile Filter Toggle Button */}
                    <div className="lg:hidden fixed bottom-24 right-6 z-40">
                        <Button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-0"
                        >
                            <div className="relative">
                                <Filter className="w-6 h-6" />
                                {(selectedCategoryId || searchTerm) && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-amber-600 text-amber-600">
                                        !
                                    </span>
                                )}
                            </div>
                        </Button>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 min-w-0">
                        {isLoading ? (
                            <ProductGridSkeleton />
                        ) : hasError ? (
                            <div className="backdrop-blur-xl bg-white/70 rounded-[2rem] border border-red-100/50 shadow-2xl p-12 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <ShoppingCart className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Issue</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
                                    We're having trouble reaching our servers. Please check your internet or disable any ad-blockers and try again.
                                </p>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl px-12 h-12 font-bold shadow-lg shadow-amber-500/30"
                                >
                                    Retry Connection
                                </Button>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="backdrop-blur-xl bg-white/70 rounded-[2rem] border border-dashed border-gray-200/50 shadow-2xl p-12 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    No matches found
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    Try adjusting your filters or search term
                                </p>
                                <Button
                                    onClick={() => {
                                        setSelectedCategoryId(undefined);
                                        setSearchTerm('');
                                    }}
                                    variant="outline"
                                    className="rounded-xl px-8"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isRegistered={isApproved}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
