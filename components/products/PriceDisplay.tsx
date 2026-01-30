'use client';

import type { Product } from '@/lib/firebase/schema';

interface PriceDisplayProps {
    product: Product;
    isRegistered?: boolean;
}

export function PriceDisplay({ product, isRegistered = false }: PriceDisplayProps) {
    const mrp = product.pricing.mrp;
    const dealerPrice = product.pricing.dealerPrice;
    const savings = mrp - dealerPrice;
    const savingsPercentage = Math.round((savings / mrp) * 100);

    return (
        <div className="space-y-4">
            {isRegistered ? (
                <>
                    {/* B2B Pricing */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                        <p className="text-sm text-gray-600 mb-2">Dealer Price</p>
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-semibold text-amber-600">
                                ₹{dealerPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xl text-gray-400 line-through">
                                ₹{mrp.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="mt-4 text-sm font-medium text-green-600">
                            You save ₹{savings.toLocaleString('en-IN')} ({savingsPercentage}%)
                        </div>
                    </div>

                    {/* Volume Pricing Info */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-2">💡 Volume Pricing</p>
                        <p className="text-sm text-blue-800">
                            Order larger quantities for better prices. Contact support for custom quotes.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    {/* Public Pricing */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Maximum Retail Price (MRP)</p>
                        <span className="text-4xl font-semibold text-gray-900">
                            ₹{mrp.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {/* Login Prompt */}
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-sm text-amber-900">
                            📌 <span className="font-semibold">Login</span> to see special dealer prices and bulk discounts!
                        </p>
                    </div>
                </>
            )}

            {/* MOQ Info */}
            <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Minimum Order Quantity:</p>
                <p className="text-lg font-semibold text-gray-900">
                    {product.pricing.moq} {product.pricing.unit}
                </p>
            </div>
        </div>
    );
}
