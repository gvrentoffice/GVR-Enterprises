'use client';

import { useTopProducts } from '@/hooks/useAnalytics';

export default function SalesPage() {
    const endDate = new Date();
    // Get last 30 days
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { products, loading } = useTopProducts(startDate, endDate);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales Insights</h1>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Top Performing Products</h2>
                    </div>

                    {products.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No sales data found.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-medium text-gray-500">Product Name</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 text-right">Units Sold</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="p-4 text-right text-gray-600">{product.quantity}</td>
                                        <td className="p-4 text-right font-bold text-gray-900">₹{product.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
