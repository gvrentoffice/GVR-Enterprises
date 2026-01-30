import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
}

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <Card key={product.id} className="group border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
                    <CardContent className="p-0 relative aspect-square bg-gray-50">
                        {/* Placeholder for Product Image - Using color block for now or text */}
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 group-hover:scale-105 transition-transform duration-500">
                            {/* In a real app, use next/image here */}
                            <span className="text-4xl font-thin opacity-20">{product.name.charAt(0)}</span>
                        </div>

                        {/* Quick Add Button showing on hover */}
                        <Button
                            size="icon"
                            className="absolute bottom-4 right-4 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start p-4">
                        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                        <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                        <div className="mt-1 font-semibold text-gray-900">₹{product.price}</div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
