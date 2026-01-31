'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { TENANT_ID } from '@/lib/constants';

export default function FixProductsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const checkAndFixProducts = async () => {
        setLoading(true);
        setResult(null);

        try {
            // Get ALL products (no tenantId filter for debugging)
            const productsRef = collection(db, 'products');
            const snapshot = await getDocs(productsRef);

            const issues: any[] = [];
            const fixes: any[] = [];
            const allProducts: any[] = [];

            for (const docSnapshot of snapshot.docs) {
                const product = docSnapshot.data();
                const productId = docSnapshot.id;
                const productIssues: string[] = [];
                const updates: any = {};

                // Store all product info for debugging
                allProducts.push({
                    id: productId,
                    name: product.name,
                    sku: product.sku,
                    tenantId: product.tenantId,
                    status: product.status,
                    visibility: product.visibility,
                    categoryId: product.categoryId,
                    categoryName: product.categoryName,
                });

                // Check tenantId
                if (product.tenantId !== TENANT_ID) {
                    productIssues.push(`TenantId: ${product.tenantId || 'missing'} → ${TENANT_ID}`);
                    updates.tenantId = TENANT_ID;
                }

                // Check status
                if (!product.status || product.status !== 'active') {
                    productIssues.push(`Status: ${product.status || 'missing'} → active`);
                    updates.status = 'active';
                }

                // Check visibility
                if (!product.visibility || product.visibility !== 'public') {
                    productIssues.push(`Visibility: ${product.visibility || 'missing'} → public`);
                    updates.visibility = 'public';
                }

                // Check categoryId
                if (!product.categoryId) {
                    productIssues.push('Missing categoryId');
                }

                // Check categoryName
                if (!product.categoryName) {
                    productIssues.push('Missing categoryName');
                }

                if (productIssues.length > 0) {
                    issues.push({
                        id: productId,
                        name: product.name,
                        sku: product.sku,
                        issues: productIssues,
                        fullData: allProducts[allProducts.length - 1],
                    });

                    // Apply fixes if there are updates
                    if (Object.keys(updates).length > 0) {
                        await updateDoc(doc(db, 'products', productId), updates);
                        fixes.push({
                            id: productId,
                            name: product.name,
                            updates,
                        });
                    }
                }
            }

            setResult({
                success: true,
                totalProducts: snapshot.docs.length,
                issuesFound: issues.length,
                issuesFixed: fixes.length,
                issues,
                fixes,
                allProducts, // Include all products for debugging
            });
        } catch (error: any) {
            setResult({
                success: false,
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="backdrop-blur-2xl bg-white/40 border-b border-white/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Fix Products
                    </h1>
                    <p className="text-zinc-600 mt-2 text-sm sm:text-base font-medium">
                        Check and fix product visibility issues
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Banner */}
                <div className="backdrop-blur-xl bg-blue-50/80 border-2 border-blue-200 rounded-3xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-black text-blue-900 mb-2">Product Visibility Requirements</h3>
                            <p className="text-blue-700 text-sm font-medium mb-2">
                                For products to show in the customer portal, they must have:
                            </p>
                            <ul className="text-blue-700 text-sm font-medium list-disc list-inside space-y-1">
                                <li><strong>tenantId:</strong> '{TENANT_ID}'</li>
                                <li><strong>status:</strong> 'active'</li>
                                <li><strong>visibility:</strong> 'public'</li>
                                <li><strong>categoryId:</strong> Must match a valid category</li>
                                <li><strong>categoryName:</strong> Must be set</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Result Message */}
                {result && (
                    <div
                        className={`backdrop-blur-xl rounded-3xl border-2 p-6 mb-8 ${result.success
                                ? 'bg-green-50/80 border-green-200'
                                : 'bg-red-50/80 border-red-200'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {result.success ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1">
                                <h3
                                    className={`font-black mb-2 ${result.success ? 'text-green-900' : 'text-red-900'
                                        }`}
                                >
                                    {result.success ? '✅ Check Complete!' : '❌ Error'}
                                </h3>
                                {result.success ? (
                                    <div className="space-y-2">
                                        <p className="text-green-700 text-sm font-medium">
                                            Total Products: {result.totalProducts}
                                        </p>
                                        <p className="text-green-700 text-sm font-medium">
                                            Issues Found: {result.issuesFound}
                                        </p>
                                        <p className="text-green-700 text-sm font-medium">
                                            Issues Fixed: {result.issuesFixed}
                                        </p>

                                        {/* Show all products for debugging */}
                                        {result.allProducts && result.allProducts.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-bold text-green-900 mb-2">All Products Found:</h4>
                                                {result.allProducts.map((p: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white/50 rounded-2xl p-3 border border-green-200 mb-2 text-xs"
                                                    >
                                                        <p className="font-bold text-zinc-900">{p.name} ({p.sku})</p>
                                                        <p className="text-zinc-600">TenantId: {p.tenantId || 'MISSING'}</p>
                                                        <p className="text-zinc-600">Status: {p.status || 'MISSING'}</p>
                                                        <p className="text-zinc-600">Visibility: {p.visibility || 'MISSING'}</p>
                                                        <p className="text-zinc-600">CategoryId: {p.categoryId || 'MISSING'}</p>
                                                        <p className="text-zinc-600">CategoryName: {p.categoryName || 'MISSING'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {result.issues.length > 0 && (
                                            <div className="mt-4 space-y-3">
                                                <h4 className="font-bold text-green-900">Product Issues:</h4>
                                                {result.issues.map((issue: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white/50 rounded-2xl p-4 border border-green-200"
                                                    >
                                                        <p className="font-bold text-zinc-900 mb-1">
                                                            {issue.name} ({issue.sku})
                                                        </p>
                                                        <ul className="text-xs text-zinc-600 list-disc list-inside">
                                                            {issue.issues.map((i: string, iIdx: number) => (
                                                                <li key={iIdx}>{i}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {result.fixes.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-bold text-green-900 mb-2">Applied Fixes:</h4>
                                                {result.fixes.map((fix: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white/50 rounded-2xl p-3 border border-green-200 mb-2"
                                                    >
                                                        <p className="font-bold text-zinc-900 text-sm">
                                                            {fix.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-600">
                                                            Updated: {Object.keys(fix.updates).join(', ')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-red-700 text-sm font-medium">
                                        Error: {result.error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-lg">
                            <RefreshCw className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-zinc-900 text-lg mb-2">
                                Check & Fix Products
                            </h3>
                            <p className="text-zinc-600 text-sm font-medium mb-4">
                                This will scan ALL products (regardless of tenantId) and show their details.
                                It will automatically fix status, visibility, and tenantId fields.
                            </p>
                            <Button
                                onClick={checkAndFixProducts}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Check & Fix Products
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
