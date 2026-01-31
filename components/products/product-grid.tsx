"use client";

import { Product } from "@/lib/firebase/schema";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
    products: Product[];
    onAddToCart?: (product: Product) => void;
    onViewDetails?: (product: Product) => void;
    className?: string;
}

/**
 * ProductGrid layout component
 * Responsive behavior:
 * - Mobile: 1 column
 * - Tablet/Small Laptop: 2 columns
 * - Desktop: 3 columns
 * - Large Desktop: 4 columns
 */
export function ProductGrid({ products, onAddToCart, onViewDetails, className }: ProductGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
                className
            )}
        >
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
}
