import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Image Placeholder */}
            <Skeleton className="aspect-square w-full" />

            <div className="p-4 space-y-3">
                {/* Category & Badge */}
                <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Title */}
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />

                {/* SKU & Unit */}
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-10" />
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
