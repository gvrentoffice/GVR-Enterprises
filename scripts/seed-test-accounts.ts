/**
 * Seed Test Accounts Script
 * Creates test data for all three portals (Customer, Agent, Admin)
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();
const auth = getAuth();

async function seedTestAccounts() {
    console.log('🌱 Starting seed process...\n');

    try {
        // 1. Create Test Agent
        console.log('👤 Creating test agent...');
        const agentPhone = '+919876543210';
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
            joinedDate: new Date(),
            performanceMetrics: {
                totalLeads: 0,
                convertedLeads: 0,
                totalOrders: 0,
                totalSales: 0,
            },
        };

        await db.collection('agents').doc(agentData.id).set(agentData);
        console.log('✅ Test agent created: agent@test.com / 9876543210\n');

        // 2. Create Test Customer (Lead)
        console.log('🏪 Creating test customer...');
        const customerPhone = '+919988776655';
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
            registeredAt: new Date(),
            lastOrderDate: null,
            totalOrders: 0,
            totalSpent: 0,
        };

        await db.collection('leads').doc(customerData.id).set(customerData);
        console.log('✅ Test customer created: customer@test.com / 9988776655\n');

        // 3. Create Admin User Document
        console.log('👨‍💼 Creating admin user document...');
        const adminData = {
            userId: 'admin-001',
            role: 'admin',
            phoneNumber: '8050181994',
            email: 'admin@rythbazar.com',
            name: 'Admin User',
            isActive: true,
            createdAt: new Date(),
        };

        await db.collection('users').doc(adminData.userId).set(adminData);
        console.log('✅ Admin user document created\n');

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
                createdAt: new Date(),
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
                createdAt: new Date(),
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
                createdAt: new Date(),
            },
        ];

        for (const product of products) {
            await db.collection('products').doc(product.id).set(product);
        }
        console.log('✅ Created 3 sample products\n');

        // 5. Create Categories
        console.log('🏷️ Creating product categories...');
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
            await db.collection('categories').doc(category.id).set(category);
        }
        console.log('✅ Created 2 categories\n');

        // Success Summary
        console.log('✨ Seed completed successfully!\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('TEST ACCOUNTS CREATED:');
        console.log('═══════════════════════════════════════════════════\n');

        console.log('🔐 ADMIN LOGIN (http://localhost:3100/login?mode=staff)');
        console.log('   Username: admin');
        console.log('   Password: SecureAdminPass@2024!Change');
        console.log('   (From .env.local)\n');

        console.log('👤 AGENT LOGIN (http://localhost:3100/agent/login)');
        console.log('   Phone: 9876543210');
        console.log('   Email: agent@test.com\n');

        console.log('🏪 CUSTOMER LOGIN (http://localhost:3100/login)');
        console.log('   Phone: 9988776655');
        console.log('   Email: customer@test.com\n');

        console.log('📦 SAMPLE DATA:');
        console.log('   - 3 Products created');
        console.log('   - 2 Categories created');
        console.log('   - All ready for testing!\n');

        console.log('═══════════════════════════════════════════════════');
        console.log('🚀 NEXT STEPS:');
        console.log('═══════════════════════════════════════════════════');
        console.log('1. Start dev server: npm run dev');
        console.log('2. Visit http://localhost:3100/login');
        console.log('3. Try all three portals with glassmorphism UI!');
        console.log('4. For phone auth, use Firebase test phone numbers\n');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the seed
seedTestAccounts();
