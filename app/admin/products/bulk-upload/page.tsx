'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Download } from 'lucide-react';
import { getAllCategories } from '@/lib/firebase/services/categoryService';
import { bulkCreateProducts } from '@/lib/firebase/services/productService';
import type { Category, Product } from '@/lib/firebase/schema';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

interface ParsedProduct {
    sku: string;
    name: string;
    categoryName: string;
    brand: string;
    size: string;
    mrp: number;
    dealerPrice: number;
    unit: string;
    moq: number;
    stock: number;
    error?: string;
    isValid: boolean;
}

export default function BulkUploadPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ParsedProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getAllCategories();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const results: ParsedProduct[] = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = lines[i].split(',').map(v => v.trim());
                const row: any = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });

                const parsedRow: ParsedProduct = {
                    sku: row.sku || `PROD-${nanoid(6).toUpperCase()}`,
                    name: row.name || '',
                    categoryName: row.category || '',
                    brand: row.brand || '',
                    size: row.size || '',
                    mrp: parseFloat(row.mrp) || 0,
                    dealerPrice: parseFloat(row.dealerprice || row.dealer_price) || 0,
                    unit: row.unit || 'pcs',
                    moq: parseInt(row.moq) || 1,
                    stock: parseInt(row.available || row.stock) || 0,
                    isValid: true
                };

                // Basic Validation
                if (!parsedRow.name) {
                    parsedRow.isValid = false;
                    parsedRow.error = 'Missing Name';
                } else if (!parsedRow.categoryName) {
                    parsedRow.isValid = false;
                    parsedRow.error = 'Missing Category';
                } else if (parsedRow.mrp <= 0) {
                    parsedRow.isValid = false;
                    parsedRow.error = 'Invalid MRP';
                }

                results.push(parsedRow);
            }
            setPreviewData(results);
            setLoading(false);
        };
        reader.readAsText(file);
    };

    const handleUpload = async () => {
        if (previewData.length === 0) return;

        const validProducts = previewData.filter(p => p.isValid);
        if (validProducts.length === 0) {
            toast({
                title: 'No Valid Products',
                description: 'Please fix the errors in your CSV file.',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);
        try {
            const productsToSave: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = validProducts.map(p => {
                const category = categories.find(c => c.name.toLowerCase() === p.categoryName.toLowerCase());

                return {
                    tenantId: 'ryth-bazar',
                    name: p.name,
                    description: `${p.name} - ${p.brand}`,
                    categoryId: category?.id || 'unassigned',
                    categoryName: category?.name || p.categoryName,
                    sku: p.sku,
                    pricing: {
                        mrp: p.mrp,
                        dealerPrice: p.dealerPrice,
                        unit: p.unit,
                        moq: p.moq
                    },
                    images: [],
                    thumbnail: '',
                    inventory: {
                        available: p.stock,
                        reserved: 0,
                        reorderLevel: 5
                    },
                    tags: [p.brand, p.categoryName].filter(Boolean),
                    status: 'active',
                    visibility: 'public',
                    showPriceToPublic: true,
                    showDealerPriceToRegistered: true
                };
            });

            const success = await bulkCreateProducts(productsToSave);
            if (success) {
                toast({
                    title: 'Upload Successful',
                    description: `Successfully uploaded ${productsToSave.length} products.`,
                });
                router.push('/admin/products');
            } else {
                throw new Error('Batch update failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload Failed',
                description: 'An error occurred during bulk upload.',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "SKU,Name,Category,Brand,Size,MRP,DealerPrice,Unit,MOQ,AvailableStock\nPROD-001,Premium Plywood 18mm,Plywood,Century,8x4,1200,950,sheet,10,100";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_bulk_upload_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Bulk Upload Products</h1>
                    <p className="text-zinc-500">Upload multiple products at once using a CSV file</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <Card className="lg:col-span-1 border-zinc-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Step 1: Upload File</CardTitle>
                        <CardDescription>Upload your product CSV file here</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center hover:border-amber-500 transition-colors cursor-pointer bg-zinc-50/50"
                            onClick={() => document.getElementById('csv-upload')?.click()}
                        >
                            <FileSpreadsheet className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                            <p className="text-sm font-medium text-zinc-900">
                                {file ? file.name : 'Click to select or drag CSV'}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">MAX 2MB • CSV format only</p>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-zinc-200"
                            onClick={downloadTemplate}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                        </Button>

                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Instructions</h4>
                            <ul className="text-xs text-amber-700 space-y-1 ml-4 list-disc">
                                <li>Ensure category names match exactly</li>
                                <li>MRP and DealerPrice must be numbers</li>
                                <li>Unit is required (e.g. pcs, sqft, mtr)</li>
                                <li>SKU is optional (will be auto-generated)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card className="lg:col-span-2 border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Step 2: Preview & Validate</CardTitle>
                            <CardDescription>
                                {previewData.length} products found in file
                            </CardDescription>
                        </div>
                        {previewData.length > 0 && !loading && (
                            <Button
                                onClick={handleUpload}
                                disabled={uploading || previewData.filter(p => p.isValid).length === 0}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Confirm Upload ({previewData.filter(p => p.isValid).length})
                                    </>
                                )}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                <p>Parsing CSV file...</p>
                            </div>
                        ) : previewData.length > 0 ? (
                            <div className="overflow-x-auto border rounded-xl border-zinc-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                                        <tr>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Name</th>
                                            <th className="p-3 text-left">Category</th>
                                            <th className="p-3 text-right">MRP</th>
                                            <th className="p-3 text-right">Dealer Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                        {previewData.map((row, idx) => (
                                            <tr key={idx} className={row.isValid ? "" : "bg-red-50"}>
                                                <td className="p-3">
                                                    {row.isValid ? (
                                                        <span title="Ready to upload">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        </span>
                                                    ) : (
                                                        <span title={row.error}>
                                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 font-medium text-zinc-900">{row.name}</td>
                                                <td className="p-3 text-zinc-500">{row.categoryName}</td>
                                                <td className="p-3 text-right text-zinc-900">₹{row.mrp}</td>
                                                <td className="p-3 text-right text-green-600 font-bold">₹{row.dealerPrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-300 border-2 border-dashed border-zinc-100 rounded-2xl">
                                <Upload className="w-12 h-12 mb-4" />
                                <p>No data to display. Please upload a file.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
