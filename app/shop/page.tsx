'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import { cn } from '@/lib/utils';
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
    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

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
        <div className="min-h-screen bg-gray-50/50">
            {/* Customer Status Banner (Subtle) */}
            {!customer ? (
                <div className="bg-amber-100/30 backdrop-blur-sm border-b border-amber-100">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
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
                <div className="bg-blue-50 backdrop-blur-sm border-b border-blue-100">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <p className="text-xs text-blue-900 font-medium">
                            <span className="font-semibold uppercase tracking-tighter mr-2">Pending Approval</span> Your account is under review for dealer pricing.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900 backdrop-blur-sm border-b border-gray-800">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
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

            {/* Header Content */}
            <div className="bg-white border-b border-gray-100 mt-1">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight uppercase">
                        Product Catalog
                    </h1>
                    <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">
                        {filteredProducts.length} Premium Collection{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Filters Sidebar (Collapsible on Mobile) */}
                    <div className={cn(
                        "lg:w-64 shrink-0 transition-all duration-300",
                        isFilterOpen ? "block" : "hidden lg:block"
                    )}>
                        <div className="lg:sticky lg:top-24 bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl border lg:border-none border-gray-100 shadow-xl lg:shadow-none">
                            <div className="flex items-center justify-between lg:hidden mb-6">
                                <h2 className="text-lg font-bold">Filters</h2>
                                <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)}>
                                    Close
                                </Button>
                            </div>
                            <ProductFilters
                                categories={categories}
                                selectedCategoryId={selectedCategoryId}
                                searchTerm={searchTerm}
                                onCategoryChange={(id) => {
                                    setSelectedCategoryId(id);
                                    if (window.innerWidth < 1024) setIsFilterOpen(false);
                                }}
                                onSearchChange={setSearchTerm}
                            />
                        </div>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden fixed bottom-24 right-6 z-40">
                        <Button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="h-14 w-14 rounded-full shadow-2xl bg-gray-900 hover:bg-black text-white p-0"
                        >
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                {(selectedCategoryId || searchTerm) && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-600 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                        !
                                    </span>
                                )}
                            </div>
                        </Button>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <ProductGridSkeleton />
                        ) : hasError ? (
                            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-red-100 flex flex-col items-center shadow-sm">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                    <ShoppingCart className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Issue</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
                                    We're having trouble reaching our servers. Please check your internet or disable any ad-blockers and try again.
                                </p>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="bg-zinc-900 text-white hover:bg-black rounded-xl px-12 h-12 font-bold"
                                >
                                    Retry Connection
                                </Button>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                                <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
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
