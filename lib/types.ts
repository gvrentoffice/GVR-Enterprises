export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    image: string;
    category: string;
    images?: string[];
    stock: number;
    rating: number;
    // B2B Fields
    sku?: string;
    moq?: number;
    origin?: string;
    bulkPrice?: number; // Price for bulk orders
    taxRate?: number; // GST %
}

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
    image: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: OrderStatus;
    totalAmount: number;
    items: OrderItem[];
    deliveryAddress: string;
    estimatedDelivery?: string;
}
