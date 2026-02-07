/**
 * Simple Seed Script (Using Client SDK)
 * Creates test data without requiring Firebase Admin SDK
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedData() {
    console.log('🌱 Starting simple seed process...\n');

    try {
        // 1. Create Test Agent
        console.log('👤 Creating test agent...');
        const agentData = {
            id: 'agent-test-001',
            name: 'Test Agent',
            phoneNumber: '9876543210',
            whatsappNumber: '9876543210',
            email: 'agent@test.com',
            role: 'agent',
            isActive: true,
            territory: {
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
            },
            joinedDate: Timestamp.now(),
            performanceMetrics: {
                totalLeads: 0,
                convertedLeads: 0,
                totalOrders: 0,
                totalSales: 0,
            },
        };

        await setDoc(doc(db, 'agents', agentData.id), agentData);
        console.log('✅ Test agent created\n');

        // 2. Create Test Customer
        console.log('🏪 Creating test customer...');
        const customerData = {
            id: 'customer-test-001',
            shopName: 'Test Retail Shop',
            ownerName: 'Test Customer',
            whatsappNumber: '9988776655',
            email: 'customer@test.com',
            phoneNumber: '9988776655',
            primaryAddress: {
                street: '123 MG Road',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
            },
            agentId: agentData.id,
            agentName: agentData.name,
            status: 'active',
            priceAccessApproved: true,
            canSeePrices: true,
            registeredAt: Timestamp.now(),
            lastOrderDate: null,
            totalOrders: 0,
            totalSpent: 0,
        };

        await setDoc(doc(db, 'leads', customerData.id), customerData);
        console.log('✅ Test customer created\n');

        // 3. Create Admin User
        console.log('👨‍💼 Creating admin user...');
        const adminData = {
            userId: 'admin-001',
            role: 'admin',
            phoneNumber: '8050181994',
            email: 'admin@rythbazar.com',
            name: 'Admin User',
            isActive: true,
            createdAt: Timestamp.now(),
        };

        await setDoc(doc(db, 'users', adminData.userId), adminData);
        console.log('✅ Admin user created\n');

        // 4. Create Sample Products
        console.log('📦 Creating sample products...');
        const products = [
            {
                id: 'prod-001',
                name: 'Premium Rice - 25kg',
                sku: 'RICE-001',
                category: 'Grains',
                categoryId: 'cat-grains',
                description: 'High quality basmati rice',
                unit: 'kg',
                packSize: 25,
                mrp: 2500,
                sellingPrice: 2200,
                thumbnail: '/placeholder.svg',
                images: ['/placeholder.svg'],
                inventory: {
                    available: 100,
                    reserved: 0,
                    lowStockThreshold: 10,
                },
                isActive: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            },
            {
                id: 'prod-002',
                name: 'Refined Oil - 5L',
                sku: 'OIL-001',
                category: 'Oils',
                categoryId: 'cat-oils',
                description: 'Healthy cooking oil',
                unit: 'liters',
                packSize: 5,
                mrp: 850,
                sellingPrice: 750,
                thumbnail: '/placeholder.svg',
                images: ['/placeholder.svg'],
                inventory: {
                    available: 200,
                    reserved: 0,
                    lowStockThreshold: 20,
                },
                isActive: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            },
            {
                id: 'prod-003',
                name: 'Sugar - 50kg',
                sku: 'SUGAR-001',
                category: 'Grains',
                categoryId: 'cat-grains',
                description: 'Pure white sugar',
                unit: 'kg',
                packSize: 50,
                mrp: 3000,
                sellingPrice: 2800,
                thumbnail: '/placeholder.svg',
                images: ['/placeholder.svg'],
                inventory: {
                    available: 50,
                    reserved: 0,
                    lowStockThreshold: 5,
                },
                isActive: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            },
        ];

        for (const product of products) {
            await setDoc(doc(db, 'products', product.id), product);
        }
        console.log('✅ Created 3 sample products\n');

        // 5. Create Categories
        console.log('🏷️ Creating categories...');
        const categories = [
            {
                id: 'cat-grains',
                name: 'Grains',
                description: 'Rice, wheat, and other grains',
                icon: '🌾',
                isActive: true,
            },
            {
                id: 'cat-oils',
                name: 'Oils',
                description: 'Cooking and edible oils',
                icon: '🫒',
                isActive: true,
            },
        ];

        for (const category of categories) {
            await setDoc(doc(db, 'categories', category.id), category);
        }
        console.log('✅ Created 2 categories\n');

        console.log('✨ Seed completed!\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('📋 TEST ACCOUNTS SUMMARY');
        console.log('═══════════════════════════════════════════════════\n');
        console.log('Admin: admin / SecureAdminPass@2024!Change');
        console.log('Agent Phone: 9876543210');
        console.log('Customer Phone: 9988776655\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

seedData();
