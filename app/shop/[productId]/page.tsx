'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Heart, ShoppingCart } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/lib/hooks/useCart';
import { ProductGallery } from '@/components/products/ProductGallery';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.productId as string;
    const [quantity, setQuantity] = useState(1);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const customerData = localStorage.getItem('customer');
        if (customerData) {
            const parsed = JSON.parse(customerData);
            setIsRegistered(parsed.priceAccessApproved || false);
        }
    }, []);

    const { product, loading, error } = useProduct(productId);
    const { addToCart } = useCart();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <Link href="/shop">
                        <Button>Back to Catalog</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Breadcrumb / Back Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/shop"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-amber-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Catalog
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-8">
                        {/* Left Column: Image Gallery */}
                        <div>
                            <ProductGallery
                                images={product.images}
                                productName={product.name}
                            />
                        </div>

                        {/* Right Column: Product Info */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wide">
                                        {product.categoryName}
                                    </span>

                                    {/* Status Badge */}
                                    {product.status !== 'active' && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${product.status === 'out_of_stock'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {product.status.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                                        {product.sku}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded">
                                        ID: {product.id}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {/* Price & Savings */}
                            <PriceDisplay product={product} isRegistered={isRegistered} />

                            <Separator />

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2 uppercase tracking-wider">Description</h3>
                                <div
                                    className="prose prose-sm text-gray-600 max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>

                            <Separator />

                            {/* Purchase Actions */}
                            <div className="space-y-4 pt-2">
                                <QuantitySelector
                                    moq={product.pricing.moq}
                                    unit={product.pricing.unit}
                                    maxQuantity={product.inventory.available}
                                    onQuantityChange={setQuantity}
                                />

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        size="lg"
                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                                        disabled={product.status === 'out_of_stock' || !isRegistered}
                                        onClick={() => {
                                            addToCart(product, quantity, isRegistered);
                                            alert(`Added ${quantity} ${product.pricing.unit} of ${product.name} to cart!`);
                                        }}
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        {isRegistered ? 'Add to Cart' : 'Approval Required'}
                                    </Button>
                                    <Button variant="outline" size="lg" className="px-3">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                    <Button variant="outline" size="lg" className="px-3">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
