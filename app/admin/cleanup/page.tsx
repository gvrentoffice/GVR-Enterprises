'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { removeDemoProducts, removeAllProducts } from '@/lib/firebase/cleanup';

export default function CleanupPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; deletedCount?: number; error?: any } | null>(null);

    const handleRemoveDemoProducts = async () => {
        if (!confirm('Are you sure you want to remove all demo products? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await removeDemoProducts();
            setResult(res);
        } catch (error) {
            setResult({ success: false, error });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAllProducts = async () => {
        const confirmation = prompt(
            'WARNING: This will delete ALL products! Type "DELETE ALL" to confirm:'
        );

        if (confirmation !== 'DELETE ALL') {
            alert('Cancelled. You must type "DELETE ALL" exactly to proceed.');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await removeAllProducts();
            setResult(res);
        } catch (error) {
            setResult({ success: false, error });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="backdrop-blur-2xl bg-white/40 border-b border-white/50 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        Database Cleanup
                    </h1>
                    <p className="text-zinc-600 mt-2 text-sm sm:text-base font-medium">
                        Remove demo or test data from your database
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Warning Banner */}
                <div className="backdrop-blur-xl bg-red-50/80 border-2 border-red-200 rounded-3xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-black text-red-900 mb-2">⚠️ Danger Zone</h3>
                            <p className="text-red-700 text-sm font-medium">
                                These actions are permanent and cannot be undone. Please make sure you have a backup
                                before proceeding.
                            </p>
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
                            <div>
                                <h3
                                    className={`font-black mb-2 ${result.success ? 'text-green-900' : 'text-red-900'
                                        }`}
                                >
                                    {result.success ? '✅ Success!' : '❌ Error'}
                                </h3>
                                <p
                                    className={`text-sm font-medium ${result.success ? 'text-green-700' : 'text-red-700'
                                        }`}
                                >
                                    {result.success
                                        ? `Successfully deleted ${result.deletedCount} products`
                                        : `Error: ${result.error?.message || 'Unknown error occurred'}`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cleanup Actions */}
                <div className="space-y-6">
                    {/* Remove Demo Products */}
                    <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-xl p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg">
                                <Trash2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-zinc-900 text-lg mb-2">Remove Demo Products</h3>
                                <p className="text-zinc-600 text-sm font-medium mb-4">
                                    This will remove all products that contain "demo" in their ID, name, SKU, or
                                    description. This is the recommended option for cleaning up test data.
                                </p>
                                <Button
                                    onClick={handleRemoveDemoProducts}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/30"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove Demo Products
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Remove All Products */}
                    <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-red-200 shadow-xl p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-lg">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-red-900 text-lg mb-2">
                                    Remove ALL Products (Dangerous!)
                                </h3>
                                <p className="text-red-700 text-sm font-medium mb-4">
                                    ⚠️ This will permanently delete ALL products from your database, including real
                                    products. Only use this if you want to completely reset your product catalog.
                                </p>
                                <Button
                                    onClick={handleRemoveAllProducts}
                                    disabled={loading}
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Delete All Products
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
