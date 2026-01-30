'use client';

import { useState, useEffect } from 'react';
import {
    getAllCategories,
    getMainCategories,
    getCategoryTree,
    getCategoryById,
    getCategoryBySlug,
} from '@/lib/firebase/services/categoryService';
import type { Category } from '@/lib/firebase/schema';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                setCategories(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}

export function useMainCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getMainCategories();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching main categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading };
}

export function useCategoryTree() {
    const [tree, setTree] = useState<(Category & { children?: Category[] })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const data = await getCategoryTree();
                setTree(data);
            } catch (err) {
                console.error('Error fetching category tree:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTree();
    }, []);

    return { tree, loading };
}

export function useCategory(categoryId: string) {
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const data = await getCategoryById(categoryId);
                setCategory(data);
            } catch (err) {
                console.error('Error fetching category:', err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    return { category, loading };
}

export function useCategoryBySlug(slug: string) {
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const data = await getCategoryBySlug(slug);
                setCategory(data);
            } catch (err) {
                console.error('Error fetching category:', err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchCategory();
        }
    }, [slug]);

    return { category, loading };
}
