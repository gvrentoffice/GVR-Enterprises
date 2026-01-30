import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/lib/types';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        try {
            const q = query(collection(db, 'products'), orderBy('name'));

            unsubscribe = onSnapshot(q, (snapshot: any) => {
                const productsData: Product[] = [];
                snapshot.forEach((doc: any) => {
                    const data = doc.data();
                    productsData.push({
                        id: doc.id,
                        name: data.name || "Unknown Product",
                        description: data.description || "",
                        price: Number(data.price) || 0,
                        unit: data.unit || "unit",
                        image: data.image || "https://placehold.co/600x600?text=No+Image",
                        category: data.category || "Uncategorized",
                        stock: Number(data.stock) || 0,
                        rating: Number(data.rating) || 0,
                        images: data.images || []
                    } as Product);
                });
                setProducts(productsData);
                setLoading(false);
            }, (err: any) => {
                console.error("Error fetching products:", err);
                setError(err.message);
                setLoading(false);
            });
        } catch (err: any) {
            console.error("Error initializing products listener:", err);
            setError(err.message);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return { products, loading, error };
}

export function useProduct(id: string) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        let unsubscribe: (() => void) | undefined;
        setLoading(true);
        try {
            const docRef = doc(db, 'products', id);
            unsubscribe = onSnapshot(docRef, (docSnap: any) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProduct({
                        id: docSnap.id,
                        name: data.name || "Unknown Product",
                        description: data.description || "",
                        price: Number(data.price) || 0,
                        unit: data.unit || "unit",
                        image: data.image || "https://placehold.co/600x600?text=No+Image",
                        category: data.category || "Uncategorized",
                        stock: Number(data.stock) || 0,
                        rating: Number(data.rating) || 0,
                        images: data.images || []
                    } as Product);
                } else {
                    setProduct(null);
                    setError("Product not found");
                }
                setLoading(false);
            }, (err: any) => {
                console.error("Error fetching product:", err);
                setError(err.message);
                setLoading(false);
            });
        } catch (err: any) {
            console.error("Error initializing product listener:", err);
            setError(err.message);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [id]);

    return { product, loading, error };
}
