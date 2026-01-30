"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    inStock?: boolean;
    discount?: number;
}

interface ProductCardProps {
    product: Product;
    onViewDetails?: (productId: string) => void;
    onAddToCart?: (productId: string) => void;
}

/**
 * ProductCard Component
 * Displays product image, name, price, and CTA
 * Source: docs/notion_sync/web_component_checklist.md Phase 2.1
 */
export function ProductCard({
    product,
    onViewDetails,
    onAddToCart,
}: ProductCardProps) {
    const { id, name, price, image, category, inStock = true, discount } = product;

    return (
        <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {discount && (
                        <Badge variant="danger">-{discount}%</Badge>
                    )}
                    {!inStock && (
                        <Badge variant="outline">Out of Stock</Badge>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <CardContent className="p-4">
                {category && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {category}
                    </p>
                )}
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    {discount ? (
                        <>
                            <span className="text-lg font-bold text-primary">
                                ₹{(price * (1 - discount / 100)).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                                ₹{price.toFixed(2)}
                            </span>
                        </>
                    ) : (
                        <span className="text-lg font-bold text-primary">
                            ₹{price.toFixed(2)}
                        </span>
                    )}
                </div>
            </CardContent>

            {/* Action Buttons */}
            <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onViewDetails?.(id)}
                >
                    View Details
                </Button>
                <Button
                    className="flex-1"
                    onClick={() => onAddToCart?.(id)}
                    disabled={!inStock}
                >
                    {inStock ? "Add to Cart" : "Unavailable"}
                </Button>
            </CardFooter>
        </Card>
    );
}
