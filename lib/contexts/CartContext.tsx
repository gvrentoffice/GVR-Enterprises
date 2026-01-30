'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/firebase/schema';

export interface CartItem {
    productId: string;
    productName: string;
    productSku: string;
    productImage: string;
    categoryName: string;

    quantity: number;
    unit: string;
    moq: number;

    unitPrice: number;
    dealerPrice?: number;
    subtotal: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
}

interface CartContextType {
    cart: Cart;
    addToCart: (product: Product, quantity: number, isRegistered: boolean) => void;
    updateQuantity: (productId: string, newQuantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    itemCount: number;
    cartSize: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'ryth-bazar-cart';
const TAX_RATE = 0.18; // 18% GST for India

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart>({
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEY);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        }
    }, [cart, isLoading]);

    const recalculateTotals = useCallback((items: CartItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;

        return {
            items,
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            total: Math.round(total * 100) / 100,
        };
    }, []);

    const addToCart = useCallback(
        (product: Product, quantity: number, isRegistered: boolean = false) => {
            setCart((prevCart) => {
                const existingItemIndex = prevCart.items.findIndex(
                    (item) => item.productId === product.id
                );

                let updatedItems: CartItem[];

                if (existingItemIndex > -1) {
                    updatedItems = [...prevCart.items];
                    updatedItems[existingItemIndex].quantity += quantity;
                    updatedItems[existingItemIndex].subtotal =
                        updatedItems[existingItemIndex].quantity *
                        (isRegistered ? product.pricing.dealerPrice : product.pricing.mrp);
                } else {
                    const unitPrice = isRegistered ? product.pricing.dealerPrice : product.pricing.mrp;
                    const newItem: CartItem = {
                        productId: product.id,
                        productName: product.name,
                        productSku: product.sku,
                        productImage: product.thumbnail,
                        categoryName: product.categoryName,
                        quantity,
                        unit: product.pricing.unit,
                        moq: product.pricing.moq,
                        unitPrice,
                        dealerPrice: isRegistered ? product.pricing.dealerPrice : undefined,
                        subtotal: quantity * unitPrice,
                    };
                    updatedItems = [...prevCart.items, newItem];
                }

                return recalculateTotals(updatedItems);
            });
        },
        [recalculateTotals]
    );

    const updateQuantity = useCallback(
        (productId: string, newQuantity: number) => {
            setCart((prevCart) => {
                const updatedItems = prevCart.items.map((item) => {
                    if (item.productId === productId) {
                        if (newQuantity < item.moq) return item;
                        return {
                            ...item,
                            quantity: newQuantity,
                            subtotal: newQuantity * item.unitPrice,
                        };
                    }
                    return item;
                });
                return recalculateTotals(updatedItems);
            });
        },
        [recalculateTotals]
    );

    const removeItem = useCallback(
        (productId: string) => {
            setCart((prevCart) => {
                const updatedItems = prevCart.items.filter((item) => item.productId !== productId);
                return recalculateTotals(updatedItems);
            });
        },
        [recalculateTotals]
    );

    const clearCart = useCallback(() => {
        setCart(recalculateTotals([]));
    }, [recalculateTotals]);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartSize = cart.items.length;

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                itemCount,
                cartSize,
                isLoading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
