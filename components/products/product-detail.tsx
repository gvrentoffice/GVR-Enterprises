"use client";

import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    className?: string;
}

/**
 * ProductDetail Component
 * Displays full product details with an image carousel
 */
export function ProductDetail({ product, onAddToCart, className }: ProductDetailProps) {
    const images = (product.images && product.images.length > 0) ? product.images : [product.image];

    // Calculate generic bulk savings if available
    const savingPercent = product.bulkPrice ? Math.round(((product.price - product.bulkPrice) / product.price) * 100) : 0;

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in zoom-in-95 duration-500", className)}>
            {/* Left Column: Image Carousel */}
            <div className="space-y-4">
                <div className="relative rounded-3xl bg-white shadow-lg border border-white/20 overflow-hidden group">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {images.map((img, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-square w-full relative overflow-hidden bg-gray-50">
                                        <Image
                                            src={img}
                                            alt={`${product.name} - image ${index + 1}`}
                                            fill
                                            className="object-cover transform hover:scale-105 transition-transform duration-700"
                                            priority={index === 0}
                                            quality={85}
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {images.length > 1 && (
                            <>
                                <CarouselPrevious className="left-4 bg-white/80 backdrop-blur-md border-0 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CarouselNext className="right-4 bg-white/80 backdrop-blur-md border-0 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                        )}
                    </Carousel>
                </div>

                {/* Thumbnails (Optional) */}
                {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className="relative w-20 h-20 rounded-xl border-2 border-transparent hover:border-primary/50 overflow-hidden flex-shrink-0 cursor-pointer transition-all hover:shadow-md"
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                    quality={60}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Product Info */}
            <div className="flex flex-col space-y-6 py-4">
                <div>
                    <div className="flex justify-between items-start">
                        <Badge className="bg-secondary text-black hover:bg-secondary/90 mb-4 px-4 py-1.5 text-sm font-medium shadow-sm border-none">
                            {product.category}
                        </Badge>
                        {product.sku && (
                            <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                        {product.name}
                    </h1>
                </div>

                <div className="flex flex-col gap-1 pb-6 border-b border-gray-100">
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-primary">₹{product.bulkPrice || product.price}</span>
                        <span className="text-gray-400 text-xl font-medium mb-1">/ {product.unit}</span>
                        {product.bulkPrice && (
                            <Badge className="mb-2 bg-green-100 text-green-700 border-none">
                                Bulk Price ({savingPercent}% Off)
                            </Badge>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                        M.R.P: <span className="line-through">₹{product.price}</span> (Inclusive of {product.taxRate || 0}% GST)
                    </div>
                </div>

                {/* B2B Highlights */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">MOQ</span>
                        <span className="text-lg font-bold text-gray-800">{product.moq || 1} {product.unit}s</span>
                        <span className="text-xs text-gray-500">Minimum Order</span>
                    </div>
                    <div className="flex flex-col p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Origin</span>
                        <span className="text-lg font-bold text-gray-800">{product.origin || "India"}</span>
                        <span className="text-xs text-gray-500">Sourced Directly</span>
                    </div>
                </div>

                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                    <p>
                        {product.description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <span className="block text-sm text-gray-500 font-medium mb-1">Stock Status</span>
                        <span className="text-lg font-semibold text-green-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {product.stock > (product.moq || 0) ? "In Stock" : "Low Stock"}
                        </span>
                        <span className="text-xs text-gray-400">{product.stock} units available</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <span className="block text-sm text-gray-500 font-medium mb-1">Quality Score</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-yellow-400 text-xl">★</span>
                            <span className="text-lg font-semibold text-gray-900">{product.rating}</span>
                            <span className="text-gray-400 text-sm">/ 5.0</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4 mt-auto">
                    <Button
                        className="w-full bg-primary hover:bg-primary-hover text-white h-16 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                        onClick={() => onAddToCart?.(product)}
                    >
                        Add to Bulk Order
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span>🛡️ Secure B2B Checkout</span>
                        <span>•</span>
                        <span>🚛 Bulk Logistics Partner</span>
                        <span>•</span>
                        <span>📄 GST Invoice Available</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
