"use client";

import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onViewDetails?: (product: Product) => void;
    className?: string;
}

/**
 * ProductCard component for displaying product summaries
 * Design follows Unified UI Rules (Royal Blue primary, rounded-lg)
 */
export function ProductCard({ product, onAddToCart, onViewDetails, className }: ProductCardProps) {
    return (
        <Card className={cn(
            "group flex flex-col h-full overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl",
            className
        )}>
            {/* Product Image */}
            <div
                className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
                onClick={() => onViewDetails?.(product)}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <Badge
                    className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-black hover:bg-white shadow-sm font-medium px-3 py-1"
                >
                    {product.category}
                </Badge>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
                <div
                    className="cursor-pointer mb-2"
                    onClick={() => onViewDetails?.(product)}
                >
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {product.description}
                </p>

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Price</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary">
                                ₹{product.price}
                            </span>
                            <span className="text-sm text-gray-400 font-medium">
                                / {product.unit}
                            </span>
                        </div>
                    </div>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors shadow-none hover:shadow-md"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart?.(product);
                        }}
                    >
                        <span className="text-lg">＋</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
