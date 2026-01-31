"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use() as per Next.js 15
    const { id } = use(params);
    const { product, loading, error } = useProduct(id);

    return (
        <div className="space-y-6 pb-24">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-2 hover:bg-white/50"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Catalog
            </Button>

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load product: {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            )}

            {/* Product Detail Card */}
            {!loading && product && (
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-xl p-1 md:p-8">
                    <ProductDetail
                        product={product}
                        onAddToCart={() => router.push("/shop/checkout")}
                    />
                </div>
            )}

            {/* Not Found State */}
            {!loading && !product && !error && (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
                    <p className="text-gray-500 mt-2">The product you are looking for does not exist.</p>
                </div>
            )}
        </div>
    );
}
