import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const products = [
    { name: "Organic Brown Rice", sales: 124, revenue: "₹12,400" },
    { name: "Sunmower Oil 5L", sales: 85, revenue: "₹38,250" },
    { name: "Premium Tea Dust", sales: 62, revenue: "₹18,600" },
    { name: "Whole Wheat Atta", sales: 58, revenue: "₹14,500" },
    { name: "Fruit Jam Mix", sales: 45, revenue: "₹6,750" },
];

export function TopProductsCard() {
    return (
        <Card className="border-gray-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">Top Selling Products</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.sales} units sold</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{product.revenue}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
