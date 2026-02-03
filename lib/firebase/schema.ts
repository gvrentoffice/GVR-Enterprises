import { Timestamp } from 'firebase/firestore';

// PRODUCT SCHEMA
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  pricing: {
    mrp: number;
    dealerPrice: number;
    unit: string;
    moq: number;
  };
  images: string[];
  thumbnail: string;
  inventory: {
    available: number;
    reserved: number;
    reorderLevel: number;
  };
  tags: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  visibility: 'public' | 'registered_only' | 'b2b_only';
  showPriceToPublic: boolean;
  showDealerPriceToRegistered: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// CATEGORY SCHEMA
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// COMPANY (B2B CUSTOMER) SCHEMA
export interface Company {
  id: string;
  tenantId: string;
  name: string;
  gstNumber?: string;
  email: string;
  phone: string;
  creditLimit: number;
  creditUsed: number;
  paymentTerms: 'NET_0' | 'NET_15' | 'NET_30' | 'NET_60' | 'NET_90';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// USER SCHEMA
export interface User {
  id: string;
  tenantId: string;
  email: string;
  phone: string;
  name: string;
  role: 'customer' | 'agent' | 'admin' | 'super_admin';
  companyId?: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ORDER SCHEMA
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  userId?: string;
  companyId?: string;
  leadId?: string; // B2B: Link to lead/customer
  agentId?: string; // B2B: Assigned sales agent
  agentName?: string; // B2B: Agent name for display
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  agentConfirmed: boolean; // B2B: Agent confirmation required
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string; // Customer notes
  logistics?: {
    transportName?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverContact?: string;
    trackingId?: string;
    dispatchedAt?: Timestamp;
    estimatedDelivery?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSku?: string;
  image?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

// AGENT SCHEMA
export interface Agent {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  whatsappNumber: string;
  employeeId: string;
  territory: string[];
  targetSales: number;
  performance?: {
    currentSales: number;
    monthlySales: number;
    tasksCompleted: number;
    leadsGenerated: number;
  };
  attendance?: {
    checkIn?: Timestamp;
    checkInLocation?: GeoPoint;
    checkOut?: Timestamp;
  };
  status: 'active' | 'on_leave' | 'inactive';
  // Security
  mpin?: string; // Hashed 4-6 digit PIN
  passwordHash?: string; // Deprecated, kept for backward compatibility
  webAuthnCredentials?: {
    id: string;
    publicKey: string;
    counter: number;
    transports?: string[];
  }[];
  authPreferences?: {
    enableMpinLogin?: boolean;
    enablePasswordLogin?: boolean; // Deprecated
    enableBiometricLogin?: boolean;
  };
  recoveryEmail?: string;
  isEmailVerified?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Visit {
  companyId: string;
  companyName: string;
  status: 'pending' | 'completed' | 'skipped';
  checkIn?: Timestamp;
  checkOut?: Timestamp;
  notes?: string;
}

// ROUTE SCHEMA
export interface Route {
  id: string;
  tenantId: string;
  agentId: string;
  date: Timestamp;
  visits: Visit[];
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// LEAD SCHEMA (B2B Customer Onboarding)
export interface Lead {
  id: string;
  tenantId?: string;
  shopName: string;
  ownerName: string;
  whatsappNumber: string;
  email?: string | null;
  primaryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  shopImageUrl: string;
  visitingCardUrl: string;
  agentId: string;
  agentName: string;
  status: 'pending' | 'approved' | 'rejected';
  priceAccessApproved: boolean;
  // Security
  mpin?: string; // Hashed 4-6 digit PIN
  passwordHash?: string; // Deprecated, kept for backward compatibility
  webAuthnCredentials?: {
    id: string;
    publicKey: string;
    counter: number;
    transports?: string[];
  }[];
  authPreferences?: {
    enableMpinLogin?: boolean;
    enablePasswordLogin?: boolean; // Deprecated
    enableBiometricLogin?: boolean;
  };
  recoveryEmail?: string;
  isEmailVerified?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Address {
  name?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  phone?: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}