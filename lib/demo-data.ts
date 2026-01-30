export interface LegacyProduct {
    id: string;
    name: string;
    // ... keeping this for legacy components if any, but we exported Product from types
}

import { Product, Order, OrderStatus } from "@/lib/types";
export type { Product, Order, OrderStatus };

export const DEMO_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Premium Basmati Rice",
        description: "Long-grain aromatic rice, aged for 2 years for perfect texture and taste.",
        price: 120,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop",
        category: "Grains",
        images: [
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590080875515-8a0a3dd947d2?q=80&w=600&auto=format&fit=crop"
        ],
        stock: 500,
        rating: 4.8,
        sku: "PBR-001",
        moq: 10,
        origin: "Punjab, India",
        bulkPrice: 110,
        taxRate: 5
    },
    {
        id: "2",
        name: "Organic Mustard Oil",
        description: "Cold-pressed pure mustard oil, rich in omega-3 and great for traditional cooking.",
        price: 180,
        unit: "L",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop",
        category: "Oils",
        stock: 200,
        rating: 4.5,
        sku: "OMO-002",
        moq: 5,
        origin: "Rajasthan, India",
        bulkPrice: 165,
        taxRate: 12
    },
    {
        id: "3",
        name: "Farm Fresh Desi Ghee",
        description: "Traditional bilona ghee made from grass-fed cow's milk. Pure and healthy.",
        price: 650,
        unit: "500g",
        image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=600&auto=format&fit=crop",
        category: "Dairy",
        stock: 100,
        rating: 4.9,
        sku: "FDG-003",
        moq: 2,
        origin: "Haryana, India",
        bulkPrice: 620,
        taxRate: 12
    },
    {
        id: "4",
        name: "Whole Wheat Atta",
        description: "Stone-ground whole wheat flour for soft and nutritious rotis.",
        price: 45,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
        category: "Grains",
        stock: 1000,
        rating: 4.6,
        sku: "WWA-004",
        moq: 20,
        origin: "Madhya Pradesh, India",
        bulkPrice: 40,
        taxRate: 0
    },
    {
        id: "5",
        name: "Organic Turmeric Powder",
        description: "Sun-dried and ground turmeric with high curcumin content.",
        price: 250,
        unit: "500g",
        image: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=600&auto=format&fit=crop",
        category: "Spices",
        stock: 150,
        rating: 4.7,
        sku: "OTP-005",
        moq: 5,
        origin: "Kerala, India",
        bulkPrice: 230,
        taxRate: 5
    }
];

// Order types moved to lib/types.ts

export const DEMO_ORDERS: Order[] = [
    {
        id: "1",
        orderNumber: "RB-9921-X",
        date: "2024-01-20",
        status: "Pending",
        totalAmount: 1440,
        items: [
            {
                productId: "1",
                productName: "Premium Basmati Rice",
                quantity: 2,
                price: 120,
                unit: "kg",
                image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"
            },
            {
                productId: "2",
                productName: "Organic Mustard Oil",
                quantity: 1,
                price: 180,
                unit: "L",
                image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop"
            }
        ],
        deliveryAddress: "123, Green Park, New Delhi",
        estimatedDelivery: "22nd Jan, 2024"
    },
    {
        id: "2",
        orderNumber: "RB-8854-C",
        date: "2024-01-15",
        status: "Delivered",
        totalAmount: 650,
        items: [
            {
                productId: "3",
                productName: "Farm Fresh Desi Ghee",
                quantity: 1,
                price: 650,
                unit: "500g",
                image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=600&auto=format&fit=crop"
            }
        ],
        deliveryAddress: "45, Model Town, Delhi"
    },
    {
        id: "3",
        orderNumber: "RB-7732-P",
        date: "2024-01-18",
        status: "Shipped",
        totalAmount: 900,
        items: [
            {
                productId: "4",
                productName: "Whole Wheat Atta",
                quantity: 10,
                price: 45,
                unit: "kg",
                image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"
            }
        ],
        deliveryAddress: "12, Civil Lines, Jaipur",
        estimatedDelivery: "21st Jan, 2024"
    }
];
