'use client';

import { useState, useEffect } from 'react';
import {
    getPublicProducts,
    getRegisteredProducts,
    getProductById,
    searchProducts,
    getProductsByCategory,
} from '@/lib/firebase/services/productService';
import type { Product } from '@/lib/firebase/schema';

interface UseProductsOptions {
    isRegistered?: boolean;
    categoryId?: string;
}

export function useProducts(options?: UseProductsOptions) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let data: Product[];

                if (options?.categoryId) {
                    data = await getProductsByCategory(
                        options.categoryId,
                        options?.isRegistered
                    );
                } else if (options?.isRegistered) {
                    data = await getRegisteredProducts();
                } else {
                    data = await getPublicProducts();
                }

                setProducts(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [options?.isRegistered, options?.categoryId]);

    return { products, loading, error };
}

export function useProduct(productId: string) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductById(productId);
                setProduct(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    return { product, loading, error };
}

export function useSearchProducts(searchTerm: string, isRegistered: boolean = false) {
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        const performSearch = async () => {
            try {
                setLoading(true);
                const data = await searchProducts(searchTerm, isRegistered);
                setResults(data);
            } catch (err) {
                console.error('Search error:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(performSearch, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, isRegistered]);

    return { results, loading };
}
