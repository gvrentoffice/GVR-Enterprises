'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToCartModal } from '@/components/cart/AddToCartModal';
import type { Product } from '@/lib/firebase/schema';

interface ProductCardProps {
    product: Product;
    isRegistered?: boolean;
}

export function ProductCard({
    product,
    isRegistered = false,
}: ProductCardProps) {
    const [showModal, setShowModal] = useState(false);

    const savingsPercentage = isRegistered
        ? Math.round(((product.pricing.mrp - product.pricing.dealerPrice) / product.pricing.mrp) * 100)
        : 0;

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/40 hover:border-amber-100/50 transition-all duration-500 flex flex-col h-full">
            {/* Image Container */}
            <Link
                href={`/shop/${product.id}`}
                className="block overflow-hidden aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100/50"
            >
                {product.thumbnail ? (
                    <div className="absolute inset-0 p-4">
                        <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-contain transition-transform duration-700 group-hover:scale-110 p-4"
                            quality={90}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 text-gray-200 flex flex-col items-center justify-center">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest">No Preview</span>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Stock Status Badge */}
                {product.status === 'out_of_stock' && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <span className="text-gray-900 font-semibold text-[10px] uppercase tracking-[0.2em] border border-gray-900 px-3 py-1 bg-white shadow-sm">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Savings Badge (B2B only) */}
                {savingsPercentage > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter shadow-lg shadow-amber-900/20 backdrop-blur-sm bg-opacity-95">
                            SAVE {savingsPercentage}%
                        </div>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Category */}
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-[0.15em] shrink-0">
                        {product.categoryName}
                    </p>
                </div>

                {/* Product Name */}
                <Link href={`/shop/${product.id}`} className="mb-1.5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 line-clamp-2 text-sm leading-snug transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* SKU & Unit */}
                <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-[8px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        {product.sku}
                    </span>
                    <span className="text-[8px] text-gray-400 font-medium bg-gray-50/50 px-1.5 py-0.5 rounded uppercase">
                        {product.pricing.unit}
                    </span>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-auto pt-4 border-t border-gray-50/80">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                {isRegistered ? (
                                    <>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                                ₹{product.pricing.dealerPrice.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-[10px] text-gray-400 line-through font-medium mb-0.5">
                                                ₹{product.pricing.mrp.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <div className="w-1 h-1 bg-amber-500 rounded-full" />
                                            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-tighter">
                                                MOQ: <span className="text-amber-600">{product.pricing.moq} {product.pricing.unit}</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                                            Dealer Prices
                                        </span>
                                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                                            Register to unlock
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowModal(true);
                                }}
                                disabled={(product.status as string) === 'out_of_stock' || (!isRegistered && (product.status as string) !== 'out_of_stock')}
                                variant="outline"
                                className="h-10 text-[10px] font-bold uppercase tracking-widest rounded-xl border-gray-100 bg-gray-50/50 hover:bg-white hover:border-amber-200 hover:text-amber-600 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                ADD
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = `/shop/${product.id}`;
                                }}
                                disabled={(product.status as string) === 'out_of_stock' || (!isRegistered && (product.status as string) !== 'out_of_stock')}
                                className="h-10 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200 hover:shadow-amber-300 transition-all duration-300"
                            >
                                BUY NOW
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add to Cart Modal */}
            {showModal && (
                <AddToCartModal
                    product={product}
                    isApproved={isRegistered}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
