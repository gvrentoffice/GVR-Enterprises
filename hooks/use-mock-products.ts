import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export function useProducts() {
    // Simulate async data fetching
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProducts(DEMO_PRODUCTS);
            setLoading(false);
        }, 800); // Simulate network latency

        return () => clearTimeout(timer);
    }, []);

    return { products, loading, error };
}

export function useProduct(id: string) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const found = DEMO_PRODUCTS.find(p => p.id === id);
            if (found) {
                setProduct(found);
                setError(null);
            } else {
                setProduct(null);
                setError("Product not found");
            }
            setLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [id]);

    return { product, loading, error };
}
