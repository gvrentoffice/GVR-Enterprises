'use client';

import { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import {
    doc,
    writeBatch,
    Timestamp
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '@/app/AuthContext';

export default function SeedPage() {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

    const seedDatabase = async () => {
        setLoading(true);
        setStatus({ type: 'idle', message: 'Seeding...' });

        try {
            const batch = writeBatch(db);
            const TENANT_ID = 'ryth-bazar';

            // 1. Create an Agent
            const agentId = 'agent-001';
            const agentRef = doc(db, 'agents', agentId);
            batch.set(agentRef, {
                id: agentId,
                tenantId: TENANT_ID,
                userId: user?.uid || 'test-user-id',
                employeeId: 'EMP101',
                territory: ['Central Business District', 'Old Town'],
                targetSales: 500000,
                status: 'active',
                performance: {
                    currentSales: 150000,
                    monthlySales: 125000,
                    tasksCompleted: 24,
                    leadsGenerated: 12
                },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // 2. Create Categories
            const categories = [
                { id: 'cat-001', name: 'Furniture', slug: 'furniture' },
                { id: 'cat-002', name: 'Lighting', slug: 'lighting' },
                { id: 'cat-003', name: 'Decor', slug: 'decor' }
            ];

            categories.forEach(cat => {
                const catRef = doc(db, 'categories', cat.id);
                batch.set(catRef, {
                    ...cat,
                    tenantId: TENANT_ID,
                    level: 0,
                    order: 0,
                    isActive: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            });

            // 3. Create Products
            const products = [
                { id: 'prod-001', name: 'Modern Velvet Sofa', cat: 'cat-001', price: 45000, dPrice: 38000 },
                { id: 'prod-002', name: 'Oak Dining Table', cat: 'cat-001', price: 32000, dPrice: 28000 },
                { id: 'prod-003', name: 'Crystal Chandelier', cat: 'cat-002', price: 15000, dPrice: 12000 },
                { id: 'prod-004', name: 'LED Floor Lamp', cat: 'cat-002', price: 4500, dPrice: 3800 },
                { id: 'prod-005', name: 'Abstract Wall Art', cat: 'cat-003', price: 8000, dPrice: 6500 },
                { id: 'prod-006', name: 'Minimalist Vase Set', cat: 'cat-003', price: 2500, dPrice: 1800 },
                { id: 'prod-007', name: 'Wingback Armchair', cat: 'cat-001', price: 18000, dPrice: 15500 },
                { id: 'prod-008', name: 'Rustic Pendant Light', cat: 'cat-002', price: 3500, dPrice: 2900 },
                { id: 'prod-009', name: 'Wool Area Rug', cat: 'cat-003', price: 12000, dPrice: 10000 },
                { id: 'prod-010', name: 'Ceramic Table Lamp', cat: 'cat-002', price: 5500, dPrice: 4200 }
            ];

            products.forEach(p => {
                const prodRef = doc(db, 'products', p.id);
                batch.set(prodRef, {
                    id: p.id,
                    tenantId: TENANT_ID,
                    name: p.name,
                    description: `Premium quality ${p.name} designed for modern spaces.`,
                    categoryId: p.cat,
                    categoryName: categories.find(c => c.id === p.cat)?.name || '',
                    sku: `SKU-${p.id.toUpperCase()}`,
                    pricing: {
                        mrp: p.price,
                        dealerPrice: p.dPrice,
                        unit: 'Piece',
                        moq: 1
                    },
                    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400'],
                    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400',
                    inventory: {
                        available: 100,
                        reserved: 0,
                        reorderLevel: 10
                    },
                    status: 'active',
                    visibility: 'registered_only',
                    showPriceToPublic: false,
                    showDealerPriceToRegistered: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            });

            // 4. Create Leads (Retailers)
            const leads = [
                { id: 'lead-001', shop: 'Imperial Interiors', owner: 'Vikram Singh' },
                { id: 'lead-002', shop: 'Modern Decor Hub', owner: 'Anita Rao' },
                { id: 'lead-003', shop: 'The Lighting Studio', owner: 'Rajesh Gupta' },
                { id: 'lead-004', shop: 'Elegant Homes', owner: 'Sanjay Mehra' },
                { id: 'lead-005', shop: 'Chic Spaces', owner: 'Priya Sharma' }
            ];

            leads.forEach((l, i) => {
                const leadRef = doc(db, 'leads', l.id);
                batch.set(leadRef, {
                    id: l.id,
                    tenantId: TENANT_ID,
                    shopName: l.shop,
                    ownerName: l.owner,
                    whatsappNumber: `987654321${i}`,
                    email: `${l.owner.toLowerCase().replace(' ', '.')}@example.com`,
                    primaryAddress: {
                        street: `${100 + i}, Main Market Road`,
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001'
                    },
                    shopImageUrl: '',
                    visitingCardUrl: '',
                    agentId: agentId,
                    agentName: 'EMP101',
                    status: 'approved',
                    priceAccessApproved: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            });

            // 5. Create Orders
            const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'pending', 'pending', 'confirmed', 'processing', 'delivered'];

            for (let i = 0; i < 10; i++) {
                const orderId = `ord-s-${i}`;
                const lead = leads[i % leads.length];
                const status = statuses[i] as any;

                const orderRef = doc(db, 'orders', orderId);
                batch.set(orderRef, {
                    id: orderId,
                    tenantId: TENANT_ID,
                    orderNumber: `RB-${2024000 + i}`,
                    leadId: lead.id,
                    agentId: agentId,
                    agentName: 'EMP101',
                    items: [
                        {
                            productId: 'prod-001',
                            productName: 'Modern Velvet Sofa',
                            quantity: 1,
                            unit: 'Piece',
                            unitPrice: 38000,
                            totalPrice: 38000
                        },
                        {
                            productId: 'prod-003',
                            productName: 'Crystal Chandelier',
                            quantity: 1,
                            unit: 'Piece',
                            unitPrice: 12000,
                            totalPrice: 12000
                        }
                    ],
                    subtotal: 50000,
                    tax: 9000,
                    total: 59000,
                    status: status,
                    agentConfirmed: status !== 'pending',
                    paymentStatus: i > 5 ? 'paid' : 'pending',
                    shippingAddress: {
                        street: `${100 + i}, Main Market Road`,
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001'
                    },
                    createdAt: Timestamp.fromDate(new Date(Date.now() - (i * 24 * 60 * 60 * 1000))),
                    updatedAt: Timestamp.now()
                });
            }

            await batch.commit();
            setStatus({ type: 'success', message: 'Database seeded successfully! You can now browse the Agent Dashboard.' });
        } catch (error: any) {
            console.error('Seeding error:', error);
            setStatus({ type: 'error', message: `Seeding failed: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-white/20 bg-white/60 backdrop-blur-xl shadow-xl overflow-hidden rounded-3xl">
                <div className="bg-amber-600 h-2 w-full" />
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-900 font-inter">Database Seeder</CardTitle>
                    <CardDescription>
                        Populate your local environment with mock B2B data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            This will create 1 Agent, 3 Categories, 10 Products, 5 Retailers, and 10 Sample Orders for testing.
                        </p>
                    </div>

                    {status.type !== 'idle' && (
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${status.type === 'success' ? 'bg-green-50/50 border-green-200 text-green-800' : 'bg-red-50/50 border-red-200 text-red-800'
                            }`}>
                            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            <p className="text-sm font-bold">{status.message}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            className="w-full bg-amber-600 hover:bg-amber-700 h-12 text-lg font-bold shadow-lg rounded-2xl transition-all active:scale-95"
                            onClick={seedDatabase}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Seeding Data...
                                </>
                            ) : (
                                'Seed Database'
                            )}
                        </Button>
                        <Link href="/agent" className="block">
                            <Button variant="ghost" className="w-full text-zinc-500 font-bold rounded-2xl">
                                Go to Agent Dashboard
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 italic text-[10px] text-center text-zinc-400">
                        Ryth Bazar Management System • Development Utility
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
